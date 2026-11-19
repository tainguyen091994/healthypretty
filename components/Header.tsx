"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { A } from "./A";
import { href } from "@/lib/links";
import { useCart } from "@/lib/cart";

const NAV = [
  { path: "/tu-van", label: "Tư vấn da" },
  { path: "/san-pham", label: "Sản phẩm" },
];

export function Header() {
  const raw = usePathname() || "/";
  const path = raw.replace(/\.html$/, "").replace(/\/index$/, "/");
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const current = (p: string) => (path === p || path.startsWith(p + "/") || (p === "/san-pham" && path.startsWith("/xem")) ? "page" : undefined);

  return (
    <>
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="wrap nav">
          <A href={href("/")} className="wordmark" aria-label="Healthy Pretty, trang chủ">Healthy Pretty</A>
          <nav aria-label="Chính">
            <ul className="nav-links">
              {NAV.map((n) => (
                <li key={n.path}><A href={href(n.path)} aria-current={current(n.path)}>{n.label}</A></li>
              ))}
            </ul>
          </nav>
          <A href={href("/gio-hang")} className="cart-link" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
            <ShoppingBag size={20} strokeWidth={1.6} aria-hidden />
            <span className="cart-text">Giỏ hàng</span>
            <span className="cart-count" aria-hidden>{count}</span>
          </A>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Điều hướng nhanh">
        <A href={href("/")} aria-current={path === "/" ? "page" : undefined}>Trang chủ</A>
        <A href={href("/tu-van")} aria-current={current("/tu-van")}>Tư vấn da</A>
        <A href={href("/san-pham")} aria-current={current("/san-pham")}>Sản phẩm</A>
        <A href={href("/gio-hang")} aria-current={current("/gio-hang")}>Giỏ ({count})</A>
      </nav>
    </>
  );
}
