import { COLLECTIONS } from "../../lib/collections";
import CollectionCard from "../../components/CollectionCard";

export const metadata = { title: "Collections — Shaviyani Pro" };

export default function CollectionsPage() {
  return (
    <div>
      <div className="sectionHead" style={{ paddingTop: 32 }}>
        <div className="sectionTitle">Collections</div>
      </div>
      <div className="collectionGrid">
        {COLLECTIONS.map((c) => (
          <CollectionCard key={c.slug} collection={c} />
        ))}
      </div>
    </div>
  );
}
