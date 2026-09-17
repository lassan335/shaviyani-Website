"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "../lib/db";
import { createSessionToken, verifySessionToken, hashPassword, verifyPassword } from "../lib/adminAuth";

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

export async function adminLogin(username, password) {
  if (!process.env.ADMIN_SESSION_SECRET) {
    return { error: "Admin login is not configured (missing ADMIN_SESSION_SECRET)." };
  }
  const uname = (username || "").trim();
  if (!uname || !password) {
    return { error: "Enter both a username and password." };
  }

  const user = await db.adminUser.findUnique({ where: { username: uname } });

  if (user) {
    const ok = await verifyPassword(password, user.salt, user.passwordHash);
    if (!ok) return { error: "Incorrect username or password." };
  } else {
    // Bootstrap fallback: no AdminUser rows exist yet anywhere, or this
    // particular username doesn't — allow the original env-based admin
    // login so a fresh deploy isn't locked out before creating a real user.
    const anyUser = await db.adminUser.findFirst();
    if (anyUser || uname !== "admin" || !process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return { error: "Incorrect username or password." };
    }
  }

  const token = await createSessionToken(process.env.ADMIN_SESSION_SECRET, uname);
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

async function currentAdminUsername() {
  const token = cookies().get("admin_session")?.value;
  const session = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);
  return session?.username || null;
}

export async function currentAdminUser() {
  return { username: await currentAdminUsername() };
}

export async function listAdminUsers() {
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return users.map((u) => ({ username: u.username, createdAt: u.createdAt.toISOString() }));
}

export async function changeAdminPassword(currentPassword, newPassword) {
  const username = await currentAdminUsername();
  if (!username) return { error: "Not logged in." };
  if (!newPassword || newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const user = await db.adminUser.findUnique({ where: { username } });

  if (user) {
    const ok = await verifyPassword(currentPassword, user.salt, user.passwordHash);
    if (!ok) return { error: "Current password is incorrect." };
    const { salt, passwordHash } = await hashPassword(newPassword);
    await db.adminUser.update({ where: { username }, data: { salt, passwordHash } });
  } else {
    // Logged in via the env-based bootstrap fallback (no AdminUser row for
    // this username yet) — verify against ADMIN_PASSWORD, then create the row.
    if (!process.env.ADMIN_PASSWORD || currentPassword !== process.env.ADMIN_PASSWORD) {
      return { error: "Current password is incorrect." };
    }
    const { salt, passwordHash } = await hashPassword(newPassword);
    await db.adminUser.create({ data: { username, salt, passwordHash } });
  }

  return { ok: true };
}

export async function createAdminUser(username, password) {
  const requester = await currentAdminUsername();
  if (!requester) return { error: "Not logged in." };

  const uname = (username || "").trim();
  if (!USERNAME_RE.test(uname)) {
    return { error: "Username must be 3-32 characters: letters, numbers, underscore, dot or hyphen." };
  }
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await db.adminUser.findUnique({ where: { username: uname } });
  if (existing) return { error: "That username is already taken." };

  const { salt, passwordHash } = await hashPassword(password);
  await db.adminUser.create({ data: { username: uname, salt, passwordHash } });
  revalidatePath("/admin/settings");
  return { ok: true };
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
