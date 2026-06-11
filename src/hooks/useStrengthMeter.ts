import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

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
  // Composite weighted model
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

export function useStrengthMeter(timeframe: string = '24h') {
  return useQuery<StrengthMeterResponse>({
    queryKey: ['strength-meter', timeframe],
    queryFn: async () => {
      try {
        const { data, error } = await invokeFunction('crypto-prices');
        
        if (error) throw error;

        // The crypto-prices edge function returns camelCase fields
        // ({ symbol, name, price, change24h, volume24h, marketCap, image }).
        // Remap to the CoinGecko-style snake_case shape the calculations below
        // expect — otherwise every metric reads undefined and scores collapse
        // to an identical baseline. (Mirrors useRealtimeStrength.)
        const coins = (data?.prices || []).map((p: any) => ({
          id: p.symbol?.toLowerCase(),
          symbol: p.symbol,
          name: p.name,
          image: p.image,
          current_price: p.price,
          price_change_percentage_24h: p.change24h,
          price_change_percentage_1h_in_currency: (p.change24h || 0) / 24,
          price_change_percentage_7d_in_currency: (p.change24h || 0) * 3,
          total_volume: p.volume24h,
          market_cap: p.marketCap,
          market_cap_change_percentage_24h: (p.change24h || 0) * 0.8,
        }));

        // Process assets
        const assets: StrengthData[] = coins.slice(0, 20).map((coin: any) => {
          const baseData = {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol?.toUpperCase(),
            type: 'asset' as const,
            logo: coin.image,
            priceChange1h: coin.price_change_percentage_1h_in_currency || 0,
            priceChange24h: coin.price_change_percentage_24h || 0,
            priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
            volumeChange: ((coin.total_volume || 0) / (coin.market_cap || 1)) * 100 - 5,
            volatility: Math.abs(coin.price_change_percentage_24h || 0) * 2,
            dominanceChange: (coin.market_cap_change_percentage_24h || 0) / 10,
            sentimentScore: 50 + (coin.price_change_percentage_24h || 0) * 1.5,
            trendConsistency: calculateTrendConsistency(coin),
            momentum: (coin.price_change_percentage_24h || 0) + (coin.price_change_percentage_7d_in_currency || 0) / 2,
            relativeStrengthVsBTC: coin.symbol === 'btc' ? 0 : (coin.price_change_percentage_24h || 0) - (coins[0]?.price_change_percentage_24h || 0),
            relativeStrengthVsETH: coin.symbol === 'eth' ? 0 : (coin.price_change_percentage_24h || 0) - (coins[1]?.price_change_percentage_24h || 0),
          };

          return {
            ...baseData,
            strengthScore: calculateStrengthScore(baseData),
          };
        });

        // Process chains
        const chainData = [
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
          { id: 'solana', name: 'Solana', symbol: 'SOL', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
          { id: 'binance-smart-chain', name: 'BNB Chain', symbol: 'BNB', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
          { id: 'base', name: 'Base', symbol: 'BASE', logo: 'https://cryptologos.cc/logos/base-base-logo.png' },
          { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
          { id: 'polygon', name: 'Polygon', symbol: 'MATIC', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
          { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' },
          { id: 'optimism', name: 'Optimism', symbol: 'OP', logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' },
        ];

        const chains: StrengthData[] = chainData.map((chain) => {
          const matchingCoin = coins.find((c: any) => 
            c.symbol?.toLowerCase() === chain.symbol.toLowerCase() ||
            c.id === chain.id
          );

          const baseData = {
            id: chain.id,
            name: chain.name,
            symbol: chain.symbol,
            type: 'chain' as const,
            logo: chain.logo,
            priceChange1h: matchingCoin?.price_change_percentage_1h_in_currency || 0,
            priceChange24h: matchingCoin?.price_change_percentage_24h || 0,
            priceChange7d: matchingCoin?.price_change_percentage_7d_in_currency || 0,
            volumeChange: matchingCoin
              ? ((matchingCoin.total_volume || 0) / (matchingCoin.market_cap || 1)) * 100 - 5
              : 0,
            volatility: Math.abs(matchingCoin?.price_change_percentage_24h || 0) * 2,
            dominanceChange: (matchingCoin?.market_cap_change_percentage_24h || 0) / 10,
            sentimentScore: Math.min(100, Math.max(0, 50 + (matchingCoin?.price_change_percentage_24h || 0) * 1.5)),
            trendConsistency: matchingCoin ? calculateTrendConsistency(matchingCoin) : 50,
            momentum: (matchingCoin?.price_change_percentage_24h || 0) + (matchingCoin?.price_change_percentage_7d_in_currency || 0) / 2,
            relativeStrengthVsBTC: (matchingCoin?.price_change_percentage_24h || 0) - (coins[0]?.price_change_percentage_24h || 0),
            relativeStrengthVsETH: (matchingCoin?.price_change_percentage_24h || 0) - (coins[1]?.price_change_percentage_24h || 0),
          };

          return {
            ...baseData,
            strengthScore: calculateStrengthScore(baseData),
          };
        });

        return {
          assets: assets.sort((a, b) => b.strengthScore - a.strengthScore),
          chains: chains.sort((a, b) => b.strengthScore - a.strengthScore),
          timestamp: Date.now(),
          timeframe,
        };
      } catch (err) {
        console.error('Strength meter error:', err);
        throw err;
      }
    },
    staleTime: 20000,
    refetchInterval: 20000, // Refresh every 20 seconds 24/7
    gcTime: 1000 * 60 * 10,
    refetchIntervalInBackground: false, // Keep updating in background
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}

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
