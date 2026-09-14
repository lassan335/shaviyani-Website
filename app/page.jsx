import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Truck, ShieldCheck, RotateCcw, Headset } from "lucide-react";
import { db } from "../lib/db";
import ProductCard from "../components/ProductCard";
import CollectionCard from "../components/CollectionCard";
import { COLLECTIONS } from "../lib/collections";

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    db.product.findMany({ where: { featured: true }, take: 4 }),
    db.product.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const heroProduct = featured.find((p) => p.image) || latest.find((p) => p.image);

  return (
    <div>
      <div className="hero">
        <div className="heroShape" />
        <div className="heroInner">
          <div>
            <div className="heroKicker">Made in the Maldives</div>
            <div className="heroTitle">
              Kits built
              <span className="accentLine">for match day.</span>
            </div>
            <div className="heroBody">
              Sports jerseys, corporate uniforms and custom team kits — sublimated designs, your names
              and numbers, buy in stock now or pre-order for your club.
            </div>
            <div className="heroActions">
              <Link href="/instant-purchase" className="btn btnPrimary">
                Shop instant purchase <ChevronRight size={15} />
              </Link>
              <Link href="/quote" className="btn btnOutline">
                Request a team quote
              </Link>
            </div>
            <div className="heroTrust">
              Custom kits already worn by MMA Social Club, Felayla FC and Maldives Islamic Bank.
            </div>
          </div>

          {heroProduct && (
            <div className="heroArt">
              <Image
                src={heroProduct.image}
                alt={heroProduct.name}
                fill
                sizes="(min-width: 760px) 45vw, 100vw"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          )}
        </div>
      </div>

      {featured.length > 0 && (
        <>
          <div className="sectionHead">
            <div className="sectionTitle">Featured</div>
          </div>
          <div className="grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}

      <div className="sectionHead">
        <div className="sectionTitle">Shop by collection</div>
        <Link href="/collections" className="sectionLink">
          All collections <ChevronRight size={14} />
        </Link>
      </div>
      <div className="collectionGrid">
        {COLLECTIONS.map((c) => (
          <CollectionCard key={c.slug} collection={c} />
        ))}
      </div>

      <div className="campaignSection">
        <div className="campaignArt">
          <Image
            src="/brand/campaign-custom-kits.jpg"
            alt="Custom sponsored team jersey, held up by the squad"
            fill
            sizes="(min-width: 760px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="campaignCopy">
          <div className="heroKicker">Custom Sponsor Kits</div>
          <div className="heroTitle">
            Your brand
            <span className="accentLine">on the pitch.</span>
          </div>
          <div className="heroBody">
            From club jerseys to corporate-sponsored kits — we design, sublimate and deliver custom
            team wear with your logo, colours, names and numbers.
          </div>
          <div className="heroActions">
            <Link href="/quote" className="btn btnPrimary">
              Request a team quote <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="sectionHead">
        <div className="sectionTitle">New in</div>
      </div>
      <div className="grid">
        {latest.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="featureStrip">
        <div className="featureItem">
          <Truck size={20} />
          <div>
            <div className="featureItemTitle">Island-wide delivery</div>
            <div className="featureItemSub">Male' and outer islands</div>
          </div>
        </div>
        <div className="featureItem">
          <ShieldCheck size={20} />
          <div>
            <div className="featureItemTitle">Order tracking</div>
            <div className="featureItemSub">Live status, every order</div>
          </div>
        </div>
        <div className="featureItem">
          <RotateCcw size={20} />
          <div>
            <div className="featureItemTitle">Simple exchanges</div>
            <div className="featureItemSub">Wrong size? We'll fix it</div>
          </div>
        </div>
        <div className="featureItem">
          <Headset size={20} />
          <div>
            <div className="featureItemTitle">Real support</div>
            <div className="featureItemSub">Sun–Thu, 9am–6pm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
