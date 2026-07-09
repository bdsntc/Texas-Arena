// Frontend data boundary for the AI Texas Hold'em betting platform.
// The mock layer is deterministic so reviewers can replay the same match id.

import {
  createStableTransactionHash,
  hashSeed,
  simulateArenaMatch,
} from "@/lib/arena-engine";

export interface AIPlayer {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  winRate: number;
  odds: number;
  totalMatches: number;
  recentForm: ('W' | 'L' | 'D')[];
  style: 'aggressive' | 'conservative' | 'balanced' | 'unpredictable';
}

export interface Match {
  id: string;
  status: 'upcoming' | 'live' | 'completed';
  players: AIPlayer[];
  prizePool: number;
  currentPot: number;
  stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  communityCards: string[];
  startTime: Date;
  winnerId?: string;
}

export interface Bet {
  id: string;
  matchId: string;
  aiId: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
}

export interface UserStats {
  balance: number;
  totalBets: number;
  totalWins: number;
  totalEarnings: number;
  bettingHistory: Bet[];
}

const mockAIPlayers: AIPlayer[] = [
  {
    id: 'ai-1',
    name: 'GPT-5.1',
    avatar: '🦈',
    elo: 2450,
    winRate: 68.5,
    odds: 2.1,
    totalMatches: 1247,
    recentForm: ['W', 'W', 'L', 'W', 'W'],
    style: 'aggressive',
  },
  {
    id: 'ai-2',
    name: 'DEEPSEEK-CHAT-V3.1',
    avatar: '🎭',
    elo: 2380,
    winRate: 62.3,
    odds: 2.5,
    totalMatches: 892,
    recentForm: ['W', 'L', 'W', 'W', 'L'],
    style: 'unpredictable',
  },
  {
    id: 'ai-3',
    name: 'GROK-4.20',
    avatar: '🛡️',
    elo: 2290,
    winRate: 58.1,
    odds: 3.2,
    totalMatches: 1456,
    recentForm: ['L', 'W', 'W', 'L', 'W'],
    style: 'conservative',
  },
  {
    id: 'ai-4',
    name: 'QWEN3-MAX',
    avatar: '♠️',
    elo: 2520,
    winRate: 71.2,
    odds: 1.8,
    totalMatches: 2103,
    recentForm: ['W', 'W', 'W', 'L', 'W'],
    style: 'balanced',
  },
  {
    id: 'ai-5',
    name: 'GEMINI-3-PRO',
    avatar: '🌀',
    elo: 2150,
    winRate: 52.8,
    odds: 4.5,
    totalMatches: 634,
    recentForm: ['L', 'L', 'W', 'W', 'L'],
    style: 'aggressive',
  },
  {
    id: 'ai-6',
    name: 'CLAUDE-SONNET-4-5',
    avatar: '👑',
    elo: 2410,
    winRate: 65.7,
    odds: 2.3,
    totalMatches: 1089,
    recentForm: ['W', 'W', 'L', 'L', 'W'],
    style: 'balanced',
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const computeOdds = (winRate: number) => {
  const p = Math.max(0.05, Math.min(0.95, winRate / 100));
  const houseMargin = 0.05;
  const o = (1 / p) * (1 + houseMargin);
  return Number(o.toFixed(2));
};

const withComputedOdds = (player: AIPlayer): AIPlayer => ({
  ...player,
  odds: computeOdds(player.winRate),
});

const getPlayersForEngine = () => mockAIPlayers.map(withComputedOdds);

const getDeterministicPrizePool = (matchId = 'match-001') => {
  const seed = hashSeed(`${matchId}:prize-pool`);
  return 125000 + (seed % 10000);
};

export const getAIList = async (): Promise<AIPlayer[]> => {
  await delay(500);
  return getPlayersForEngine();
};

export const getOdds = async (aiId: string): Promise<number> => {
  await delay(200);
  const ai = mockAIPlayers.find(p => p.id === aiId);
  return ai ? computeOdds(ai.winRate) : 2.0;
};

export const getPrizePool = async (): Promise<number> => {
  await delay(300);
  return getDeterministicPrizePool();
};

export const sendBet = async (matchId: string, aiId: string, amount: number): Promise<Bet> => {
  await delay(800);
  const id = createStableTransactionHash([matchId, aiId, String(amount)]).slice(0, 18);
  return {
    id: `bet-${id}`,
    matchId,
    aiId,
    amount,
    timestamp: new Date(),
    status: 'pending',
  };
};

export const getMatchState = async (matchId: string): Promise<Match> => {
  await delay(400);
  const players = getPlayersForEngine();
  const simulation = simulateArenaMatch(matchId, players.slice(0, 6));
  return {
    id: matchId,
    status: 'live',
    players: players.slice(0, 6),
    prizePool: getDeterministicPrizePool(matchId),
    currentPot: 45000 + (simulation.seed % 7000),
    stage: 'flop',
    communityCards: simulation.board.slice(0, 3).map(toDisplayCard),
    startTime: new Date('2026-01-01T00:00:00Z'),
  };
};

export const getMatchResult = async (matchId: string): Promise<Match> => {
  await delay(600);
  const players = getPlayersForEngine();
  const simulation = simulateArenaMatch(matchId, players.slice(0, 6));
  const prizePool = getDeterministicPrizePool(matchId);

  return {
    id: matchId,
    status: 'completed',
    players: players.slice(0, 6),
    prizePool,
    currentPot: prizePool,
    stage: 'showdown',
    communityCards: simulation.board.map(toDisplayCard),
    startTime: new Date('2026-01-01T00:00:00Z'),
    winnerId: simulation.winnerId,
  };
};

export const getUserStats = async (): Promise<UserStats> => {
  await delay(400);
  return {
    balance: 10000,
    totalBets: 47,
    totalWins: 28,
    totalEarnings: 15420,
    bettingHistory: [],
  };
};

export const sendX402Transaction = async (amount: number): Promise<{ status: 'pending' | 'confirmed' | 'failed', txHash: string }> => {
  await delay(1200);

  return {
    status: 'confirmed',
    txHash: createStableTransactionHash(['x402-demo', String(amount)]),
  };
};

function toDisplayCard(card: string) {
  const suitMap: Record<string, string> = {
    S: '♠',
    H: '♥',
    D: '♦',
    C: '♣',
  };
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  return `${rank}${suitMap[suit] ?? suit}`;
}
