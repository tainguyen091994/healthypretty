# Healthy Pretty

Shop site for Healthy Pretty, a pharmacist-led dermocosmetic store in Ho Chi Minh City. It replaces the KiotViet web store at healthypretty.web-store.online. Site copy is Vietnamese; code and docs are English.

The main feature is a 7-question skin quiz. It ends in a "tray": a morning and an evening routine built from products the shop stocks, each with a one-line reason in the pharmacist's voice. Actives that must not meet go on alternate nights. One button adds the whole tray to the cart, and another copies a summary for Zalo.

## Run it

Node 22.

```bash
npm install
```

```bash
npm run dev
```

| Command | What it does |
|---|---|
| `npm run build` | Production build. Every product page is static and refreshes every 15 minutes. |
| `npm test` | Quiz tests: 12 skin profiles, safety rules, conflict checks, budget, a photo in every slot. |
| `npm run typecheck` | TypeScript check. |
| `npm run export` | Static preview in `out/`. Opens from any folder; product pages go through `xem.html?sp=<slug>`. |
| `npm run test:e2e` | Browser test of `out/`: 12 quiz paths on desktop and phone, catalogue, product view, cart. Needs Playwright (`npm i -D playwright && npx playwright install chromium`). |

## Pages

| Path | Page |
|---|---|
| `/` | Home: hero tray, six skin needs, trust bar, pharmacist block |
| `/tu-van` | Skin quiz and tray |
| `/san-pham` | Catalogue with need, type and brand filters, search and sort (`?need=`, `?brand=`, `?q=`) |
| `/san-pham/[slug]` | Product page |
| `/gio-hang` | Cart. Orders go through Zalo for now, or the Shopee shop. |

## Where things live

- `data/products.json`: 383 products crawled from the old web store, tagged by `scripts/tag_products.py`.
- `data/overrides.json`: the pharmacist's corrections, keyed by product code. Empty today.
- `data/conflict-rules.json`: which actives must not share a session. Waiting for the pharmacist's sign-off.
- `data/image-picks.json`: which product photo to show first (the cleanest one, picked by `scripts/pick_clean_image.py`).
- `lib/quiz.ts`: the routine builder. `lib/data/`: the data sources. `lib/format.ts`: the banned-claims list.
- `docs/kiotviet.md`: how to switch the data source to KiotViet.
- `docs/prompt-pack.md`: prompts for the hero photo, need-card photos and video loops.
- `docs/claims_report.md`: supplier wording to check before any original product text goes back on the site.
- `docs/healthypretty_board_luxury-fresh_20261119.md`: the design direction and tokens.

## Rules for content

- No claim past the product label. Words like "đặc trị" and "điều trị" never appear; `isSafeText()` in `lib/format.ts` blocks them.
- No invented reviews, numbers or people. Missing facts show as `[DATA NEEDED]`.
- No AI people anywhere. The pharmacist photo must be real.
- Supplements carry the standard notice that they are not medicine.
- Photos and videos stay out of git (`public/media/` is ignored). Keep the masters in Google Drive.

## Analytics

`lib/track.ts` pushes events to `window.dataLayer` for Google Tag Manager: `quiz_start`, `quiz_complete`, `routine_add_all`, `add_to_cart`, `zalo_handoff`. The number to watch is the share of quiz finishers who add to cart.
