import { useEffect, useRef, useState } from "react";

export function useRoundPrize(endAt?: number, mode: 'active' | 'passive' = 'active') {
  const [dollars, setDollars] = useState(0);
  const timerRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!endAt) return;

    const key = `roundPrize:${endAt}`;
    let initialDelay = 0;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as { dollars?: number; nextAt?: number };
        const now = Date.now();
        if (typeof saved.dollars === 'number' && now < endAt) {
          setDollars(saved.dollars);
        } else {
          setDollars(0);
        }
        if (typeof saved.nextAt === 'number' && saved.nextAt > now) {
          initialDelay = saved.nextAt - now;
        }
      } else {
        setDollars(0);
      }
    } catch {
      setDollars(0);
    }

    const scheduleNext = () => {
      const now = Date.now();
      if (now >= endAt) {
        setDollars(0);
        try { localStorage.removeItem(key); } catch {}
        return;
      }
      const inc = 5 + Math.floor(Math.random() * 11); // 5..15
      const nextAt = now + (5000 + Math.floor(Math.random() * 3000)); // 5s..8s
      setDollars(v => {
        const updated = v + inc;
        try { localStorage.setItem(key, JSON.stringify({ dollars: updated, nextAt })); } catch {}
        return updated;
      });
      timerRef.current = window.setTimeout(scheduleNext, nextAt - now);
    };

    if (mode === 'active') {
      timerRef.current = window.setTimeout(scheduleNext, initialDelay);
    } else {
      // passive: poll storage to sync value without writing
      const poll = () => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const saved = JSON.parse(raw) as { dollars?: number };
            if (typeof saved.dollars === 'number') setDollars(saved.dollars);
          } catch {}
        }
      };
      poll();
      pollRef.current = window.setInterval(poll, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [endAt, mode]);

  return dollars;
}
