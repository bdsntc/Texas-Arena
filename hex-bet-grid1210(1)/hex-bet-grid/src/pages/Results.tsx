import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { NeonCard } from "@/components/ui/neon-card";
import { AICard } from "@/components/ui/ai-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { getMatchResult, getAIList, type AIPlayer, type Match } from "@/lib/api";
import { calculatePrizeDistribution, createStableTransactionHash } from "@/lib/arena-engine";
import { useRoundPrize } from "@/hooks/useRoundPrize";
import { useMatchStore } from "@/store/bettingStore";
import { cn } from "@/lib/utils";
import { Trophy, ArrowRight, RotateCcw, Award } from "lucide-react";

const settlementWallets = [
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWdb3u9WEx13a1p",
  "7sXbN9WcM8pQ2KzY4dVaR1hE6tLmF5jU3qPoC0aB2nG",
  "3LhKp8YqV5mT1nB7zXcR4aE9uS6wD2fG0jNbM3pQeA",
];

const shorten = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

export default function Results() {
  const [matchResult, setMatchResult] = useState<Match | null>(null);
  const [players, setPlayers] = useState<AIPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const { countdown, countdownEndAt } = useMatchStore();
  const roundPrize = useRoundPrize(countdownEndAt ?? (Date.now() + countdown * 1000), 'passive');

  useEffect(() => {
    const fetchData = async () => {
      const [result, aiList] = await Promise.all([
        getMatchResult('match-001'),
        getAIList(),
      ]);
      setMatchResult(result);
      setPlayers(aiList);
      setLoading(false);
    };
    fetchData();
  }, []);

  const winner = players.find(p => p.id === matchResult?.winnerId);
  const prizeDistribution = calculatePrizeDistribution(roundPrize);
  const distribution = [
    { label: 'Winner Pool Share', percentage: 60, amount: prizeDistribution.winnerPoolShare },
    { label: 'Platform Fee', percentage: 5, amount: prizeDistribution.platformFee },
    { label: 'Next Match Pool', percentage: 35, amount: prizeDistribution.nextMatchPool },
  ];

  const topBetters = settlementWallets.map((address, index) => {
    const bet = [5000, 3000, 2500][index];
    const payout = Math.round((prizeDistribution.winnerPoolShare * bet) / 10500);
    return {
      address: shorten(address),
      bet,
      payout,
      txHash: createStableTransactionHash([matchResult?.id ?? 'match-001', address, String(bet)]),
    };
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-6">
            <Trophy className="w-5 h-5" />
            <span className="font-display font-bold">MATCH COMPLETED</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            Winner: <span className="text-primary neon-text animate-glow">{winner?.name}</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="animate-slide-up">
            {winner && (
              <AICard ai={winner} isWinner />
            )}
            
            <NeonCard variant="highlight" className="mt-6 text-center">
              <div className="text-sm text-muted-foreground uppercase mb-2">Total Prize Pool</div>
              <AnimatedNumber 
                value={roundPrize}
                prefix="$"
                className="text-5xl font-bold text-primary neon-text"
              />
            </NeonCard>
          </div>

          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <NeonCard>
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Prize Distribution
              </h3>
              
              <div className="space-y-4">
                {distribution.map((item, i) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">
                        ${item.amount.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          i === 0 && "bg-primary",
                          i === 1 && "bg-secondary",
                          i === 2 && "bg-accent"
                        )}
                        style={{ 
                          width: `${item.percentage}%`,
                          animationDelay: `${i * 200}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>

            <NeonCard>
              <h3 className="font-display font-bold text-foreground mb-4">Top Winners</h3>
              <div className="space-y-3">
                {topBetters.map((better, i) => (
                  <div 
                    key={better.txHash}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      i === 0 && "bg-accent/10 border border-accent/30",
                      i !== 0 && "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        i === 0 && "bg-accent text-accent-foreground",
                        i !== 0 && "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                      <div>
                        <span className="font-mono text-sm text-foreground">{better.address}</span>
                        <div className="font-mono text-xs text-muted-foreground">
                          {better.txHash.slice(0, 10)}...{better.txHash.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Bet: ${better.bet.toLocaleString()}</div>
                      <div className="text-primary font-bold">+${better.payout.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link to="/lobby">
            <Button variant="hero" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              Bet Again
            </Button>
          </Link>
          <Link to="/match">
            <Button variant="outline" size="lg" className="gap-2">
              Watch Replay
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
