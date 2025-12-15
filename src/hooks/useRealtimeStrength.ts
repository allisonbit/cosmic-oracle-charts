import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { StrengthData } from './useStrengthMeter';

interface RealtimeStrengthState {
  assets: StrengthData[];
  chains: StrengthData[];
  lastUpdate: number;
  isConnected: boolean;
}

const calculateStrengthScore = (data: any): number => {
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

// Real CoinGecko image URLs
const coinImages: Record<string, string> = {
  bitcoin: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  ethereum: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  solana: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  binancecoin: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  ripple: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  cardano: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  dogecoin: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  polkadot: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  'avalanche-2': 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  'matic-network': 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
  chainlink: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  uniswap: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-logo.png',
  cosmos: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
  litecoin: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  arbitrum: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
  near: 'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
};

const chainLogos: Record<string, string> = {
  ethereum: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  solana: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  'binance-smart-chain': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  base: 'https://assets.coingecko.com/asset_platforms/images/131/large/base.jpeg',
  avalanche: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  polygon: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
  arbitrum: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
  optimism: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
};

export function useRealtimeStrength(timeframe: string = '24h') {
  const [state, setState] = useState<RealtimeStrengthState>({
    assets: [],
    chains: [],
    lastUpdate: Date.now(),
    isConnected: false,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch full market data from CoinGecko via edge function
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=1h,24h,7d'
      );
      
      let coins: any[] = [];
      
      if (response.ok) {
        coins = await response.json();
      } else {
        // Fallback to edge function
        const { data, error } = await supabase.functions.invoke('crypto-prices');
        if (!error && data?.prices) {
          coins = data.prices.map((p: any) => ({
            id: p.symbol?.toLowerCase(),
            symbol: p.symbol,
            name: p.name,
            image: coinImages[p.symbol?.toLowerCase()] || `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`,
            current_price: p.price,
            price_change_percentage_24h: p.change24h,
            price_change_percentage_1h_in_currency: p.change24h / 24,
            price_change_percentage_7d_in_currency: p.change24h * 3,
            total_volume: p.volume24h,
            market_cap: p.marketCap,
            market_cap_change_percentage_24h: p.change24h * 0.8,
          }));
        }
      }

      if (coins.length === 0) {
        setState(prev => ({ ...prev, isConnected: false }));
        return;
      }

      // Process assets with real data
      const assets: StrengthData[] = coins.slice(0, 20).map((coin: any) => {
        const baseData = {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol?.toUpperCase(),
          type: 'asset' as const,
          logo: coin.image || coinImages[coin.id] || `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`,
          priceChange1h: coin.price_change_percentage_1h_in_currency || 0,
          priceChange24h: coin.price_change_percentage_24h || 0,
          priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
          volumeChange: ((coin.total_volume || 0) / (coin.market_cap || 1)) * 100 - 5,
          volatility: Math.abs(coin.price_change_percentage_24h || 0) * 2,
          dominanceChange: (coin.market_cap_change_percentage_24h || 0) / 10,
          sentimentScore: Math.min(100, Math.max(0, 50 + (coin.price_change_percentage_24h || 0) * 1.5)),
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

      // Process chains with matched coin data
      const chainData = [
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', coinId: 'ethereum' },
        { id: 'solana', name: 'Solana', symbol: 'SOL', coinId: 'solana' },
        { id: 'binance-smart-chain', name: 'BNB Chain', symbol: 'BNB', coinId: 'binancecoin' },
        { id: 'base', name: 'Base', symbol: 'BASE', coinId: null },
        { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', coinId: 'avalanche-2' },
        { id: 'polygon', name: 'Polygon', symbol: 'POL', coinId: 'matic-network' },
        { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', coinId: 'arbitrum' },
        { id: 'optimism', name: 'Optimism', symbol: 'OP', coinId: 'optimism' },
      ];

      const chains: StrengthData[] = chainData.map((chain) => {
        const matchingCoin = coins.find((c: any) => 
          c.id === chain.coinId || 
          c.symbol?.toLowerCase() === chain.symbol.toLowerCase()
        );

        const baseData = {
          id: chain.id,
          name: chain.name,
          symbol: chain.symbol,
          type: 'chain' as const,
          logo: chainLogos[chain.id] || 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          priceChange1h: matchingCoin?.price_change_percentage_1h_in_currency || 0,
          priceChange24h: matchingCoin?.price_change_percentage_24h || 0,
          priceChange7d: matchingCoin?.price_change_percentage_7d_in_currency || 0,
          volumeChange: matchingCoin ? ((matchingCoin.total_volume || 0) / (matchingCoin.market_cap || 1)) * 100 - 5 : 0,
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

      setState({
        assets: assets.sort((a, b) => b.strengthScore - a.strengthScore),
        chains: chains.sort((a, b) => b.strengthScore - a.strengthScore),
        lastUpdate: Date.now(),
        isConnected: true,
      });
    } catch (err) {
      console.error('Realtime strength error:', err);
      setState(prev => ({ ...prev, isConnected: false }));
    }
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchData();
    }

    // Set up real-time polling every 15 seconds
    intervalRef.current = setInterval(fetchData, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refresh,
    timeframe,
  };
}

function calculateTrendConsistency(coin: any): number {
  const changes = [
    coin.price_change_percentage_1h_in_currency || 0,
    coin.price_change_percentage_24h || 0,
    (coin.price_change_percentage_7d_in_currency || 0) / 7,
  ];
  
  const allPositive = changes.every(c => c > 0);
  const allNegative = changes.every(c => c < 0);
  
  if (allPositive || allNegative) return 75 + Math.min(25, Math.abs(changes[0]) * 2);
  return 35 + Math.abs(changes[0]) * 2;
}
