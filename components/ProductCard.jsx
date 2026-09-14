import Link from "next/link";
import Image from "next/image";
import { currency } from "../lib/format";

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <div
        className="cardArt"
        style={{ background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})` }}
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 900px) 25vw, (min-width: 640px) 33vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        )}
        <span className="modeTag" style={{ position: "relative", zIndex: 1 }}>
          {product.mode === "instant" ? "Instant" : "Pre-Order"}
        </span>
      </div>
      <div className="cardBody">
        <div className="cardTeam">{product.team}</div>
        <div className="cardName">{product.name}</div>
        <div className="cardPrice">{currency(product.price)}</div>
      </div>
    </Link>
  );
}
