import { ArrowRight, ArrowUpRight, BadgeCheck, MessageCircle, SlidersHorizontal } from "lucide-react";
import { A } from "@/components/A";
import { Tray } from "@/components/Tray";
import { catalog, listLite } from "@/lib/data";
import { href, ZALO_URL } from "@/lib/links";
import { buildRoutine, NEED_LABEL, type Answers } from "@/lib/quiz";
import type { NeedId, ProductLite } from "@/lib/types";

const NEEDS: { id: NeedId; text: string; span: string }[] = [
  { id: "dau-mun", text: "Làm sạch dầu thừa, giúp lỗ chân lông thông thoáng.", span: "big" },
  { id: "phuc-hoi", text: "Cấp ẩm và hỗ trợ hàng rào da.", span: "wide" },
  { id: "tham-sam", text: "Hỗ trợ da đều màu và sáng hơn.", span: "wide" },
  { id: "lao-hoa", text: "Hỗ trợ da săn và mịn hơn.", span: "c5" },
  { id: "sau-lieu-trinh", text: "Chăm sóc da sau laser, peel và thủ thuật.", span: "c4" },
  { id: "toc-co-the", text: "Tóc, cơ thể, viên uống.", span: "c3" },
];

// A fixed example for the hero tray. Real answers come from /tu-van.
const EXAMPLE: Answers = {
  skin: "hon-hop", concerns: ["dau-mun", "tham-sam"], sensitivity: "doi-khi",
  current: ["none"], pregnant: false, budget: "1-2tr", length: "toi-gian",
};

function pick(list: ProductLite[], need: NeedId, n: number) {
  const seen = new Set<string>();
  return list
    .filter((p) => p.needs[0] === need && p.image && p.type !== "supplement")
    .sort((a, b) => b.price - a.price)
    .filter((p) => (seen.has(p.type) ? false : (seen.add(p.type), true)))
    .slice(0, n);
}

export default async function Home() {
  const lite = await listLite();
  const rules = await catalog.conflictRules();
  const example = buildRoutine(lite, EXAMPLE, rules.rules);
  const brands = Object.entries(lite.reduce<Record<string, number>>((m, p) => ((m[p.brand] = (m[p.brand] || 0) + 1), m), {}))
    .filter(([b]) => b !== "Khác")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);

  return (
    <>
      <section className="hero">
        <div className="hero-frame">
          <div className="gel" aria-hidden><span className="g1" /><span className="g2" /><span className="g3" /></div>
          {/* Photo slot: docs/prompt-pack.md, shot HP-01. Put the file in public/media and add
              <img className="hero-photo" src="media/hero.webp" alt="" data-source="HP-01, AI image" />. */}
          <div className="hero-copy">
            <h1 className="display h1">Đúng sản phẩm,<br /> <em className="nowrap">đúng làn da</em></h1>
            <p className="lede">Trả lời 7 câu hỏi về da. Nhận chu trình sáng và tối, mỗi bước kèm lời dặn của dược sĩ.</p>
            <div className="hero-actions">
              <A className="btn btn-primary" href={href("/tu-van")}>Làm bài tư vấn da <ArrowRight size={18} aria-hidden /></A>
              <A className="btn btn-quiet" href={href("/san-pham")}>Xem sản phẩm</A>
            </div>
            <p className="hero-note">Khoảng 2 phút. Không cần đăng nhập.</p>
          </div>
          <div>
            <Tray mini title={<>Buổi <em>tối</em></>} meta="Ví dụ: da hỗn hợp, ưu tiên mụn" steps={example.pm.slice(0, 4)} />
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="trust">
          <div className="trust-item"><BadgeCheck size={22} strokeWidth={1.5} aria-hidden /><div><strong>Nguồn gốc rõ ràng</strong><span>Thương hiệu và dung tích ghi rõ ở từng sản phẩm.</span></div></div>
          <div className="trust-item"><MessageCircle size={22} strokeWidth={1.5} aria-hidden /><div><strong>ThS. Dược sĩ tư vấn</strong><span>Hỏi trực tiếp qua Zalo trước khi mua.</span></div></div>
          <div className="trust-item"><SlidersHorizontal size={22} strokeWidth={1.5} aria-hidden /><div><strong>Chọn theo nhu cầu da</strong><span>Lọc theo 6 nhu cầu, hoặc làm bài tư vấn.</span></div></div>
        </div>

        <section className="section" aria-labelledby="needs-h">
          <div className="section-head">
            <h2 id="needs-h" className="display h2">Da bạn <em>đang cần gì?</em></h2>
            <A className="text-link" href={href("/san-pham")}>Tất cả {lite.length} sản phẩm <ArrowRight size={16} aria-hidden /></A>
          </div>
          <div className="needs">
            {NEEDS.map((n) => {
              const count = lite.filter((p) => p.needs.includes(n.id)).length;
              const imgs = pick(lite, n.id, n.span === "big" ? 3 : n.span === "c3" ? 1 : 2);
              return (
                <A key={n.id} href={href(`/san-pham?need=${n.id}`)} className={`need ${n.span}`}>
                  <div>
                    <div className="need-top">
                      <h3 className="display h3">{NEED_LABEL[n.id]}</h3>
                      <span className="need-count">{count} sản phẩm</span>
                    </div>
                    <p>{n.text}</p>
                  </div>
                  <div className="need-stack" aria-hidden>
                    {imgs.map((p) => <img key={p.slug} src={p.image!} alt="" loading="lazy" referrerPolicy="no-referrer" data-source="shop-catalogue" />)}
                  </div>
                  <span className="need-arrow" aria-hidden><ArrowUpRight size={18} /></span>
                </A>
              );
            })}
          </div>
        </section>

        <section className="section split" aria-labelledby="tray-h">
          <div>
            <h2 id="tray-h" className="display h2">Một khay, <em>hai buổi</em></h2>
            <p className="lede">Ở quầy, dược sĩ xếp sản phẩm lên khay theo thứ tự dùng. Bài tư vấn làm đúng việc đó cho bạn.</p>
            <ol className="steps-list">
              <li><span>Trả lời 7 câu về da, thói quen và ngân sách.</span></li>
              <li><span>Nhận khay sáng và tối. Mỗi bước ghi rõ vì sao chọn.</span></li>
              <li><span>Hai hoạt chất không nên dùng chung sẽ được xếp xen kẽ từng tối.</span></li>
              <li><span>Gửi kết quả cho dược sĩ qua Zalo để xem lại.</span></li>
            </ol>
            <A className="btn btn-primary" href={href("/tu-van")}>Bắt đầu tư vấn <ArrowRight size={18} aria-hidden /></A>
          </div>
          <Tray title={<>Buổi <em>sáng</em></>} meta={`${example.am.length} bước`} steps={example.am} />
        </section>

        <section className="section pharm" aria-labelledby="pharm-h">
          <div className="photo-slot placeholder" data-source="needed: real photo">
            [DATA NEEDED: ảnh thật của dược sĩ tại quầy. Không dùng ảnh AI cho người thật.]
          </div>
          <div>
            <h2 id="pharm-h" className="display h2">Hỏi dược sĩ <em>trước khi mua</em></h2>
            <p className="lede">Healthy Pretty do ThS. Dược sĩ [DATA NEEDED: tên] phụ trách. Gửi kết quả bài tư vấn hoặc ảnh da qua Zalo. Dược sĩ xem và trả lời trong giờ làm việc.</p>
            <div className="hero-actions" style={{ marginTop: 28 }}>
              <a className="btn" href={ZALO_URL} target="_blank" rel="noopener"><MessageCircle size={18} aria-hidden /> Nhắn Zalo cho dược sĩ</a>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="brands-h">
          <div className="section-head"><h2 id="brands-h" className="display h2">Thương hiệu</h2></div>
          <div className="brands">
            {brands.map(([b, c]) => (
              <A key={b} href={href(`/san-pham?brand=${encodeURIComponent(b)}`)}>{b}<sup className="small" style={{ fontFamily: "var(--font-text)", marginLeft: 4 }}>{c}</sup></A>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
