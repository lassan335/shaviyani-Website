import { db } from "../../lib/db";
import ProductCard from "../../components/ProductCard";

export const metadata = { title: "Instant Purchase — Shaviyani Pro" };

export default async function InstantPurchasePage() {
  const products = await db.product.findMany({ where: { mode: "instant" }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="sectionHead" style={{ paddingTop: 32 }}>
        <div>
          <div className="sectionTitle">Instant Purchase</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 520 }}>
            In stock and ready to ship — these orders go straight to Out for Delivery, no supplier wait.
          </p>
        </div>
      </div>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && <div className="emptyState">Nothing in stock right now — check Pre-Order.</div>}
      </div>
    </div>
  );
}
