import { useMemo } from "react";
import { useCryptoPrices } from "./useCryptoPrices";

/**
 * Realtime price hook (standalone).
 *
 * Previously polled the "crypto-prices" edge function every 10s. Standalone,
 * that endpoint is dead — so this is now a thin adapter over the live engine
 * cache (`useCryptoPrices`, CoinGecko). The public API is preserved:
 * { prices: Record<symbol, RealtimePrice>, isConnected, refetch }.
 *
 * The [symbol → record] map keeps every existing consumer working unchanged.
 * If the Supabase overlay is wired up later, the old fast-polling fetch can
 * replace the queryFn here without touching callers.
 */
interface RealtimePrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
}

export function useRealtimePrices(symbols: string[]) {
  const { data, isLoading, isError, refetch, isFetching } = useCryptoPrices();

  const symbolKey = symbols.join(",");
  const prices = useMemo<Record<string, RealtimePrice>>(() => {
    const out: Record<string, RealtimePrice> = {};
    const list = data?.prices;
    if (!list) return out;
    const wanted = new Set(symbols.map(s => s.toLowerCase()));
    const ts = Date.now();
    for (const p of list) {
      if (!wanted.has(p.symbol.toLowerCase())) continue;
      out[p.symbol] = {
        symbol: p.symbol,
        price: p.price,
        change24h: p.change24h,
        lastUpdated: ts,
      };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, symbolKey]);

  return {
    prices,
    isConnected: !isError && !isLoading,
    refetch: () => refetch(),
    isFetching,
  };
}
