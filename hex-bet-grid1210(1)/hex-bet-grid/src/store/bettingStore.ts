import { create } from 'zustand';
import type { AIPlayer, Bet } from '@/lib/api';

interface BettingState {
  selectedAI: AIPlayer | null;
  betAmount: number;
  currentBets: Bet[];
  isBettingLocked: boolean;
  
  selectAI: (ai: AIPlayer | null) => void;
  setBetAmount: (amount: number) => void;
  addBet: (bet: Bet) => void;
  lockBetting: () => void;
  unlockBetting: () => void;
  clearBets: () => void;
}

export const useBettingStore = create<BettingState>((set) => ({
  selectedAI: null,
  betAmount: 100,
  currentBets: [],
  isBettingLocked: false,

  selectAI: (ai) => set({ selectedAI: ai }),
  setBetAmount: (amount) => set({ betAmount: Math.max(0, amount) }),
  addBet: (bet) => set((state) => ({ 
    currentBets: [...state.currentBets, bet],
    selectedAI: null,
    betAmount: 100,
  })),
  lockBetting: () => set({ isBettingLocked: true }),
  unlockBetting: () => set({ isBettingLocked: false }),
  clearBets: () => set({ currentBets: [], selectedAI: null, betAmount: 100 }),
}));

interface MatchState {
  currentMatchId: string | null;
  matchStatus: 'upcoming' | 'live' | 'completed';
  countdown: number;
  countdownEndAt: number | null;
  
  setMatchId: (id: string) => void;
  setMatchStatus: (status: 'upcoming' | 'live' | 'completed') => void;
  setCountdown: (seconds: number) => void;
}

export const useMatchStore = create<MatchState>((set) => {
  const STORAGE_KEY = 'countdownEndAt';
  const defaultCountdown = 180;
  let savedEnd = Number(localStorage.getItem(STORAGE_KEY));
  if (Number.isNaN(savedEnd)) savedEnd = 0;
  const now = Date.now();
  const isValid = savedEnd > now;
  const initialEnd = isValid ? savedEnd : now + defaultCountdown * 1000;
  const initialCountdown = Math.max(0, Math.floor((initialEnd - now) / 1000));
  if (!isValid) {
    try { localStorage.setItem(STORAGE_KEY, String(initialEnd)); } catch {}
  }

  return {
    currentMatchId: 'match-001',
    matchStatus: 'upcoming',
    countdown: initialCountdown,
    countdownEndAt: initialEnd,

    setMatchId: (id) => set({ currentMatchId: id }),
    setMatchStatus: (status) => {
      if (status === 'live') {
        const end = Date.now() + defaultCountdown * 1000;
        try { localStorage.setItem(STORAGE_KEY, String(end)); } catch {}
        set({ 
          matchStatus: status, 
          countdownEndAt: end, 
          countdown: Math.max(0, Math.floor((end - Date.now()) / 1000))
        });
      } else {
        set({ matchStatus: status });
      }
    },
    setCountdown: (seconds) => {
      const end = Date.now() + Math.max(0, seconds) * 1000;
      try { localStorage.setItem(STORAGE_KEY, String(end)); } catch {}
      set({ countdown: seconds, countdownEndAt: end });
    },
  };
});
