// Writes public/data/details.json for the static preview product page (xem.html?sp=slug).
// Run by `npm run export`. The output is gitignored.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const products = JSON.parse(readFileSync("data/products.json", "utf8"));
const picks = JSON.parse(readFileSync("data/image-picks.json", "utf8"));
const details = {};
for (const p of products) { const i = picks[p.slug]; const images = i ? [p.images[i], ...p.images.filter((_, j) => j !== i)] : p.images;
  details[p.slug] = { images, usage: p.usage, code: p.code, reviewed: p.reviewed }; }
mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/details.json", JSON.stringify(details));
console.log(`details.json: ${Object.keys(details).length} products`);
