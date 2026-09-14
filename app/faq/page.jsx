"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const FAQS = [
  {
    q: "What's the difference between Instant Purchase and Pre-Order?",
    a: "Instant Purchase items are in stock in our Male' warehouse and ship within 1–2 days. Pre-Order items are ordered from our overseas supplier after you order, with an estimated 3–4 week delivery to Male'.",
  },
  {
    q: "How do I know what size to order?",
    a: "Check the Size Chart page for chest/length/shoulder measurements. Pro Interlock club kits run slightly slim — size up if unsure.",
  },
  {
    q: "Can I order custom names and numbers for my team?",
    a: "Yes — use the Request a Quotation page for custom team kits with printed names/numbers and bulk sizing.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track an Order page with your order number and the email you used at checkout to see live status.",
  },
  {
    q: "Do you deliver to outer islands?",
    a: "Yes, via inter-island courier. Delivery takes longer than Male' — see the Shipping Policy page for typical timeframes.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Currently bank transfer or cash on delivery within Male'. Online card payment is coming soon.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "Instant Purchase orders can be changed before they ship. Pre-orders can be cancelled free of charge before they're marked \"Sent to Supplier\" — after that they're already ordered from our supplier on your behalf.",
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faqItem">
      <div className="faqQ" onClick={() => setOpen(!open)}>
        {item.q}
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {open && <div className="faqA">{item.a}</div>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="page">
      <div className="pageTitle">FAQs</div>
      <div>
        {FAQS.map((f) => (
          <FaqItem key={f.q} item={f} />
        ))}
      </div>
    </div>
  );
}
