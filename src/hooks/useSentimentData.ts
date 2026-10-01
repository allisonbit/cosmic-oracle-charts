import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCryptoPrices, CryptoPrice } from "./useCryptoPrices";
import { useMarketData } from "./useMarketData";
import { fetchFearGreedHistory } from "@/lib/marketEngine";

// ── Standalone sentiment data ─────────────────────────────────────────────────
// Previously proxied a Supabase edge function that aggregated news, NFTs,
// trending coins and categories. Standalone, every field is computed from the
// live market engine (CoinGecko + alternative.me). The Social tab's panels
// degrade to honest empty states for data we can't fetch client-side (news,
// GitHub activity) — no fabrication.

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  large: string;
  marketCapRank: number;
  priceBtc: number;
  score: number;
  slug: string;
}

export interface TrendingCategory {
  name: string;
  marketCap: number;
  marketCapChange24h: number;
  volume: number;
  coinsCount: number;
}

export interface FearGreedEntry {
  value: number;
  classification: string;
  timestamp: number;
}

export interface GlobalMarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  activeCryptos: number;
  marketCapChange24h: number;
}

export interface TopCoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  ath: number;
  athChangePercentage: number;
  circulatingSupply: number;
  totalSupply: number;
}

export interface SentimentData {
  news: never[];
  trending: TrendingCoin[];
  trendingNfts: never[];
  trendingCategories: TrendingCategory[];
  fearGreed: FearGreedEntry[];
  global: GlobalMarketData | null;
  topCoins: TopCoinData[];
  lastUpdated: string;
  source: string;
}

function classify(v: number): string {
  if (v >= 80) return "Extreme Greed";
  if (v >= 60) return "Greed";
  if (v >= 40) return "Neutral";
  if (v >= 20) return "Fear";
  return "Extreme Fear";
}

function toTopCoin(p: CryptoPrice, id: string): TopCoinData {
  return {
    id,
    symbol: p.symbol,
    name: p.name,
    image: p.image || "",
    price: p.price,
    change24h: p.change24h,
    volume: p.volume24h,
    marketCap: p.marketCap,
    high24h: p.high24h ?? p.price,
    low24h: p.low24h ?? p.price,
    ath: 0,
    athChangePercentage: 0,
    circulatingSupply: 0,
    totalSupply: 0,
  };
}

/**
 * Standalone sentiment data: everything from the live engine, nothing polled
 * from a dead backend. `news` and `trendingNfts` are always empty — the UI
 * shows honest empty states for those.
 */
export function useSentimentData() {
  const { data: pricesData } = useCryptoPrices();
  const { data: marketData } = useMarketData();

  // The Fear & Greed history (last 8 days) comes straight from alternative.me.
  const fngHistory = useQuery({
    queryKey: ["sentiment-fng-history"],
    queryFn: async (): Promise<FearGreedEntry[]> => {
      const rows = await fetchFearGreedHistory(10);
      return rows.map(r => ({
        value: r.value,
        classification: r.classification ?? classify(r.value),
        timestamp: r.timestamp,
      }));
    },
    staleTime: 60 * 60_000, // the index updates daily
    refetchInterval: 30 * 60_000,
  });

  const data = useMemo<SentimentData | null>(() => {
    if (!pricesData && !marketData) return null;
    const prices = pricesData?.prices ?? [];
    const coins = marketData?.topCoins ?? [];

    // Trending = biggest absolute movers among the top coins (real ranking).
    const btcPrice = prices.find(p => p.symbol === "BTC")?.price || 0;
    const trending: TrendingCoin[] = [...coins]
      .sort((a, b) => Math.abs(b.change24h ?? 0) - Math.abs(a.change24h ?? 0))
      .slice(0, 8)
      .map((c, i) => ({
        id: c.id ?? c.symbol.toLowerCase(),
        name: c.name,
        symbol: c.symbol,
        thumb: c.image ?? "",
        large: c.image ?? "",
        marketCapRank: c.rank ?? i + 1,
        priceBtc: btcPrice > 0 ? c.price / btcPrice : 0,
        score: Math.min(10, Math.abs(c.change24h ?? 0)),
        slug: c.id ?? c.symbol.toLowerCase(),
      }));

    // Categories derived from the actual top coins by sector keyword match.
    const sectorOf = (name: string, symbol: string): string => {
      const n = `${name} ${symbol}`.toLowerCase();
      if (/btc|bitcoin/.test(n)) return "Majors";
      if (/eth|sol|avax|ada|dot|atom|near|apt|sui/.test(n)) return "Layer 1";
      if (/arb|op|matic|pol|strk|zk/.test(n)) return "Layer 2";
      if (/usdt|usdc|dai|usde|usds|tusd/.test(n)) return "Stablecoins";
      if (/doge|shib|pepe|bonk|wif|flok/.test(n)) return "Memes";
      if (/link|rndr|fet|agix|tao|ai/.test(n)) return "AI & Oracles";
      if (/uni|cake|aave|ldo|crv|mkr/.test(n)) return "DeFi";
      return "Other";
    };
    const bySector = new Map<string, TrendingCategory>();
    coins.forEach(c => {
      const sector = sectorOf(c.name ?? "", c.symbol ?? "");
      const agg = bySector.get(sector) ?? {
        name: sector, marketCap: 0, marketCapChange24h: 0, volume: 0, coinsCount: 0,
      };
      agg.marketCap += c.marketCap ?? 0;
      agg.volume += c.volume ?? 0;
      agg.marketCapChange24h += c.change24h ?? 0;
      agg.coinsCount += 1;
      bySector.set(sector, agg);
    });
    const trendingCategories = [...bySector.values()]
      .filter(s => s.coinsCount > 0)
      .map(s => ({ ...s, marketCapChange24h: s.marketCapChange24h / s.coinsCount }))
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 6);

    const fngValue = marketData?.fearGreedIndex ?? null;
    const fearGreed: FearGreedEntry[] = fngHistory.data?.length
      ? fngHistory.data
      : fngValue !== null
        ? [{ value: fngValue, classification: classify(fngValue), timestamp: Date.now() }]
        : [];

    const global: GlobalMarketData | null = marketData?.global
      ? {
          totalMarketCap: marketData.global.totalMarketCap,
          totalVolume: marketData.global.totalVolume24h,
          btcDominance: marketData.global.btcDominance,
          ethDominance: marketData.global.ethDominance,
          activeCryptos: marketData.global.activeCryptocurrencies,
          marketCapChange24h: marketData.global.marketCapChange24h,
        }
      : null;

    const idFor = (p: CryptoPrice) =>
      coins.find(c => c.symbol.toUpperCase() === p.symbol.toUpperCase())?.id ?? p.symbol.toLowerCase();

    return {
      news: [] as never[],
      trending,
      trendingNfts: [] as never[],
      trendingCategories,
      fearGreed,
      global,
      topCoins: prices.slice(0, 20).map(p => toTopCoin(p, idFor(p))),
      lastUpdated: new Date(pricesData?.timestamp ?? Date.now()).toISOString(),
      source: "live-engine",
    };
  }, [pricesData, marketData, fngHistory.data]);

  const isLoading = !data;
  return { data, isLoading };
}
