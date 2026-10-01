// ── useRealtimeStrength — standalone strength data, no polling ───────────────
// Previously polled a dead `crypto-prices` edge function every 20 seconds and
// interpolated fake 1h/7d moves. Now it reuses the shared strength computation
// over the engine's real markets snapshot and refreshes on visit / window
// focus / manual refresh instead of hammering an endpoint that no longer exists.

import { useQuery } from '@tanstack/react-query';
import type { StrengthData, StrengthMeterResponse } from './useStrengthMeter';
import { fetchStrengthData } from './useStrengthMeter';

interface RealtimeStrengthState {
  assets: StrengthData[];
  chains: StrengthData[];
  lastUpdate: number;
  isConnected: boolean;
}

export function useRealtimeStrength(timeframe: string = '24h') {
  const q = useQuery<StrengthMeterResponse>({
    queryKey: ['strength-meter', timeframe],
    queryFn: () => fetchStrengthData(timeframe),
    staleTime: 120_000,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const state: RealtimeStrengthState = {
    assets: q.data?.assets ?? [],
    chains: q.data?.chains ?? [],
    lastUpdate: q.data?.timestamp ?? Date.now(),
    isConnected: !!q.data,
  };

  return {
    ...state,
    refresh: () => q.refetch(),
    timeframe,
  };
}
