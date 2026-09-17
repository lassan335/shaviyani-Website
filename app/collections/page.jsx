import { db } from "../../lib/db";
import CollectionCard from "../../components/CollectionCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections — Shaviyani Pro" };

export default async function CollectionsPage() {
  const collections = await db.collection.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="sectionHead" style={{ paddingTop: 32 }}>
        <div className="sectionTitle">Collections</div>
      </div>
      <div className="collectionGrid">
        {collections.map((c) => (
          <CollectionCard key={c.slug} collection={c} />
        ))}
      </div>
    </div>
  );
}
