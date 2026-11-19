"use client";
import { ZALO_URL } from "./links";

// zalo.me links cannot carry a prefilled message. So we copy the message
// first, then open Zalo, and tell the customer to paste it.
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export function handOff(text: string, onDone: (copied: boolean) => void) {
  const copying = copyText(text);
  window.open(ZALO_URL, "_blank", "noopener");
  copying.then(onDone);
}
