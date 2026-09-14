"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useCart } from "../../../lib/cart-context";
import { currency } from "../../../lib/format";

export default function ProductDetail({ product }) {
  const materials = product.materials.split(",");
  const sizes = product.sizes.split(",");
  const [material, setMaterial] = useState(materials[0]);
  const [size, setSize] = useState(sizes[1] || sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const isPreorder = product.mode === "preorder";

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      team: product.team,
      material,
      size,
      qty,
      price: product.price,
      mode: isPreorder ? "Pre-Order" : "Instant",
      gradientFrom: product.gradientFrom,
      gradientTo: product.gradientTo,
      image: product.image || null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="productPage">
      <div
        className="productArt"
        style={{ background: `linear-gradient(135deg, ${product.gradientFrom}, ${product.gradientTo})` }}
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 760px) 50vw, 100vw"
            style={{ objectFit: "cover", borderRadius: 14 }}
            priority
          />
        )}
      </div>

      <div>
        <div className="productTeam">{product.team}</div>
        <div className="productName">{product.name}</div>
        <div className="productPrice">{currency(product.price)}</div>

        {isPreorder && (
          <div className="preorderNote">
            Pre-order — ships from supplier, estimated {product.preorderEta || "3–4 weeks to Male'"}
          </div>
        )}

        {product.description && <p className="productDesc">{product.description}</p>}

        <div className="optionLabel">Material</div>
        <div className="optionRow">
          {materials.map((m) => (
            <button
              key={m}
              className={"optionChip" + (material === m ? " active" : "")}
              onClick={() => setMaterial(m)}
              type="button"
            >
              {m}
            </button>
          ))}
        </div>

        <div className="optionLabel">Size</div>
        <div className="optionRow">
          {sizes.map((s) => (
            <button
              key={s}
              className={"optionChip sizeChip" + (size === s ? " active" : "")}
              onClick={() => setSize(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        <Link href="/size-chart" className="sizeChartLink">
          View size chart
        </Link>

        <div className="qtyRow">
          <button className="qtyBtn" onClick={() => setQty((q) => Math.max(1, q - 1))} type="button">
            −
          </button>
          <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
          <button className="qtyBtn" onClick={() => setQty((q) => q + 1)} type="button">
            +
          </button>
        </div>

        <button
          className={"btn btnPrimary btnBlock" + (added ? " btnSuccess" : "")}
          style={{ marginTop: 20 }}
          onClick={handleAdd}
        >
          {added ? (
            <>
              <Check size={16} /> Added to bag
            </>
          ) : isPreorder ? (
            "Pre-order now"
          ) : (
            "Add to bag"
          )}
        </button>
        {added && (
          <button
            className="btn btnOutlineDark btnBlock"
            style={{ marginTop: 10 }}
            onClick={() => router.push("/cart")}
            type="button"
          >
            Go to cart
          </button>
        )}
      </div>
    </div>
  );
}
