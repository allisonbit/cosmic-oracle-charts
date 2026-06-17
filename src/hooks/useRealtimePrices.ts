import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

/**
 * Realtime price hook.
 *
 * Previously implemented as a raw setInterval(5s) that bypassed TanStack
 * Query — meaning every component mounting it spawned its own polling loop,
 * and the data never landed in the shared cache used by `useCryptoPrices`.
 *
 * Now it's a thin wrapper over `useQuery` that shares the global
 * `["crypto-prices"]` cache entry with `useCryptoPrices`. TanStack Query
 * automatically picks the lowest `refetchInterval` across active observers,
 * so mounting this hook anywhere accelerates the shared cache to 5s while
 * a page only using `useCryptoPrices` stays at 15s. No duplicate fetches.
 *
 * Public API is preserved: { prices: Record<symbol, RealtimePrice>, isConnected, refetch }.
 */
interface RealtimePrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
}

interface RawPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export function useRealtimePrices(symbols: string[]) {
  const query = useQuery({
    queryKey: ["crypto-prices"],
    queryFn: async () => {
      const { data, error } = await invokeFunction("crypto-prices");
      if (error) throw error;
      return data as { prices: RawPrice[]; timestamp: number };
    },
    refetchInterval: 5000,
    staleTime: 4000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: 1500,
    networkMode: "offlineFirst",
  });

  const symbolKey = symbols.join(",");
  const prices = useMemo<Record<string, RealtimePrice>>(() => {
    const out: Record<string, RealtimePrice> = {};
    const list = query.data?.prices;
    if (!list) return out;
    const wanted = new Set(symbols);
    const ts = Date.now();
    for (const p of list) {
      if (!wanted.has(p.symbol)) continue;
      out[p.symbol] = {
        symbol: p.symbol,
        price: p.price,
        change24h: p.change24h,
        lastUpdated: ts,
      };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, symbolKey]);

  return {
    prices,
    isConnected: query.isSuccess && !query.isError,
    refetch: () => query.refetch(),
  };
}
