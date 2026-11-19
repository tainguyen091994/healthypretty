import type { ConflictRules, NeedId, Product } from "../types";

/**
 * One interface for every catalogue backend.
 * LocalJsonSource reads data/products.json (built from the old web store).
 * KiotVietSource will call the KiotViet Retail API from the server.
 * Pages only talk to this interface.
 */
export interface CatalogSource {
  name: string;
  listProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  byNeed(need: NeedId): Promise<Product[]>;
  conflictRules(): Promise<ConflictRules>;
}
