import fs from "fs/promises";
import path from "path";

// Saves an uploaded File to durable storage and returns a public URL/path
// that can be used directly in <Image src=...>.
//
// - In production (or whenever BLOB_READ_WRITE_TOKEN is set), uploads go to
//   Vercel Blob — required because Vercel's filesystem is read-only/ephemeral.
// - In local dev without that token, files are written straight into
//   public/uploads/ so the feature works out of the box with no setup.
export async function saveUpload(file, folder = "uploads") {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    // Pass the token explicitly — @vercel/blob can otherwise auto-detect a
    // Vercel OIDC token (e.g. from `vercel env pull` in .env.local) and try
    // that instead, which fails outside environments where OIDC is enabled.
    const blob = await put(filename, file, { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN });
    return blob.url;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const localName = filename.split("/").pop();
  await fs.writeFile(path.join(dir, localName), buffer);
  return `/uploads/${localName}`;
}
