import { useEffect, useRef, useState } from "react";

export function useCountdown(expiresAt: string | null, onExpire: () => void) {
  const [now, setNow] = useState(() => Date.now());
  const expireRef = useRef(onExpire);

  useEffect(() => {
    expireRef.current = onExpire;
  });

  useEffect(() => {
    if (!expiresAt) return;
    const end = Date.parse(expiresAt);
    let fired = false;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (!fired && t >= end) {
        fired = true;
        expireRef.current();
      }
    };
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 250);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [expiresAt]);

  return expiresAt === null ? null : Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
}
