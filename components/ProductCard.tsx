import type { ProductLite } from "@/lib/types";
import { productHref } from "@/lib/links";
import { vnd } from "@/lib/format";
import { A } from "./A";

export function ProductCard({ p }: { p: ProductLite }) {
  const sale = p.salePrice && p.salePrice < p.price;
  return (
    <A href={productHref(p.slug)} className="card">
      <div className="card-media">
        {p.image
          ? <img src={p.image} alt={`${p.brand} ${p.title}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" data-source="shop-catalogue" />
          : <div className="placeholder" style={{ width: "100%", height: "100%" }} />}
      </div>
      <div>
        <div className="card-brand">{p.brand} · {p.typeLabel}{p.size ? ` · ${p.size}` : ""}</div>
        <div className="card-title">{p.title}</div>
      </div>
      <div className="card-meta">
        <span className="price">{vnd(sale ? p.salePrice! : p.price)}{sale ? <s>{vnd(p.price)}</s> : null}</span>
      </div>
    </A>
  );
}
