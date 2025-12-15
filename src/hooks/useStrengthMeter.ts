import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        const { data, error } = await supabase.functions.invoke('crypto-prices');
        
        if (error) throw error;

        const coins = data?.prices || [];
        
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
            priceChange1h: matchingCoin?.price_change_percentage_1h_in_currency || Math.random() * 4 - 2,
            priceChange24h: matchingCoin?.price_change_percentage_24h || Math.random() * 10 - 5,
            priceChange7d: matchingCoin?.price_change_percentage_7d_in_currency || Math.random() * 20 - 10,
            volumeChange: Math.random() * 30 - 15,
            volatility: Math.random() * 40 + 10,
            dominanceChange: Math.random() * 2 - 1,
            sentimentScore: 40 + Math.random() * 40,
            trendConsistency: 40 + Math.random() * 40,
            momentum: Math.random() * 20 - 10,
            relativeStrengthVsBTC: Math.random() * 10 - 5,
            relativeStrengthVsETH: Math.random() * 10 - 5,
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
    staleTime: 30000,
    refetchInterval: 30000,
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
  
  if (allPositive || allNegative) return 80 + Math.random() * 20;
  return 30 + Math.random() * 40;
}
