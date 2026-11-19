// Analytics shim. Pushes events to window.dataLayer, so GA4 or GTM can read them
// later without code changes. The main metric: add_to_cart with source "quiz"
// divided by quiz_complete.
type EventName = "quiz_start" | "quiz_complete" | "routine_add_all" | "add_to_cart" | "zalo_handoff";

declare global { interface Window { dataLayer?: Record<string, unknown>[] } }

export function track(event: EventName, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (window.dataLayer ||= []).push({ event, ...params });
}
