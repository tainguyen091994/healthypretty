import type { Product, ProductLite } from "../types";
import { KiotVietSource } from "./kiotviet";
import { LocalJsonSource } from "./local";
import type { CatalogSource } from "./source";

/** Pick the backend with DATA_SOURCE=local|kiotviet. Default: local. */
export const catalog: CatalogSource = process.env.DATA_SOURCE === "kiotviet" ? KiotVietSource : LocalJsonSource;

/** Products a customer may see: hidden types and samples stay out of lists. */
export function isListed(p: Product) {
  return p.type !== "other" && p.inStock;
}

export function toLite(p: Product): ProductLite {
  return {
    id: p.id, slug: p.slug, brand: p.brand, title: p.title, typeLabel: p.typeLabel, size: p.size,
    type: p.type, actives: p.actives, needs: p.needs, skin: p.skin, time: p.time,
    price: p.price, salePrice: p.salePrice, inStock: p.inStock, image: p.images[0] ?? null,
  };
}

export async function listLite(): Promise<ProductLite[]> {
  return (await catalog.listProducts()).filter(isListed).map(toLite);
}
