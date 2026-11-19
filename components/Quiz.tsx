"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Plus, RotateCcw } from "lucide-react";
import type { ConflictRule, NeedId, ProductLite } from "@/lib/types";
import { buildRoutine, NEED_LABEL, QUESTIONS, summaryText, type Answers, type Option } from "@/lib/quiz";
import { addToCart } from "@/lib/cart";
import { track } from "@/lib/track";
import { handOff } from "@/lib/zalo";
import { href } from "@/lib/links";
import { vnd } from "@/lib/format";
import { Tray } from "./Tray";
import { A } from "./A";
import { useToast } from "./useToast";

type Key = keyof typeof QUESTIONS;
const ORDER: Key[] = ["skin", "concerns", "sensitivity", "current", "pregnant", "budget", "length"];
const MULTI: Partial<Record<Key, number>> = { concerns: 2, current: 4 };

type Draft = Partial<Record<Key, string[]>>;

function toAnswers(d: Draft): Answers {
  return {
    skin: d.skin![0] as Answers["skin"],
    concerns: d.concerns as NeedId[],
    sensitivity: d.sensitivity![0] as Answers["sensitivity"],
    current: d.current as Answers["current"],
    pregnant: d.pregnant![0] === "co",
    budget: d.budget![0] as Answers["budget"],
    length: d.length![0] as Answers["length"],
  };
}

export function Quiz({ products, rules }: { products: ProductLite[]; rules: ConflictRule[] }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [done, setDone] = useState(false);
  const toast = useToast();

  const key = ORDER[step];
  const q = QUESTIONS[key] as { title: string; hint?: string; options: Option<string>[] };
  const picked = draft[key] ?? [];
  const max = MULTI[key];

  const answers = useMemo(() => (done ? toAnswers(draft) : null), [done, draft]);
  const routine = useMemo(() => (answers ? buildRoutine(products, answers, rules) : null), [answers, products, rules]);

  function next(d: Draft) {
    if (step < ORDER.length - 1) { setStep(step + 1); window.scrollTo({ top: 0 }); return; }
    const a = toAnswers(d);
    const r = buildRoutine(products, a, rules);
    track("quiz_complete", { skin: a.skin, concern: a.concerns[0], products: r.products.length, value: r.total });
    setDone(true);
    window.scrollTo({ top: 0 });
  }

  function choose(value: string) {
    if (step === 0 && !draft.skin) track("quiz_start");
    let list: string[];
    if (!max) list = [value];
    else if (key === "current" && value === "none") list = ["none"];
    else {
      const base = picked.filter((v) => v !== "none");
      list = base.includes(value) ? base.filter((v) => v !== value) : base.length < max ? [...base, value] : base;
    }
    const d = { ...draft, [key]: list };
    setDraft(d);
    if (!max) setTimeout(() => next(d), 220);
  }

  function restart() { setDraft({}); setStep(0); setDone(false); }

  if (done && routine && answers) {
    const tags = [
      QUESTIONS.skin.options.find((o) => o.value === answers.skin)?.label,
      ...answers.concerns.map((c) => NEED_LABEL[c]),
      answers.sensitivity === "co" ? "Da dễ kích ứng" : null,
      answers.pregnant ? "Mang thai / cho con bú" : null,
    ].filter(Boolean);
    const add = (p: ProductLite) => { addToCart([p], "quiz"); toast.show(`Đã thêm ${p.title} vào giỏ`); };
    return (
      <div className="result">
        <div className="wrap">
          <div className="result-head">
            <div>
              <h1 className="display h2">Khay của <em>bạn</em></h1>
              <div className="chips" style={{ marginTop: 8 }}>
                {tags.map((t) => <span key={t} className="chip" style={{ cursor: "default" }}>{t}</span>)}
              </div>
            </div>
            <button className="btn btn-quiet btn-sm" onClick={restart}><RotateCcw size={16} aria-hidden /> Làm lại</button>
          </div>

          <div className="trays">
            <Tray title={<>Buổi <em>sáng</em></>} meta={`${routine.am.length} bước`} steps={routine.am}
              action={(s) => <button className="btn btn-quiet btn-sm" onClick={() => add(s.product)} aria-label={`Thêm ${s.product.title} vào giỏ`}><Plus size={14} aria-hidden /> Thêm</button>} />
            <Tray title={<>Buổi <em>tối</em></>} meta={`${routine.pm.length} bước`} steps={routine.pm}
              action={(s) => (s.sharedWithMorning ? null : <button className="btn btn-quiet btn-sm" onClick={() => add(s.product)} aria-label={`Thêm ${s.product.title} vào giỏ`}><Plus size={14} aria-hidden /> Thêm</button>)} />
          </div>

          {routine.notes.length || routine.warnings.length ? (
            <section aria-label="Lời dặn" style={{ marginTop: 32 }}>
              <h2 className="display h3">Lời dặn của <em>dược sĩ</em></h2>
              <ul className="notes">
                {routine.notes.map((n) => <li key={n}>{n}</li>)}
                {routine.warnings.map((w) => <li key={w.ruleId}>{w.note}</li>)}
                <li>Bắt đầu từng sản phẩm mới cách nhau vài ngày. Thử trước ở một vùng da nhỏ.</li>
              </ul>
            </section>
          ) : null}
          <p className="small muted" style={{ marginTop: 24, maxWidth: "70ch" }}>
            Gợi ý dựa trên câu trả lời của bạn và nhãn sản phẩm. Đây không phải chẩn đoán y khoa. Nếu da đang có vấn đề nặng, hãy gặp bác sĩ da liễu.
          </p>
        </div>

        <div className="result-bar">
          <div className="wrap">
            <div>
              <div className="small muted">{routine.products.length} sản phẩm</div>
              <strong style={{ fontSize: 20 }}>{vnd(routine.total)}</strong>
            </div>
            <div className="hero-actions">
              <button className="btn btn-quiet" onClick={() => {
                track("zalo_handoff", { from: "quiz" });
                handOff(summaryText(answers, routine), (ok) => toast.show(ok ? "Đã chép tin nhắn, dán vào Zalo" : "Không chép được. Hãy chụp màn hình gửi dược sĩ."));
              }}><MessageCircle size={18} aria-hidden /> <span className="lbl-long">Gửi dược sĩ qua Zalo</span><span className="lbl-short">Zalo</span></button>
              <button className="btn btn-primary" onClick={() => {
                addToCart(routine.products, "quiz");
                track("routine_add_all", { products: routine.products.length, value: routine.total });
                toast.show("Đã thêm cả khay vào giỏ");
              }}><span className="lbl-long">Thêm cả khay vào giỏ</span><span className="lbl-short">Thêm cả khay</span></button>
            </div>
          </div>
        </div>
        {toast.node}
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="quiz">
        <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={ORDER.length} aria-valuenow={step + 1} aria-label="Tiến độ">
          <span style={{ transform: `scaleX(${(step + 1) / ORDER.length})` }} />
        </div>
        <p className="q-count">Câu {step + 1} / {ORDER.length}</p>
        <h1 className="display q-title" key={key}>{q.title}</h1>
        {q.hint ? <p className="q-hint">{q.hint}</p> : null}
        <div className="options" role="group" aria-label={q.title}>
          {q.options.map((o) => {
            const on = picked.includes(o.value);
            const idx = picked.indexOf(o.value);
            return (
              <button key={o.value} className="option" aria-pressed={on} onClick={() => choose(o.value)}>
                <span>
                  {o.label}
                  {key === "concerns" && on ? <span className="order"> · {idx === 0 ? "ưu tiên chính" : "ưu tiên phụ"}</span> : null}
                </span>
                <span className="tick" aria-hidden>{on ? <Check size={14} /> : null}</span>
              </button>
            );
          })}
        </div>
        <div className="q-nav">
          {step > 0
            ? <button className="btn btn-quiet" onClick={() => setStep(step - 1)}><ArrowLeft size={18} aria-hidden /> Quay lại</button>
            : <A className="btn btn-quiet" href={href("/")}><ArrowLeft size={18} aria-hidden /> Trang chủ</A>}
          {max ? (
            <button className="btn btn-primary" disabled={!picked.length} onClick={() => next(draft)}>
              Tiếp tục <ArrowRight size={18} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
