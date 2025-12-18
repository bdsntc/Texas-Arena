import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({ value, prefix = "", suffix = "", className, decimals = 0 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const diff = value - displayValue;
    if (Math.abs(diff) < 1) {
      setDisplayValue(value);
      return;
    }

    const step = diff / 20;
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const next = prev + step;
        if ((step > 0 && next >= value) || (step < 0 && next <= value)) {
          clearInterval(interval);
          return value;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <span className={cn("font-display tabular-nums animate-count block text-center mx-auto", className)}>
      {prefix}{displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}
    </span>
  );
}
