import { describe, expect, it } from "vitest";
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

describe("arena engine", () => {
  it("replays the same match deterministically", () => {
    const first = simulateArenaMatch("match-001", players);
    const second = simulateArenaMatch("match-001", players);

    expect(second).toEqual(first);
  });

  it("changes the simulation when the match id changes", () => {
    const first = simulateArenaMatch("match-001", players);
    const second = simulateArenaMatch("match-002", players);

    expect(second.board).not.toEqual(first.board);
  });

  it("keeps scoring values normalized", () => {
    const score = scoreAIPlayer(players[0]);

    expect(score.total).toBeGreaterThan(0);
    expect(score.total).toBeLessThanOrEqual(1);
    expect(score.elo).toBeLessThanOrEqual(1);
    expect(score.winRate).toBeLessThanOrEqual(1);
  });

  it("distributes the whole pool without losing units", () => {
    const distribution = calculatePrizeDistribution(125000);

    expect(distribution.total).toBe(125000);
    expect(distribution.winnerPoolShare).toBe(75000);
    expect(distribution.platformFee).toBe(6250);
    expect(distribution.nextMatchPool).toBe(43750);
  });

  it("creates stable transaction hashes for audit replay", () => {
    const hash = createStableTransactionHash(["wallet-1", "match-001", "ai-3", "500"]);

    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(hash).toBe(createStableTransactionHash(["wallet-1", "match-001", "ai-3", "500"]));
  });
});
