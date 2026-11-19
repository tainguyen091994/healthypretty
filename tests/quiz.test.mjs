// Run: npm test  (node --test --experimental-strip-types)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRoutine, conflicts } from "../lib/quiz.ts";

const raw = JSON.parse(readFileSync(new URL("../data/products.json", import.meta.url)));
const rules = JSON.parse(readFileSync(new URL("../data/conflict-rules.json", import.meta.url))).rules;
const all = raw.filter((p) => p.type !== "other" && p.inStock).map((p) => ({ ...p, image: p.images[0] ?? null }));

export const CASES = [
  { name: "oily acne, minimal, low budget", skin: "dau", concerns: ["dau-mun"], sensitivity: "khong", current: ["none"], pregnant: false, budget: "duoi-1tr", length: "toi-gian" },
  { name: "oily acne + pigment, full", skin: "dau", concerns: ["dau-mun", "tham-sam"], sensitivity: "khong", current: ["none"], pregnant: false, budget: "khong-gioi-han", length: "day-du" },
  { name: "combination acne, sensitive", skin: "hon-hop", concerns: ["dau-mun"], sensitivity: "co", current: ["none"], pregnant: false, budget: "1-2tr", length: "toi-gian" },
  { name: "dry repair", skin: "kho", concerns: ["phuc-hoi"], sensitivity: "doi-khi", current: ["none"], pregnant: false, budget: "1-2tr", length: "day-du" },
  { name: "dry aging, full", skin: "kho", concerns: ["lao-hoa", "tham-sam"], sensitivity: "khong", current: ["none"], pregnant: false, budget: "khong-gioi-han", length: "day-du" },
  { name: "aging + acne, already on retinoid", skin: "thuong", concerns: ["lao-hoa", "dau-mun"], sensitivity: "khong", current: ["retinoid"], pregnant: false, budget: "khong-gioi-han", length: "day-du" },
  { name: "pregnant, pigment", skin: "thuong", concerns: ["tham-sam"], sensitivity: "khong", current: ["none"], pregnant: true, budget: "1-2tr", length: "toi-gian" },
  { name: "pregnant, acne, full", skin: "dau", concerns: ["dau-mun", "lao-hoa"], sensitivity: "doi-khi", current: ["none"], pregnant: true, budget: "khong-gioi-han", length: "day-du" },
  { name: "post-procedure", skin: "chua-ro", concerns: ["sau-lieu-trinh"], sensitivity: "co", current: ["none"], pregnant: false, budget: "khong-gioi-han", length: "toi-gian" },
  { name: "unknown skin, pigment, on acids", skin: "chua-ro", concerns: ["tham-sam"], sensitivity: "khong", current: ["acids"], pregnant: false, budget: "duoi-1tr", length: "day-du" },
  { name: "BPO user, acne", skin: "dau", concerns: ["dau-mun", "phuc-hoi"], sensitivity: "doi-khi", current: ["bpo"], pregnant: false, budget: "1-2tr", length: "day-du" },
  { name: "normal skin, aging, sensitive", skin: "thuong", concerns: ["lao-hoa"], sensitivity: "co", current: ["none"], pregnant: false, budget: "khong-gioi-han", length: "day-du" },
];

const ids = (steps) => steps.map((s) => s.product);

for (const c of CASES) {
  test(c.name, () => {
    const r = buildRoutine(all, c, rules);
    const am = ids(r.am), pm = ids(r.pm);
    // Essentials are present.
    assert.ok(am.some((p) => p.type === "sunscreen"), "morning has sunscreen");
    assert.equal(am.at(-1).type, "sunscreen", "sunscreen is the last morning step");
    assert.ok(pm.some((p) => p.type === "cleanser"), "evening has a cleanser");
    // Safety rules.
    assert.ok(!am.some((p) => p.actives.includes("retinoid")), "no retinoid in the morning");
    if (c.pregnant) assert.ok(![...am, ...pm].some((p) => p.actives.includes("retinoid")), "no retinoid when pregnant");
    if (c.sensitivity === "co") assert.ok(![...am, ...pm].some((p) => p.actives.includes("retinoid") || p.actives.includes("aha")), "no retinoid/AHA for reactive skin");
    if (c.current.includes("retinoid")) assert.ok(!pm.some((p) => p.actives.includes("retinoid")), "no second retinoid");
    // No avoid-level conflict inside one session, except steps marked to alternate.
    assert.ok(!r.warnings.some((w) => w.severity === "avoid"), "no avoid conflicts: " + JSON.stringify(r.warnings));
    // Every step has a reason; no repeated product inside one session.
    for (const s of [...r.am, ...r.pm]) assert.ok(s.reason.length > 10);
    assert.equal(new Set(am.map((p) => p.id)).size, am.length);
    assert.equal(new Set(pm.map((p) => p.id)).size, pm.length);
    // Every tray slot has a photo (the catalogue has a photo option for every slot).
    assert.ok([...am, ...pm].every((p) => p.image), "every step has a photo");
    // Budget respected or explained.
    const cap = { "duoi-1tr": 1e6, "1-2tr": 2e6, "khong-gioi-han": Infinity }[c.budget];
    assert.ok(r.total <= cap || r.notes.some((n) => n.includes("ngân sách")), "budget");
    // Main concern drives the evening treatment.
    const t = r.pm.find((s) => s.key === "treatment");
    if (t) assert.ok(t.product.needs.includes(c.concerns[0]), "treatment matches main concern");
  });
}

test("conflict checker flags retinoid with acids in one evening", () => {
  const w = conflicts({ am: [], pm: [["retinoid"], ["bha"]] }, rules);
  assert.ok(w.some((x) => x.ruleId === "retinoid-acids"));
});

test("conflict checker flags retinoid in the morning", () => {
  const w = conflicts({ am: [["retinoid"]], pm: [] }, rules);
  assert.ok(w.some((x) => x.ruleId === "retinoid-morning"));
});
