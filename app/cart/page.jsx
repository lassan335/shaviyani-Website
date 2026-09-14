"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../lib/cart-context";
import { currency } from "../../lib/format";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, hasPreorder } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="pageTitle">Your bag</div>
        <p className="pageSub">Your bag is empty.</p>
        <Link href="/instant-purchase" className="btn btnPrimary">
          Browse jerseys
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pageTitle">Your bag</div>

      <div>
        {items.map((item) => (
          <div className="cartLine" key={item.slug + item.material + item.size}>
            <div
              className="cartLineArt"
              style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}
            >
              {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />}
            </div>
            <div className="cartLineInfo">
              <div className="cartLineName">{item.name}</div>
              <div className="cartLineMeta">
                {item.material} · {item.size} · {item.mode}
              </div>
              <div className="qtyControl">
                <button onClick={() => updateQty(item, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item, item.qty + 1)}>+</button>
                <button onClick={() => removeItem(item)} style={{ marginLeft: 10, color: "var(--red)" }}>
                  Remove
                </button>
              </div>
            </div>
            <div className="cartLinePrice">{currency(item.qty * item.price)}</div>
          </div>
        ))}
      </div>

      {hasPreorder && (
        <div className="preorderNote" style={{ marginTop: 16 }}>
          Your bag includes pre-order items — these ship separately once received from our supplier.
        </div>
      )}

      <div className="cartSummary">
        <div className="summaryRow">
          <span>Subtotal</span>
          <span>{currency(subtotal)}</span>
        </div>
        <div className="summaryRow" style={{ color: "var(--muted)" }}>
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="summaryRow summaryTotal">
          <span>Total</span>
          <span>{currency(subtotal)}</span>
        </div>
        <Link href="/checkout" className="btn btnPrimary btnBlock" style={{ marginTop: 14 }}>
          Checkout
        </Link>
      </div>
    </div>
  );
}
