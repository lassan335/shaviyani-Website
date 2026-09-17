import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import ProductCard from "../../../components/ProductCard";

export async function generateStaticParams() {
  const collections = await db.collection.findMany({ select: { slug: true } });
  return collections.map((c) => ({ slug: c.slug }));
}

export default async function CollectionPage({ params }) {
  const meta = await db.collection.findUnique({ where: { slug: params.slug } });
  if (!meta) notFound();

  const products = await db.product.findMany({
    where: { collection: meta.name },
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
