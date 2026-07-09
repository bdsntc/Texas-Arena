import {
  calculatePrizeDistribution,
  createStableTransactionHash,
  scoreAIPlayer,
  simulateArenaMatch,
} from "./arena-engine";
import type { AIPlayer } from "@/lib/api";

const players: AIPlayer[] = [
  {
    id: "ai-1",
    name: "GPT-5.1",
    avatar: "shark",
    elo: 2450,
    winRate: 68.5,
    odds: 1.53,
    totalMatches: 1247,
    recentForm: ["W", "W", "L", "W", "W"],
    style: "aggressive",
  },
  {
    id: "ai-2",
    name: "DEEPSEEK-CHAT-V3.1",
    avatar: "mask",
    elo: 2380,
    winRate: 62.3,
    odds: 1.69,
    totalMatches: 892,
    recentForm: ["W", "L", "W", "W", "L"],
    style: "unpredictable",
  },
  {
    id: "ai-3",
    name: "QWEN3-MAX",
    avatar: "spade",
    elo: 2520,
    winRate: 71.2,
    odds: 1.47,
    totalMatches: 2103,
    recentForm: ["W", "W", "W", "L", "W"],
    style: "balanced",
  },
];

export function runArenaEngineAssertions() {
  const first = simulateArenaMatch("match-001", players);
  const second = simulateArenaMatch("match-001", players);
  const alternate = simulateArenaMatch("match-002", players);
  const score = scoreAIPlayer(players[0]);
  const distribution = calculatePrizeDistribution(125000);
  const txHash = createStableTransactionHash(["wallet-1", "match-001", "ai-3", "500"]);

  assertEqual(JSON.stringify(second), JSON.stringify(first), "same match id should replay exactly");
  assert(first.board.join(",") !== alternate.board.join(","), "different match ids should change the board");
  assert(score.total > 0 && score.total <= 1, "player score should stay normalized");
  assertEqual(distribution.total, 125000, "distribution should preserve the whole pool");
  assertEqual(distribution.winnerPoolShare, 75000, "winner pool share should be 60 percent");
  assert(/^0x[a-f0-9]{64}$/.test(txHash), "transaction hash should use EVM-style format");
  assertEqual(txHash, createStableTransactionHash(["wallet-1", "match-001", "ai-3", "500"]), "tx hash should be stable");
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}
