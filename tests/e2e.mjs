// Browser test of the exported preview. Run: npm run export && npm run test:e2e
// It serves out/ on a local port, takes the quiz along 12 answer paths
// (desktop and phone), and checks the tray, the cart and the catalogue.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";
// Playwright is not a project dependency. Install it once: npm i -D playwright && npx playwright install chromium
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = new URL("../out/", import.meta.url).pathname;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^\/+/, "") || "index.html";
  try {
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise((ok) => server.listen(0, ok));
const base = `http://localhost:${server.address().port}/`;

// Option index to pick at each quiz step. Multi-select steps take the listed
// index, then "Tiếp tục". Paths cover skin types, budgets, pregnancy and lengths.
const PATHS = [
  [0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1], [2, 2, 2, 0, 0, 2, 0], [3, 3, 0, 2, 1, 0, 1],
  [4, 4, 1, 3, 0, 1, 0], [0, 5, 2, 1, 1, 2, 1], [1, 2, 0, 4, 0, 0, 0], [2, 0, 1, 0, 1, 1, 1],
  [3, 1, 2, 2, 0, 2, 0], [4, 3, 0, 1, 1, 0, 1], [0, 4, 1, 3, 0, 1, 1], [1, 5, 2, 4, 1, 2, 0],
];

const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };

const browser = await chromium.launch();
for (const [i, path] of PATHS.entries()) {
  const phone = i % 2 === 1;
  const ctx = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(base + "tu-van.html");
  for (const pick of path) {
    if (await page.locator(".result").count()) break;
    const opts = page.locator(".option");
    await opts.nth(Math.min(pick, (await opts.count()) - 1)).click();
    const cont = page.locator('button:has-text("Tiếp tục")');
    await page.waitForTimeout(350);
    if (await cont.count() && await cont.isEnabled()) await cont.click();
    await page.waitForTimeout(400);
  }
  const name = `path ${i + 1} ${phone ? "phone" : "desktop"}`;
  await page.waitForSelector(".result", { timeout: 5000 }).catch(() => {});
  const slots = await page.locator(".slot").count();
  check(slots >= 3, `${name}: tray has ${slots} slots`);
  check((await page.locator(".slot-img.placeholder").count()) === 0, `${name}: a tray slot has no photo`);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  check(width <= (phone ? 390 : 1440), `${name}: page is ${width}px wide`);
  await page.click(".result-bar .btn-primary");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("hp_cart_v1") ?? "[]").length);
  check(stored >= 3, `${name}: cart has ${stored} lines after "add tray"`);
  check(errs.length === 0, `${name}: page errors ${errs.join(" | ")}`);
  await ctx.close();
}

// Catalogue filter, product view and cart.
const page = await browser.newPage();
await page.goto(base + "san-pham.html?need=dau-mun");
check((await page.locator("a.card").count()) > 0, "catalogue: no cards for need=dau-mun");
await page.locator("a.card").first().click();
await page.waitForSelector("h1");
check(page.url().includes("xem.html?sp="), "product link does not open the viewer");
await page.click('button:has-text("Thêm vào giỏ")');
await page.goto(base + "gio-hang.html");
check((await page.locator(".line").count()) === 1, "cart: expected 1 line");
await browser.close();
server.close();

if (fails.length) {
  console.error(`FAIL (${fails.length})\n` + fails.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${PATHS.length} quiz paths, catalogue, product view, cart`);
