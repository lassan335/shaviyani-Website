"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { saveUpload } from "../lib/upload";

function csvToList(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- Products ----------

export async function listProducts() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return products.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
}

async function productDataFromForm(formData) {
  const data = {
    slug: formData.get("slug")?.trim(),
    name: formData.get("name")?.trim(),
    team: formData.get("team")?.trim(),
    collection: formData.get("collection")?.trim(),
    league: formData.get("league")?.trim() || null,
    mode: formData.get("mode") || "instant",
    price: Math.round(Number(formData.get("price")) || 0),
    preorderEta: formData.get("preorderEta")?.trim() || null,
    description: formData.get("description")?.trim() || null,
    gradientFrom: formData.get("gradientFrom") || "#0E2438",
    gradientTo: formData.get("gradientTo") || "#17A398",
    materials: csvToList(formData.get("materials")).join(","),
    sizes: csvToList(formData.get("sizes")).join(","),
    featured: formData.get("featured") === "on",
  };

  const file = formData.get("image");
  if (file && file.size > 0) {
    data.image = await saveUpload(file, "products");
  }

  return data;
}

export async function createProduct(formData) {
  const data = await productDataFromForm(formData);
  if (!data.slug || !data.name || !data.team || !data.collection) {
    return { error: "Slug, name, team and collection are required." };
  }
  const existing = await db.product.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "A product with that slug already exists." };

  await db.product.create({ data });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/collections");
  return { ok: true };
}

export async function updateProduct(id, formData) {
  const data = await productDataFromForm(formData);
  if (!data.slug || !data.name || !data.team || !data.collection) {
    return { error: "Slug, name, team and collection are required." };
  }
  await db.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath(`/product/${data.slug}`);
  return { ok: true };
}

export async function deleteProduct(id) {
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true };
}

// ---------- Collections ----------

export async function listCollections() {
  return db.collection.findMany({ orderBy: { order: "asc" } });
}

function collectionDataFromForm(formData) {
  return {
    slug: formData.get("slug")?.trim(),
    name: formData.get("name")?.trim(),
    blurb: formData.get("blurb")?.trim() || null,
    gradientFrom: formData.get("gradientFrom") || "#0E2438",
    gradientTo: formData.get("gradientTo") || "#17A398",
    order: Number(formData.get("order")) || 0,
  };
}

export async function createCollection(formData) {
  const data = collectionDataFromForm(formData);
  if (!data.slug || !data.name) return { error: "Slug and name are required." };
  const existing = await db.collection.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "A collection with that slug already exists." };

  await db.collection.create({ data });
  revalidatePath("/admin/collections");
  revalidatePath("/");
  revalidatePath("/collections");
  return { ok: true };
}

export async function updateCollection(id, formData) {
  const data = collectionDataFromForm(formData);
  if (!data.slug || !data.name) return { error: "Slug and name are required." };
  await db.collection.update({ where: { id }, data });
  revalidatePath("/admin/collections");
  revalidatePath("/");
  revalidatePath("/collections");
  return { ok: true };
}

export async function deleteCollection(id) {
  await db.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
  revalidatePath("/");
  revalidatePath("/collections");
  return { ok: true };
}

// ---------- Homepage content ----------

export async function getSiteContent() {
  return db.siteContent.findUnique({ where: { id: "home" } });
}

export async function updateSiteContent(formData) {
  const data = {
    heroKicker: formData.get("heroKicker")?.trim() || "",
    heroTitleLine1: formData.get("heroTitleLine1")?.trim() || "",
    heroTitleAccent: formData.get("heroTitleAccent")?.trim() || "",
    heroBody: formData.get("heroBody")?.trim() || "",
    heroTrustLine: formData.get("heroTrustLine")?.trim() || "",
    campaignKicker: formData.get("campaignKicker")?.trim() || "",
    campaignTitleLine1: formData.get("campaignTitleLine1")?.trim() || "",
    campaignTitleAccent: formData.get("campaignTitleAccent")?.trim() || "",
    campaignBody: formData.get("campaignBody")?.trim() || "",
  };

  const heroImage = formData.get("heroImage");
  if (heroImage && heroImage.size > 0) {
    data.heroImage = await saveUpload(heroImage, "site");
  }
  const campaignImage = formData.get("campaignImage");
  if (campaignImage && campaignImage.size > 0) {
    data.campaignImage = await saveUpload(campaignImage, "site");
  }

  await db.siteContent.upsert({
    where: { id: "home" },
    create: { id: "home", ...data },
    update: data,
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true };
}
