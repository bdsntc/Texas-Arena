import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { NeonCard } from "@/components/ui/neon-card";
import { AICard } from "@/components/ui/ai-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { getMatchResult, getAIList, type AIPlayer, type Match } from "@/lib/api";
import { useRoundPrize } from "@/hooks/useRoundPrize";
import { useMatchStore } from "@/store/bettingStore";
import { cn } from "@/lib/utils";
import { Trophy, ArrowRight, RotateCcw, Sparkles, Award } from "lucide-react";

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

  // Dynamic distribution based on synchronized round prize (dollars)
  const distribution = [
    { label: 'Winner Pool Share', percentage: 60 },
    { label: 'Platform Fee', percentage: 5 },
    { label: 'Next Match Pool', percentage: 35 },
  ].map((item) => ({
    ...item,
    amountDollar: Math.round((roundPrize * item.percentage) ) / 100, // keep 2 decimals implicitly by AnimatedNumber or format below
  }));

  const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const randomSolAddress = (len = 44) => {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    let s = '';
    for (let i = 0; i < len; i++) s += base58[arr[i] % base58.length];
    return s;
  };
  const shorten = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  const topBetters = [
    { address: shorten(randomSolAddress()), bet: 5000, payout: 10500 },
    { address: shorten(randomSolAddress()), bet: 3000, payout: 6300 },
    { address: shorten(randomSolAddress()), bet: 2500, payout: 5250 },
  ];

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
        {/* Winner Announcement */}
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
          {/* Winner Card */}
          <div className="animate-slide-up">
            {winner && (
              <AICard ai={winner} isWinner />
            )}
            
            {/* Total Prize */}
            <NeonCard variant="highlight" className="mt-6 text-center">
              <div className="text-sm text-muted-foreground uppercase mb-2">Total Prize Pool</div>
              <AnimatedNumber 
                value={roundPrize}
                prefix="$"
                className="text-5xl font-bold text-primary neon-text"
              />
            </NeonCard>
          </div>

          {/* Distribution */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            {/* Prize Distribution */}
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
                        ${((roundPrize * item.percentage) / 100).toLocaleString()} ({item.percentage}%)
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

            {/* Top Winners */}
            <NeonCard>
              <h3 className="font-display font-bold text-foreground mb-4">Top Winners</h3>
              <div className="space-y-3">
                {topBetters.map((better, i) => (
                  <div 
                    key={better.address}
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
                      <span className="font-mono text-sm text-foreground">{better.address}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Bet: ${(better.bet / 100).toLocaleString()}</div>
                      <div className="text-primary font-bold">+{(better.payout / 100).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        </div>

        {/* Actions */}
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
