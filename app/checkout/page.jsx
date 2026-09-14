"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../lib/cart-context";
import { currency } from "../../lib/format";
import { createOrder } from "../actions";

export default function CheckoutPage() {
  const { items, subtotal, hasPreorder, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", island: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="pageTitle">Checkout</div>
        <p className="pageSub">Your bag is empty.</p>
        <Link href="/instant-purchase" className="btn btnPrimary">
          Browse jerseys
        </Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createOrder({
      customer: form,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        material: i.material,
        size: i.size,
        qty: i.qty,
        price: i.price,
      })),
      isPreorder: hasPreorder,
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    clear();
    router.push(`/order-confirmation/${result.orderNumber}`);
  };

  return (
    <div className="page">
      <div className="pageTitle">Checkout</div>
      <p className="pageSub">
        Payment is collected on delivery / by bank transfer for now — enter your details and we'll
        confirm your order and next steps by email.
      </p>

      <form onSubmit={submit}>
        <div className="formGrid">
          <label className="field full">
            <span>Full name</span>
            <input required value={form.name} onChange={set("name")} placeholder="Your name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={form.phone} onChange={set("phone")} placeholder="+960 7XX-XXXX" />
          </label>
          <label className="field full">
            <span>Delivery address</span>
            <input required value={form.address} onChange={set("address")} placeholder="House, street, city" />
          </label>
          <label className="field full">
            <span>Island / atoll</span>
            <input value={form.island} onChange={set("island")} placeholder="e.g. Male'" />
          </label>
        </div>

        {error && (
          <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginTop: 14 }}>
            {error}
          </div>
        )}

        <div className="cartSummary">
          <div className="summaryRow summaryTotal">
            <span>Total due</span>
            <span>{currency(subtotal)}</span>
          </div>
          <button className="btn btnPrimary btnBlock" style={{ marginTop: 14 }} disabled={submitting} type="submit">
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}
