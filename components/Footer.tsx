import { A } from "./A";
import { href, SHOPEE_URL, ZALO_PHONE, ZALO_PHONE_2, ZALO_URL } from "@/lib/links";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot">
          <div>
            <p className="wordmark" aria-hidden>Healthy Pretty</p>
            <p>Dược mỹ phẩm chọn theo nhu cầu da, có dược sĩ tư vấn.</p>
            <p>Địa chỉ: [DATA NEEDED: địa chỉ cửa hàng tại TP.HCM]</p>
          </div>
          <div>
            <h2>Hỏi dược sĩ</h2>
            <ul>
              <li>Zalo: <a href={ZALO_URL} target="_blank" rel="noopener">{ZALO_PHONE}</a></li>
              <li>Zalo 2: <a href={`https://zalo.me/${ZALO_PHONE_2}`} target="_blank" rel="noopener">{ZALO_PHONE_2}</a></li>
              <li>Giờ trả lời: [DATA NEEDED]</li>
            </ul>
          </div>
          <div>
            <h2>Mua sắm</h2>
            <ul>
              <li><A href={href("/tu-van")}>Bài tư vấn da</A></li>
              <li><A href={href("/san-pham")}>Tất cả sản phẩm</A></li>
              <li><a href={SHOPEE_URL} target="_blank" rel="noopener">Gian hàng Shopee</a></li>
            </ul>
          </div>
        </div>
        <div className="fine">
          <p>Thông tin trên trang chỉ để tham khảo, không thay thế chẩn đoán của bác sĩ. Kết quả có thể khác nhau ở mỗi người.</p>
          <p>Giấy phép kinh doanh: [DATA NEEDED]. Đã thông báo Bộ Công Thương: [DATA NEEDED].</p>
        </div>
      </div>
    </footer>
  );
}
