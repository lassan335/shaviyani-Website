"use server";

import { isZohoConnected, searchCustomers, createCustomer, createEstimate } from "../lib/zoho";
import ratesData from "../lib/rates.json";

export async function quoteGeneratorStatus() {
  let connected = false;
  try {
    connected = await isZohoConnected();
  } catch {
    connected = false;
  }
  return {
    connected,
    photoImportEnabled: !!process.env.ANTHROPIC_API_KEY,
    rates: ratesData,
  };
}

export async function zohoSearchCustomers(q) {
  try {
    return { customers: await searchCustomers(q) };
  } catch (err) {
    return { error: err.message === "NOT_CONNECTED" ? "Not connected to Zoho Books yet." : err.message };
  }
}

export async function zohoCreateCustomer({ contact_name, email, phone }) {
  try {
    return { customer: await createCustomer({ contact_name, email, phone }) };
  } catch (err) {
    return { error: err.message };
  }
}

export async function zohoCreateQuote({ customer_id, line_items, notes, expiry_date }) {
  if (!customer_id || !Array.isArray(line_items) || line_items.length === 0) {
    return { error: "customer_id and at least one line item are required" };
  }
  try {
    const estimate = await createEstimate({ customer_id, line_items, notes, expiry_date });
    return {
      estimate_id: estimate.estimate_id,
      estimate_number: estimate.estimate_number,
      total: estimate.total,
      status: estimate.status,
    };
  } catch (err) {
    return { error: err.message };
  }
}

function summarizeSizes(sizes) {
  const counts = {};
  sizes.forEach((s) => {
    counts[s] = (counts[s] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([size, n]) => `${size} x${n}`)
    .join(", ");
}

export async function parseOrderSheet(formData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "ANTHROPIC_API_KEY is not set — add one from console.anthropic.com to enable photo import." };
  }
  const file = formData.get("file");
  if (!file) return { error: "No file uploaded" };

  const tierName = formData.get("tier");
  const tier = ratesData.tiers[tierName] ? tierName : Object.keys(ratesData.tiers)[0];
  const rates = ratesData.tiers[tier];
  const material = formData.get("material") || Object.keys(rates.jerseyRates || {})[0];

  const jerseyTypes = Object.keys(rates.jerseyRates?.[material] || {});
  const accessoryNames = Object.keys(rates.accessories || {});

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const prompt = `This image is a handwritten/printed jersey order sheet. Extract every row into JSON.

Each row is one customer's order. A row typically has: a name, a jersey type, a sleeve length, a size, a quantity, and sometimes add-on accessories.

The jersey type must be one of exactly these (pick the closest match, or null if you can't tell): ${JSON.stringify(jerseyTypes)}
"Adult Jersey Only" / "Kids Jersey Only" = jersey with no shorts. "... With Short" = jersey + matching shorts. "Muslima" is a long-sleeve modest-fit jersey (always Long Sleeve, ignore any Short Sleeve mark for these rows). "Corporate T Shirt" is a plain team/corporate tee.
Sleeve is "Short Sleeve" or "Long Sleeve".
Accessories are optional add-ons that may be marked separately per row or in a summary section — use exactly these names when present: ${JSON.stringify(accessoryNames)}

Don't invent data — leave a field null if it's genuinely blank or illegible rather than guessing.

Return ONLY valid JSON, no prose, no markdown fences, in this exact shape:
{
  "rows": [
    {"name": "string or null", "jersey_type": "one of the list above or null", "sleeve": "Short Sleeve or Long Sleeve or null", "size": "string or null", "quantity": 1, "accessories": ["string", "..."]}
  ]
}`;

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });
    const aiData = await aiRes.json();
    const raw = (aiData.content || []).map((b) => b.text || "").join("").trim();
    const cleaned = raw.replace(/^```json\s*|```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const rows = parsed.rows || [];

    const merged = new Map();
    function addToLine(name, rate, qty, size) {
      const key = `${name}__${rate}`;
      if (!merged.has(key)) merged.set(key, { name, rate, quantity: 0, sizes: [] });
      const entry = merged.get(key);
      entry.quantity += qty;
      if (size) entry.sizes.push(size);
    }

    rows.forEach((r) => {
      const qty = Number(r.quantity) > 0 ? Number(r.quantity) : 1;
      const sleeve = r.jersey_type === "Muslima" ? "Long Sleeve" : r.sleeve;
      const rate = rates.jerseyRates?.[material]?.[r.jersey_type]?.[sleeve];

      if (r.jersey_type && sleeve && rate != null) {
        addToLine(`${r.jersey_type} (${material}, ${sleeve})`, rate, qty, r.size);
      }

      (r.accessories || []).forEach((a) => {
        const accRate = rates.accessories?.[a];
        if (accRate == null) return;
        addToLine(a, accRate, qty, null);
      });
    });

    const lineItems = [...merged.values()].map((e) => ({
      name: e.name,
      description: e.sizes.length ? `Sizes: ${summarizeSizes(e.sizes)}` : "",
      quantity: e.quantity,
      rate: e.rate,
    }));

    return { lineItems, playerCount: rows.length };
  } catch (err) {
    console.error(err);
    return { error: "Could not parse the order sheet. Try a clearer photo, or add rows manually." };
  }
}
