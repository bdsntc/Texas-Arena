import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBettingStore } from "@/store/bettingStore";
import { AnimatedNumber } from "./animated-number";

interface BettingSliderProps {
  maxAmount?: number;
  onConfirm: (amount: number) => void;
  disabled?: boolean;
}

export function BettingSlider({ maxAmount = 10000, onConfirm, disabled }: BettingSliderProps) {
  const { selectedAI, betAmount, setBetAmount, isBettingLocked } = useBettingStore();

  const quickAmounts = [1, 5, 10, 50];

  const potentialWin = selectedAI ? betAmount * selectedAI.odds : 0;

  return (
    <div className={cn(
      "p-6 rounded-xl border border-primary/30 bg-card/50 backdrop-blur space-y-6",
      disabled && "opacity-50 pointer-events-none"
    )}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Place Bet</h3>
        {selectedAI && (
          <div className="text-sm">
            <span className="text-muted-foreground">Betting on: </span>
            <span className="text-primary font-bold">{selectedAI.name}</span>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="flex-1 font-display text-lg bg-muted border-primary/30 focus:border-primary"
            disabled={isBettingLocked}
          />
          <span className="flex items-center text-primary font-display font-bold">USDC</span>
        </div>

        {/* Slider */}
        <Slider
          value={[betAmount]}
          onValueChange={([val]) => setBetAmount(val)}
          max={maxAmount}
          step={1}
          disabled={isBettingLocked}
          className="py-4"
        />

        {/* Quick amounts */}
        <div className="flex gap-2">
          {quickAmounts.map(amount => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(amount)}
              disabled={isBettingLocked}
              className="flex-1"
            >
              {amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Potential Win */}
      {selectedAI && (
        <div className="p-4 rounded-lg bg-muted/50 border border-accent/30">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Potential Win</span>
            <AnimatedNumber 
              value={potentialWin} 
              prefix="$" 
              decimals={2}
              className="text-accent text-2xl font-bold"
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Odds: {selectedAI.odds.toFixed(2)}x
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={() => onConfirm(betAmount)}
        disabled={!selectedAI || betAmount <= 0 || isBettingLocked}
      >
        {isBettingLocked ? 'Betting Locked' : 'Confirm Bet'}
      </Button>
    </div>
  );
}
