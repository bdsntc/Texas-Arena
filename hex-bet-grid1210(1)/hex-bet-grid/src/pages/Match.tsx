import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { NeonCard } from "@/components/ui/neon-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Leaderboard } from "@/components/ui/leaderboard";
import { getAIList, type AIPlayer } from "@/lib/api";
import { createHoldemSimulator, type DecisionEvent } from "@/lib/holdem";
import { cn } from "@/lib/utils";
import { Loader2, Trophy, Zap, Clock, Layers } from "lucide-react";
import { useRoundPrize } from "@/hooks/useRoundPrize";
import { useMatchStore } from "@/store/bettingStore";

const cardSymbols: Record<string, string> = {
  '♠': 'text-black',
  '♥': 'text-destructive',
  '♦': 'text-destructive',
  '♣': 'text-black',
};

function PlayingCard({ card }: { card: string }) {
  const value = card.slice(0, -1);
  const suit = card.slice(-1);
  
  return (
    <div className={cn(
      "w-20 h-28 rounded-lg bg-foreground flex flex-col items-center justify-center",
      "shadow-[0_4px_20px_rgba(0,0,0,0.5)] animate-scale-in"
    )}>
      <span className={cn("text-3xl font-bold", cardSymbols[suit] || 'text-primary-foreground')}>
        {value}
      </span>
      <span className={cn("text-4xl", cardSymbols[suit] || 'text-primary-foreground')}>
        {suit}
      </span>
    </div>
  );
}

function PokerTable({ players, communityCards, currentPot, holeCards, stage, winnerId, playerStacks, playerBets }: { 
  players: AIPlayer[];
  communityCards: string[];
  currentPot: number;
  holeCards: Record<string, string[]>;
  stage: 'preflop'|'flop'|'turn'|'river'|'showdown';
  winnerId?: string;
  playerStacks: Record<string, number>;
  playerBets: Record<string, number>;
}) {
  const avatarMap: Record<string, string> = {
    'GPT-5.1': '/GPT-5.1.png',
    'DEEPSEEK-CHAT-V3.1': '/DEEPSEEK-CHAT-V3.1.png',
    'GROK-4.20': '/GROK-4.20.png',
    'QWEN3-MAX': '/QWEN3-MAX.png',
    'GEMINI-3-PRO': '/GEMINI-3-PRO.png',
    'CLAUDE-SONNET-4-5': '/CLAUDE-SONNET-4-5.png',
  };
  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Table */}
      <div className={cn(
        "relative aspect-[16/9] rounded-[100px] overflow-hidden",
        "bg-gradient-to-b from-emerald-800 to-emerald-900",
        "border-8 border-amber-900/80",
        "shadow-[inset_0_0_100px_rgba(0,0,0,0.5),0_20px_60px_rgba(0,0,0,0.6)]"
      )}>
        {/* Inner felt pattern */}
        <div className="absolute inset-4 rounded-[80px] border-2 border-emerald-700/50" />
        
        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex gap-2 mb-4">
            {communityCards.map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
            {/* Placeholder cards */}
            {Array(5 - communityCards.length).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="w-20 h-28 rounded-lg bg-emerald-700/50 border-2 border-dashed border-emerald-600/50" />
            ))}
          </div>
          
          {/* Pot Display */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background/90 border border-primary/50">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="font-display font-bold text-accent">
                POT: <AnimatedNumber value={currentPot} prefix="$" className="text-3xl font-bold text-primary" />
              </span>
            </div>
          </div>
        </div>

        {/* Player positions around table */}
        {players.slice(0, 6).map((player, index) => {
          const total = Math.min(players.length, 6);
          const angle = -90 + (360 / total) * index; // start at top, distribute clockwise
          const rad = (angle * Math.PI) / 180;
          const rx = 38; // horizontal radius (% of table)
          const ry = 33; // vertical radius (% of table)
          const x = 50 + rx * Math.cos(rad);
          const y = 50 + ry * Math.sin(rad);
          const holeSideRight = x > 50;
          const cards = holeCards[player.id] || [];
          const isWinner = winnerId === player.id && stage === 'showdown';
          
          return (
            <div 
              key={player.id}
              className={cn("absolute -translate-x-1/2 -translate-y-1/2")}
              style={{ top: `${y}%`, left: `${x}%` }}
            >
              <div className="flex flex-col items-center">
                <div className={cn("flex items-center", holeSideRight ? "flex-row" : "flex-row-reverse") }>
                  {/* Hole cards */}
                  <div className="flex gap-2">
                    {cards.slice(0,2).map((c, i) => (
                      stage === 'showdown' ? (
                        <div key={i} className="w-10 h-16 rounded-md bg-foreground flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                          <span className={cn("text-sm font-bold", cardSymbols[c.slice(-1)] || 'text-primary-foreground')}>{c.slice(0, -1)}</span>
                          <span className={cn("text-base", cardSymbols[c.slice(-1)] || 'text-primary-foreground')}>{c.slice(-1)}</span>
                        </div>
                      ) : (
                        <div key={i} className="w-10 h-16 rounded-md overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                          <img src="/p1.jpg" alt="card back" className="w-full h-full object-cover" />
                        </div>
                      )
                    ))}
                  </div>
                  {/* Avatar */}
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center ml-3 mr-3",
                    isWinner ? "bg-card border-2 border-accent shadow-[0_0_20px_hsl(172_100%_57%_/_0.7)]" : "bg-card border-2 border-primary/50 shadow-lg"
                  )}>
                    {avatarMap[player.name] ? (
                      <img src={avatarMap[player.name]} alt={player.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-3xl">{player.avatar}</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 px-3 py-2 rounded-lg bg-background/90 text-sm">
                  <div className={cn("font-bold truncate max-w-[140px]", isWinner ? "text-accent" : "text-foreground")}>{player.name}</div>
                  <AnimatedNumber value={playerStacks[player.id] ?? 0} prefix="$" className="text-primary text-center text-lg font-bold" />
                  <div className="text-muted-foreground text-center text-sm">ELO {player.elo}</div>
                  <AnimatedNumber value={playerBets[player.id] ?? 0} prefix="$" className="text-accent text-center text-sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DecisionLog({ decisions }: { decisions: { player: string; action: string; amount?: number; timestamp: Date }[] }) {
  return (
    <NeonCard className="h-[360px] flex flex-col">
      <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        AI Decision Log
      </h3>
      <div className="space-y-2 overflow-y-auto flex-1">
        {decisions.map((decision, i) => (
          <div 
            key={i}
            className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm animate-fade-in"
          >
            <span className="font-medium text-foreground">{decision.player}</span>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-bold uppercase",
              decision.action === 'raise' && "bg-accent/20 text-accent",
              decision.action === 'call' && "bg-primary/20 text-primary",
              decision.action === 'fold' && "bg-destructive/20 text-destructive",
              decision.action === 'check' && "bg-muted text-muted-foreground",
              decision.action === 'thinking' && "bg-muted/70 text-muted-foreground"
            )}>
              {decision.action === 'thinking' ? 'thinking…' : decision.action} {decision.amount ? `$${decision.amount}` : ''}
            </span>
          </div>
        ))}
      </div>
    </NeonCard>
  );
}

export default function Match() {
  const [players, setPlayers] = useState<AIPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pot, setPot] = useState(0);
  const [stage, setStage] = useState<'preflop'|'flop'|'turn'|'river'|'showdown'>('preflop');
  const [communityCards, setCommunityCards] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<DecisionEvent[]>([]);
  const [holeCards, setHoleCards] = useState<Record<string, string[]>>({});
  const [winnerId, setWinnerId] = useState<string | undefined>(undefined);
  const [prizePool, setPrizePool] = useState(125000);
  const [playerStacks, setPlayerStacks] = useState<Record<string, number>>({});
  const [playerBets, setPlayerBets] = useState<Record<string, number>>({});
  const { countdown, countdownEndAt } = useMatchStore();
  const roundPrize = useRoundPrize(countdownEndAt ?? (Date.now() + countdown * 1000), 'passive');

  useEffect(() => {
    const run = async () => {
      const data = await getAIList();
      setPlayers(data.slice(0,6));
      setLoading(false);
      const sim = createHoldemSimulator(data.slice(0,6), {
        onState: s => { setPot(s.pot); setStage(s.stage); setCommunityCards(s.communityCards); setHoleCards(s.holeCards); setWinnerId(s.winnerId); setPlayerStacks(s.playerStacks); setPlayerBets(s.playerBets); },
        onDecision: e => { setDecisions(d => [...d, e].slice(-50)); },
        onNewHand: () => { setDecisions([]); setPrizePool(p => p + Math.round(1000 + Math.random()*2000)); }
      });
      sim.start();
    };
    run();
  }, []);


  const stageNames: Record<string, string> = {
    preflop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Live <span className="text-primary">Match</span>
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-accent">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                LIVE
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Layers className="w-4 h-4" />
                Stage: <span className="text-foreground font-medium">{stageNames[stage]}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NeonCard className="px-6 py-3">
              <div className="text-xs text-muted-foreground uppercase">Prize Pool</div>
              <AnimatedNumber value={roundPrize} prefix="$" className="text-3xl font-bold text-primary" />
            </NeonCard>
          </div>
        </div>

        <div className="space-y-8">
          {/* Enlarged Main Table */}
          <PokerTable 
            players={players}
            communityCards={communityCards}
            currentPot={pot}
            holeCards={holeCards}
            stage={stage}
            winnerId={winnerId}
            playerStacks={playerStacks}
            playerBets={playerBets}
          />

          {/* Below Section: Decision Log + Leaderboard */}
          <div className="grid md:grid-cols-2 gap-6">
            <DecisionLog decisions={decisions} />
            <Leaderboard players={players} stacks={playerStacks} sortBy="stack" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
