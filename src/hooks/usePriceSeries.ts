import { useQuery } from "@tanstack/react-query";
import { fetchPriceSeries } from "@/lib/marketEngine";

export interface PricePoint {
  time: string;
  price: number;
  volume: number;
  marketCap: number;
}

/**
 * Real historical price series straight from CoinGecko via the standalone
 * engine — no edge function, no fabricated walk. `symbol` is the ticker
 * (e.g. "ETH"); it is resolved to a CoinGecko id with a small static map plus
 * a live lookup against the top markets. Returns up to ~168 sampled points
 * over `days`, used to compute genuine technical indicators.
 */
export function usePriceSeries(symbol?: string, days = 7, maxPoints = 168) {
  return useQuery({
    queryKey: ["engine-price-series", symbol?.toUpperCase(), days, maxPoints],
    enabled: !!symbol,
    staleTime: 60_000,
    refetchInterval: false,
    retry: 1,
    queryFn: async (): Promise<PricePoint[]> => {
      if (!symbol) return [];
      const coinId = await resolveCoinId(symbol);
      if (!coinId) return [];
      const rows = await fetchPriceSeries(coinId, days);
      if (!rows.length) return [];
      const step = Math.max(1, Math.ceil(rows.length / maxPoints));
      return rows
        .filter((_, i) => i % step === 0)
        .map((r) => ({
          time: new Date(r.time).toISOString(),
          price: r.price,
          volume: r.volume,
          marketCap: r.marketCap,
        }));
    },
  });
}

// ── symbol → CoinGecko id resolution ─────────────────────────────────────────

const ID_OVERRIDES: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  MATIC: "matic-network",
  POL: "matic-network",
  LINK: "chainlink",
  LTC: "litecoin",
  TRX: "tron",
  TON: "the-open-network",
  SUI: "sui",
  ARB: "arbitrum",
  OP: "optimism",
  ATOM: "cosmos",
  NEAR: "near",
  APT: "aptos",
  SHIB: "shiba-inu",
  PEPE: "pepe",
  UNI: "uniswap",
  AAVE: "aave",
  BCH: "bitcoin-cash",
  FIL: "filecoin",
  ICP: "internet-computer",
  ETC: "ethereum-classic",
  HBAR: "hedera-hashgraph",
  VET: "vechain",
  INJ: "injective-protocol",
  RENDER: "render-token",
};

let idCache: { at: number; map: Record<string, string> } | null = null;

async function resolveCoinId(symbol: string): Promise<string | null> {
  const sym = symbol.toUpperCase();
  if (ID_OVERRIDES[sym]) return ID_OVERRIDES[sym];

  // Live lookup over the top markets, cached for 1h (symbol set rarely changes).
  if (idCache && Date.now() - idCache.at < 3_600_000) {
    return idCache.map[sym] ?? null;
  }
  try {
    const { fetchMarkets } = await import("@/lib/marketEngine");
    const coins = await fetchMarkets(250);
    const map: Record<string, string> = {};
    for (const c of coins) map[c.symbol.toUpperCase()] = c.id;
    idCache = { at: Date.now(), map };
    return map[sym] ?? null;
  } catch {
    return null;
  }
}
