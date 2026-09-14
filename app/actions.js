"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "../lib/db";
import { createSessionToken } from "../lib/adminAuth";

export async function adminLogin(password) {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return { error: "Admin login is not configured (missing ADMIN_PASSWORD/ADMIN_SESSION_SECRET)." };
  }
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Incorrect password." };
  }
  const token = await createSessionToken(process.env.ADMIN_SESSION_SECRET);
  cookies().set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return { ok: true };
}

export async function adminLogout() {
  cookies().set("admin_session", "", { path: "/", maxAge: 0 });
}

function serializeOrder(order) {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    statusLogs: (order.statusLogs || []).map((l) => ({ ...l, changedAt: l.changedAt.toISOString() })),
  };
}

export async function createOrder({ customer, items, isPreorder }) {
  if (!customer?.name || !customer?.email || !customer?.address) {
    return { error: "Please fill in your name, email and delivery address." };
  }
  if (!items?.length) {
    return { error: "Your cart is empty." };
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const orderNumber = "JZ-" + Math.floor(1000 + Math.random() * 9000);

  const order = await db.order.create({
    data: {
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || null,
      address: customer.address,
      island: customer.island || null,
      subtotal,
      isPreorder: !!isPreorder,
      status: "Placed",
      items: {
        create: items.map((i) => ({
          productId: i.productId || null,
          name: i.name,
          material: i.material,
          size: i.size,
          qty: i.qty,
          price: i.price,
        })),
      },
      statusLogs: { create: [{ status: "Placed" }] },
    },
  });

  revalidatePath("/admin");
  return { orderNumber: order.orderNumber };
}

export async function createManualOrder(data) {
  if (!data?.customer || !data?.product || !data?.salePrice) {
    return { error: "Customer, product and sale price are required." };
  }
  const qty = Number(data.qty) || 1;
  const salePrice = Number(data.salePrice) || 0;
  const orderNumber = "JZ-" + Math.floor(1000 + Math.random() * 9000);

  await db.order.create({
    data: {
      orderNumber,
      customerName: data.customer,
      customerEmail: data.email || "unknown@shaviyani.com",
      address: data.address || "—",
      subtotal: salePrice,
      supplierCost: Number(data.supplierCost) || 0,
      shippingCost: Number(data.shippingCost) || 0,
      status: "Placed",
      items: {
        create: [
          {
            name: data.product,
            material: data.material,
            size: data.size,
            qty,
            price: Math.round(salePrice / qty),
          },
        ],
      },
      statusLogs: { create: [{ status: "Placed" }] },
    },
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateOrderStatus(orderId, status) {
  await db.order.update({ where: { id: orderId }, data: { status } });
  await db.orderStatusLog.create({ data: { orderId, status } });
  revalidatePath("/admin");
}

export async function trackOrder({ orderNumber, email }) {
  if (!orderNumber || !email) {
    return { error: "Enter both your order number and the email used at checkout." };
  }
  const order = await db.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include: { items: true, statusLogs: { orderBy: { changedAt: "asc" } } },
  });
  if (!order || order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return { error: "We couldn't find an order with that order number and email." };
  }
  return { order: serializeOrder(order) };
}

export async function submitQuote(data) {
  if (!data?.teamName || !data?.contactName || !data?.email) {
    return { error: "Please fill in the required fields." };
  }
  const items = (data.items || []).filter((i) => i.style && i.material && i.size && Number(i.qty) > 0);
  if (items.length === 0) {
    return { error: "Add at least one item with a style, material, size and quantity." };
  }
  await db.quoteRequest.create({
    data: {
      teamName: data.teamName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || null,
      notes: data.notes || null,
      items: {
        create: items.map((i) => ({
          style: i.style,
          material: i.material,
          size: i.size,
          qty: Number(i.qty),
        })),
      },
    },
  });
  return { ok: true };
}
