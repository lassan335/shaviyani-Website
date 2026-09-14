const encoder = new TextEncoder();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

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
export async function createSessionToken(secret) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toHex(sig)}`;
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) return false;
  const [payload, sigHex] = token.split(".");
  if (!payload || !sigHex) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  try {
    const key = await getKey(secret);
    return await crypto.subtle.verify("HMAC", key, fromHex(sigHex), encoder.encode(payload));
  } catch {
    return false;
  }
}
