import { useQuery } from "@tanstack/react-query";
import { fetchMarkets } from "@/lib/marketEngine";
import { CHAINS } from "@/lib/chainConfig";

/**
 * Per-chain metrics for the comparison table. Every field is real or
 * documented — no seeded simulation.
 */
export interface ChainMetric {
  chainId: string;
  name: string;
  /** Real 24h change of the native asset (CoinGecko). */
  change24h: number;
  /** Real 24h global volume of the native asset (CoinGecko). */
  volume24h: number;
  /** Real market cap of the native asset (CoinGecko). */
  marketCap: number;
  /** Documented throughput from chainConfig specs (not a live feed). */
  tps: number;
}

export interface AdvancedChainDataResponse {
  chainMetrics: ChainMetric[];
  timestamp: number;
}

export function useAdvancedChainData(enabled = true) {
  return useQuery({
    queryKey: ["chain-comparison"],
    queryFn: async (): Promise<AdvancedChainDataResponse> => {
      const coins = await fetchMarkets(250);
      return {
        chainMetrics: CHAINS.map((c) => {
          const coinId = c.id === "base" ? "ethereum" : c.id;
          const native =
            coins.find((x) => x.id === coinId) ??
            // CoinGecko ids that differ from our chain ids.
            coins.find((x) => x.id === c.coingeckoId);
          return {
            chainId: c.id,
            name: c.name,
            change24h: native?.change24h ?? 0,
            volume24h: native?.volume24h ?? 0,
            marketCap: native?.marketCap ?? 0,
            tps: c.tps ?? 0,
          };
        }),
        timestamp: Date.now(),
      };
    },
    enabled,
    staleTime: 120_000,
    refetchInterval: false,
    retry: 1,
  });
}
