"use client";

import { useState } from "react";
import { currency, formatDate } from "../../lib/format";
import { STATUS_DESCRIPTION } from "../../lib/orderStatus";
import StatusTrack from "../../components/StatusTrack";
import { trackOrder } from "../actions";

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    const result = await trackOrder({ orderNumber, email });
    setLoading(false);
    if (result.error) setError(result.error);
    else setOrder(result.order);
  };

  return (
    <div className="page">
      <div className="pageTitle">Track an Order</div>
      <p className="pageSub">Enter your order number and the email you used at checkout.</p>

      <form onSubmit={submit}>
        <div className="formGrid">
          <label className="field">
            <span>Order number</span>
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="JZ-1042"
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
        </div>
        <button className="btn btnDark" style={{ marginTop: 14 }} disabled={loading} type="submit">
          {loading ? "Looking up…" : "Track order"}
        </button>
      </form>

      {error && (
        <div className="preorderNote" style={{ background: "#FEECEC", color: "var(--red)", marginTop: 18 }}>
          {error}
        </div>
      )}

      {order && (
        <div style={{ marginTop: 28 }}>
          <div className="pageTitle" style={{ fontSize: 18 }}>
            {order.orderNumber} — {order.status}
          </div>
          <p className="pageSub" style={{ marginBottom: 10 }}>
            Placed {formatDate(order.createdAt)}. {STATUS_DESCRIPTION[order.status]}
          </p>

          <StatusTrack status={order.status} />

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

          {order.statusLogs?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="optionLabel">History</div>
              {order.statusLogs.map((log) => (
                <div key={log.id} className="summaryRow">
                  <span>{log.status}</span>
                  <span style={{ color: "var(--muted)" }}>{formatDate(log.changedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
