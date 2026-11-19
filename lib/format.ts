import type { ActiveTag } from "./types";

export const vnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const ACTIVE_LABEL: Record<ActiveTag, string> = {
  retinoid: "Retinoid", bha: "BHA", aha: "AHA/PHA", bpo: "Benzoyl peroxide", vitc: "Vitamin C",
  niacinamide: "Niacinamide", tranexamic: "Tranexamic acid", azelaic: "Azelaic acid",
  brightener: "Hoạt chất dưỡng sáng", regen: "Peptide / PDRN", ceramide: "Ceramide",
  hyaluronic: "Hyaluronic acid", soothing: "Thành phần làm dịu", spf: "Chống nắng",
};

// Words the site must not show (Luật Quảng cáo, Nghị định 181/2013, TT 06/2011/TT-BYT).
// Product texts that contain them stay hidden until the pharmacist rewrites them.
const BANNED = [
  "điều trị", "đặc trị", "trị mụn", "trị nám", "trị thâm", "chữa", "khỏi", "tiêu diệt",
  "kháng khuẩn", "kháng viêm", "giảm viêm", "chống viêm", "liền sẹo", "lành thương", "mau lành",
  "ức chế", "100%", "ngay lập tức", "cam kết", "tuyệt đối", "vĩnh viễn", "thần kỳ", "số 1",
  "tốt nhất", "xâm lấn", "giảm cân", "sẹo", "nám",
];

export function isSafeText(t: string | null | undefined): t is string {
  if (!t) return false;
  const s = t.toLowerCase();
  return !BANNED.some((w) => s.includes(w));
}
