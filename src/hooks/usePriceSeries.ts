import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

export interface PricePoint {
  time: string;
  price: number;
  volume: number;
  marketCap: number;
}

// Real historical price series from CoinGecko (via the `sparkline` edge function,
// which caches upstream). Returns up to ~48 sampled points over `days`. Used to
// compute genuine technical indicators instead of fabricating a price walk.
export function usePriceSeries(symbol?: string, days = 7, maxPoints = 168) {
  return useQuery({
    queryKey: ["price-series", symbol?.toUpperCase(), days, maxPoints],
    enabled: !!symbol,
    staleTime: 60_000,
    refetchInterval: 90_000,
    refetchIntervalInBackground: false,
    retry: 2,
    queryFn: async (): Promise<PricePoint[]> => {
      const { data } = await invokeFunction<{ points: PricePoint[] }>("sparkline", {
        body: { symbol, days, maxPoints },
      });
      return data?.points ?? [];
    },
  });
}
