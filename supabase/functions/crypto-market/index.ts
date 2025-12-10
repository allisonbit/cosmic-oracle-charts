import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache to avoid rate limiting
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Fallback data
const fallbackMarketData = {
  global: {
    totalMarketCap: 3200000000000,
    totalVolume24h: 120000000000,
    btcDominance: 55.2,
    ethDominance: 12.8,
    activeCryptocurrencies: 14500,
    marketCapChange24h: 1.5,
  },
  fearGreedIndex: 65,
  trending: [
    { symbol: 'SOL', name: 'Solana', rank: 5, priceChange: 5.2 },
    { symbol: 'AVAX', name: 'Avalanche', rank: 12, priceChange: 4.8 },
    { symbol: 'ARB', name: 'Arbitrum', rank: 45, priceChange: 3.5 },
  ],
  topCoins: [
    { symbol: 'BTC', name: 'Bitcoin', price: 97500, change24h: 2.5, volume: 45000000000, marketCap: 1900000000000, rank: 1 },
    { symbol: 'ETH', name: 'Ethereum', price: 3650, change24h: 1.8, volume: 18000000000, marketCap: 440000000000, rank: 2 },
    { symbol: 'SOL', name: 'Solana', price: 225, change24h: 3.2, volume: 4500000000, marketCap: 105000000000, rank: 5 },
    { symbol: 'BNB', name: 'BNB', price: 680, change24h: 1.2, volume: 2000000000, marketCap: 100000000000, rank: 4 },
    { symbol: 'XRP', name: 'Ripple', price: 2.35, change24h: -0.5, volume: 8000000000, marketCap: 130000000000, rank: 3 },
    { symbol: 'ADA', name: 'Cardano', price: 1.05, change24h: 4.1, volume: 1200000000, marketCap: 37000000000, rank: 9 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.41, change24h: -1.2, volume: 3500000000, marketCap: 60000000000, rank: 7 },
    { symbol: 'DOT', name: 'Polkadot', price: 9.50, change24h: 2.8, volume: 500000000, marketCap: 14000000000, rank: 15 },
    { symbol: 'AVAX', name: 'Avalanche', price: 52, change24h: 5.2, volume: 800000000, marketCap: 21000000000, rank: 12 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.62, change24h: 1.5, volume: 400000000, marketCap: 6000000000, rank: 20 },
    { symbol: 'LINK', name: 'Chainlink', price: 28, change24h: 2.1, volume: 600000000, marketCap: 17000000000, rank: 14 },
    { symbol: 'UNI', name: 'Uniswap', price: 16.5, change24h: 0.8, volume: 250000000, marketCap: 10000000000, rank: 22 },
    { symbol: 'ATOM', name: 'Cosmos', price: 12, change24h: 1.9, volume: 300000000, marketCap: 4500000000, rank: 28 },
    { symbol: 'LTC', name: 'Litecoin', price: 115, change24h: 0.5, volume: 700000000, marketCap: 8500000000, rank: 18 },
    { symbol: 'ARB', name: 'Arbitrum', price: 1.15, change24h: 3.5, volume: 450000000, marketCap: 4600000000, rank: 45 },
    { symbol: 'NEAR', name: 'NEAR Protocol', price: 7.20, change24h: 4.8, volume: 350000000, marketCap: 8000000000, rank: 25 },
  ],
  timestamp: Date.now(),
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Return cached data if still valid
    if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log('Returning cached market data');
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching global market data...');

    // Fetch fear & greed index first (different API, usually works)
    let fearGreedIndex = 50;
    try {
      const fgResponse = await fetch('https://api.alternative.me/fng/?limit=1');
      if (fgResponse.ok) {
        const fgData = await fgResponse.json();
        fearGreedIndex = parseInt(fgData.data?.[0]?.value || '50');
      }
    } catch {
      console.log('Could not fetch fear & greed');
    }

    // Fetch top coins
    let topCoins: any[] = [];
    try {
      const marketsResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h',
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (marketsResponse.ok) {
        const marketsData = await marketsResponse.json();
        topCoins = marketsData.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0,
          volume: coin.total_volume,
          marketCap: coin.market_cap,
          rank: coin.market_cap_rank,
        }));
      }
    } catch {
      console.log('Could not fetch markets, using fallback');
    }

    // If we got rate limited, return fallback with real fear/greed
    if (topCoins.length === 0) {
      const fallback = { ...fallbackMarketData, fearGreedIndex, timestamp: Date.now() };
      cachedData = fallback;
      cacheTimestamp = Date.now();
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try to get global data
    let global = fallbackMarketData.global;
    try {
      const globalResponse = await fetch(
        'https://api.coingecko.com/api/v3/global',
        { headers: { 'Accept': 'application/json' } }
      );
      if (globalResponse.ok) {
        const globalData = await globalResponse.json();
        global = {
          totalMarketCap: globalData.data?.total_market_cap?.usd || 0,
          totalVolume24h: globalData.data?.total_volume?.usd || 0,
          btcDominance: globalData.data?.market_cap_percentage?.btc || 0,
          ethDominance: globalData.data?.market_cap_percentage?.eth || 0,
          activeCryptocurrencies: globalData.data?.active_cryptocurrencies || 0,
          marketCapChange24h: globalData.data?.market_cap_change_percentage_24h_usd || 0,
        };
      }
    } catch {
      console.log('Using fallback global data');
    }

    const result = {
      global,
      fearGreedIndex,
      trending: topCoins.slice(0, 5).map(c => ({
        symbol: c.symbol,
        name: c.name,
        rank: c.rank,
        priceChange: c.change24h,
      })),
      topCoins,
      timestamp: Date.now(),
    };

    cachedData = result;
    cacheTimestamp = Date.now();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching market data:', message);
    
    // Return fallback on any error
    return new Response(JSON.stringify({ ...fallbackMarketData, timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
