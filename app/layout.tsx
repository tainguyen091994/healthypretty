import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Healthy Pretty · Dược mỹ phẩm có dược sĩ tư vấn", template: "%s · Healthy Pretty" },
  description: "Làm bài tư vấn da 2 phút, nhận chu trình sáng và tối kèm lời dặn của dược sĩ. Dược mỹ phẩm chọn theo nhu cầu da.",
};

export const viewport: Viewport = { themeColor: "#F4F5F0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,500;1,500&display=swap&subset=vietnamese"
        />
        <link rel="preconnect" href="https://cf.shopee.vn" />
      </head>
      <body>
        <a href="#main" className="sr-only">Bỏ qua, tới nội dung</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
