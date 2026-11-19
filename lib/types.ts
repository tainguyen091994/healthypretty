// Shared catalogue types. Every data source (local JSON now, KiotViet later)
// must return these shapes, so pages never depend on where data comes from.

export type NeedId = "dau-mun" | "phuc-hoi" | "tham-sam" | "lao-hoa" | "sau-lieu-trinh" | "toc-co-the";

export type ProductType =
  | "cleanser" | "remover" | "toner" | "serum" | "moisturizer" | "sunscreen" | "spot"
  | "mask" | "exfoliant" | "eye" | "lip" | "body" | "hair" | "supplement" | "mist" | "other";

export type ActiveTag =
  | "retinoid" | "bha" | "aha" | "bpo" | "vitc" | "niacinamide" | "tranexamic" | "azelaic"
  | "brightener" | "regen" | "ceramide" | "hyaluronic" | "soothing" | "spf";

export type SkinTag = "oily" | "dry" | "sensitive" | "all";

export interface Product {
  id: string; // KiotViet ids are kept as strings
  code: string | null;
  slug: string;
  brand: string;
  title: string;
  typeLabel: string;
  size: string | null;
  sourceName: string;
  category: string;
  type: ProductType;
  actives: ActiveTag[];
  needs: NeedId[];
  skin: SkinTag[];
  time: "am" | "pm" | "both";
  price: number;
  salePrice: number | null;
  inStock: boolean;
  stock: number | null;
  images: string[];
  usage: string | null;
  reviewed: boolean;
}

/** The fields list pages and the quiz need. Keeps page payloads small. */
export type ProductLite = Pick<
  Product,
  "id" | "slug" | "brand" | "title" | "typeLabel" | "size" | "type" | "actives" | "needs" | "skin" | "time" | "price" | "salePrice" | "inStock"
> & { image: string | null };

export interface ConflictRule {
  id: string;
  a: ActiveTag[];
  b: ActiveTag[];
  when: "same-session" | "morning";
  severity: "avoid" | "caution";
  note: string;
}

export interface ConflictRules {
  version: string;
  reviewedBy: string | null;
  rules: ConflictRule[];
}
