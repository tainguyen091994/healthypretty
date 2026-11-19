"use client";
// Cart in localStorage. Each line keeps a small snapshot of the product,
// so the cart page needs no catalogue download. Prices are re-checked by the
// pharmacist on Zalo before the order is confirmed.
import { useCallback, useEffect, useState } from "react";
import type { ProductLite } from "./types";
import { track } from "./track";

export interface CartLine {
  slug: string; brand: string; title: string; size: string | null;
  price: number; image: string | null; qty: number;
}

const KEY = "hp_cart_v1";
const EVENT = "hp-cart";

function read(): CartLine[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(lines: CartLine[]) {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode: cart lives for this page only */ }
  window.dispatchEvent(new Event(EVENT));
}

export function unitPrice(p: Pick<ProductLite, "price" | "salePrice">) { return p.salePrice ?? p.price; }

export function addToCart(items: ProductLite[], source: string) {
  const lines = read();
  for (const p of items) {
    const line = lines.find((l) => l.slug === p.slug);
    if (line) line.qty += 1;
    else lines.push({ slug: p.slug, brand: p.brand, title: p.title, size: p.size, price: unitPrice(p), image: p.image, qty: 1 });
    track("add_to_cart", { source, slug: p.slug, value: unitPrice(p) });
  }
  write(lines);
}

export function setQty(slug: string, qty: number) {
  write(read().map((l) => (l.slug === slug ? { ...l, qty } : l)).filter((l) => l.qty > 0));
}

export function clearCart() { write([]); }

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const sync = useCallback(() => setLines(read()), []);
  useEffect(() => {
    sync(); setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, [sync]);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.price, 0);
  return { lines, count, total, ready };
}
