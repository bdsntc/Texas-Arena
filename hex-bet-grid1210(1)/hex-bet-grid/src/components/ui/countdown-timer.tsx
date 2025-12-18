import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  seconds?: number;
  endAt?: number;
  onComplete?: () => void;
  className?: string;
  holdAtZero?: boolean;
}

export function CountdownTimer({ seconds: initialSeconds = 0, endAt, onComplete, className, holdAtZero = true }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (endAt) {
      const tick = () => {
        const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
        setSeconds(remaining);
        if (remaining <= 0) onComplete?.();
      };
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    } else {
      if (seconds <= 0) {
        if (holdAtZero) {
          setSeconds(0);
          return;
        }
        onComplete?.();
        return;
      }
      const interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [endAt, seconds, onComplete, holdAtZero]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const isUrgent = seconds <= 30;

  return (
    <div className={cn(
      "font-display text-center",
      isUrgent && "animate-pulse-neon",
      className
    )}>
      <div className="text-xs uppercase text-muted-foreground mb-1">Match Starts In</div>
      <div className={cn(
        "text-4xl font-bold tracking-wider",
        isUrgent ? "text-destructive" : "text-primary",
        "neon-text"
      )}>
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
    </div>
  );
}
