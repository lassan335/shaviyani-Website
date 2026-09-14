import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import { currency, formatDate } from "../../../lib/format";
import { STATUS_DESCRIPTION } from "../../../lib/orderStatus";
import StatusTrack from "../../../components/StatusTrack";

export default async function OrderConfirmationPage({ params }) {
  const order = await db.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="page">
      <div className="pageTitle">Thanks, {order.customerName.split(" ")[0]}!</div>
      <p className="pageSub">
        Order <strong>{order.orderNumber}</strong> placed on {formatDate(order.createdAt)}. We've sent a
        confirmation to {order.customerEmail}.
      </p>

      <StatusTrack status={order.status} />
      <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", marginTop: -4 }}>
        {STATUS_DESCRIPTION[order.status]}
      </p>

      {order.isPreorder && (
        <div className="preorderNote" style={{ marginTop: 16 }}>
          This order includes pre-order item(s) — estimated 3–4 weeks to Male' once sent to supplier.
        </div>
      )}

      <div className="cartSummary">
        {order.items.map((item) => (
          <div className="summaryRow" key={item.id}>
            <span>
              {item.name} ({item.material}, {item.size}) × {item.qty}
            </span>
            <span>{currency(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="summaryRow summaryTotal">
          <span>Total</span>
          <span>{currency(order.subtotal)}</span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 20 }}>
        Bookmark this: track your order anytime at{" "}
        <Link href="/track" style={{ color: "var(--teal)", fontWeight: 700 }}>
          Track an Order
        </Link>{" "}
        with order number <strong>{order.orderNumber}</strong> and your email.
      </p>
    </div>
  );
}
