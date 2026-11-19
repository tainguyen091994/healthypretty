import type { ConflictRules, NeedId, Product } from "../types";
import type { CatalogSource } from "./source";
import { LocalJsonSource } from "./local";

/**
 * KiotViet Retail API source. NOT ACTIVE YET. See docs/kiotviet.md.
 *
 * Server only. Never import this file from a client component:
 * it reads KIOTVIET_CLIENT_ID and KIOTVIET_CLIENT_SECRET from the environment.
 *
 * Plan:
 * 1. POST https://id.kiotviet.vn/connect/token (client_credentials, scope PublicApi.Access)
 *    and cache the access token until it expires.
 * 2. GET https://public.kiotapi.com/products?includeInventory=true&pageSize=100 with headers
 *    Retailer: <KIOTVIET_RETAILER> and Authorization: Bearer <token>. Page with currentItem.
 * 3. Map each KiotViet product to Product with mapProduct(). Price, stock and images come
 *    from KiotViet. Tags (type, needs, actives, time) come from data/overrides.json keyed by
 *    product code, so the pharmacist's edits survive every sync.
 * 4. Revalidate every 15 minutes (Next.js fetch cache), or on a KiotViet webhook.
 *
 * Confirm endpoint names and field names against the current KiotViet API docs before coding.
 */
export interface KiotVietProduct {
  id: number;
  code: string;
  name: string;
  fullName?: string;
  categoryName?: string;
  basePrice: number;
  images?: string[];
  inventories?: { onHand: number }[];
  isActive?: boolean;
  description?: string;
}

export function mapProduct(k: KiotVietProduct, tags: Partial<Product> | undefined): Product {
  const onHand = (k.inventories ?? []).reduce((n, i) => n + (i.onHand ?? 0), 0);
  return {
    id: String(k.id),
    code: k.code,
    slug: tags?.slug ?? String(k.id),
    brand: tags?.brand ?? k.categoryName ?? "",
    title: tags?.title ?? k.name,
    typeLabel: tags?.typeLabel ?? "",
    size: tags?.size ?? null,
    sourceName: k.fullName ?? k.name,
    category: k.categoryName ?? "",
    type: tags?.type ?? "other",
    actives: tags?.actives ?? [],
    needs: tags?.needs ?? [],
    skin: tags?.skin ?? ["all"],
    time: tags?.time ?? "both",
    price: k.basePrice,
    salePrice: null,
    inStock: onHand > 0,
    stock: onHand,
    images: k.images ?? [],
    usage: tags?.usage ?? null,
    reviewed: tags?.reviewed ?? false,
  };
}

export const KiotVietSource: CatalogSource = {
  name: "kiotviet",
  async listProducts(): Promise<Product[]> {
    throw new Error("KiotVietSource is not connected yet. Set DATA_SOURCE=local or finish lib/data/kiotviet.ts.");
  },
  async getProduct(_slug: string) { return (await this.listProducts()).find((p) => p.slug === _slug) ?? null; },
  async byNeed(need: NeedId) { return (await this.listProducts()).filter((p) => p.needs.includes(need)); },
  async conflictRules(): Promise<ConflictRules> { return LocalJsonSource.conflictRules(); },
};
