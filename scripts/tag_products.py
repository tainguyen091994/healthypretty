#!/usr/bin/env python3
"""Turn a raw KiotViet web-store dump into data/products.json.

Input: a JSON list of product records (see scripts/crawl_store.py).
Output: data/products.json (site catalogue) and docs/claims_report.md
(original wording that needs a pharmacist check).

Every tag here is a first guess from the product name and the label text.
The pharmacist checks and edits data/overrides.json; overrides always win.

Usage: python3 scripts/tag_products.py RAW.json
"""
import json, re, sys, unicodedata, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Categories that must not appear on a public shop: clinic-only, injectables,
# prescription items, internal placeholders.
HIDDEN_CATEGORIES = {"RX", "MediSpa", "NHÀ THUỐC", "Linh tinh"}
HIDDEN_NAME = re.compile(r"botulax|botox|qua tang|tpcn/ vien uong|ampoule vitamin c 13%", re.I)


def strip(s: str) -> str:
    s = s.replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()


def has(text, *pats):
    return any(re.search(p, text) for p in pats)


TYPE_RULES = [
    ("supplement", [r"vien uong", r"supplem", r"\bvien\b", r"h/30v", r"capsule"]),
    ("remover", [r"tay trang", r"micellar", r"make ?up remover", r"cleansing oil"]),
    ("exfoliant", [r"tay te bao chet", r"scrub", r"exfoliat", r"\bpeel"]),
    ("spot", [r"cham mun", r"(?<!brown )(?<!dark )spot", r"mieng dan", r"\bpatch", r"salyzap lotion"]),
    ("hair", [r"dau goi", r"shampoo", r"\btoc\b(?<!cap toc)", r"hair", r"gau\b"]),
    ("sunscreen", [r"chong nang", r"\bspf", r"sunscreen", r"sun (cream|fluid|block|gel)", r"sun block", r"heliocare"]),
    ("cleanser", [r"rua mat", r"cleanser", r"cleansing (gel|milk|foam)", r"foaming", r"\bfoam\b", r"sebogel", r"gel moussant"]),
    ("body", [r"sua tam", r"body", r"duong the", r"\btay\b", r"got chan", r"\bran\b", r"foot", r"hand cream", r"stretch", r"bung"]),
    ("lip", [r"^son ", r"son duong", r"\blip\b", r"duong moi", r"(cho|vung) moi\b"]),
    ("eye", [r"vung mat", r"\beye\b", r"quang tham", r"bong mat"]),
    ("mask", [r"mat na", r"\bmask\b"]),
    ("mist", [r"xit khoang", r"\bmist\b", r"thermal", r"spring water", r"nuoc khoang"]),
    ("toner", [r"toner", r"nuoc can bang", r"\btonic\b", r"astringent"]),
    ("serum", [r"serum", r"tinh chat", r"ampoule", r"ampule", r"huyet thanh", r"essence", r"concentrate", r"booster", r"complex"]),
    ("moisturizer", [r"kem", r"cream", r"\bgel\b", r"lotion", r"sua duong", r"balm", r"fluid", r"emulsion"]),
]

TYPE_LABEL = {
    "supplement": "Viên uống", "remover": "Tẩy trang", "exfoliant": "Tẩy tế bào chết",
    "hair": "Chăm sóc tóc", "spot": "Chấm mụn", "sunscreen": "Kem chống nắng",
    "cleanser": "Sữa rửa mặt", "body": "Chăm sóc cơ thể", "lip": "Dưỡng môi",
    "eye": "Dưỡng vùng mắt", "mask": "Mặt nạ", "mist": "Xịt khoáng", "toner": "Toner",
    "serum": "Tinh chất", "moisturizer": "Kem dưỡng", "other": "Khác",
}

ACTIVE_RULES = {
    "retinoid": [r"retin", r"vitisphere", r"\bhpr\b", r"bakuchiol"],
    "bha": [r"salicyl", r"\bbha\b", r"salyzap", r"lha"],
    "aha": [r"glycolic", r"lactic", r"mandel", r"\bmande\b", r"\baha\b", r"\bpha\b", r"gluconolactone", r"exfoliating face cream"],
    "bpo": [r"benzoyl"],
    "vitc": [r"vitamin c\b", r"vita c\b", r"vit c\b", r"ascorb", r"melavita-c", r"\bvc\b"],
    "niacinamide": [r"niacinamide", r"\bb3\b"],
    "tranexamic": [r"tranexamic", r"\btxa\b"],
    "azelaic": [r"azela"],
    "brightener": [r"arbutin", r"glutathione", r"kojic", r"depigment", r"depiwhite", r"whitening", r"brightening", r"melasma", r"dark spot", r"pigment"],
    "regen": [r"peptide", r"pdrn", r"exosome", r"\begf\b", r"collagen", r"stem cell", r"te bao goc"],
    "ceramide": [r"ceramide", r"corneo"],
    "hyaluronic": [r"hyaluro", r"\bha\b", r"aqua", r"hydra"],
    "soothing": [r"cica", r"centella", r"\bb5\b", r"panthenol", r"ectoin", r"calming", r"vitamin k", r"capinon", r"neutraz", r"sensi", r"lam diu", r"soothing", r"shooth"],
    "spf": [r"\bspf", r"chong nang", r"sun"],
}

ACTIVE_LABEL = {
    "retinoid": "Retinoid", "bha": "BHA (salicylic acid)", "aha": "AHA/PHA",
    "bpo": "Benzoyl peroxide", "vitc": "Vitamin C", "niacinamide": "Niacinamide",
    "tranexamic": "Tranexamic acid", "azelaic": "Azelaic acid", "brightener": "Hoạt chất dưỡng sáng",
    "regen": "Peptide / PDRN / exosome", "ceramide": "Ceramide", "hyaluronic": "Hyaluronic acid",
    "soothing": "Hoạt chất làm dịu (cica, B5, ectoin, vitamin K)", "spf": "Màng lọc chống nắng",
}

NEED_RULES = {
    "dau-mun": [r"\bmun\b", r"acne", r"da dau", r"sebo", r"\bakn", r"acnaut", r"acnestil", r"aknicare", r"purifying", r"kiem soat (dau|nhon)", r"balancing", r"lo chan long", r"salicyl", r"\bbha\b", r"azela"],
    "phuc-hoi": [r"phuc hoi", r"cap am", r"duong am", r"hydra", r"hyaluro", r"ceramide", r"repair", r"nhay cam", r"sensitive", r"lam diu", r"calming", r"\bb5\b", r"cica", r"moistur", r"aqua", r"do da", r"gian mao mach", r"vitamin k", r"barrier"],
    "tham-sam": [r"tham", r"\bnam\b", r"sam", r"tan nhang", r"duong sang", r"duong trang", r"trang da", r"sang da", r"bright", r"whiten", r"pigment", r"melasma", r"tranexamic", r"glutathione", r"arbutin", r"vitamin c\b", r"radiance", r"dark spot", r"depigment", r"glow"],
    "lao-hoa": [r"lao hoa", r"nep nhan", r"tre hoa", r"tai tao", r"san chac", r"retin", r"peptide", r"pdrn", r"collagen", r"aging", r"anti-age", r"wrinkle", r"exosome", r"revival", r"cang bong"],
    "sau-lieu-trinh": [r"sau (treatment|xam lan|lieu trinh|laser|peel)", r"xam lan", r"post", r"exosome", r"egf", r"pdrn", r"duoderm", r"ultra repair", r"total repair", r"sensitive skin ampoule"],
}

SKIN_RULES = {
    "oily": [r"da dau", r"oily", r"hon hop", r"mixed", r"combination", r"sebo"],
    "dry": [r"da kho", r"\bdry\b(?! sunscreen)", r"rat kho"],
    "sensitive": [r"nhay cam", r"sensitive", r"kich ung", r"sensi"],
}

BANNED = [
    "điều trị", "đặc trị", "trị mụn", "trị nám", "trị thâm", "chữa", "khỏi hẳn", "khỏi", "tiêu diệt",
    "kháng khuẩn", "kháng viêm", "giảm viêm", "chống viêm", "liền sẹo", "lành thương", "mau lành",
    "ức chế", "100%", "ngay lập tức", "cam kết", "tuyệt đối", "sau 1 tuần", "sau 7 ngày", "vĩnh viễn",
    "thần kỳ", "số 1", "tốt nhất", "xâm lấn", "giảm cân", "tiệt trừ", "giãn mao mạch", "mờ sẹo", "sẹo",
]


def clean_desc(raw: str):
    t = html.unescape(raw or "")
    t = re.sub(r"<\s*/?\s*br\s*/?\s*>", "\n", t, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    t = t.split("-----")[0]
    return t.strip()


def usage_text(desc: str):
    m = re.search(r"(hướng dẫn sử dụng|cách dùng|cách sử dụng)\s*:?\s*(.+)", desc, re.I | re.S)
    if not m:
        return None
    body = m.group(2)
    body = re.split(r"\n\s*\n\s*-?\s*(bảo quản|lưu ý|thành phần|công dụng|xuất xứ)", body, flags=re.I)[0]
    lines = [re.sub(r"^[+\-•*]\s*", "", l).strip() for l in body.split("\n")]
    lines = [l for l in lines if l]
    return " ".join(lines)[:600] or None


VN_WORDS = set(strip(w) for w in (
    "kem dưỡng tinh chất sữa rửa mặt gel cho da dầu mụn khô nhạy cảm chống nắng tẩy trang nước cân bằng "
    "làm sạch sâu và giảm phục hồi dành mờ thâm nám trắng sáng tái tạo trẻ hóa lão ngừa nếp nhăn vùng môi "
    "hỗ trợ dưỡng ẩm cấp toàn thân bọt mặt nạ xịt khoáng dạng lỏng sữa tắm gội đầu tóc viên uống ban đêm ngày "
    "kiểm soát nhờn giữ của với các mọi loại lẻ miếng hộp chuyên biệt tế bào chết gốc huyết thanh đỏ dịu thể "
    "căng bóng chuyên sâu tàn nhang sẹo cơ dung dịch hạt bio hương thảo chiết xuất dâu tằm argan tay chân gót"
).split())

KEEP_UPPER = {"SPF", "PA", "HA", "B3", "B5", "B12", "BHA", "AHA", "PHA", "PDRN", "EGF", "UV", "AC", "AKN", "CICA",
              "SPF50", "SPF30", "SPF50+", "PA+++", "PA++++", "PA+", "FCL", "TXA", "ACM", "SOS", "DR.WHITE", "K1%",
              "H2O", "H20", "XL", "MD", "II", "III", "R8", "C", "K", "E", "A", "TA"}


def tidy_case(s: str):
    words = s.split()
    out = []
    for w in words:
        core = w.strip(",.()")
        if core.upper() in KEEP_UPPER or re.search(r"\d", core):
            out.append(w.upper() if core.upper() in KEEP_UPPER else w)
        elif w.isupper() and len(core) > 1:
            out.append(w.capitalize())
        else:
            out.append(w)
    return " ".join(out)


def split_name(name: str, brand: str):
    n = re.sub(r"^(\[+[^\]]*\]+\s*)+", "", name).strip()
    n = re.sub(r"^%s\s*-\s*" % re.escape(brand), "", n, flags=re.I)
    parts = [p.strip() for p in re.split(r"\s+[-–]\s+|\s+[-–](?=[A-Z])", n) if p.strip()]
    def latin_score(p):
        toks = p.split()
        if not toks:
            return 0
        latin = [t for t in toks if t.isascii() and strip(t) not in VN_WORDS]
        return len(latin) / len(toks)
    best = None
    for i in range(1, len(parts)):
        if latin_score(parts[i]) >= 0.6:
            best = " - ".join(parts[i:])
            break
    if not best:
        toks = n.split()
        runs, cur = [], []
        for t in toks:
            if t.isascii() and strip(t) not in VN_WORDS:
                cur.append(t)
            else:
                if cur: runs.append(cur)
                cur = []
        if cur: runs.append(cur)
        runs = [r for r in runs if len(r) >= 2]
        if runs:
            best = " ".join(max(runs, key=len))
    if not best:
        best = n
    best = re.sub(r"^(%s)\s+" % re.escape(brand), "", best, flags=re.I).strip(" -–")
    best = re.sub(r"\s*[-–]?\s*\(?\d+(?:[.,]\d+)?\s?(ml|g|mg)\)?\s*$", "", best, flags=re.I).strip(" -–.")
    best = tidy_case(best)
    bt = strip(brand).replace("'", "")
    while strip(best).startswith(bt + " "):
        best = best[len(bt) + 1:].strip()
    return best if len(best) >= 3 else tidy_case(n)


def size_of(name: str):
    m = re.search(r"(\d+(?:[.,]\d+)?\s?(?:ml|g|mg)\b|h/\d+v|hộp \d+ (?:miếng|viên))", name, re.I)
    return m.group(1).replace(" ", "") if m else None


KNOWN_BRANDS = ["OROBANC", "PHARMACERIS", "KYUNGLAB", "FIXDERMA", "POSTQUAM", "BIONNEX", "RILASTIL", "DERMAFIRM", "TOSKANI", "JALUPRO", "PROFHILO"]


def brand_of(name: str, cat: str):
    tags_ = [t.strip() for t in re.findall(r"\[+([^\]]+)\]+", name.split(" ")[0] + " " + " ".join(name.split(" ")[1:2]))]
    tags_ = [t for t in re.findall(r"^\s*(?:\[([^\]]+)\]\s*)", name)] + re.findall(r"^\[[^\]]+\]\[([^\]]+)\]", name)
    tags_ = [re.sub(r"\s*CHÍNH HÃNG", "", t).strip() for t in tags_ if not t.upper().startswith("DATE")]
    b = tags_[0] if tags_ else cat.strip()
    if not tags_:
        for kb in KNOWN_BRANDS:
            if strip(name).startswith(strip(kb)):
                b = kb
                break
    if b in ("Khác", "NEO-") and not tags_:
        b = "Khác"
    b = b.strip("[] ")
    fixes = {"BABE": "BABÉ", "NEO-": "NeoStrata", "TEEN": "Teenilicious", "TEENILICIOUS": "Teenilicious",
             "COTTON PADS": "Hatsu", "MD CARE": "MD Care", "SRX": "SRX", "ACM": "ACM", "T3": "T3", "SMAS": "SMAS"}
    b = fixes.get(b.upper(), b)
    return b if not b.isupper() or len(b) <= 4 else b.title().replace("D'Arcel", "d'Arcel")


def tags(text, rules):
    return [k for k, pats in rules.items() if has(text, *pats)]


def type_of(text):
    for t, pats in TYPE_RULES:
        if has(text, *pats):
            return t
    return "other"


def time_of(ptype, actives, text):
    if has(text, r"ban dem", r"night"):
        return "pm"
    if has(text, r"ban ngay", r"\bday\b") or ptype == "sunscreen":
        return "am"
    if ptype in ("serum", "moisturizer", "spot") and ({"retinoid", "aha"} & set(actives) or ptype == "spot"):
        return "pm"
    if ptype == "serum" and "vitc" in actives:
        return "am"
    return "both"


def main(raw_path):
    raw = json.loads(Path(raw_path).read_text())
    overrides_path = ROOT / "data" / "overrides.json"
    overrides = json.loads(overrides_path.read_text()) if overrides_path.exists() else {}
    out, report, hidden = [], [], []
    for r in raw:
        if "error" in r or not r.get("is_active", True):
            continue
        name, cat = r["name"], r["category_name"]
        if cat in HIDDEN_CATEGORIES or HIDDEN_NAME.search(strip(name)) or not r.get("price"):
            hidden.append((cat, name))
            continue
        desc = clean_desc(r.get("description"))
        t_name = strip(name)
        t_all = strip(name + " " + desc[:900])
        brand = brand_of(name, cat)
        ptype = type_of(t_name)
        actives = tags(t_name, ACTIVE_RULES)
        if ptype == "sunscreen" and "spf" not in actives:
            actives.append("spf")
        if ptype != "sunscreen" and "spf" in actives and not has(t_name, r"\bspf"):
            actives.remove("spf")
        needs = tags(t_all, NEED_RULES)
        if ptype in ("hair", "body", "supplement", "lip"):
            needs = ["toc-co-the"]
        skin = tags(t_all, SKIN_RULES) or ["all"]
        slug = r["url"].rstrip("/").split("/p/")[-1]
        rec = {
            "id": r["id"],
            "code": r.get("code"),
            "slug": slug,
            "brand": brand,
            "title": split_name(name, brand),
            "typeLabel": TYPE_LABEL[ptype],
            "size": size_of(name),
            "sourceName": name,
            "category": cat,
            "type": ptype,
            "actives": actives,
            "needs": needs,
            "skin": skin,
            "time": time_of(ptype, actives, t_name),
            "price": r["price"],
            "salePrice": r["promotion"] if r.get("promotion") and r["promotion"] < r["price"] else None,
            "inStock": bool(r.get("is_sku_in_stock")),
            "stock": r.get("on_hand"),
            "images": r.get("images", [])[:5],
            "usage": usage_text(desc),
            "reviewed": False,
        }
        rec.update(overrides.get(rec["id"], {}))
        out.append(rec)
        found = [w for w in BANNED if w in (name + " " + desc).lower()]
        if found:
            report.append((brand, name, found))
    out.sort(key=lambda x: (x["brand"].lower(), x["title"].lower()))
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "products.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    lines = ["# Claims report", "",
             f"Products checked: {len(out)}. With wording to check: {len(report)}.", "",
             "The site does not show the original description. It shows a neutral summary and the usage text.",
             "Check the words below before you put the original text back anywhere.", "",
             "| Brand | Product | Words to check |", "|---|---|---|"]
    for b, n, f in report:
        lines.append(f"| {b} | {n.replace('|', '/')} | {', '.join(f)} |")
    lines += ["", f"## Hidden from the public site ({len(hidden)})", "",
              "Clinic-only, prescription, gift or zero-price items. Check if any should be public.", ""]
    lines += [f"- {c}: {n}" for c, n in hidden]
    (ROOT / "docs").mkdir(exist_ok=True)
    (ROOT / "docs" / "claims_report.md").write_text("\n".join(lines) + "\n")
    from collections import Counter
    print(len(out), "products;", len(hidden), "hidden;", len(report), "with claims to check")
    print("types", Counter(p["type"] for p in out).most_common())
    print("needs", Counter(n for p in out for n in p["needs"]).most_common())
    print("no need", sum(1 for p in out if not p["needs"]))


if __name__ == "__main__":
    main(sys.argv[1])
