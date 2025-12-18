import type { AIPlayer } from "@/lib/api";

export type Stage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type Action = 'bet' | 'call' | 'raise' | 'fold' | 'check' | 'thinking';

export interface DecisionEvent {
  player: string;
  action: Action;
  amount?: number;
  timestamp: Date;
}

export interface HoldemState {
  stage: Stage;
  pot: number;
  communityCards: string[];
  holeCards: Record<string, string[]>;
  winnerId?: string;
  playerStacks: Record<string, number>;
  playerBets: Record<string, number>;
}

export interface HoldemCallbacks {
  onState: (state: HoldemState) => void;
  onDecision: (e: DecisionEvent) => void;
  onNewHand: () => void;
}

export function createHoldemSimulator(players: AIPlayer[], callbacks: HoldemCallbacks) {
  let deck: string[] = [];
  let folded = new Set<string>();
  let pot = 0;
  let stage: Stage = 'preflop';
  let communityCards: string[] = [];
  let timers: number[] = [];
  let holeCards: Record<string, string[]> = {};
  let playerStacks: Record<string, number> = {};
  let currentBet: number = 0;
  let playerBets: Record<string, number> = {};
  const maxOdds = Math.max(...players.map(p => p.odds));
  const minOdds = Math.min(...players.map(p => p.odds));

  const suits = ['♠','♥','♦','♣'];
  const values = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
  const newDeck = () => {
    const d: string[] = [];
    for (const v of values) for (const s of suits) d.push(v + s);
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  };

  const burn = () => { deck.shift(); };
  const draw = () => deck.shift() as string;

  const emitState = () => callbacks.onState({ stage, pot, communityCards: [...communityCards], holeCards: { ...holeCards }, winnerId: undefined, playerStacks: { ...playerStacks }, playerBets: { ...playerBets } });
  const emitDecision = (e: DecisionEvent) => callbacks.onDecision(e);

  const schedule = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.push(id);
  };

  const decideAndBet = (p: AIPlayer) => {
    if (folded.has(p.id)) return;
    // if player has no chips left, they are effectively folded
    if ((playerStacks[p.id] ?? 0) <= 0) { folded.add(p.id); return; }
    const r = Math.random();
    // Normalize odds: lower odds → higher score (0..1)
    const oddsDenom = Math.max(0.0001, (maxOdds - minOdds));
    const oddsScore = Math.min(1, Math.max(0, (maxOdds - p.odds) / oddsDenom));
    // Normalize win rate: 0..1
    const winScore = Math.min(1, Math.max(0, p.winRate / 100));
    // Combined strength: emphasize win rate slightly more than odds
    const strength = 0.6 * winScore + 0.4 * oddsScore; // 0..1
    // Stronger AIs fold less; weaker fold more
    const foldChance = Math.min(0.35, Math.max(0.05, 0.05 + 0.25 * (1 - strength)));
    if (r < foldChance) { folded.add(p.id); emitDecision({ player: p.name, action: 'fold', timestamp: new Date() }); return; }
    const STAKE_SCALE = 1 / 30;
    // Base contribution scaled by strength (small-stake table)
    const baseRaw = Math.max(1, Math.round(40 + 60 * strength));
    const base = Math.max(1, Math.round(baseRaw * STAKE_SCALE));
    if (r < 0.45) {
      const contribute = Math.min(base, playerStacks[p.id]);
      playerStacks[p.id] -= contribute;
      pot += contribute;
      currentBet = Math.max(currentBet, contribute);
      playerBets[p.id] = (playerBets[p.id] ?? 0) + contribute;
      emitDecision({ player: p.name, action: 'bet', amount: contribute, timestamp: new Date() });
    }
    else if (r < 0.75) {
      const raiseByRaw = baseRaw + Math.round(Math.random() * (20 + 60 * strength));
      const raiseBy = Math.max(1, Math.round(raiseByRaw * STAKE_SCALE));
      const contribute = Math.min(raiseBy, playerStacks[p.id]);
      playerStacks[p.id] -= contribute;
      pot += contribute;
      currentBet = Math.max(currentBet, contribute);
      playerBets[p.id] = (playerBets[p.id] ?? 0) + contribute;
      emitDecision({ player: p.name, action: 'raise', amount: contribute, timestamp: new Date() });
    }
    else {
      const toCall = Math.max(0, currentBet);
      const contribute = Math.min(toCall, playerStacks[p.id]);
      playerStacks[p.id] -= contribute;
      pot += contribute;
      playerBets[p.id] = (playerBets[p.id] ?? 0) + contribute;
      emitDecision({ player: p.name, action: 'call', amount: contribute, timestamp: new Date() });
    }
    emitState();
  };

  const playRound = (roundPlayers: AIPlayer[]) => {
    const order = [...roundPlayers];
    let offset = 0;
    for (let i = 0; i < order.length; i++) {
      const think = 800 + Math.floor(Math.random() * 700); // 0.8s - 1.5s
      schedule(offset, () => emitDecision({ player: order[i].name, action: 'thinking', timestamp: new Date() }));
      schedule(offset + think, () => decideAndBet(order[i]));
      offset += think + 200; // small spacing
    }
    return offset;
  };

  const startStages = () => {
    stage = 'preflop';
    emitState();
    const t = playRound(players);
    schedule(t + 500, () => {
      stage = 'flop';
      currentBet = 0;
      burn();
      communityCards.push(draw(), draw(), draw());
      emitState();
      const d = playRound(players.filter(p => !folded.has(p.id)));
      schedule(d + 500, () => {
        stage = 'turn';
        currentBet = 0;
        burn();
        communityCards.push(draw());
        emitState();
        const d2 = playRound(players.filter(p => !folded.has(p.id)));
        schedule(d2 + 500, () => {
          stage = 'river';
          currentBet = 0;
          burn();
          communityCards.push(draw());
          emitState();
          const d3 = playRound(players.filter(p => !folded.has(p.id)));
          schedule(d3 + 800, () => {
            stage = 'showdown';
            // pick winner among active players
            const active = players.filter(p => !folded.has(p.id));
            const winner = active.length ? active[Math.floor(Math.random() * active.length)] : players[Math.floor(Math.random() * players.length)];
            // award pot to winner
            playerStacks[winner.id] = (playerStacks[winner.id] ?? 0) + pot;
            callbacks.onState({ stage, pot, communityCards: [...communityCards], holeCards: { ...holeCards }, winnerId: winner.id, playerStacks: { ...playerStacks }, playerBets: { ...playerBets } });
            // reset pot after short delay
            schedule(500, () => { pot = 0; emitState(); });
            schedule(3000, () => newHand());
          });
        });
      });
    });
  };

  const newHand = () => {
    timers.forEach(t => clearTimeout(t)); timers = [];
    folded = new Set();
    pot = 0;
    currentBet = 0;
    communityCards = [];
    deck = newDeck();
    // deal hole cards: one card per player twice
    holeCards = {};
    players.forEach(p => { holeCards[p.id] = []; });
    playerBets = {};
    players.forEach(p => { playerBets[p.id] = 0; });
    // deal first card to each
    players.forEach(p => { holeCards[p.id].push(draw()); });
    // deal second card to each
    players.forEach(p => { holeCards[p.id].push(draw()); });
    callbacks.onNewHand();
    startStages();
  };

  const start = () => { deck = newDeck(); holeCards = {}; players.forEach(p => { holeCards[p.id] = [draw(), draw()]; playerStacks[p.id] = 1000; }); playerBets = {}; players.forEach(p => { playerBets[p.id] = 0; }); startStages(); };
  const stop = () => { timers.forEach(t => clearTimeout(t)); timers = []; };

  return { start, stop };
}
