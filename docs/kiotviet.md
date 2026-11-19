# Connecting KiotViet

Today the site reads `data/products.json`, which `scripts/crawl_store.py` built from the old web store on 2026-11-19. Prices and stock in that file go stale. KiotViet is the shop's real stock system, so the live site should read from it.

Pages never call a data source directly. They call `catalog` from `lib/data/index.ts`, which picks a source with the `DATA_SOURCE` environment variable:

| `DATA_SOURCE` | Source | File |
|---|---|---|
| `local` (default) | `data/products.json` | `lib/data/local.ts` |
| `kiotviet` | KiotViet Retail API | `lib/data/kiotviet.ts` (stub) |

## What KiotViet gives and what stays in this repo

KiotViet holds price, stock, product code, name and photos. It does not hold the quiz tags: product type, skin needs, actives and time of day. Those come from `scripts/tag_products.py` today and from `data/overrides.json`, keyed by product code, once the pharmacist starts editing. A KiotViet sync never touches that file, so her edits survive.

Conflict rules (which actives must not share a session) stay in `data/conflict-rules.json`. The pharmacist owns them. `reviewedBy` is `null` until she signs them off.

## Steps

1. In KiotViet, open Settings, then the API connection page, and create a client. Copy the Client ID, Client Secret and the retailer (shop) name. Check the current menu names in the KiotViet help pages; they change.
2. Put them in the host's environment settings, never in git:
   ```
   DATA_SOURCE=kiotviet
   KIOTVIET_CLIENT_ID=...
   KIOTVIET_CLIENT_SECRET=...
   KIOTVIET_RETAILER=...
   ```
3. Finish `lib/data/kiotviet.ts`. The plan is in the comment at the top of the file: get a token with client credentials, page through products with inventory, map each one with `mapProduct()`, and merge tags from `data/overrides.json` by code. Confirm the endpoint and field names against the current KiotViet API docs first. The stub was written from memory of the API, not from a live call.
4. Fill `data/overrides.json` with tags for every product code. Start by exporting the tags the local file already has: they match by code for products that came from KiotViet.
5. Run `npm run build` with `DATA_SOURCE=kiotviet` and check the catalogue count against KiotViet.
6. Prices refresh every 15 minutes (`revalidate = 900`). If the shop needs faster stock updates, add a KiotViet webhook that calls Next.js on-demand revalidation.

## Things to check when it goes live

- Products with `type: "other"` never appear in the quiz. Untagged new products land there until someone tags them.
- Items under 10 ml or 10 g, or under 90.000đ, count as samples and stay out of the quiz.
- Photos: KiotViet photo URLs replace the Shopee ones. The clean-photo picker (`scripts/pick_clean_image.py`, `data/image-picks.json`) was built for Shopee photos; re-run it or drop the picks after the switch.
