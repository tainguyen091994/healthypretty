import type { Step } from "@/lib/quiz";
import { productHref } from "@/lib/links";
import { vnd } from "@/lib/format";
import { A } from "./A";
import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  meta?: ReactNode;
  steps: Step[];
  mini?: boolean;
  action?: (s: Step) => ReactNode;
}

/** The pharmacist's tray: products laid out in order of use, each with a note. */
export function Tray({ title, meta, steps, mini, action }: Props) {
  const numbered: { s: Step; n: number }[] = [];
  let n = 0;
  steps.forEach((s, i) => {
    const prev = steps[i - 1];
    const sameSlot = prev && s.alternateWith && prev.alternateWith === s.product.slug;
    if (!sameSlot) n += 1;
    numbered.push({ s, n });
  });
  return (
    <section className={`tray${mini ? " tray-mini" : ""}`} aria-label={typeof title === "string" ? title : undefined}>
      <div className="tray-head">
        <h3>{title}</h3>
        {meta ? <span className="small muted">{meta}</span> : null}
      </div>
      <ol className="tray-slots" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {numbered.map(({ s, n }, i) => (
          <li key={s.key + s.product.slug} className={`slot${s.sharedWithMorning ? " shared" : ""}`} style={{ ["--i" as string]: i }}>
            <span className="slot-n" aria-hidden>{n}</span>
            {s.product.image
              ? <img className="slot-img" src={s.product.image} alt="" loading="lazy" referrerPolicy="no-referrer" data-source="shop-catalogue" />
              : <span className="slot-img placeholder" />}
            <div className="slot-body">
              <div className="slot-step">
                {s.label}
                {s.alternateWith ? <span className="slot-alt">{s.key === "treatment" ? "tối này" : "tối sau"}</span> : null}
              </div>
              <A className="slot-name" href={productHref(s.product.slug)}>{s.product.brand} {s.product.title}</A>
              {!mini ? <div className="slot-note">{s.reason}</div> : null}
            </div>
            <div className="slot-price">
              {s.sharedWithMorning ? <span className="small muted">dùng chung</span> : vnd(s.product.salePrice ?? s.product.price)}
              {action ? <div style={{ marginTop: 6 }}>{action(s)}</div> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
