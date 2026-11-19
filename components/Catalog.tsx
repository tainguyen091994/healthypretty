"use client";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { NeedId, ProductLite, ProductType } from "@/lib/types";
import { NEED_LABEL } from "@/lib/quiz";
import { ProductCard } from "./ProductCard";

const NEEDS = Object.keys(NEED_LABEL) as NeedId[];
const TYPE_GROUPS: { label: string; types: ProductType[] }[] = [
  { label: "Làm sạch", types: ["cleanser", "remover"] },
  { label: "Toner, xịt khoáng", types: ["toner", "mist"] },
  { label: "Tinh chất", types: ["serum", "spot"] },
  { label: "Kem dưỡng", types: ["moisturizer", "eye", "lip"] },
  { label: "Chống nắng", types: ["sunscreen"] },
  { label: "Tẩy da chết, mặt nạ", types: ["exfoliant", "mask"] },
  { label: "Cơ thể, tóc", types: ["body", "hair"] },
  { label: "Viên uống", types: ["supplement"] },
];
const PAGE = 24;
type Sort = "goi-y" | "gia-tang" | "gia-giam";
const price = (p: ProductLite) => p.salePrice ?? p.price;

export function Catalog({ products }: { products: ProductLite[] }) {
  const [need, setNeed] = useState<NeedId | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("goi-y");
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search);
    const n = s.get("need") as NeedId | null;
    if (n && NEEDS.includes(n)) setNeed(n);
    if (s.get("brand")) setBrand(s.get("brand")!);
    if (s.get("q")) setQ(s.get("q")!);
  }, []);

  useEffect(() => {
    const s = new URLSearchParams();
    if (need) s.set("need", need);
    if (brand) s.set("brand", brand);
    if (q) s.set("q", q);
    const qs = s.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
    setShown(PAGE);
  }, [need, brand, q, group, sort]);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b)), [products]);
  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

  const list = useMemo(() => {
    const types = TYPE_GROUPS.find((g) => g.label === group)?.types;
    const words = fold(q).split(/\s+/).filter(Boolean);
    const out = products.filter((p) =>
      (!need || p.needs.includes(need)) &&
      (!types || types.includes(p.type)) &&
      (!brand || p.brand === brand) &&
      (!words.length || words.every((w) => fold(`${p.brand} ${p.title} ${p.typeLabel}`).includes(w))));
    if (sort === "gia-tang") out.sort((a, b) => price(a) - price(b));
    else if (sort === "gia-giam") out.sort((a, b) => price(b) - price(a));
    else if (need) out.sort((a, b) => a.needs.indexOf(need) - b.needs.indexOf(need));
    return out;
  }, [products, need, group, brand, q, sort]);

  return (
    <div className="wrap">
      <div style={{ paddingTop: 40 }}>
        <h1 className="display h2">{need ? <>Cho <em>{NEED_LABEL[need].toLowerCase()}</em></> : <>Tất cả <em>sản phẩm</em></>}</h1>
      </div>
      <div className="catalog">
        <aside className="filters" aria-label="Bộ lọc">
          <div>
            <label htmlFor="q" className="sr-only">Tìm sản phẩm</label>
            <div style={{ position: "relative" }}>
              <Search size={18} aria-hidden style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-2)" }} />
              <input id="q" className="field" style={{ paddingLeft: 40 }} type="search" placeholder="Tìm tên, thương hiệu" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div>
            <h2>Nhu cầu da</h2>
            <div className="chips scroll">
              <button className="chip" aria-pressed={!need} onClick={() => setNeed(null)}>Tất cả</button>
              {NEEDS.map((n) => <button key={n} className="chip" aria-pressed={need === n} onClick={() => setNeed(need === n ? null : n)}>{NEED_LABEL[n]}</button>)}
            </div>
          </div>
          <div>
            <h2>Loại sản phẩm</h2>
            <div className="chips scroll">
              {TYPE_GROUPS.map((g) => <button key={g.label} className="chip" aria-pressed={group === g.label} onClick={() => setGroup(group === g.label ? null : g.label)}>{g.label}</button>)}
            </div>
          </div>
          <div>
            <h2><label htmlFor="brand">Thương hiệu</label></h2>
            <select id="brand" className="field" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Tất cả thương hiệu</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </aside>
        <section aria-label="Danh sách sản phẩm">
          <div className="toolbar">
            <span className="muted small" aria-live="polite">{list.length} sản phẩm</span>
            <label className="small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              Sắp xếp
              <select className="field" style={{ width: "auto", minHeight: 40 }} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="goi-y">Gợi ý</option>
                <option value="gia-tang">Giá thấp đến cao</option>
                <option value="gia-giam">Giá cao đến thấp</option>
              </select>
            </label>
          </div>
          {list.length ? (
            <div className="grid">{list.slice(0, shown).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
          ) : (
            <p className="muted">Không có sản phẩm khớp bộ lọc. Thử bỏ bớt một lựa chọn.</p>
          )}
          {shown < list.length ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
              <button className="btn btn-quiet" onClick={() => setShown(shown + PAGE)}>Xem thêm {Math.min(PAGE, list.length - shown)} sản phẩm</button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
