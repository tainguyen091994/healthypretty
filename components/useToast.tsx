"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 3200);
  }, []);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const node = msg ? <div className="toast" role="status">{msg}</div> : <div role="status" className="sr-only" />;
  return { show, node };
}
