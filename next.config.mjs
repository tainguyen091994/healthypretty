/** @type {import('next').NextConfig} */
const preview = process.env.STATIC_EXPORT === "1";

const nextConfig = {
  reactStrictMode: true,
  // STATIC_EXPORT=1 builds a static copy for the private preview link.
  // Pages come out as flat files (index.html, tu-van.html) with relative asset
  // paths, so the copy works from any folder. Production runs as a normal
  // Next.js server with KiotViet data.
  ...(preview ? { output: "export", trailingSlash: false, assetPrefix: ".", images: { unoptimized: true } } : {}),
  env: { NEXT_PUBLIC_PREVIEW: preview ? "1" : "0" },
};

export default nextConfig;
