import { useQuery } from "@tanstack/react-query";

// ── useLiquidationData — honest empty state ──────────────────────────────────
// Liquidation levels require per-exchange derivatives/liquidation feeds. The
// old `liquidation-data` edge function no longer exists and there is no free,
// key-less public API for predicted liquidation heatmaps, so this hook returns
// an explicit empty dataset — the UI renders zeros / "—" instead of estimates.

interface LiquidationLevel {
  asset: string;
  symbol: string;
  price: number;
  longLiquidations: number;
  shortLiquidations: number;
  type: 'long' | 'short' | 'balanced';
  priceDistance: number;
}

interface LiquidationData {
  levels: LiquidationLevel[];
  totalLongLiquidations: number;
  totalShortLiquidations: number;
  longPercentage: number;
  lastUpdated: string;
}

async function fetchLiquidationData(): Promise<LiquidationData> {
  return {
    levels: [],
    totalLongLiquidations: 0,
    totalShortLiquidations: 0,
    longPercentage: 50,
    lastUpdated: new Date().toISOString(),
  };
}

export function useLiquidationData() {
  return useQuery({
    queryKey: ['liquidation-data'],
    queryFn: fetchLiquidationData,
    staleTime: 5 * 60_000,
    gcTime: 1000 * 60 * 10,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
