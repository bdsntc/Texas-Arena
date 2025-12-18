import { useState, useEffect, useCallback } from 'react';
import { ws } from '@/lib/ws';

export function useLivePrizePool() {
  const [prizePool, setPrizePool] = useState(0);

  useEffect(() => {
    const handler = (data: { type: string; value: number }) => {
      if (data.type === 'prizePool') {
        setPrizePool(data.value);
      }
    };

    ws.on('prizePool', handler as (data: unknown) => void);
    return () => ws.off('prizePool', handler as (data: unknown) => void);
  }, []);

  return prizePool;
}

export function useLiveMatchState() {
  const [matchState, setMatchState] = useState({
    pot: 45000,
    stage: 'preflop' as 'preflop' | 'flop' | 'turn' | 'river',
  });

  useEffect(() => {
    const handler = (data: { type: string; pot: number; stage: string }) => {
      if (data.type === 'matchState') {
        setMatchState({
          pot: data.pot,
          stage: data.stage as 'preflop' | 'flop' | 'turn' | 'river',
        });
      }
    };

    ws.on('matchState', handler as (data: unknown) => void);
    return () => ws.off('matchState', handler as (data: unknown) => void);
  }, []);

  return matchState;
}
