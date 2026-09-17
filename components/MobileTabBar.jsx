"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "../lib/cart-context";

const TABS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/collections", label: "Shop", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/track", label: "Track", icon: Truck },
];

export default function MobileTabBar() {
  const { count } = useCart();
  const pathname = usePathname();

  return (
    <nav className="mobileTabBar" aria-label="Primary">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        const Icon = t.icon;
        return (
          <Link key={t.href} href={t.href} className={"mobileTabItem" + (active ? " active" : "")}>
            <span className="mobileTabIcon">
              <Icon size={19} />
              {t.href === "/cart" && count > 0 && <span className="mobileTabBadge">{count}</span>}
            </span>
            <span className="mobileTabLabel">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
