import { db } from "./db";

const {
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REDIRECT_URI,
  ZOHO_ORG_ID,
  ZOHO_ACCOUNTS_DOMAIN = "accounts.zoho.com",
  ZOHO_API_DOMAIN = "www.zohoapis.com",
} = process.env;

export function zohoOAuthStartUrl() {
  const scope = "ZohoBooks.fullaccess.all";
  return (
    `https://${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/auth` +
    `?scope=${encodeURIComponent(scope)}` +
    `&client_id=${ZOHO_CLIENT_ID}` +
    `&response_type=code` +
    `&access_type=offline` +
    `&redirect_uri=${encodeURIComponent(ZOHO_REDIRECT_URI)}` +
    `&prompt=consent`
  );
}

export async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: ZOHO_REDIRECT_URI,
    code,
  });
  const res = await fetch(`https://${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token?${params}`, { method: "POST" });
  const data = await res.json();
  if (!data.refresh_token) {
    throw new Error(
      data.error === "invalid_code"
        ? "That authorization code has already been used or expired. Start the connection again."
        : "No refresh_token returned — you may have already authorized this app. Revoke access at accounts.zoho.com/home#security/apps and try again."
    );
  }
  await db.zohoToken.upsert({
    where: { id: "zoho" },
    create: {
      id: "zoho",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
    update: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });
}

export async function isZohoConnected() {
  const token = await db.zohoToken.findUnique({ where: { id: "zoho" } });
  return !!token;
}

async function getAccessToken() {
  const token = await db.zohoToken.findUnique({ where: { id: "zoho" } });
  if (!token) throw new Error("NOT_CONNECTED");

  if (Date.now() < token.expiresAt.getTime() - 60000) {
    return token.accessToken;
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    refresh_token: token.refreshToken,
  });
  const res = await fetch(`https://${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token?${params}`, { method: "POST" });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to refresh Zoho access token");

  await db.zohoToken.update({
    where: { id: "zoho" },
    data: { accessToken: data.access_token, expiresAt: new Date(Date.now() + data.expires_in * 1000) },
  });
  return data.access_token;
}

async function zohoFetch(path, { method = "GET", params, body } = {}) {
  const accessToken = await getAccessToken();
  const qs = new URLSearchParams({ organization_id: ZOHO_ORG_ID, ...(params || {}) });
  const res = await fetch(`https://${ZOHO_API_DOMAIN}${path}?${qs}`, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Zoho API request failed");
  return data;
}

export async function searchCustomers(q) {
  const data = await zohoFetch("/books/v3/contacts", { params: { contact_name_contains: q || "", per_page: "15" } });
  return data.contacts || [];
}

export async function createCustomer({ contact_name, email, phone }) {
  const data = await zohoFetch("/books/v3/contacts", { method: "POST", body: { contact_name, email, phone } });
  return data.contact;
}

export async function createEstimate({ customer_id, line_items, notes, expiry_date }) {
  const data = await zohoFetch("/books/v3/estimates", {
    method: "POST",
    body: {
      customer_id,
      date: new Date().toISOString().slice(0, 10),
      expiry_date: expiry_date || undefined,
      notes: notes || "",
      line_items: line_items.map((li) => ({
        name: li.name,
        description: li.description || "",
        rate: Number(li.rate),
        quantity: Number(li.quantity),
      })),
    },
  });
  return data.estimate;
}
