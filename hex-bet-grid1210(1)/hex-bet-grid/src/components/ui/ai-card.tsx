import { cn } from "@/lib/utils";
import type { AIPlayer } from "@/lib/api";
import { NeonCard } from "./neon-card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AICardProps {
  ai: AIPlayer;
  isSelected?: boolean;
  onSelect?: (ai: AIPlayer) => void;
  isWinner?: boolean;
  disabled?: boolean;
}

export function AICard({ ai, isSelected, onSelect, isWinner, disabled }: AICardProps) {
  const getStyleColor = (style: AIPlayer['style']) => {
    switch (style) {
      case 'aggressive': return 'text-destructive';
      case 'conservative': return 'text-primary';
      case 'balanced': return 'text-accent';
      case 'unpredictable': return 'text-secondary';
    }
  };

  const avatarMap: Record<string, string> = {
    'GPT-5.1': '/GPT-5.1.png',
    'DEEPSEEK-CHAT-V3.1': '/DEEPSEEK-CHAT-V3.1.png',
    'GROK-4.20': '/GROK-4.20.png',
    'QWEN3-MAX': '/QWEN3-MAX.png',
    'GEMINI-3-PRO': '/GEMINI-3-PRO.png',
    'CLAUDE-SONNET-4-5': '/CLAUDE-SONNET-4-5.png',
  };
  const imageSrc = avatarMap[ai.name];

  return (
    <NeonCard
      variant={isWinner ? 'winner' : isSelected ? 'highlight' : 'default'}
      hover={!disabled}
      className={cn(
        "cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div 
        onClick={() => !disabled && onSelect?.(ai)}
        className="space-y-4"
      >
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 flex items-center justify-center rounded-full",
            "bg-muted border border-primary/30"
          )}>
            {imageSrc ? (
              <img src={imageSrc} alt={ai.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl">{ai.avatar}</span>
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-lg tracking-wider">
              {ai.name}
            </h3>
            <span className={cn("text-xs uppercase font-medium", getStyleColor(ai.style))}>
              {ai.style}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">ELO</span>
            <p className="font-display font-bold text-primary text-lg">{ai.elo}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Win Rate</span>
            <p className="font-display font-bold text-accent text-lg">{ai.winRate}%</p>
          </div>
        </div>

        {/* Odds */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-muted-foreground text-sm">Odds</span>
          <span className="font-display font-bold text-xl text-foreground">
            {ai.odds.toFixed(2)}x
          </span>
        </div>

        {/* Recent Form */}
        <div className="flex gap-1">
          {ai.recentForm.map((result, i) => (
            <div
              key={i}
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                result === 'W' && "bg-primary/20 text-primary",
                result === 'L' && "bg-destructive/20 text-destructive",
                result === 'D' && "bg-muted text-muted-foreground"
              )}
            >
              {result}
            </div>
          ))}
        </div>
      </div>
    </NeonCard>
  );
}
