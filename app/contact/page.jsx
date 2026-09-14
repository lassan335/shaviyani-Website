export const metadata = { title: "Contact — Shaviyani Pro" };

export default function ContactPage() {
  return (
    <div className="page">
      <div className="pageTitle">Contact</div>
      <p className="pageSub">Questions about an order, sizing, or a team quote? Reach us here.</p>
      <div className="proseBlock">
        <h2>Email</h2>
        <p>sales@shaviyani.com</p>
        <p>info@shaviyani.com</p>
        <h2>Phone / WhatsApp</h2>
        <p>+960 933 8292</p>
        <p>+960 918 4848</p>
        <h2>Address</h2>
        <p>M. Raaz, Shaariuvarudhee Magu, Male', Maldives</p>
        <h2>Social</h2>
        <p>facebook.com/shaviyanisolutions</p>
        <p>instagram.com/shaviyanisigns</p>
        <h2>For team/bulk orders</h2>
        <p>
          Use the{" "}
          <a href="/quote" style={{ color: "var(--teal)", fontWeight: 700 }}>
            Request a Quotation
          </a>{" "}
          page for the fastest response on custom kits.
        </p>
      </div>
    </div>
  );
}
