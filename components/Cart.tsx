"use client";
import { Minus, MessageCircle, Plus, Trash2 } from "lucide-react";
import { setQty, useCart } from "@/lib/cart";
import { href, productHref, SHOPEE_URL } from "@/lib/links";
import { vnd } from "@/lib/format";
import { handOff } from "@/lib/zalo";
import { track } from "@/lib/track";
import { A } from "./A";
import { useToast } from "./useToast";

export function Cart() {
  const { lines, total, count, ready } = useCart();
  const toast = useToast();
  const order = () => [
    "Chào dược sĩ, mình muốn đặt hàng trên web Healthy Pretty:",
    ...lines.map((l) => `- ${l.qty} x ${l.brand} ${l.title}${l.size ? ` (${l.size})` : ""}: ${vnd(l.price * l.qty)}`),
    `Tạm tính: ${vnd(total)}`,
    "",
    "Tên người nhận:",
    "Số điện thoại:",
    "Địa chỉ giao hàng:",
  ].join("\n");

  return (
    <div className="wrap">
      <h1 className="display h2" style={{ paddingTop: 40 }}>Giỏ <em>hàng</em></h1>
      {!ready ? null : !lines.length ? (
        <div style={{ padding: "24px 0 40px" }}>
          <p className="lede">Giỏ đang trống.</p>
          <div className="hero-actions" style={{ marginTop: 24 }}>
            <A className="btn btn-primary" href={href("/tu-van")}>Làm bài tư vấn da</A>
            <A className="btn btn-quiet" href={href("/san-pham")}>Xem sản phẩm</A>
          </div>
        </div>
      ) : (
        <div className="cart">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="Sản phẩm trong giỏ">
            {lines.map((l) => (
              <li key={l.slug} className="line">
                {l.image ? <img src={l.image} alt="" referrerPolicy="no-referrer" /> : <span className="placeholder" style={{ width: 88, height: 88, borderRadius: 12 }} />}
                <div>
                  <div className="small muted">{l.brand}{l.size ? ` · ${l.size}` : ""}</div>
                  <A href={productHref(l.slug)} style={{ textDecoration: "none", fontWeight: 500 }}>{l.title}</A>
                  <div>
                    <span className="qty">
                      <button aria-label="Bớt một" onClick={() => setQty(l.slug, l.qty - 1)}><Minus size={14} /></button>
                      <span aria-live="polite">{l.qty}</span>
                      <button aria-label="Thêm một" onClick={() => setQty(l.slug, l.qty + 1)}><Plus size={14} /></button>
                    </span>
                    <button className="btn btn-sm" style={{ border: 0 }} onClick={() => setQty(l.slug, 0)} aria-label={`Xóa ${l.title}`}><Trash2 size={16} aria-hidden /></button>
                  </div>
                </div>
                <div className="price">{vnd(l.price * l.qty)}</div>
              </li>
            ))}
          </ul>
          <aside className="summary" aria-label="Tóm tắt đơn">
            <div className="row"><span>{count} sản phẩm</span><span>{vnd(total)}</span></div>
            <div className="row muted small"><span>Phí giao hàng</span><span>Dược sĩ báo qua Zalo</span></div>
            <div className="row" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}><strong>Tạm tính</strong><strong>{vnd(total)}</strong></div>
            <button className="btn btn-primary" onClick={() => {
              track("zalo_handoff", { from: "cart", value: total });
              handOff(order(), (ok) => toast.show(ok ? "Đã chép đơn hàng, dán vào Zalo" : "Không chép được. Hãy chụp màn hình gửi dược sĩ."));
            }}><MessageCircle size={18} aria-hidden /> Đặt hàng qua Zalo</button>
            <a className="btn btn-quiet" href={SHOPEE_URL} target="_blank" rel="noopener">Mua trên Shopee</a>
            <p className="small muted" style={{ margin: 0 }}>Bấm đặt hàng sẽ chép đơn và mở Zalo. Dán tin nhắn, dược sĩ xác nhận giá, tồn kho và phí giao.</p>
          </aside>
        </div>
      )}
      {toast.node}
    </div>
  );
}
