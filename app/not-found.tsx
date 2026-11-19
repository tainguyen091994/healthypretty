import { A } from "@/components/A";
import { href } from "@/lib/links";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "80px var(--gutter)" }}>
      <h1 className="display h2">Không tìm thấy <em>trang này</em></h1>
      <A className="text-link" href={href("/san-pham")}>Xem tất cả sản phẩm</A>
    </div>
  );
}
