import type { ProductLite } from "./types";

/** Products for the same first need, of a different type, so the list fills a routine gap. */
export function relatedOf(p: { slug: string; needs: string[]; type: string }, all: ProductLite[], n = 4) {
  return all.filter((x) => x.slug !== p.slug && x.needs[0] === p.needs[0] && x.type !== p.type).slice(0, n);
}
