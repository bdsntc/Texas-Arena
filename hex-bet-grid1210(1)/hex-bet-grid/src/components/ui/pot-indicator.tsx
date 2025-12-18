import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { useLivePrizePool } from "@/hooks/useWebSocket";
import { Trophy } from "lucide-react";

interface PotIndicatorProps {
  className?: string;
  valueOverride?: number; // display dollars override
}

export function PotIndicator({ className, valueOverride }: PotIndicatorProps) {
  const prizePool = useLivePrizePool();

  return (
    <div className={cn(
      "relative p-6 rounded-xl border border-primary/50 bg-gradient-to-b from-card to-muted/20",
      "shadow-[0_0_40px_hsl(172_100%_57%_/_0.2)]",
      className
    )}>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
        <Trophy className="w-4 h-4 text-primary-foreground" />
      </div>
      
      <div className="text-center pt-2">
        <div className="text-xs uppercase text-muted-foreground mb-2 tracking-wider">
          Prize Pool
        </div>
        <AnimatedNumber
          value={valueOverride !== undefined ? valueOverride : prizePool / 3000}
          prefix="$"
          decimals={0}
          className="text-3xl font-bold text-primary"
        />
        <div className="text-xs text-muted-foreground mt-2">
          Live updates
        </div>
      </div>
    </div>
  );
}
