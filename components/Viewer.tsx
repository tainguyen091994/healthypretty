"use client";
import { useEffect, useState } from "react";
import type { Product, ProductLite } from "@/lib/types";
import { ProductDetail } from "./ProductDetail";
import { relatedOf } from "@/lib/related";
import { href } from "@/lib/links";
import { A } from "./A";

export function Viewer({ products }: { products: ProductLite[] }) {
  const [state, setState] = useState<{ p: Product; lite: ProductLite } | "missing" | null>(null);
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("sp");
    const lite = products.find((x) => x.slug === slug);
    if (!lite) { setState("missing"); return; }
    fetch("data/details.json")
      .then((r) => r.json())
      .then((d: Record<string, Pick<Product, "images" | "usage" | "code" | "reviewed">>) => {
        const extra = d[lite.slug] ?? { images: lite.image ? [lite.image] : [], usage: null, code: null, reviewed: false };
        setState({ lite, p: { ...lite, ...extra, id: lite.id, sourceName: "", category: "", stock: null } as Product });
        document.title = `${lite.brand} ${lite.title} · Healthy Pretty`;
      })
      .catch(() => setState({ lite, p: { ...lite, images: lite.image ? [lite.image] : [], usage: null, code: null, reviewed: false, sourceName: "", category: "", stock: null } as Product }));
  }, [products]);
  if (state === null) return <div className="wrap" style={{ minHeight: "60vh" }} />;
  if (state === "missing") return <div className="wrap" style={{ padding: "80px 0" }}><p>Không tìm thấy sản phẩm.</p><A className="text-link" href={href("/san-pham")}>Xem tất cả sản phẩm</A></div>;
  return <ProductDetail p={state.p} lite={state.lite} related={relatedOf(state.p, products)} />;
}
