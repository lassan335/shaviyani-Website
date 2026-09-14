import { db } from "../../lib/db";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Shaviyani Pro" };

export default async function AdminPage() {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  const quotes = await db.quoteRequest.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const serialized = orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }));
  const serializedQuotes = quotes.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() }));

  return <AdminDashboard initialOrders={serialized} quotes={serializedQuotes} />;
}
