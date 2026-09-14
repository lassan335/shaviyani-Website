import Link from "next/link";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerGrid">
        <div className="footerCol">
          <h4>Shop</h4>
          <Link href="/instant-purchase">Instant Purchase</Link>
          <Link href="/pre-order">Pre-Order</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/size-chart">Size Chart</Link>
        </div>
        <div className="footerCol">
          <h4>Teams &amp; Bulk</h4>
          <Link href="/quote">Request a Quotation</Link>
          <Link href="/track">Track an Order</Link>
        </div>
        <div className="footerCol">
          <h4>Help</h4>
          <Link href="/policies/shipping">Shipping Policy</Link>
          <Link href="/policies/refunds">Refund Policy</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footerCol">
          <h4>Shaviyani Pro</h4>
          <p>Sports jerseys, corporate uniforms and custom team kits, made in the Maldives.</p>
          <p>sales@shaviyani.com</p>
          <p>+960 933 8292</p>
        </div>
      </div>
      <div className="footerBottom">
        © {new Date().getFullYear()} Shaviyani Pro, a division of Shaviyani Holdings Pvt Ltd. All prices in MVR.
      </div>
    </footer>
  );
}
