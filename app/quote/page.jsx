"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { submitQuote } from "../actions";

const STYLES = [
  "Jersey — Short Sleeves",
  "Jersey — Long Sleeves",
  "Jersey + Shorts — Short Sleeves",
  "Jersey + Shorts — Long Sleeves",
  "Corporate T-Shirt — Short Sleeves",
];

const JERSEY_MATERIALS = [
  "Wetlook",
  "Honeycomb",
  "Jacquard Wave",
  "Camouflage Jacquard Mesh",
  "Chevron Jacquard",
  "Checkered Eyelet Mesh",
];

const CORPORATE_MATERIALS = ["Baby PK", "Waffle", "Dot Waffle", "Crocodile"];

const MATERIALS = [...JERSEY_MATERIALS, ...CORPORATE_MATERIALS, "Not sure / need advice"];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

function blankItem() {
  return { style: STYLES[0], material: MATERIALS[0], size: SIZES[1], qty: 1 };
}

const initialContact = { teamName: "", contactName: "", email: "", phone: "", notes: "" };

export default function QuotePage() {
  const [contact, setContact] = useState(initialContact);
  const [items, setItems] = useState([blankItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const setContactField = (k) => (e) => setContact({ ...contact, [k]: e.target.value });

  const setItemField = (idx, k) => (e) => {
    const value = k === "qty" ? Math.max(1, Number(e.target.value) || 1) : e.target.value;
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [k]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await submitQuote({ ...contact, items });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="page">
        <div className="pageTitle">Request received</div>
        <p className="pageSub">
          Thanks — we'll get back to you within 1–2 business days with pricing for {contact.teamName}. No
          payment has been collected; this was a quote request only.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pageTitle">Request a Quotation</div>
      <p className="pageSub">
        Ordering for a team or club? Add each style you need as its own line — e.g. 4× short sleeve and
        5× long sleeve is just two rows — and we'll send a quote.
      </p>

      <form onSubmit={submit}>
        <div className="formGrid">
          <label className="field full">
            <span>Team / club name</span>
            <input required value={contact.teamName} onChange={setContactField("teamName")} placeholder="e.g. Club Valencia FC" />
          </label>
          <label className="field">
            <span>Your name</span>
            <input required value={contact.contactName} onChange={setContactField("contactName")} placeholder="Contact person" />
          </label>
          <label className="field">
            <span>Email</span>
            <input required type="email" value={contact.email} onChange={setContactField("email")} placeholder="you@example.com" />
          </label>
          <label className="field full">
            <span>Phone</span>
            <input value={contact.phone} onChange={setContactField("phone")} placeholder="+960 7XX-XXXX" />
          </label>
        </div>

        <div className="optionLabel" style={{ marginTop: 24 }}>
          Items
        </div>

        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div className="formGrid">
              <label className="field full">
                <span>Style</span>
                <select value={item.style} onChange={setItemField(idx, "style")}>
                  {STYLES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Material</span>
                <select value={item.material} onChange={setItemField(idx, "material")}>
                  {MATERIALS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Size</span>
                <select value={item.size} onChange={setItemField(idx, "size")}>
                  {SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Quantity</span>
                <input type="number" min="1" value={item.qty} onChange={setItemField(idx, "qty")} />
              </label>
              <div className="field" style={{ justifyContent: "flex-end" }}>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "var(--red)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "10px 0",
                    }}
                  >
                    <X size={14} /> Remove item
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addItem} className="btn btnOutlineDark" style={{ marginTop: 4 }}>
          <Plus size={15} /> Add another item
        </button>

        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 10, fontWeight: 600 }}>
          Total quantity: {totalQty}
        </div>

        <label className="field full" style={{ marginTop: 20 }}>
          <span>Design notes</span>
          <textarea
            value={contact.notes}
            onChange={setContactField("notes")}
            placeholder="Names/numbers to print, crest, custom colours, deadline, reference images…"
          />
        </label>

        {error && (
          <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginTop: 14 }}>
            {error}
          </div>
        )}

        <button className="btn btnPrimary" style={{ marginTop: 16 }} disabled={submitting} type="submit">
          {submitting ? "Sending…" : "Send request"}
        </button>
      </form>
    </div>
  );
}
