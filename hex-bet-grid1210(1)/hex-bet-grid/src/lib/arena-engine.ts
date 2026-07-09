import type { AIPlayer } from "@/lib/api";

export type ArenaCard = `${string}${"S" | "H" | "D" | "C"}`;

export interface ArenaScoreBreakdown {
  elo: number;
  winRate: number;
  recentForm: number;
  styleRisk: number;
  oddsValue: number;
  total: number;
}

export interface ArenaPlayerResult {
  playerId: string;
  playerName: string;
  score: number;
  breakdown: ArenaScoreBreakdown;
  holeCards: ArenaCard[];
}

export interface ArenaSimulationResult {
  matchId: string;
  seed: number;
  board: ArenaCard[];
  players: ArenaPlayerResult[];
  winnerId: string;
  winnerName: string;
}

export interface PrizeDistribution {
  winnerPoolShare: number;
  platformFee: number;
  nextMatchPool: number;
  total: number;
}

const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = ["S", "H", "D", "C"] as const;

const STYLE_RISK: Record<AIPlayer["style"], number> = {
  aggressive: 0.78,
  conservative: 0.54,
  balanced: 0.68,
  unpredictable: 0.72,
};

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildDeck(): ArenaCard[] {
  const deck: ArenaCard[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push(`${rank}${suit}`);
    }
  }
  return deck;
}

export function shuffleDeck(matchId: string): ArenaCard[] {
  const deck = buildDeck();
  const random = createSeededRandom(hashSeed(matchId));

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export function scoreAIPlayer(player: AIPlayer): ArenaScoreBreakdown {
  const elo = clamp((player.elo - 1800) / 900);
  const winRate = clamp(player.winRate / 100);
  const wins = player.recentForm.filter((result) => result === "W").length;
  const draws = player.recentForm.filter((result) => result === "D").length;
  const recentForm = clamp((wins + draws * 0.5) / Math.max(1, player.recentForm.length));
  const styleRisk = STYLE_RISK[player.style];
  const oddsValue = clamp(1 / Math.max(1.01, player.odds));

  const total =
    elo * 0.28 +
    winRate * 0.3 +
    recentForm * 0.16 +
    styleRisk * 0.12 +
    oddsValue * 0.14;

  return {
    elo: round4(elo),
    winRate: round4(winRate),
    recentForm: round4(recentForm),
    styleRisk: round4(styleRisk),
    oddsValue: round4(oddsValue),
    total: round4(total),
  };
}

export function simulateArenaMatch(matchId: string, players: AIPlayer[]): ArenaSimulationResult {
  if (players.length < 2) {
    throw new Error("At least two AI players are required to simulate a match.");
  }

  const deck = shuffleDeck(matchId);
  const random = createSeededRandom(hashSeed(`${matchId}:variance`));
  const board = deck.slice(players.length * 2, players.length * 2 + 5);

  const results = players.map((player, index) => {
    const holeCards = [deck[index * 2], deck[index * 2 + 1]];
    const breakdown = scoreAIPlayer(player);
    const variance = (random() - 0.5) * 0.08;
    const score = round4(breakdown.total + variance + rankBonus(holeCards));

    return {
      playerId: player.id,
      playerName: player.name,
      score,
      breakdown,
      holeCards,
    };
  });

  const ranked = [...results].sort((a, b) => b.score - a.score || a.playerName.localeCompare(b.playerName));
  const winner = ranked[0];

  return {
    matchId,
    seed: hashSeed(matchId),
    board,
    players: ranked,
    winnerId: winner.playerId,
    winnerName: winner.playerName,
  };
}

export function calculatePrizeDistribution(pool: number): PrizeDistribution {
  const normalizedPool = Math.max(0, Math.round(pool));
  const platformFee = Math.floor(normalizedPool * 0.05);
  const nextMatchPool = Math.floor(normalizedPool * 0.35);
  const winnerPoolShare = normalizedPool - platformFee - nextMatchPool;

  return {
    winnerPoolShare,
    platformFee,
    nextMatchPool,
    total: winnerPoolShare + platformFee + nextMatchPool,
  };
}

export function createStableTransactionHash(parts: string[]): string {
  const base = parts.join(":");
  const segments = Array.from({ length: 8 }, (_, index) =>
    hashSeed(`${base}:${index}`).toString(16).padStart(8, "0"),
  );
  return `0x${segments.join("")}`;
}

function rankBonus(cards: ArenaCard[]): number {
  const rankValues: Record<string, number> = {
    A: 0.028,
    K: 0.024,
    Q: 0.02,
    J: 0.016,
    "10": 0.014,
  };
  const ranks = cards.map((card) => card.slice(0, -1));
  const suited = cards[0].slice(-1) === cards[1].slice(-1);
  const pair = ranks[0] === ranks[1];

  return round4(
    ranks.reduce((sum, rank) => sum + (rankValues[rank] ?? 0.006), 0) +
      (suited ? 0.012 : 0) +
      (pair ? 0.035 : 0),
  );
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round4(value: number) {
  return Math.round(value * 10000) / 10000;
}
