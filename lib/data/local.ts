import products from "../../data/products.json";
import rules from "../../data/conflict-rules.json";
import picks from "../../data/image-picks.json";
import type { ConflictRules, NeedId, Product } from "../types";
import type { CatalogSource } from "./source";

// image-picks.json moves the cleanest photo (no promo frame) to the front.
// Made by scripts/pick_clean_image.py. KiotViet data can use the same file.
const pickMap = picks as Record<string, number>;
const all = (products as Product[]).map((p) => {
  const i = pickMap[p.slug];
  return i ? { ...p, images: [p.images[i], ...p.images.filter((_, j) => j !== i)] } : p;
});

export const LocalJsonSource: CatalogSource = {
  name: "local-json",
  async listProducts() { return all; },
  async getProduct(slug) { return all.find((p) => p.slug === slug) ?? null; },
  async byNeed(need: NeedId) { return all.filter((p) => p.needs.includes(need)); },
  async conflictRules() { return rules as ConflictRules; },
};
