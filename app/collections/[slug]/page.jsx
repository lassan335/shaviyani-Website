import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import ProductCard from "../../../components/ProductCard";
import { COLLECTIONS, collectionSlugToName } from "../../../lib/collections";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export default async function CollectionPage({ params }) {
  const meta = COLLECTIONS.find((c) => c.slug === params.slug);
  if (!meta) notFound();

  const products = await db.product.findMany({
    where: { collection: collectionSlugToName(params.slug) },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="sectionHead" style={{ paddingTop: 32 }}>
        <div>
          <div className="sectionTitle">{meta.name}</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{meta.blurb}</p>
        </div>
      </div>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && <div className="emptyState">No jerseys in this collection yet.</div>}
      </div>
    </div>
  );
}
