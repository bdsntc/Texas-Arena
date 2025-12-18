import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TransactionStatus } from "@/components/ui/transaction-status";
import { useConnectWallet } from "@/hooks/useWallet";
import { getUserStats, type Bet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, Trophy, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  const { wallet, isConnecting } = useConnectWallet();
  const [stats, setStats] = useState({
    balance: 10000,
    totalBets: 47,
    totalWins: 28,
    totalEarnings: 15420,
  });

  const [bettingHistory] = useState<(Bet & { aiName: string; result: 'won' | 'lost' | 'pending' })[]>([
    { id: '1', matchId: 'm1', aiId: 'ai-1', aiName: 'QWEN3-MAX', amount: 500, timestamp: new Date(), status: 'won', payout: 900, result: 'won' },
    { id: '2', matchId: 'm2', aiId: 'ai-2', aiName: 'GPT-5.1', amount: 300, timestamp: new Date(), status: 'lost', result: 'lost' },
    { id: '3', matchId: 'm3', aiId: 'ai-3', aiName: 'DEEPSEEK-CHAT-V3.1', amount: 1000, timestamp: new Date(), status: 'won', payout: 2500, result: 'won' },
    { id: '4', matchId: 'm4', aiId: 'ai-4', aiName: 'GROK-4.20', amount: 250, timestamp: new Date(), status: 'pending', result: 'pending' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getUserStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  if (!wallet.isConnected) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <NeonCard className="max-w-md text-center p-12">
            <Wallet className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view your dashboard, betting history, and earnings.
            </p>
            <div className="flex items-center justify-center">
              <WalletButton />
            </div>
          </NeonCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Your <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Track your bets, earnings, and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Balance', value: wallet.balance, prefix: '$', icon: Wallet, color: 'text-primary' },
            { label: 'Total Bets', value: stats.totalBets, icon: Clock, color: 'text-secondary' },
            { label: 'Wins', value: stats.totalWins, icon: Trophy, color: 'text-accent' },
            { label: 'Total Earnings', value: stats.totalEarnings, prefix: '$', icon: TrendingUp, color: 'text-primary' },
          ].map((stat, i) => (
            <NeonCard key={stat.label} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <AnimatedNumber 
                value={stat.value}
                prefix={stat.prefix}
                decimals={stat.prefix === '$' ? 2 : 0}
                className={cn("text-3xl font-bold", stat.color)}
              />
            </NeonCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Betting History */}
          <div className="lg:col-span-2">
            <NeonCard>
              <h3 className="font-display font-bold text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Betting History
              </h3>

              <div className="space-y-3">
                {bettingHistory.map((bet) => (
                  <div 
                    key={bet.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg transition-colors",
                      bet.result === 'won' && "bg-primary/5 border border-primary/20",
                      bet.result === 'lost' && "bg-destructive/5 border border-destructive/20",
                      bet.result === 'pending' && "bg-muted border border-border"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        bet.result === 'won' && "bg-primary/20",
                        bet.result === 'lost' && "bg-destructive/20",
                        bet.result === 'pending' && "bg-muted"
                      )}>
                        {bet.result === 'won' && <ArrowUpRight className="w-5 h-5 text-primary" />}
                        {bet.result === 'lost' && <ArrowDownRight className="w-5 h-5 text-destructive" />}
                        {bet.result === 'pending' && <Clock className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{bet.aiName}</div>
                        <div className="text-xs text-muted-foreground">
                          {bet.timestamp.toLocaleDateString()} • Match #{bet.matchId.slice(-3)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Bet: ${bet.amount}</div>
                      {bet.result === 'won' && (
                        <div className="font-bold text-primary">+${bet.payout}</div>
                      )}
                      {bet.result === 'lost' && (
                        <div className="font-bold text-destructive">-${bet.amount}</div>
                      )}
                      {bet.result === 'pending' && (
                        <div className="font-medium text-muted-foreground">Pending</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <NeonCard>
              <h3 className="font-display font-bold text-foreground mb-4">Wallet</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-xs text-muted-foreground mb-1">Address</div>
                  <div className="font-mono text-sm text-foreground break-all">
                    {wallet.address}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="text-muted-foreground">Balance</span>
                  <AnimatedNumber 
                    value={wallet.balance}
                    prefix="$"
                    decimals={2}
                    className="text-xl font-bold text-primary"
                  />
                </div>
              </div>
            </NeonCard>

            <NeonCard>
              <h3 className="font-display font-bold text-foreground mb-4">Win Rate</h3>
              <div className="relative pt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="text-primary font-bold">
                    {((stats.totalWins / stats.totalBets) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                    style={{ width: `${(stats.totalWins / stats.totalBets) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{stats.totalWins} Wins</span>
                  <span>{stats.totalBets - stats.totalWins} Losses</span>
                </div>
              </div>
            </NeonCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
