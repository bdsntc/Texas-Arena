import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { AICard } from "@/components/ui/ai-card";
import { BettingSlider } from "@/components/ui/betting-slider";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { PotIndicator } from "@/components/ui/pot-indicator";
import { TransactionStatus } from "@/components/ui/transaction-status";
import { Leaderboard } from "@/components/ui/leaderboard";
import { useBettingStore, useMatchStore } from "@/store/bettingStore";
import { getAIList, sendBet, type AIPlayer } from "@/lib/api";
import { useSendTransaction, useConnectWallet } from "@/hooks/useWallet";
import { useRoundPrize } from "@/hooks/useRoundPrize";
import { toast } from "@/hooks/use-toast";
import { Loader2, Wallet } from "lucide-react";
import { WalletButton } from "@/components/ui/wallet-button";

export default function Lobby() {
  const [aiPlayers, setAiPlayers] = useState<AIPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { selectedAI, selectAI, addBet, isBettingLocked, unlockBetting } = useBettingStore();
  const { currentMatchId, countdown, countdownEndAt, matchStatus, setMatchStatus } = useMatchStore();
  const roundPrize = useRoundPrize(countdownEndAt ?? (Date.now() + countdown * 1000), 'active');
  const { wallet } = useConnectWallet();
  const { status: txStatus, txHash, errorMessage, send: sendTx, reset: resetTx } = useSendTransaction();

  useEffect(() => {
    const fetchAIs = async () => {
      const data = await getAIList();
      setAiPlayers(data);
      setLoading(false);
    };
    fetchAIs();
  }, []);

  const handleConfirmBet = async (amount: number) => {
    if (!selectedAI || !currentMatchId) return;

    // Check whether the wallet is connected
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send transaction
      const result = await sendTx(amount);
      
      if (result.success) {
        // Record bet
        const bet = await sendBet(currentMatchId, selectedAI.id, amount);
        addBet(bet);
        
        toast({
          title: "Bet Placed!",
          description: `You bet $${amount} on ${selectedAI.name} using ${wallet.providerName?.toUpperCase() || 'wallet'}`,
        });
      } else {
        toast({
          title: "Transaction Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleCountdownComplete = () => {
    unlockBetting();
    setMatchStatus('live');
    // round ended: the hook will reset to 0 automatically on new endAt
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              AI <span className="text-primary">Battle</span> Lobby
            </h1>
            <p className="text-muted-foreground">
              Select an AI player and place your bet before the match begins
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <PotIndicator valueOverride={roundPrize} />
            <CountdownTimer endAt={countdownEndAt ?? (Date.now() + countdown * 1000)} onComplete={handleCountdownComplete} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* AI Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {aiPlayers.map((ai) => (
                <AICard
                  key={ai.id}
                  ai={ai}
                  isSelected={selectedAI?.id === ai.id}
                  onSelect={selectAI}
                  disabled={false}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {!wallet.isConnected && (
              <div className="p-4 rounded-lg bg-muted/50 border border-primary/30 text-center">
                <Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Connect your wallet to place bets
                </p>
                <WalletButton />
              </div>
            )}
            
            <BettingSlider
              onConfirm={handleConfirmBet}
              disabled={txStatus === 'pending' || !wallet.isConnected}
            />
            
            <TransactionStatus 
              status={txStatus} 
              txHash={txHash} 
              network={wallet.network}
              errorMessage={errorMessage}
            />
            
            <Leaderboard players={aiPlayers} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
