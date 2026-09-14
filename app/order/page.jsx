import { db } from "../../lib/db";
import OrderApp from "./OrderApp";

export const metadata = { title: "Order — Shaviyani Pro" };

export default async function OrderPage() {
  const products = await db.product.findMany({ orderBy: { name: "asc" } });
  return <OrderApp products={products} />;
}
