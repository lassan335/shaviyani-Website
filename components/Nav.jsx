"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "../lib/cart-context";

const LINKS = [
  { href: "/order", label: "Order a Jersey" },
  { href: "/instant-purchase", label: "Instant Purchase" },
  { href: "/pre-order", label: "Pre-Order" },
  { href: "/collections", label: "Collections" },
  { href: "/quote", label: "Team Orders" },
  { href: "/track", label: "Track Order" },
];

export default function Nav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="siteNav">
        <Link href="/" className="brand">
          <Image src="/brand/logo-mark.png" alt="" width={28} height={14} priority style={{ height: 26, width: "auto" }} />
          <Image
            src="/brand/logo-wordmark.png"
            alt="Shaviyani"
            width={152}
            height={20}
            priority
            style={{ height: 15, width: "auto" }}
          />
          <span className="brandPro">PRO</span>
        </Link>
        <div className="navLinks">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="navRight">
          <Link href="/cart" className="bagBtn" aria-label="Cart">
            <ShoppingBag size={20} />
            {count > 0 && <span className="bagCount">{count}</span>}
          </Link>
          <button className="navMenuBtn" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="mobileMenu">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={pathname.startsWith(l.href) ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
