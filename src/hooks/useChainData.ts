import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMarkets, type EngineCoin } from "@/lib/marketEngine";
import { useDexTopTokens, type DexToken } from "@/lib/dexScreener";

export interface ChainOverview {
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  /** Node-only metrics — unavailable in standalone mode, widgets show "—". */
  transactions24h?: number;
  gasFees?: number;
  tps?: number;
  activeWallets?: number;
  defiTvl?: number;
}

export interface TokenHeat {
  symbol: string;
  name: string;
  /** 1h price change — real momentum signal. */
  momentum: number;
  /** Volume ÷ liquidity ratio (×100, capped) — real activity signal. */
  volumeSpike: number;
  /** |24h price change| — real volatility signal. */
  volatility: number;
  /** Always 0 — no social feed exists; heat derives from price + flow only. */
  socialScore: number;
  /** Volume ÷ market cap (×100) — real turnover signal. */
  liquidityChange: number;
  price: number;
  change24h: number;
}

export interface SmartMoneyFlow {
  /** Aggregate DEX buy volume (24h) across the chain's top pairs. */
  inflow: number;
  /** Aggregate DEX sell volume (24h). */
  outflow: number;
  /** inflow − outflow, from real buys/sells. */
  netFlow: number;
  topSwaps: { from: string; to: string; amount: number }[];
  /** Summed pool liquidity of the top pairs (real). */
  liquidityAdded: number;
  /** Removals aren't exposed by the public API — always 0, shown as "—". */
  liquidityRemoved: number;
}

export interface ChainDataResponse {
  overview: ChainOverview;
  tokenHeat: TokenHeat[];
  smartMoneyFlow: SmartMoneyFlow;
  timestamp: number;
}

/** Map a DexScreener pair (real) into a heat row — every field is a real signal. */
function toHeatRow(t: DexToken): TokenHeat {
  const volLiq = t.liquidity > 0 ? t.volume24h / t.liquidity : 0;
  return {
    symbol: t.symbol,
    name: t.name,
    momentum: t.change1h,
    volumeSpike: Math.min(500, volLiq * 100),
    volatility: Math.abs(t.change24h),
    socialScore: 0,
    liquidityChange: t.marketCap > 0 ? (t.volume24h / t.marketCap) * 100 : 0,
    price: t.price,
    change24h: t.change24h,
  };
}

export function useChainData(chainId: string, enabled = true) {
  // One fresh markets snapshot per load — shared ["engine-markets"] cache with
  // the rest of the site. No interval polling.
  const markets = useQuery({
    queryKey: ["engine-markets", 250],
    queryFn: () => fetchMarkets(250),
    enabled: enabled && !!chainId,
    staleTime: 120_000,
    refetchInterval: false,
    retry: 1,
  });

  // Live DEX pairs for this chain from DexScreener's public API.
  const { data: dexTokens, isLoading: dexLoading } = useDexTopTokens(chainId, 30, enabled && !!chainId);

  const data: ChainDataResponse | undefined = useMemo(() => {
    if (!chainId) return undefined;
    const coins: EngineCoin[] | undefined = markets.data;
    if (!coins && !dexTokens) return undefined;

    // Native asset: the chain id IS the CoinGecko id for L1s; Base tracks ETH.
    const nativeId = chainId === "base" ? "ethereum" : chainId;
    const native = coins?.find((c) => c.id === nativeId);

    const dexVolume = (dexTokens ?? []).reduce((a, t) => a + t.volume24h, 0);
    const dexLiquidity = (dexTokens ?? []).reduce((a, t) => a + t.liquidity, 0);
    const buys = (dexTokens ?? []).reduce((a, t) => a + t.buys24h, 0);
    const sells = (dexTokens ?? []).reduce((a, t) => a + t.sells24h, 0);
    const swapCount = buys + sells || 1;

    const overview: ChainOverview = {
      marketCap: native?.marketCap ?? 0,
      volume24h: dexVolume || native?.volume24h || 0,
      priceChange24h: native?.change24h ?? 0,
      // Node-only metrics stay undefined → the UI shows "—".
      transactions24h: undefined,
      gasFees: undefined,
      tps: undefined,
      activeWallets: undefined,
      defiTvl: undefined,
    };

    // Buy/sell pressure straight from real 24h swap counts (base-token side).
    const buyShare = buys / swapCount;
    const inflow = dexVolume * buyShare;
    const smartMoneyFlow: SmartMoneyFlow = {
      inflow,
      outflow: dexVolume - inflow,
      netFlow: inflow * 2 - dexVolume,
      topSwaps: (dexTokens ?? []).slice(0, 5).map((t) => ({
        from: t.symbol,
        to: "USD",
        amount: t.volume24h,
      })),
      liquidityAdded: dexLiquidity,
      liquidityRemoved: 0,
    };

    return {
      overview,
      tokenHeat: (dexTokens ?? []).map(toHeatRow),
      smartMoneyFlow,
      timestamp: Date.now(),
    };
  }, [chainId, markets.data, dexTokens]);

  return {
    data,
    isLoading: markets.isLoading || dexLoading,
    isFetching: markets.isFetching || dexLoading,
    refetch: () => Promise.all([markets.refetch()]),
  };
}
