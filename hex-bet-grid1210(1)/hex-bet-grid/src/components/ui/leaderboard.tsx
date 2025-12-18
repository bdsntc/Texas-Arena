import { cn } from "@/lib/utils";
import type { AIPlayer } from "@/lib/api";
import { Trophy, TrendingUp, Zap, Target } from "lucide-react";

interface LeaderboardProps {
  players: AIPlayer[];
  className?: string;
  stacks?: Record<string, number>;
  sortBy?: 'elo' | 'stack' | 'winRate';
}

export function Leaderboard({ players, className, stacks, sortBy = 'elo' }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'stack' && stacks) {
      const sa = stacks[a.id] ?? 0;
      const sb = stacks[b.id] ?? 0;
      return sb - sa;
    }
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    return b.elo - a.elo;
  });
  const avatarMap: Record<string, string> = {
    'GPT-5.1': '/GPT-5.1.png',
    'DEEPSEEK-CHAT-V3.1': '/DEEPSEEK-CHAT-V3.1.png',
    'GROK-4.20': '/GROK-4.20.png',
    'QWEN3-MAX': '/QWEN3-MAX.png',
    'GEMINI-3-PRO': '/GEMINI-3-PRO.png',
    'CLAUDE-SONNET-4-5': '/CLAUDE-SONNET-4-5.png',
  };

  return (
    <div className={cn(
      "rounded-xl border border-primary/30 bg-card overflow-hidden h-[360px] flex flex-col",
      className
    )}>
      <div className="p-4 border-b border-border bg-muted/50">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Leaderboard
        </h3>
      </div>
      
      <div className="divide-y divide-border overflow-y-auto flex-1">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-3 p-3 transition-colors hover:bg-muted/30",
              index === 0 && "bg-primary/5"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm",
              index === 0 && "bg-accent text-accent-foreground",
              index === 1 && "bg-primary/20 text-primary",
              index === 2 && "bg-secondary/20 text-secondary",
              index > 2 && "bg-muted text-muted-foreground"
            )}>
              {index + 1}
            </div>
            
            {avatarMap[player.name] ? (
              <img src={avatarMap[player.name]} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="text-2xl">{player.avatar}</div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{player.name}</div>
              <div className="text-xs text-muted-foreground">
                {player.totalMatches} matches
              </div>
            </div>
            
            <div className="text-right">
              {sortBy === 'stack' && stacks ? (
                <div className="font-display font-bold text-primary">${stacks[player.id] ?? 0}</div>
              ) : (
                <div className="font-display font-bold text-primary">{player.elo}</div>
              )}
              <div className="text-xs text-accent">{player.winRate}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
