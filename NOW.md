# NOW

Updated 2026-11-19.

## State

- Site built: home, skin quiz with morning and evening tray, catalogue, product pages, cart with Zalo order.
- Data: 383 products from the old web store, tagged by script. Not yet checked by the pharmacist.
- Tests: `npm test` 14 of 14 pass. `npm run test:e2e` passes 12 quiz paths plus catalogue, product view and cart.
- Static preview builds with `npm run export`.

## Next

1. Pharmacist review: the tags in `data/products.json` (fix through `data/overrides.json`) and `data/conflict-rules.json` (set `reviewedBy`).
2. Fill every `[DATA NEEDED]`: shop address, opening hours, business licence number, Bộ Công Thương notice, pharmacist name and degree, real pharmacist photo.
3. Generate the photos in `docs/prompt-pack.md` and put them in `public/media/` (not in git).
4. Pick a host (Vercel is the simplest for Next.js) and a domain.
5. Connect KiotViet: `docs/kiotviet.md`.
6. Add Google Tag Manager and watch quiz-finisher add-to-cart rate.

## Open points

- Some product titles from the supplier contain "giảm nám" and similar label words. They are product names, but check them with the claims list in `docs/claims_report.md`.
- Product photos are hotlinked from Shopee and KiotViet. They will move to KiotViet at the API step.
- Shopee review research was blocked (Shopee needs a login for reviews).
