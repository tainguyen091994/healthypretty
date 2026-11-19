"use client";
import { useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
import type { Product, ProductLite } from "@/lib/types";
import { NEED_LABEL } from "@/lib/quiz";
import { ACTIVE_LABEL, isSafeText, vnd } from "@/lib/format";
import { addToCart } from "@/lib/cart";
import { href, ZALO_URL } from "@/lib/links";
import { handOff } from "@/lib/zalo";
import { track } from "@/lib/track";
import { ProductCard } from "./ProductCard";
import { A } from "./A";
import { useToast } from "./useToast";

const TIME = { am: "Buổi sáng", pm: "Buổi tối", both: "Sáng hoặc tối" } as const;

export function ProductDetail({ p, lite, related }: { p: Product; lite: ProductLite; related: ProductLite[] }) {
  const [img, setImg] = useState(0);
  const toast = useToast();
  const sale = p.salePrice && p.salePrice < p.price;
  const usage = isSafeText(p.usage) ? p.usage : null;

  return (
    <div className="wrap">
      <nav aria-label="Đường dẫn" className="small muted" style={{ paddingTop: 24 }}>
        <A href={href("/san-pham")}>Sản phẩm</A>
        {p.needs[0] ? <> / <A href={href(`/san-pham?need=${p.needs[0]}`)}>{NEED_LABEL[p.needs[0]]}</A></> : null}
      </nav>
      <div className="pdp">
        <div>
          <div className="gallery-main">
            {p.images[img] ? <img src={p.images[img]} alt={`${p.brand} ${p.title}`} referrerPolicy="no-referrer" data-source="shop-catalogue" /> : <div className="placeholder" style={{ height: "100%" }} />}
          </div>
          {p.images.length > 1 ? (
            <div className="thumbs">
              {p.images.map((src, i) => (
                <button key={src} aria-pressed={i === img} aria-label={`Ảnh ${i + 1}`} onClick={() => setImg(i)}>
                  <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="pdp-info">
          <div>
            <div className="muted">{p.brand}</div>
            <h1 className="display h2" style={{ marginTop: 4 }}>{p.title}</h1>
            <div style={{ fontSize: 22 }} className="price">{vnd(sale ? p.salePrice! : p.price)}{sale ? <s>{vnd(p.price)}</s> : null}</div>
          </div>
          <dl className="facts">
            <dt>Loại</dt><dd>{p.typeLabel}</dd>
            {p.size ? <><dt>Dung tích</dt><dd>{p.size}</dd></> : null}
            {p.needs.length ? <><dt>Phù hợp nhu cầu</dt><dd>{p.needs.map((n) => NEED_LABEL[n]).join(", ")}</dd></> : null}
            {p.actives.length ? <><dt>Thành phần chính</dt><dd>{p.actives.map((a) => ACTIVE_LABEL[a]).join(", ")}</dd></> : null}
            <dt>Thời điểm dùng</dt><dd>{TIME[p.time]}</dd>
          </dl>
          <div className="hero-actions">
            <button className="btn btn-primary" disabled={!p.inStock} onClick={() => { addToCart([lite], "product"); toast.show("Đã thêm vào giỏ"); }}>
              <Plus size={18} aria-hidden /> {p.inStock ? "Thêm vào giỏ" : "Tạm hết hàng"}
            </button>
            <button className="btn btn-quiet" onClick={() => {
              track("zalo_handoff", { from: "product", slug: p.slug });
              handOff(`Chào dược sĩ, mình muốn hỏi về sản phẩm: ${p.brand} ${p.title}${p.size ? ` (${p.size})` : ""}. Da mình là: `, (ok) => toast.show(ok ? "Đã chép tin nhắn, dán vào Zalo" : "Mở Zalo để hỏi dược sĩ"));
            }}><MessageCircle size={18} aria-hidden /> Hỏi dược sĩ</button>
          </div>
          <div>
            <h2 className="h3 display">Cách dùng</h2>
            <p className="muted" style={{ whiteSpace: "pre-line" }}>{usage ?? "Dược sĩ sẽ hướng dẫn cách dùng phù hợp với da bạn. Nhắn Zalo để hỏi."}</p>
          </div>
          {p.type === "supplement" ? (
            <p className="notice">Thực phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.</p>
          ) : null}
          {!p.reviewed ? (
            <p className="small muted">Thông tin trên trang đang được dược sĩ rà soát. Hỏi qua <a href={ZALO_URL} target="_blank" rel="noopener">Zalo</a> nếu cần chắc chắn.</p>
          ) : null}
        </div>
      </div>
      {related.length ? (
        <section className="section" aria-labelledby="rel-h">
          <div className="section-head"><h2 id="rel-h" className="display h2">Cùng <em>nhu cầu</em></h2></div>
          <div className="grid">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </section>
      ) : null}
      {toast.node}
    </div>
  );
}

