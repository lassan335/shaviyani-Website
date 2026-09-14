export const metadata = { title: "Refund Policy — Shaviyani Pro" };

export default function RefundPolicyPage() {
  return (
    <div className="page">
      <div className="pageTitle">Refund Policy</div>
      <p className="pageSub">Returns, exchanges and cancellations.</p>
      <div className="proseBlock">
        <h2>Instant Purchase — wrong size or fault</h2>
        <p>
          If a jersey arrives faulty or the wrong size was sent in error, contact us within 7 days of
          delivery for a free exchange or full refund. Item must be unworn with tags attached.
        </p>
        <h2>Instant Purchase — change of mind</h2>
        <p>
          Unworn items in original condition can be exchanged for a different size within 7 days of
          delivery. Change-of-mind refunds (not exchanges) are subject to a restocking review.
        </p>
        <h2>Pre-Order cancellations</h2>
        <p>
          Pre-orders can be cancelled free of charge before the order is marked "Sent to Supplier." Once
          sent to our supplier, the order is committed and cannot be cancelled, since it has already been
          custom-ordered on your behalf.
        </p>
        <h2>Custom team kits</h2>
        <p>
          Custom kits with printed names/numbers are made to order and are non-refundable once production
          has started, except for manufacturing defects.
        </p>
        <h2>How to request a refund/exchange</h2>
        <p>
          Message us via the{" "}
          <a href="/contact" style={{ color: "var(--teal)", fontWeight: 700 }}>
            Contact
          </a>{" "}
          page with your order number and photos if the item is faulty.
        </p>
      </div>
    </div>
  );
}
