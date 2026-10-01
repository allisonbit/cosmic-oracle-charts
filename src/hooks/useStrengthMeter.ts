import { useQuery } from "@tanstack/react-query";
import { fetchMarkets, type EngineCoin } from "@/lib/marketEngine";

export interface StrengthData {
  id: string;
  name: string;
  symbol: string;
  type: 'chain' | 'asset';
  logo: string;
  strengthScore: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  volumeChange: number;
  volatility: number;
  dominanceChange: number;
  sentimentScore: number;
  trendConsistency: number;
  momentum: number;
  relativeStrengthVsBTC: number;
  relativeStrengthVsETH: number;
}

export interface StrengthMeterResponse {
  assets: StrengthData[];
  chains: StrengthData[];
  timestamp: number;
  timeframe: string;
}

const calculateStrengthScore = (data: any): number => {
  // Composite weighted model over REAL market signals only.
  const weights = {
    priceMomentum: 0.25,
    volumeFlow: 0.15,
    volatility: 0.10,
    dominance: 0.10,
    relativePerformance: 0.20,
    sentiment: 0.10,
    trendConsistency: 0.10,
  };

  const priceMomentumScore = Math.min(100, Math.max(0, 50 + (data.priceChange24h || 0) * 2));
  const volumeScore = Math.min(100, Math.max(0, 50 + (data.volumeChange || 0)));
  const volatilityScore = Math.min(100, Math.max(0, 100 - (data.volatility || 50)));
  const dominanceScore = Math.min(100, Math.max(0, 50 + (data.dominanceChange || 0) * 10));
  const relativeScore = Math.min(100, Math.max(0, 50 + ((data.relativeStrengthVsBTC || 0) + (data.relativeStrengthVsETH || 0)) / 2));
  const sentimentScore = data.sentimentScore || 50;
  const trendScore = data.trendConsistency || 50;

  return Math.round(
    priceMomentumScore * weights.priceMomentum +
    volumeScore * weights.volumeFlow +
    volatilityScore * weights.volatility +
    dominanceScore * weights.dominance +
    relativeScore * weights.relativePerformance +
    sentimentScore * weights.sentiment +
    trendScore * weights.trendConsistency
  );
};

function calculateTrendConsistency(coin: any): number {
  const changes = [
    coin.price_change_percentage_1h_in_currency || 0,
    coin.price_change_percentage_24h || 0,
    (coin.price_change_percentage_7d_in_currency || 0) / 7,
  ];

  const allPositive = changes.every(c => c > 0);
  const allNegative = changes.every(c => c < 0);
  const avgMagnitude = changes.reduce((s, c) => s + Math.abs(c), 0) / changes.length;

  // Stronger & more consistent trend = higher score. No randomness.
  if (allPositive || allNegative) return Math.min(100, 75 + avgMagnitude * 2);
  return Math.min(70, Math.max(25, 40 + avgMagnitude));
}

// Chains scored from their native assets' real market data.
const chainData = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', coinId: 'ethereum', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', coinId: 'solana', logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'binance-smart-chain', name: 'BNB Chain', symbol: 'BNB', coinId: 'binancecoin', logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: 'base', name: 'Base', symbol: 'BASE', coinId: 'base', logo: 'https://assets.coingecko.com/asset_platforms/images/131/large/base.jpeg' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', coinId: 'avalanche-2', logo: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
  { id: 'polygon', name: 'Polygon', symbol: 'POL', coinId: 'matic-network', logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', coinId: 'arbitrum', logo: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP', coinId: 'optimism', logo: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png' },
];

/**
 * Standalone strength computation from the engine's real markets snapshot —
 * real 1h/24h/7d changes, real volume and market cap. The old version called a
 * dead edge function and interpolated fake 1h/7d moves (24h/24, 24h*3); every
 * input here is now a real fetched figure.
 */
export async function fetchStrengthData(timeframe = '24h'): Promise<StrengthMeterResponse> {
  const coins: EngineCoin[] = await fetchMarkets(250);
  if (!coins.length) throw new Error('Market data unavailable');

  // CoinGecko-style snake_case shape the scoring helpers below expect.
  const mapped = coins.map(c => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    current_price: c.price,
    price_change_percentage_1h_in_currency: c.change1h,      // real
    price_change_percentage_24h: c.change24h,                 // real
    price_change_percentage_7d_in_currency: c.change7d,       // real
    total_volume: c.volume24h,
    market_cap: c.marketCap,
    // Per-coin market-cap 24h change isn't in the free markets endpoint —
    // neutral 0 keeps the dominance component honest instead of inventing one.
    market_cap_change_percentage_24h: 0,
  }));
  const btc24h = mapped[0]?.price_change_percentage_24h ?? 0; // markets are rank-sorted, BTC first
  const eth24h = mapped.find(c => c.id === 'ethereum')?.price_change_percentage_24h ?? 0;

  const assets: StrengthData[] = mapped.slice(0, 20).map((coin: any) => {
    const baseData = {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      type: 'asset' as const,
      logo: coin.image,
      priceChange1h: coin.price_change_percentage_1h_in_currency || 0,
      priceChange24h: coin.price_change_percentage_24h || 0,
      priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
      volumeChange: ((coin.total_volume || 0) / (coin.market_cap || 1)) * 100 - 5,
      volatility: Math.abs(coin.price_change_percentage_24h || 0) * 2,
      dominanceChange: 0, // neutral — real per-coin mcap change unavailable free
      sentimentScore: Math.min(100, Math.max(0, 50 + (coin.price_change_percentage_24h || 0) * 1.5)),
      trendConsistency: calculateTrendConsistency(coin),
      momentum: (coin.price_change_percentage_24h || 0) + (coin.price_change_percentage_7d_in_currency || 0) / 2,
      relativeStrengthVsBTC: coin.symbol === 'BTC' ? 0 : (coin.price_change_percentage_24h || 0) - btc24h,
      relativeStrengthVsETH: coin.symbol === 'ETH' ? 0 : (coin.price_change_percentage_24h || 0) - eth24h,
    };
    return { ...baseData, strengthScore: calculateStrengthScore(baseData) };
  });

  const chains: StrengthData[] = chainData.map((chain) => {
    const matchingCoin = mapped.find(c => c.id === chain.coinId || c.symbol === chain.symbol);
    const baseData = {
      id: chain.id,
      name: chain.name,
      symbol: chain.symbol,
      type: 'chain' as const,
      logo: chain.logo,
      priceChange1h: matchingCoin?.price_change_percentage_1h_in_currency || 0,
      priceChange24h: matchingCoin?.price_change_percentage_24h || 0,
      priceChange7d: matchingCoin?.price_change_percentage_7d_in_currency || 0,
      volumeChange: matchingCoin ? ((matchingCoin.total_volume || 0) / (matchingCoin.market_cap || 1)) * 100 - 5 : 0,
      volatility: Math.abs(matchingCoin?.price_change_percentage_24h || 0) * 2,
      dominanceChange: 0,
      sentimentScore: Math.min(100, Math.max(0, 50 + (matchingCoin?.price_change_percentage_24h || 0) * 1.5)),
      trendConsistency: matchingCoin ? calculateTrendConsistency(matchingCoin) : 50,
      momentum: (matchingCoin?.price_change_percentage_24h || 0) + (matchingCoin?.price_change_percentage_7d_in_currency || 0) / 2,
      relativeStrengthVsBTC: (matchingCoin?.price_change_percentage_24h || 0) - btc24h,
      relativeStrengthVsETH: (matchingCoin?.price_change_percentage_24h || 0) - eth24h,
    };
    return { ...baseData, strengthScore: calculateStrengthScore(baseData) };
  });

  return {
    assets: assets.sort((a, b) => b.strengthScore - a.strengthScore),
    chains: chains.sort((a, b) => b.strengthScore - a.strengthScore),
    timestamp: Date.now(),
    timeframe,
  };
}

export function useStrengthMeter(timeframe: string = '24h') {
  return useQuery<StrengthMeterResponse>({
    queryKey: ['strength-meter', timeframe],
    queryFn: () => fetchStrengthData(timeframe),
    staleTime: 120_000,
    refetchInterval: false, // refresh on visit / manual refetch, no 24/7 polling
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
