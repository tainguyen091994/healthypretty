"""Pick the cleanest photo for each product: white background, no promo frame,
no text panel. Writes data/image-picks.json ({slug: image index}).

The shop's first photo often has an orange "chính hãng" frame or a text panel.
Usually a later photo is the plain packshot. Scores use small thumbnails only.

Usage: python3 scripts/pick_clean_image.py [cache_dir]
"""
import io, json, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CACHE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / ".cache" / "thumbs"
CACHE.mkdir(parents=True, exist_ok=True)

def thumb_url(u):
    return u + "_tn" if "cf.shopee.vn/file/" in u else u

def fetch(u):
    f = CACHE / (u.rsplit("/", 1)[-1].replace("?", "_") + ".jpg")
    if not f.exists():
        try:
            with urllib.request.urlopen(thumb_url(u), timeout=20) as r:
                f.write_bytes(r.read())
        except Exception:
            return None
    try:
        return Image.open(io.BytesIO(f.read_bytes())).convert("RGB").resize((96, 96))
    except Exception:
        return None

def score(im):
    """Higher is cleaner. 1.0 = white edges and side strips, no orange."""
    px = im.load(); n = im.size[0]
    def white(x, y):
        r, g, b = px[x, y]; return min(r, g, b) > 228 and max(r, g, b) - min(r, g, b) < 18
    def orange(x, y):
        r, g, b = px[x, y]; return r > 190 and 90 < g < 200 and b < 120 and r - b > 90
    ring = [(x, y) for x in range(n) for y in range(n) if min(x, y, n - 1 - x, n - 1 - y) < 8]
    sides = [(x, y) for x in range(n) for y in range(n) if x < n * 0.22 or x > n * 0.78]
    allpx = [(x, y) for x in range(n) for y in range(n)]
    w_ring = sum(white(*p) for p in ring) / len(ring)
    w_side = sum(white(*p) for p in sides) / len(sides)
    org = sum(orange(*p) for p in allpx) / len(allpx)
    return 0.5 * w_ring + 0.5 * w_side - 4 * org

def main():
    products = json.loads((ROOT / "data/products.json").read_text())
    urls = sorted({u for p in products for u in p["images"]})
    with ThreadPoolExecutor(16) as ex:
        ims = dict(zip(urls, ex.map(fetch, urls)))
    picks, changed = {}, 0
    for p in products:
        scored = [(score(ims[u]), -i, i) for i, u in enumerate(p["images"]) if ims.get(u)]
        if not scored:
            continue
        best = max(scored)
        # Keep photo 0 unless another one is clearly cleaner.
        first = next((s for s in scored if s[2] == 0), None)
        pick = best[2] if first is None or best[0] > first[0] + 0.08 else 0
        if pick:
            picks[p["slug"]] = pick; changed += 1
    (ROOT / "data/image-picks.json").write_text(json.dumps(picks, ensure_ascii=False, indent=0, sort_keys=True) + "\n")
    print(f"{len(products)} products, {len(urls)} photos, {changed} get a cleaner first photo")

if __name__ == "__main__":
    main()
