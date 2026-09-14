"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Plus, X, LogOut } from "lucide-react";
import { currency, formatDate } from "../../lib/format";
import { STATUSES, STATUS_COLOR } from "../../lib/orderStatus";
import StatusTrack from "../../components/StatusTrack";
import { updateOrderStatus, createManualOrder, adminLogout } from "../actions";

function orderLabel(order) {
  if (!order.items?.length) return "—";
  const first = order.items[0].name;
  return order.items.length > 1 ? `${first} +${order.items.length - 1} more` : first;
}

function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const profit = order.subtotal - order.supplierCost - order.shippingCost;
  const margin = order.subtotal > 0 ? ((profit / order.subtotal) * 100).toFixed(0) : "0";

  return (
    <div className="orderRow" style={{ borderLeftColor: STATUS_COLOR[order.status] }}>
      <div className="orderMain" onClick={() => setOpen(!open)}>
        <div className="orderMainLeft">
          {open ? <ChevronDown size={16} color="#8A8F98" /> : <ChevronRight size={16} color="#8A8F98" />}
          <div>
            <div className="orderId">{order.orderNumber}</div>
            <div className="orderProduct">{orderLabel(order)}</div>
          </div>
        </div>
        <div className="orderMainMid">
          <div className="orderCustomer">{order.customerName}</div>
          <div className="orderMeta">{formatDate(order.createdAt)}</div>
        </div>
        <div className="orderMainRight">
          <span
            className="badge"
            style={{ color: STATUS_COLOR[order.status], borderColor: STATUS_COLOR[order.status] }}
          >
            {order.status}
          </span>
          <div className="orderProfit" style={{ color: profit >= 0 ? "#2F8F6B" : "#C8383A" }}>
            {currency(profit)}
          </div>
        </div>
      </div>

      {open && (
        <div className="orderDetail">
          <StatusTrack status={order.status} />

          <div className="detailGrid">
            <div>
              <div className="detailLabel">Customer</div>
              <div className="detailValue" style={{ fontSize: 12 }}>
                {order.customerName} · {order.customerEmail}
              </div>
            </div>
            <div>
              <div className="detailLabel">Address</div>
              <div className="detailValue" style={{ fontSize: 12 }}>
                {order.address}
                {order.island ? `, ${order.island}` : ""}
              </div>
            </div>
            <div>
              <div className="detailLabel">Sale price</div>
              <div className="detailValue">{currency(order.subtotal)}</div>
            </div>
            <div>
              <div className="detailLabel">Supplier cost</div>
              <div className="detailValue">{currency(order.supplierCost)}</div>
            </div>
            <div>
              <div className="detailLabel">Shipping / customs</div>
              <div className="detailValue">{currency(order.shippingCost)}</div>
            </div>
            <div>
              <div className="detailLabel">Margin</div>
              <div className="detailValue">{margin}%</div>
            </div>
          </div>

          <div className="detailLabel" style={{ marginTop: 16, marginBottom: 8 }}>
            Items
          </div>
          {order.items.map((item) => (
            <div className="summaryRow" key={item.id}>
              <span>
                {item.name} ({item.material}, {item.size}) × {item.qty}
              </span>
              <span>{currency(item.price * item.qty)}</span>
            </div>
          ))}

          <div className="detailLabel" style={{ marginTop: 16, marginBottom: 8 }}>
            Update status
          </div>
          <div className="statusButtons">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={"statusBtn" + (s === order.status ? " active" : "")}
                style={s === order.status ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] } : {}}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(order.id, s);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NewOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    customer: "",
    email: "",
    address: "",
    product: "",
    material: "Match Grade (AeroDry)",
    size: "M",
    qty: 1,
    salePrice: "",
    supplierCost: "",
    shippingCost: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.customer || !form.product || !form.salePrice) return;
    setSubmitting(true);
    await createManualOrder(form);
    setSubmitting(false);
    onCreated();
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">New order</div>
          <button className="iconBtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="formGrid">
          <label className="field full">
            <span>Customer</span>
            <input value={form.customer} onChange={set("customer")} placeholder="Customer or team name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input value={form.email} onChange={set("email")} placeholder="customer@example.com" />
          </label>
          <label className="field">
            <span>Address</span>
            <input value={form.address} onChange={set("address")} placeholder="Delivery address" />
          </label>
          <label className="field full">
            <span>Product</span>
            <input value={form.product} onChange={set("product")} placeholder="Jersey name" />
          </label>
          <label className="field">
            <span>Material</span>
            <select value={form.material} onChange={set("material")}>
              <option>Match Grade (AeroDry)</option>
              <option>Pro Interlock</option>
              <option>Fan Version</option>
            </select>
          </label>
          <label className="field">
            <span>Size</span>
            <select value={form.size} onChange={set("size")}>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>Team Order</option>
            </select>
          </label>
          <label className="field">
            <span>Quantity</span>
            <input type="number" min="1" value={form.qty} onChange={set("qty")} />
          </label>
          <label className="field">
            <span>Sale price (MVR)</span>
            <input type="number" value={form.salePrice} onChange={set("salePrice")} />
          </label>
          <label className="field">
            <span>Supplier cost (MVR)</span>
            <input type="number" value={form.supplierCost} onChange={set("supplierCost")} />
          </label>
          <label className="field">
            <span>Shipping / customs (MVR)</span>
            <input type="number" value={form.shippingCost} onChange={set("shippingCost")} />
          </label>
        </div>

        <button className="btn btnDark btnBlock" onClick={submit} disabled={submitting}>
          {submitting ? "Creating…" : "Create order"}
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard({ initialOrders, quotes }) {
  const [orders, setOrders] = useState(initialOrders);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [tab, setTab] = useState("orders");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleStatusChange = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    startTransition(async () => {
      await updateOrderStatus(id, status);
    });
  };

  const refreshAfterCreate = () => {
    router.refresh();
  };

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.subtotal, 0);
    const profit = orders.reduce((s, o) => s + (o.subtotal - o.supplierCost - o.shippingCost), 0);
    const inPipeline = orders.filter((o) => o.status !== "Delivered").length;
    return { revenue, profit, inPipeline, count: orders.length };
  }, [orders]);

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="headerTitle">Order Pipeline</div>
          <div className="headerSub">Shaviyani Pro — internal dashboard</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btnDark" onClick={() => setShowModal(true)}>
            <Plus size={15} /> New order
          </button>
          <button
            className="btn btnOutlineDark"
            onClick={async () => {
              await adminLogout();
              router.push("/admin/login");
              router.refresh();
            }}
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>

      <div className="statRow">
        <div className="statCard">
          <div className="statLabel">Open orders</div>
          <div className="statValue">{stats.count}</div>
        </div>
        <div className="statCard">
          <div className="statLabel">In pipeline</div>
          <div className="statValue">{stats.inPipeline}</div>
        </div>
        <div className="statCard">
          <div className="statLabel">Revenue</div>
          <div className="statValue">{currency(stats.revenue)}</div>
        </div>
        <div className="statCard">
          <div className="statLabel">Profit</div>
          <div className="statValue">{currency(stats.profit)}</div>
        </div>
      </div>

      <div className="filterRow">
        <button className={"chip" + (tab === "orders" ? " active" : "")} onClick={() => setTab("orders")}>
          Orders
        </button>
        <button className={"chip" + (tab === "quotes" ? " active" : "")} onClick={() => setTab("quotes")}>
          Quote requests ({quotes.length})
        </button>
      </div>

      {tab === "orders" ? (
        <>
          <div className="filterRow">
            {["All", ...STATUSES].map((s) => (
              <button
                key={s}
                className={"chip" + (filter === s ? " active" : "")}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="orderList">
            {filtered.map((o) => (
              <OrderRow key={o.id} order={o} onStatusChange={handleStatusChange} />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: "#8A8F98", fontSize: 13, padding: 30 }}>
                No orders at this stage yet.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="orderList">
          {quotes.map((q) => (
            <div className="orderRow" key={q.id} style={{ borderLeftColor: "var(--teal)" }}>
              <div className="orderDetail" style={{ borderTop: "none", padding: 14 }}>
                <div className="orderProduct" style={{ maxWidth: "none", marginBottom: 4 }}>
                  {q.teamName}
                </div>
                <div className="detailLabel">
                  {q.contactName} · {q.email} {q.phone ? `· ${q.phone}` : ""}
                </div>
                <div className="detailLabel" style={{ marginTop: 8 }}>
                  {q.items.reduce((s, i) => s + i.qty, 0)} item(s) total · {formatDate(q.createdAt)}
                </div>
                <div style={{ marginTop: 8 }}>
                  {q.items.map((i) => (
                    <div className="summaryRow" key={i.id}>
                      <span>
                        {i.style} — {i.material}, {i.size}
                      </span>
                      <span>× {i.qty}</span>
                    </div>
                  ))}
                </div>
                {q.notes && (
                  <div className="productDesc" style={{ marginTop: 8, fontSize: 13 }}>
                    {q.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
          {quotes.length === 0 && (
            <div style={{ textAlign: "center", color: "#8A8F98", fontSize: 13, padding: 30 }}>
              No quote requests yet.
            </div>
          )}
        </div>
      )}

      {showModal && <NewOrderModal onClose={() => setShowModal(false)} onCreated={refreshAfterCreate} />}
    </div>
  );
}
