"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { currency } from "../../../lib/format";
import {
  quoteGeneratorStatus,
  zohoSearchCustomers,
  zohoCreateCustomer,
  zohoCreateQuote,
  parseOrderSheet,
} from "../../quoteGeneratorActions";

let itemCounter = 0;
function emptyLineItem() {
  itemCounter += 1;
  return { id: `li-${itemCounter}`, name: "", description: "", quantity: 1, rate: "" };
}

export default function QuoteGenerator() {
  const [status, setStatus] = useState(null);
  const [tier, setTier] = useState("");
  const [material, setMaterial] = useState("");
  const [lineItems, setLineItems] = useState([emptyLineItem()]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ contact_name: "", email: "", phone: "" });

  const [orderFile, setOrderFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState(null);
  const [reviewItems, setReviewItems] = useState(null);

  const [notes, setNotes] = useState("");
  const [expiry, setExpiry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    quoteGeneratorStatus().then((s) => {
      setStatus(s);
      const tiers = Object.keys(s.rates?.tiers || {});
      if (tiers.length) {
        setTier(tiers[0]);
        setMaterial(Object.keys(s.rates.tiers[tiers[0]].jerseyRates || {})[0] || "");
      }
    });
  }, []);

  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomerResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await zohoSearchCustomers(customerSearch.trim());
      setCustomerResults(res.customers || []);
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  const materials = status ? Object.keys(status.rates?.tiers?.[tier]?.jerseyRates || {}) : [];

  function updateLineItem(id, field, value) {
    setLineItems((items) => items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }
  function removeLineItem(id) {
    setLineItems((items) => items.filter((i) => i.id !== id));
  }
  function addLineItem() {
    setLineItems((items) => [...items, emptyLineItem()]);
  }
  const total = lineItems.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.rate) || 0), 0);

  async function handleCreateCustomer() {
    if (!newCustomer.contact_name.trim()) return alert("Customer name is required");
    const res = await zohoCreateCustomer(newCustomer);
    if (res.error) return alert(res.error);
    setSelectedCustomer({
      id: res.customer.contact_id,
      name: res.customer.contact_name,
      phone: res.customer.phone || newCustomer.phone,
    });
    setShowNewCustomer(false);
    setNewCustomer({ contact_name: "", email: "", phone: "" });
  }

  async function handleParseSheet() {
    if (!orderFile) return alert("Choose a photo first");
    setParsing(true);
    setParseMessage(null);
    setReviewItems(null);
    const formData = new FormData();
    formData.append("file", orderFile);
    formData.append("material", material);
    formData.append("tier", tier);
    const res = await parseOrderSheet(formData);
    setParsing(false);
    if (res.error) {
      setParseMessage({ type: "warn", text: res.error });
      return;
    }
    setParseMessage({
      type: "ok",
      text: `Found ${res.playerCount} row(s), ${res.lineItems.length} line item(s). Review below, then add to quote.`,
    });
    setReviewItems(res.lineItems.map((li, i) => ({ ...li, key: i })));
  }

  function addReviewedItems() {
    if (!reviewItems) return;
    setLineItems((items) => [
      ...items,
      ...reviewItems.map((r) => ({
        id: emptyLineItem().id,
        name: r.name,
        description: r.description,
        quantity: r.quantity,
        rate: r.rate,
      })),
    ]);
    setReviewItems(null);
    setParseMessage({ type: "ok", text: "Line items added below." });
  }

  async function handleSubmit() {
    if (!selectedCustomer) return alert("Select or create a customer first");
    const items = lineItems.filter((i) => i.name.trim() && i.quantity && i.rate !== "");
    if (items.length === 0) return alert("Add at least one complete line item");

    setSubmitting(true);
    const res = await zohoCreateQuote({
      customer_id: selectedCustomer.id,
      line_items: items,
      notes,
      expiry_date: expiry || undefined,
    });
    setSubmitting(false);
    if (res.error) {
      setResult({ type: "warn", text: res.error });
      return;
    }
    setResult({ type: "ok", estimate: res, items, notes });
  }

  function waLink() {
    const lines = [
      `Hi${selectedCustomer?.name ? " " + selectedCustomer.name : ""}, here's your quote (${result.estimate.estimate_number}):`,
      "",
      ...result.items.map((li) => `• ${li.name}${li.description ? " — " + li.description : ""} x${li.quantity} @ ${li.rate}`),
      "",
      `Total: ${result.estimate.total}`,
    ];
    if (result.notes) lines.push("", result.notes);
    const message = encodeURIComponent(lines.join("\n"));
    const digits = (selectedCustomer?.phone || "").replace(/[^\d]/g, "");
    return digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`;
  }

  if (!status) return <div className="page">Loading…</div>;

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <div className="qgHeader">
        <div>
          <Image
            src="/brand/logo-full.png"
            alt="Shaviyani Pro"
            width={4234}
            height={1961}
            priority
            style={{ height: 40, width: "auto", marginBottom: 10 }}
          />
          <div className="pageTitle">SHAVIYANI PRO JERSEY ORDER</div>
          <p className="pageSub">Build a quote and push it to Zoho Books as a Draft Estimate.</p>
        </div>
        <Link href="/admin" className="btn btnOutlineDark">
          ← Back to dashboard
        </Link>
      </div>

      {!status.connected && (
        <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginBottom: 16 }}>
          Not connected to Zoho Books. <a href="/api/zoho/oauth/start">Connect now</a>.
        </div>
      )}

      <div className="formGrid" style={{ marginBottom: 20 }}>
        <label className="field full">
          <span>Customer</span>
          <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search existing customer..." />
        </label>
        {customerResults.length > 0 && (
          <div className="field full" style={{ marginTop: -12 }}>
            {customerResults.map((c) => (
              <div
                key={c.contact_id}
                style={{ padding: "6px 0", cursor: "pointer", borderBottom: "1px solid #eee" }}
                onClick={() => {
                  setSelectedCustomer({ id: c.contact_id, name: c.contact_name, phone: c.phone || c.mobile || "" });
                  setCustomerResults([]);
                  setCustomerSearch(c.contact_name);
                }}
              >
                {c.contact_name}
              </div>
            ))}
          </div>
        )}
        <div className="field full">
          <button type="button" className="btn btnOutlineDark" onClick={() => setShowNewCustomer((v) => !v)}>
            + New customer
          </button>
        </div>
        {showNewCustomer && (
          <>
            <label className="field full">
              <span>Name</span>
              <input
                value={newCustomer.contact_name}
                onChange={(e) => setNewCustomer({ ...newCustomer, contact_name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
            </label>
            <label className="field">
              <span>Phone</span>
              <input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
            </label>
            <div className="field full">
              <button type="button" className="btn btnDark" onClick={handleCreateCustomer}>
                Create customer
              </button>
            </div>
          </>
        )}
        {selectedCustomer && (
          <div className="field full" style={{ color: "#2F8F6B", fontSize: 13 }}>
            Selected: {selectedCustomer.name}
            {selectedCustomer.phone ? ` · ${selectedCustomer.phone}` : " · no phone on file"}
          </div>
        )}
      </div>

      {status.photoImportEnabled && (
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div className="detailLabel" style={{ marginBottom: 8 }}>
            Import order sheet (photo or scan)
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input type="file" accept="image/*" onChange={(e) => setOrderFile(e.target.files[0] || null)} />
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              {Object.keys(status.rates.tiers).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select value={material} onChange={(e) => setMaterial(e.target.value)}>
              {materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button type="button" className="btn btnOutlineDark" onClick={handleParseSheet} disabled={parsing}>
              {parsing ? "Reading..." : "Parse sheet"}
            </button>
          </div>
          {parseMessage && (
            <div
              className="preorderNote"
              style={{
                marginTop: 10,
                background: parseMessage.type === "ok" ? "#EAF7EF" : "#FEECEC",
                color: parseMessage.type === "ok" ? "#2F8F6B" : "var(--red)",
              }}
            >
              {parseMessage.text}
            </div>
          )}
          {reviewItems && (
            <div style={{ marginTop: 10 }}>
              {reviewItems.map((li) => (
                <div className="summaryRow" key={li.key}>
                  <span>
                    {li.name} {li.description ? `— ${li.description}` : ""} × {li.quantity}
                  </span>
                  <span>{currency(li.rate * li.quantity)}</span>
                </div>
              ))}
              <button type="button" className="btn btnDark" style={{ marginTop: 8 }} onClick={addReviewedItems}>
                Add all to quote below ↓
              </button>
            </div>
          )}
        </div>
      )}

      <div className="detailLabel" style={{ marginBottom: 8 }}>
        Line items
      </div>
      {lineItems.map((li) => (
        <div key={li.id} className="qgLineItem">
          <input
            placeholder="Item (e.g. Home Jersey - Size L)"
            value={li.name}
            onChange={(e) => updateLineItem(li.id, "name", e.target.value)}
          />
          <input
            placeholder="Material / size note"
            value={li.description}
            onChange={(e) => updateLineItem(li.id, "description", e.target.value)}
          />
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={li.quantity}
            onChange={(e) => updateLineItem(li.id, "quantity", e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Rate"
            value={li.rate}
            onChange={(e) => updateLineItem(li.id, "rate", e.target.value)}
          />
          <button type="button" className="btn btnOutlineDark" onClick={() => removeLineItem(li.id)}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="btn btnOutlineDark" onClick={addLineItem}>
        + Add line item
      </button>

      <label className="field full" style={{ marginTop: 20 }}>
        <span>Notes (optional)</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <label className="field full">
        <span>Expiry date (optional)</span>
        <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
      </label>

      <div style={{ textAlign: "right", fontSize: 18, margin: "16px 0" }}>
        Total: <strong>{currency(total)}</strong>
      </div>

      <div className="qgFooterRow">
        <small style={{ color: "#8A8F98" }}>This creates a Draft Estimate in Zoho Books.</small>
        <button type="button" className="btn btnPrimary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Generating..." : "Generate Quote"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 16 }}>
          {result.type === "warn" ? (
            <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)" }}>
              {result.text}
            </div>
          ) : (
            <>
              <div className="preorderNote" style={{ background: "#EAF7EF", color: "#2F8F6B" }}>
                Estimate {result.estimate.estimate_number} created in Zoho Books — total {result.estimate.total} (
                {result.estimate.status}).
              </div>
              <a href={waLink()} target="_blank" rel="noreferrer">
                <button type="button" className="btn btnSuccess" style={{ marginTop: 10 }}>
                  Send via WhatsApp{selectedCustomer?.phone ? "" : " (pick contact)"}
                </button>
              </a>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .qgHeader {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }
        .qgLineItem {
          display: grid;
          grid-template-columns: 2fr 1fr 70px 90px auto;
          gap: 8px;
          margin-bottom: 8px;
        }
        .qgFooterRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        @media (max-width: 560px) {
          .qgLineItem {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "name name"
              "desc desc"
              "qty rate"
              "remove remove";
          }
          .qgLineItem input:nth-child(1) {
            grid-area: name;
          }
          .qgLineItem input:nth-child(2) {
            grid-area: desc;
          }
          .qgLineItem input:nth-child(3) {
            grid-area: qty;
          }
          .qgLineItem input:nth-child(4) {
            grid-area: rate;
          }
          .qgLineItem button {
            grid-area: remove;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
