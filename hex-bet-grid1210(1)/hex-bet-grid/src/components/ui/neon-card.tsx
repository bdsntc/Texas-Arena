import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'winner';
  hover?: boolean;
  style?: CSSProperties;
}

export function NeonCard({ children, className, variant = 'default', hover = true, style }: NeonCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl p-6 transition-all duration-300",
        "bg-card border",
        variant === 'default' && "border-primary/30 shadow-[0_0_15px_hsl(172_100%_57%_/_0.1)]",
        variant === 'highlight' && "border-primary shadow-[0_0_25px_hsl(172_100%_57%_/_0.3)]",
        variant === 'winner' && "border-accent shadow-[0_0_30px_hsl(75_100%_50%_/_0.4)] animate-winner-flash",
        hover && "hover:border-primary hover:shadow-[0_0_30px_hsl(172_100%_57%_/_0.3)] hover:scale-[1.02]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
