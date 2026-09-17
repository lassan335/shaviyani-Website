import Link from "next/link";
import { Flag, Shirt, Award, Briefcase } from "lucide-react";

const ICONS = {
  "national-team": Flag,
  "club-kits": Shirt,
  "match-officials": Award,
  "corporate-apparel": Briefcase,
};

export default function CollectionCard({ collection }) {
  const Icon = ICONS[collection.slug] || Shirt;

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="collectionCard"
      style={{ background: `linear-gradient(135deg, ${collection.gradientFrom}, ${collection.gradientTo})` }}
    >
      <div className="collectionCardTop">
        <div className="collectionCardIcon">
          <Icon size={16} />
        </div>
      </div>
      <div className="collectionCardBottom">
        <div className="collectionCardName">{collection.name}</div>
        <div className="collectionCardBlurb">{collection.blurb}</div>
      </div>
    </Link>
  );
}
