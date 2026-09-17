/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allows <Image> to render uploads saved to Vercel Blob (lib/upload.js)
    // in production. Local dev uploads under /public/uploads need no entry.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

module.exports = nextConfig;
