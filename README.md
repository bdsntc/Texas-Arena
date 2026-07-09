# Texas Arena

Texas Arena is a Web3-style AI Texas Hold'em arena. Users study six AI players, place a prediction before the round locks, watch a deterministic match simulation, and review the settlement breakdown after showdown.

The project is frontend-first, but the domain layer is designed so a reviewer can replay the same match from the same `matchId` and receive the same deck, board, winner, score breakdown, and settlement math.

## What Is Original Here

- A deterministic Texas Hold'em arena engine seeded by `matchId`.
- AI scoring based on ELO, win rate, recent form, style risk, odds value, and card strength.
- Reproducible prize distribution with winner share, platform fee, and next-match rollover.
- Wallet-aware betting flow with stable mock transaction hashes for audit replay.
- Live match UI showing table state, player stacks, community cards, decision log, and leaderboard.

The repository uses shadcn/Radix UI primitives for base interface components. The application-specific work lives in the arena logic, betting flow, wallet integration, state model, and page composition.

## Key Source Map

```text
hex-bet-grid1210(1)/hex-bet-grid/src/lib/arena-engine.ts       Deterministic match, scoring, deck, prize, tx helpers
hex-bet-grid1210(1)/hex-bet-grid/src/lib/holdem.ts             Live table simulator used by the match page
hex-bet-grid1210(1)/hex-bet-grid/src/lib/api.ts                Frontend data boundary and betting/match APIs
hex-bet-grid1210(1)/hex-bet-grid/src/hooks/useWallet.ts        Wallet connection and transaction state
hex-bet-grid1210(1)/hex-bet-grid/src/store/bettingStore.ts     Betting and match lifecycle state
hex-bet-grid1210(1)/hex-bet-grid/src/pages/Lobby.tsx           AI selection, wallet gate, stake confirmation
hex-bet-grid1210(1)/hex-bet-grid/src/pages/Match.tsx           Live arena table and AI decision log
hex-bet-grid1210(1)/hex-bet-grid/src/pages/Results.tsx         Winner and settlement breakdown
```

## Product Flow

1. A new AI poker match is announced in the lobby.
2. Users compare AI stats, odds, recent form, and style.
3. A wallet connection gates the betting action.
4. Bets lock when the match starts.
5. The match page renders the poker table, player stacks, community cards, and AI decisions.
6. The result page shows the winner and deterministic prize distribution.

## Deterministic Review Flow

1. Start from a known match id, for example `match-001`.
2. The arena engine hashes that id into a seed.
3. The seed shuffles the deck and assigns hole cards.
4. Each AI receives a transparent score breakdown.
5. The highest final score wins the match.
6. Settlement math distributes the full prize pool without remainder loss.

This makes demos repeatable and gives reviewers a concrete audit surface beyond visual UI components.

## Local Development

```sh
cd "hex-bet-grid1210(1)/hex-bet-grid"
npm install
npm run dev
```

## Quality Checks

```sh
npm run lint
npm run typecheck
npm run test
npm run build
```

Or run the combined gate:

```sh
npm run quality
```

## Mocked Boundaries

This version keeps blockchain and payment interactions mocked so the product can be reviewed without private keys or deployed contracts. Mocking is explicit:

- Wallet detection uses browser wallet providers when available.
- Transaction hashes are deterministic placeholders in review mode.
- x402 payment behavior is represented as a frontend flow, not a production payment gateway.

## Security And Fairness Notes

- Match randomness should be moved to a verifiable randomness source before handling real funds.
- Server-side settlement must verify wallet ownership, bet lock time, and prize distribution.
- Production x402 integration should replace all mock payment code.
- The deterministic engine is for demo auditability and regression testing, not real-money randomness.
