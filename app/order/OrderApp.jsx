"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Check } from "lucide-react";
import { currency } from "../../lib/format";
import { createOrder } from "../actions";

function ProductPickCard({ product, onSelect }) {
  return (
    <button className="card" onClick={() => onSelect(product)} type="button">
      <div
        className="cardArt"
        style={{ background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})` }}
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 900px) 25vw, (min-width: 640px) 33vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        )}
        <span className="modeTag" style={{ position: "relative", zIndex: 1 }}>
          {product.mode === "instant" ? "Instant" : "Pre-Order"}
        </span>
      </div>
      <div className="cardBody">
        <div className="cardTeam">{product.team}</div>
        <div className="cardName">{product.name}</div>
        <div className="cardPrice">{currency(product.price)}</div>
      </div>
    </button>
  );
}

const initialContact = { name: "", email: "", phone: "", address: "", island: "" };

export default function OrderApp({ products }) {
  const [selected, setSelected] = useState(null);
  const [material, setMaterial] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState("configure"); // "configure" | "details"
  const [contact, setContact] = useState(initialContact);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const openProduct = (product) => {
    const materials = product.materials.split(",");
    const sizes = product.sizes.split(",");
    setSelected(product);
    setMaterial(materials[0]);
    setSize(sizes[1] || sizes[0]);
    setQty(1);
    setStep("configure");
    setError(null);
  };

  const close = () => {
    setSelected(null);
    setContact(initialContact);
  };

  const setContactField = (k) => (e) => setContact({ ...contact, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createOrder({
      customer: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        island: contact.island,
      },
      items: [
        {
          productId: selected.id,
          name: selected.name,
          material,
          size,
          qty,
          price: selected.price,
        },
      ],
      isPreorder: selected.mode === "preorder",
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    close();
    router.push(`/order-confirmation/${result.orderNumber}`);
  };

  const materials = selected ? selected.materials.split(",") : [];
  const sizes = selected ? selected.sizes.split(",") : [];
  const isPreorder = selected?.mode === "preorder";

  return (
    <div>
      <div className="sectionHead" style={{ paddingTop: 32 }}>
        <div>
          <div className="sectionTitle">Order a Jersey</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 520 }}>
            Pick a product, choose material and size, and order directly — no account needed.
          </p>
        </div>
      </div>

      <div className="grid">
        {products.map((p) => (
          <ProductPickCard key={p.id} product={p} onSelect={openProduct} />
        ))}
      </div>

      {selected && (
        <div className="modalOverlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div className="modalTitle">{selected.name}</div>
              <button className="iconBtn" onClick={close} type="button">
                <X size={18} />
              </button>
            </div>

            {step === "configure" && (
              <div>
                <div className="cardTeam">{selected.team}</div>
                <div className="drawerPrice" style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginTop: 4 }}>
                  {currency(selected.price)}
                </div>

                {isPreorder && (
                  <div className="preorderNote" style={{ marginTop: 12 }}>
                    Pre-order — ships from supplier, estimated {selected.preorderEta || "3–4 weeks to Male'"}
                  </div>
                )}

                <div className="optionLabel">Material</div>
                <div className="optionRow">
                  {materials.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={"optionChip" + (material === m ? " active" : "")}
                      onClick={() => setMaterial(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="optionLabel">Size</div>
                <div className="optionRow">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={"optionChip sizeChip" + (size === s ? " active" : "")}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="qtyRow">
                  <button className="qtyBtn" type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    −
                  </button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
                  <button className="qtyBtn" type="button" onClick={() => setQty((q) => q + 1)}>
                    +
                  </button>
                </div>

                <button
                  className="btn btnPrimary btnBlock"
                  style={{ marginTop: 20 }}
                  type="button"
                  onClick={() => setStep("details")}
                >
                  Continue — {currency(selected.price * qty)}
                </button>
              </div>
            )}

            {step === "details" && (
              <form onSubmit={submit}>
                <div className="summaryRow" style={{ marginBottom: 12 }}>
                  <span>
                    {selected.name} ({material}, {size}) × {qty}
                  </span>
                  <span>{currency(selected.price * qty)}</span>
                </div>

                <div className="formGrid">
                  <label className="field full">
                    <span>Full name</span>
                    <input required value={contact.name} onChange={setContactField("name")} placeholder="Your name" />
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={contact.email}
                      onChange={setContactField("email")}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="field">
                    <span>Phone</span>
                    <input value={contact.phone} onChange={setContactField("phone")} placeholder="+960 7XX-XXXX" />
                  </label>
                  <label className="field full">
                    <span>Delivery address</span>
                    <input
                      required
                      value={contact.address}
                      onChange={setContactField("address")}
                      placeholder="House, street, city"
                    />
                  </label>
                  <label className="field full">
                    <span>Island / atoll</span>
                    <input value={contact.island} onChange={setContactField("island")} placeholder="e.g. Male'" />
                  </label>
                </div>

                {error && (
                  <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginTop: 14 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    className="btn btnOutlineDark"
                    type="button"
                    onClick={() => setStep("configure")}
                    style={{ flex: 1 }}
                  >
                    Back
                  </button>
                  <button className="btn btnPrimary" type="submit" disabled={submitting} style={{ flex: 2 }}>
                    {submitting ? (
                      "Placing order…"
                    ) : (
                      <>
                        <Check size={16} /> Place order
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
