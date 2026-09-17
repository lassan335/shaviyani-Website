const encoder = new TextEncoder();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const PBKDF2_ITERATIONS = 100000;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

async function getKey(secret) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

// Edge-runtime-compatible (middleware) and Node-compatible (server actions) —
// uses the global Web Crypto API available in both, no `node:crypto` import.
// Payload embeds the username so actions can tell which admin is logged in.
export async function createSessionToken(secret, username) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${username}|${expires}`;
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${encodeURIComponent(payload)}.${toHex(sig)}`;
}

// Returns { username } on a valid, unexpired session, or null otherwise.
export async function verifySessionToken(token, secret) {
  if (!token || !secret) return null;
  const [encodedPayload, sigHex] = token.split(".");
  if (!encodedPayload || !sigHex) return null;

  const payload = decodeURIComponent(encodedPayload);
  const [username, expiresStr] = payload.split("|");
  const expires = Number(expiresStr);
  if (!username || !Number.isFinite(expires) || Date.now() > expires) return null;

  try {
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify("HMAC", key, fromHex(sigHex), encoder.encode(payload));
    return valid ? { username } : null;
  } catch {
    return null;
  }
}

function randomSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function derivePasswordHash(password, salt) {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return toHex(bits);
}

export async function hashPassword(password) {
  const salt = randomSalt();
  const passwordHash = await derivePasswordHash(password, salt);
  return { salt, passwordHash };
}

export async function verifyPassword(password, salt, passwordHash) {
  const candidate = await derivePasswordHash(password, salt);
  return candidate === passwordHash;
}
