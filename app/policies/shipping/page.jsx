export const metadata = { title: "Shipping Policy — Shaviyani Pro" };

export default function ShippingPolicyPage() {
  return (
    <div className="page">
      <div className="pageTitle">Shipping Policy</div>
      <p className="pageSub">How Instant Purchase and Pre-Order items get to you.</p>
      <div className="proseBlock">
        <h2>Instant Purchase</h2>
        <p>
          In-stock jerseys ship within 1–2 business days from our Male' warehouse. Delivery within Male'
          typically takes 1–3 days; outer islands via inter-island courier typically take 3–7 days
          depending on ferry/flight schedules.
        </p>
        <h2>Pre-Order</h2>
        <p>
          Pre-order jerseys are ordered from our overseas supplier after you place your order. The typical
          timeline is: Sent to Supplier (2–5 days) → In Transit (7–14 days) → Customs Clearance (2–7 days) →
          Out for Delivery → Delivered. Total estimated time is 3–4 weeks to Male', longer to outer islands.
        </p>
        <h2>Order tracking</h2>
        <p>
          Every order moves through the same visible pipeline: Placed → Sent to Supplier → In Transit →
          Customs Clearance → Out for Delivery → Delivered. Instant Purchase orders skip straight from
          Placed to Out for Delivery. Track any order any time on the{" "}
          <a href="/track" style={{ color: "var(--teal)", fontWeight: 700 }}>
            Track an Order
          </a>{" "}
          page.
        </p>
        <h2>Shipping costs</h2>
        <p>Shipping cost is calculated at checkout based on your island/atoll and order size.</p>
        <h2>Delays</h2>
        <p>
          Customs clearance and courier timing are outside our control and can vary, especially during
          peak season. We'll update your order status as soon as we have news.
        </p>
      </div>
    </div>
  );
}
