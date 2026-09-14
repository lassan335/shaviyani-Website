import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import ProductDetail from "./ProductDetail";

export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }) {
  const product = await db.product.findUnique({ where: { slug: params.slug } });
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
