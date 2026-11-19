# Workings (internal)

## Rubric, written before the build

The reviewer scores each item pass or fail, with evidence.

1. Frame test. Can a first-time visitor get a pharmacist-style answer (routine, order, reason, conflict note) without leaving the site? Pass = quiz to tray in under 90 seconds, Zalo hand-off on the result.
2. 30-second reader. From the home page alone, can a reader say what the shop is, who stands behind it and what to click first?
3. Truth. No claim past the label. No invented numbers, reviews or people. Gaps are marked [DATA NEEDED].
4. Craft. Contrast passes, works at 390 px, no horizontal scroll, Vietnamese renders in both fonts, motion respects reduced motion.
5. Swap test. Can the data source change to KiotViet without touching a page component?
6. Look. Is it calm, fresh and expensive-looking, and is the tray idea visible on the home page and the result?

## Pre-mortem

- Wrong tags put a wrong product in a routine. Mitigation: every pick shows its reason, the pharmacist edits data/overrides.json, the tray links to Zalo.
- Legal: product text from suppliers has treatment claims. Mitigation: the site shows neutral summaries and usage only; docs/claims_report.md lists the rest.
- Hotlinked Shopee images may break. Mitigation: KiotViet images replace them at the API step.
- The quiz feels like a gimmick. Mitigation: it stays at 7 short questions and ends in real products with prices and one button to buy all.
