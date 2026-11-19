// One place that turns site paths into hrefs.
// Production: normal Next.js routes ("/san-pham/abc").
// Preview (STATIC_EXPORT=1): flat .html files at one level, so the build works
// from any folder on a static host ("san-pham.html", "xem.html?sp=abc").
export const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

export function href(path: string): string {
  if (!PREVIEW) return path;
  const [p, q] = path.split("?");
  const clean = p.replace(/^\/+|\/+$/g, "");
  const file = clean === "" ? "index.html" : `${clean}.html`;
  return q ? `${file}?${q}` : file;
}

export function productHref(slug: string): string {
  return PREVIEW ? `xem.html?sp=${encodeURIComponent(slug)}` : `/san-pham/${slug}`;
}

export const ZALO_PHONE = "0397743838";
export const ZALO_PHONE_2 = "0365866099";
export const ZALO_URL = `https://zalo.me/${ZALO_PHONE}`;
export const SHOPEE_URL = "https://shopee.vn/healthyprettycosmetics";
