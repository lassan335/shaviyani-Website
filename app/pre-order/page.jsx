import { db } from "../../lib/db";
import ProductCard from "../../components/ProductCard";

export const metadata = { title: "Pre-Order — Shaviyani Pro" };

export default async function PreOrderPage() {
  const products = await db.product.findMany({ where: { mode: "preorder" }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="sectionHead" style={{ paddingTop: 32 }}>
        <div>
          <div className="sectionTitle">Pre-Order</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 560 }}>
            Ordered from our overseas supplier once you order — typically ships in 3–4 weeks to Male'.
            Exact timing shows on each product page.
          </p>
        </div>
      </div>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && <div className="emptyState">No pre-order items open right now.</div>}
      </div>
    </div>
  );
}
