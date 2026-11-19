// Skin quiz and routine builder. Pure functions, no React, no I/O,
// so tests can run them with plain Node (node --experimental-strip-types).
import type { ActiveTag, ConflictRule, NeedId, ProductLite, ProductType } from "./types";

export type SkinType = "dau" | "hon-hop" | "thuong" | "kho" | "chua-ro";
export type Sensitivity = "co" | "doi-khi" | "khong";
export type Current = "retinoid" | "acids" | "bpo" | "none";
export type Budget = "duoi-1tr" | "1-2tr" | "khong-gioi-han";
export type Length = "toi-gian" | "day-du";

export interface Answers {
  skin: SkinType;
  concerns: NeedId[]; // 1 or 2, first one is the main concern
  sensitivity: Sensitivity;
  current: Current[];
  pregnant: boolean;
  budget: Budget;
  length: Length;
}

export interface Option<T extends string> { value: T; label: string; hint?: string }

export const QUESTIONS = {
  skin: {
    title: "Cuối ngày, da bạn thường thế nào?",
    options: [
      { value: "dau", label: "Bóng dầu khắp mặt" },
      { value: "hon-hop", label: "Bóng vùng chữ T, má bình thường" },
      { value: "thuong", label: "Không bóng, không căng" },
      { value: "kho", label: "Căng, có chỗ bong nhẹ" },
      { value: "chua-ro", label: "Mình chưa rõ" },
    ] as Option<SkinType>[],
  },
  concerns: {
    title: "Bạn muốn ưu tiên điều gì?",
    hint: "Chọn tối đa 2. Lựa chọn đầu tiên là ưu tiên chính.",
    options: [
      { value: "dau-mun", label: "Dầu và mụn" },
      { value: "phuc-hoi", label: "Dưỡng ẩm, phục hồi" },
      { value: "tham-sam", label: "Thâm sạm, da xỉn" },
      { value: "lao-hoa", label: "Nếp nhăn, da kém săn" },
      { value: "sau-lieu-trinh", label: "Da sau laser, peel, thủ thuật" },
    ] as Option<NeedId>[],
  },
  sensitivity: {
    title: "Da bạn có hay đỏ, rát hoặc châm chích khi đổi sản phẩm?",
    options: [
      { value: "co", label: "Có, khá thường xuyên" },
      { value: "doi-khi", label: "Thỉnh thoảng" },
      { value: "khong", label: "Hầu như không" },
    ] as Option<Sensitivity>[],
  },
  current: {
    title: "Bạn đang dùng hoạt chất nào?",
    hint: "Chọn tất cả những gì đang dùng.",
    options: [
      { value: "retinoid", label: "Retinol, tretinoin, adapalene" },
      { value: "acids", label: "AHA, BHA, tẩy da chết hóa học" },
      { value: "bpo", label: "Benzoyl peroxide" },
      { value: "none", label: "Không dùng hoặc không rõ" },
    ] as Option<Current>[],
  },
  pregnant: {
    title: "Bạn đang mang thai hoặc cho con bú?",
    options: [
      { value: "khong", label: "Không" },
      { value: "co", label: "Có" },
    ] as Option<"co" | "khong">[],
  },
  budget: {
    title: "Ngân sách cho cả bộ sản phẩm?",
    options: [
      { value: "duoi-1tr", label: "Dưới 1 triệu" },
      { value: "1-2tr", label: "1 đến 2 triệu" },
      { value: "khong-gioi-han", label: "Chọn loại phù hợp nhất" },
    ] as Option<Budget>[],
  },
  length: {
    title: "Bạn muốn chu trình dài bao nhiêu bước?",
    options: [
      { value: "toi-gian", label: "Tối giản, 3 bước mỗi buổi" },
      { value: "day-du", label: "Đầy đủ, 4 đến 5 bước" },
    ] as Option<Length>[],
  },
};

export const NEED_LABEL: Record<NeedId, string> = {
  "dau-mun": "Da dầu & mụn",
  "phuc-hoi": "Dưỡng ẩm & phục hồi",
  "tham-sam": "Thâm sạm & dưỡng sáng",
  "lao-hoa": "Lão hóa & tái tạo",
  "sau-lieu-trinh": "Chăm sóc y tế",
  "toc-co-the": "Tóc, cơ thể & khác",
};

const ACTIVE_NOTE: Partial<Record<ActiveTag, string>> = {
  retinoid: "có retinoid, dùng buổi tối, bắt đầu 2 đến 3 tối mỗi tuần",
  bha: "có BHA, hợp da dầu và lỗ chân lông",
  aha: "có AHA/PHA, giúp bề mặt da mịn hơn",
  bpo: "có benzoyl peroxide, chỉ chấm lên nốt mụn",
  vitc: "có vitamin C, dùng buổi sáng trước kem chống nắng",
  niacinamide: "có niacinamide, hợp nhiều loại da",
  tranexamic: "có tranexamic acid, hỗ trợ da đều màu",
  azelaic: "có azelaic acid, dịu với da dễ đỏ",
  brightener: "có hoạt chất dưỡng sáng",
  regen: "có peptide hoặc PDRN, hỗ trợ da săn",
  ceramide: "có ceramide, hỗ trợ hàng rào da",
  hyaluronic: "có hyaluronic acid, giữ ẩm",
  soothing: "có thành phần làm dịu",
  spf: "chống nắng phổ rộng",
};

const STEP_LABEL: Record<string, string> = {
  remover: "Tẩy trang",
  cleanser: "Làm sạch",
  toner: "Cân bằng",
  treatment: "Hoạt chất chính",
  treatment2: "Hoạt chất bổ sung",
  moisturizer: "Dưỡng ẩm",
  sunscreen: "Chống nắng",
};

/** Actives that best serve each concern, strongest first. Used to rank treatments. */
const NEED_ACTIVES: Record<NeedId, ActiveTag[]> = {
  "dau-mun": ["bha", "azelaic", "niacinamide", "bpo", "aha"],
  "tham-sam": ["tranexamic", "vitc", "brightener", "azelaic", "niacinamide"],
  "lao-hoa": ["retinoid", "regen", "aha", "vitc"],
  "phuc-hoi": ["ceramide", "soothing", "hyaluronic"],
  "sau-lieu-trinh": ["regen", "soothing", "ceramide"],
  "toc-co-the": [],
};

const STRONG: ActiveTag[] = ["retinoid", "aha", "bha", "bpo"];
const MIN_PRICE = 90000; // below this the item is a sachet or sample
const BUDGET_CAP: Record<Budget, number> = { "duoi-1tr": 1000000, "1-2tr": 2000000, "khong-gioi-han": Infinity };

export interface Step {
  key: string;
  label: string;
  product: ProductLite;
  reason: string;
  alternateWith?: string; // product slug used on the other evenings
  sharedWithMorning?: boolean;
}

export interface Warning { ruleId: string; severity: "avoid" | "caution"; note: string }

export interface Routine {
  am: Step[];
  pm: Step[];
  warnings: Warning[];
  notes: string[];
  total: number;
  products: ProductLite[];
}

function price(p: ProductLite) { return p.salePrice ?? p.price; }

function skinTag(a: Answers): "oily" | "dry" | null {
  if (a.skin === "dau" || a.skin === "hon-hop") return "oily";
  if (a.skin === "kho") return "dry";
  return null;
}

/** Sachets and testers (2 ml, 1.5 ml, 5 g...) never go into a routine. */
export function isSample(p: ProductLite): boolean {
  const m = /^(\d+(?:[.,]\d+)?)(ml|g)$/i.exec(p.size ?? "");
  return price(p) < MIN_PRICE || (!!m && parseFloat(m[1].replace(",", ".")) < 10);
}

function allowed(p: ProductLite, a: Answers): boolean {
  if (!p.inStock || isSample(p)) return false;
  if (a.pregnant && p.actives.includes("retinoid")) return false;
  if (a.sensitivity === "co" && p.actives.some((x) => x === "retinoid" || x === "aha")) return false;
  if (a.current.includes("retinoid") && p.actives.includes("retinoid")) return false;
  return true;
}

export function score(p: ProductLite, a: Answers, treatment = false): number {
  let s = 0;
  if (treatment) {
    a.concerns.forEach((need, i) => {
      const list = NEED_ACTIVES[need];
      const hit = list.findIndex((x) => p.actives.includes(x));
      if (hit >= 0) s += (i === 0 ? 5 : 2) - hit * 0.5;
    });
    s -= 0.5 * Math.max(0, p.needs.length - 2);
  }
  a.concerns.forEach((need, i) => { if (p.needs.includes(need)) s += i === 0 ? 4 : 2; });
  const st = skinTag(a);
  if (st && p.skin.includes(st)) s += 2;
  if (st === "oily" && p.skin.includes("dry") && !p.skin.includes("oily")) s -= 3;
  if (st === "dry" && p.skin.includes("oily") && !p.skin.includes("dry")) s -= 3;
  if (a.sensitivity !== "khong") {
    if (p.skin.includes("sensitive") || p.actives.includes("soothing")) s += a.sensitivity === "co" ? 3 : 1;
    if (p.actives.some((x) => STRONG.includes(x))) s -= a.sensitivity === "co" ? 4 : 1;
  }
  if (a.pregnant && p.actives.some((x) => x === "bha" || x === "bpo")) s -= 3;
  if (a.budget === "duoi-1tr") s -= price(p) / 250000;
  if (a.budget === "1-2tr") s -= price(p) / 600000;
  return s;
}

/** Share of the budget each step may use. Keeps one step from eating the whole budget. */
const SHARE: Record<string, number> = { cleanser: 0.2, moisturizer: 0.25, sunscreen: 0.25, treatment: 0.3, toner: 0.15, remover: 0.15 };

function rank(list: ProductLite[], a: Answers, filter: (p: ProductLite) => boolean, role = "treatment"): ProductLite[] {
  const cap = BUDGET_CAP[a.budget] * (SHARE[role] ?? 0.3) * 1.2;
  const all = list.filter((p) => allowed(p, a) && filter(p));
  // A slot with no photo looks broken, so use photo-less items only as a last resort.
  const withPhoto = all.filter((p) => p.image);
  const base = withPhoto.length ? withPhoto : all;
  const inBudget = base.filter((p) => price(p) <= cap);
  return (inBudget.length ? inBudget : base)
    .map((p) => ({ p, s: score(p, a, role === "treatment") }))
    .sort((x, y) => y.s - x.s || price(x.p) - price(y.p) || x.p.id.localeCompare(y.p.id))
    .map((x) => x.p);
}

function isType(...t: ProductType[]) { return (p: ProductLite) => t.includes(p.type); }

function reasonFor(p: ProductLite, a: Answers, role: string): string {
  const parts: string[] = [];
  const need = a.concerns.find((n) => p.needs.includes(n));
  if (role === "sunscreen") parts.push("Bước cuối buổi sáng. Thoa lại sau 2 đến 3 giờ nếu ở ngoài trời");
  else if (role === "cleanser") parts.push(skinTag(a) === "oily" ? "Làm sạch dầu thừa mà không làm da căng" : "Làm sạch nhẹ, không làm khô da");
  else if (role === "remover") parts.push("Lấy đi kem chống nắng và bụi trước khi rửa mặt");
  else if (role === "moisturizer") parts.push(skinTag(a) === "dry" ? "Khóa ẩm cho da khô" : "Cấp ẩm vừa đủ, không nặng mặt");
  else if (role === "toner") parts.push("Làm mềm da, giúp bước sau thấm đều");
  else if (need) parts.push(`Chọn cho ưu tiên "${NEED_LABEL[need]}"`);
  const act = p.actives.filter((x) => x !== "spf").map((x) => ACTIVE_NOTE[x]).filter(Boolean)[0];
  if (act && role !== "sunscreen") parts.push(act);
  return parts.join("; ") + ".";
}

export function conflicts(
  sessions: { am: ActiveTag[][]; pm: ActiveTag[][] },
  rules: ConflictRule[],
): Warning[] {
  const out: Warning[] = [];
  const seen = new Set<string>();
  const push = (r: ConflictRule) => { if (!seen.has(r.id)) { seen.add(r.id); out.push({ ruleId: r.id, severity: r.severity, note: r.note }); } };
  for (const r of rules) {
    if (r.when === "morning") {
      if (sessions.am.some((acts) => acts.some((x) => r.a.includes(x)))) push(r);
      continue;
    }
    for (const session of [sessions.am, sessions.pm]) {
      const flat = session.flat();
      if (flat.some((x) => r.a.includes(x)) && flat.some((x) => r.b.includes(x))) push(r);
    }
  }
  return out;
}

function clash(a: ActiveTag[], b: ActiveTag[], rules: ConflictRule[]): boolean {
  return rules.some((r) => r.when === "same-session" && r.severity === "avoid" &&
    ((a.some((x) => r.a.includes(x)) && b.some((x) => r.b.includes(x))) ||
     (b.some((x) => r.a.includes(x)) && a.some((x) => r.b.includes(x)))));
}

const CURRENT_ACTIVES: Record<Current, ActiveTag[]> = { retinoid: ["retinoid"], acids: ["aha", "bha"], bpo: ["bpo"], none: [] };

export function buildRoutine(all: ProductLite[], a: Answers, rules: ConflictRule[]): Routine {
  const full = a.length === "day-du";
  const current = a.current.flatMap((c) => CURRENT_ACTIVES[c]);
  const notes: string[] = [];
  const used = new Set<string>();
  const pick = (list: ProductLite[]) => { const p = list.find((x) => !used.has(x.id)); if (p) used.add(p.id); return p; };

  const cleanser = pick(rank(all, a, (p) => isType("cleanser")(p) && !p.actives.includes("bpo"), "cleanser"));
  const sunscreen = pick(rank(all, a, isType("sunscreen"), "sunscreen"));
  const moisturizer = pick(rank(all, a, (p) => isType("moisturizer")(p) && !p.actives.some((x) => STRONG.includes(x) || x === "azelaic") && p.time !== "pm", "moisturizer"));
  const toner = full ? pick(rank(all, a, (p) => isType("toner", "mist")(p) && !p.actives.some((x) => STRONG.includes(x)), "toner")) : undefined;
  const remover = full ? pick(rank(all, a, isType("remover"), "remover")) : undefined;

  // Morning treatment: no strong actives, never against what the customer already uses.
  const amTreat = pick(rank(all, a, (p) => isType("serum")(p) && p.time !== "pm" &&
    !p.actives.some((x) => STRONG.includes(x)) && !clash(p.actives, [], rules) &&
    a.concerns.some((n) => p.needs.includes(n))));

  // Evening treatment: the main concern, may hold strong actives, must not clash with current actives.
  const pmPool = rank(all, a, (p) => isType("serum", "spot", "exfoliant", "moisturizer")(p) &&
    (p.type !== "moisturizer" || p.actives.length > 0) && p.time !== "am" &&
    p.needs.includes(a.concerns[0]) && !clash(p.actives, current, rules) &&
    (p.type !== "exfoliant" || !p.actives.length || a.sensitivity !== "co"));
  const pmTreat = pick(pmPool);
  let pmTreat2: ProductLite | undefined;
  if (full && a.concerns[1]) {
    pmTreat2 = pick(rank(all, a, (p) => isType("serum", "exfoliant")(p) && p.time !== "am" &&
      p.needs.includes(a.concerns[1]) && !clash(p.actives, current, rules)));
  }

  const step = (key: string, p: ProductLite | undefined, role = key): Step | null =>
    p ? { key, label: STEP_LABEL[key], product: p, reason: reasonFor(p, a, role) } : null;

  const am = [step("cleanser", cleanser), step("toner", toner), step("treatment", amTreat), step("moisturizer", moisturizer), step("sunscreen", sunscreen)]
    .filter(Boolean) as Step[];
  const pm = [step("remover", remover), step("cleanser", cleanser), step("toner", toner), step("treatment", pmTreat)]
    .filter(Boolean) as Step[];
  if (pmTreat2) {
    const s = step("treatment2", pmTreat2, "treatment")!;
    if (pmTreat && clash(pmTreat.actives, pmTreat2.actives, rules)) {
      const t = pm.find((x) => x.key === "treatment")!;
      t.alternateWith = pmTreat2.slug;
      s.alternateWith = pmTreat.slug;
      notes.push(`Dùng xen kẽ: tối này ${pmTreat.brand} ${pmTreat.title}, tối sau ${pmTreat2.brand} ${pmTreat2.title}.`);
    }
    pm.push(s);
  }
  const m = step("moisturizer", moisturizer);
  if (m) pm.push(m);
  for (const s of pm) if (am.some((x) => x.product.id === s.product.id)) s.sharedWithMorning = true;

  // Trim to the budget: drop optional steps first, cheapest essentials stay.
  const products = () => Array.from(new Map([...am, ...pm].map((s) => [s.product.id, s.product])).values());
  const total = () => products().reduce((n, p) => n + price(p), 0);
  const cap = BUDGET_CAP[a.budget];
  for (const key of ["toner", "remover", "treatment2", "treatment"]) {
    if (total() <= cap) break;
    for (const list of [am, pm]) {
      const i = list.findIndex((s) => s.key === key && !(key === "treatment" && list === pm));
      if (i >= 0) list.splice(i, 1);
    }
    if (key === "treatment2") notes.splice(0, notes.length);
    pm.forEach((s) => { if (key === "treatment2") delete s.alternateWith; });
  }
  if (total() > cap) notes.push("Bộ này vượt ngân sách bạn chọn. Dược sĩ có thể gợi ý bản nhỏ hơn hoặc thay thế.");

  if (a.pregnant) notes.push("Bạn đang mang thai hoặc cho con bú: chúng tôi đã bỏ retinoid. Hãy gửi kết quả cho dược sĩ xem lại trước khi dùng.");
  if (current.length) notes.push("Bạn đang dùng hoạt chất mạnh. Chu trình này tránh trùng và tránh xung đột với nó.");
  if (a.concerns.includes("sau-lieu-trinh")) notes.push("Da sau thủ thuật cần theo hướng dẫn của bác sĩ đã làm thủ thuật. Gửi kết quả cho dược sĩ trước khi dùng.");

  const tags = (list: Step[]) => list.filter((s) => !s.alternateWith || s.key === "treatment").map((s) => s.product.actives);
  const warnings = conflicts({ am: tags(am), pm: [...tags(pm), current] }, rules);

  return { am, pm, warnings, notes, total: total(), products: products() };
}

/** Plain-text summary for the Zalo hand-off. No personal data beyond the answers. */
export function summaryText(a: Answers, r: Routine): string {
  const lab = <T extends string>(opts: Option<T>[], v: T) => opts.find((o) => o.value === v)?.label ?? v;
  const lines = [
    "Chào dược sĩ, mình vừa làm bài tư vấn da trên web Healthy Pretty:",
    `- Da: ${lab(QUESTIONS.skin.options, a.skin)}`,
    `- Ưu tiên: ${a.concerns.map((c) => NEED_LABEL[c]).join(", ")}`,
    `- Độ nhạy cảm: ${lab(QUESTIONS.sensitivity.options, a.sensitivity)}`,
    `- Đang dùng: ${a.current.map((c) => lab(QUESTIONS.current.options, c)).join(", ")}`,
    `- Mang thai/cho con bú: ${a.pregnant ? "Có" : "Không"}`,
    `- Ngân sách: ${lab(QUESTIONS.budget.options, a.budget)}`,
    "",
    "Buổi sáng: " + r.am.map((s) => `${s.product.brand} ${s.product.title}`).join(" → "),
    "Buổi tối: " + r.pm.map((s) => `${s.product.brand} ${s.product.title}`).join(" → "),
    "",
    "Nhờ dược sĩ xem giúp chu trình này có hợp với mình không ạ.",
  ];
  return lines.join("\n");
}
