import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache to avoid rate limiting - increased duration
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 second cache for stability

// Fallback data when API is unavailable
const fallbackPrices = [
  { symbol: 'BTC', name: 'Bitcoin', price: 97500, change24h: 2.5, volume24h: 45000000000, marketCap: 1900000000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 3650, change24h: 1.8, volume24h: 18000000000, marketCap: 440000000000 },
  { symbol: 'SOL', name: 'Solana', price: 225, change24h: 3.2, volume24h: 4500000000, marketCap: 105000000000 },
  { symbol: 'BNB', name: 'BNB', price: 680, change24h: 1.2, volume24h: 2000000000, marketCap: 100000000000 },
  { symbol: 'XRP', name: 'Ripple', price: 2.35, change24h: -0.5, volume24h: 8000000000, marketCap: 130000000000 },
  { symbol: 'ADA', name: 'Cardano', price: 1.05, change24h: 4.1, volume24h: 1200000000, marketCap: 37000000000 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.41, change24h: -1.2, volume24h: 3500000000, marketCap: 60000000000 },
  { symbol: 'DOT', name: 'Polkadot', price: 9.50, change24h: 2.8, volume24h: 500000000, marketCap: 14000000000 },
  { symbol: 'AVAX', name: 'Avalanche', price: 52, change24h: 5.2, volume24h: 800000000, marketCap: 21000000000 },
  { symbol: 'MATIC', name: 'Polygon', price: 0.62, change24h: 1.5, volume24h: 400000000, marketCap: 6000000000 },
  { symbol: 'LINK', name: 'Chainlink', price: 28, change24h: 2.1, volume24h: 600000000, marketCap: 17000000000 },
  { symbol: 'UNI', name: 'Uniswap', price: 16.5, change24h: 0.8, volume24h: 250000000, marketCap: 10000000000 },
  { symbol: 'ATOM', name: 'Cosmos', price: 12, change24h: 1.9, volume24h: 300000000, marketCap: 4500000000 },
  { symbol: 'LTC', name: 'Litecoin', price: 115, change24h: 0.5, volume24h: 700000000, marketCap: 8500000000 },
  { symbol: 'ARB', name: 'Arbitrum', price: 1.15, change24h: 3.5, volume24h: 450000000, marketCap: 4600000000 },
  { symbol: 'NEAR', name: 'NEAR Protocol', price: 7.20, change24h: 4.8, volume24h: 350000000, marketCap: 8000000000 },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Return cached data if still valid
    if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log('Returning cached price data');
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching crypto prices from CoinGecko...');

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot,avalanche-2,matic-network,chainlink,uniswap,cosmos,litecoin,arbitrum,near&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status);
      // Return fallback data on rate limit
      const fallbackResponse = { prices: fallbackPrices, timestamp: Date.now(), cached: true };
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    const coinMapping: Record<string, { symbol: string; name: string }> = {
      'bitcoin': { symbol: 'BTC', name: 'Bitcoin' },
      'ethereum': { symbol: 'ETH', name: 'Ethereum' },
      'solana': { symbol: 'SOL', name: 'Solana' },
      'binancecoin': { symbol: 'BNB', name: 'BNB' },
      'ripple': { symbol: 'XRP', name: 'Ripple' },
      'cardano': { symbol: 'ADA', name: 'Cardano' },
      'dogecoin': { symbol: 'DOGE', name: 'Dogecoin' },
      'polkadot': { symbol: 'DOT', name: 'Polkadot' },
      'avalanche-2': { symbol: 'AVAX', name: 'Avalanche' },
      'matic-network': { symbol: 'MATIC', name: 'Polygon' },
      'chainlink': { symbol: 'LINK', name: 'Chainlink' },
      'uniswap': { symbol: 'UNI', name: 'Uniswap' },
      'cosmos': { symbol: 'ATOM', name: 'Cosmos' },
      'litecoin': { symbol: 'LTC', name: 'Litecoin' },
      'arbitrum': { symbol: 'ARB', name: 'Arbitrum' },
      'near': { symbol: 'NEAR', name: 'NEAR Protocol' },
    };

    const prices = Object.entries(data).map(([id, info]: [string, any]) => {
      const coin = coinMapping[id];
      if (!coin) return null;
      return {
        symbol: coin.symbol,
        name: coin.name,
        price: info.usd || 0,
        change24h: info.usd_24h_change || 0,
        volume24h: info.usd_24h_vol || 0,
        marketCap: info.usd_market_cap || 0,
      };
    }).filter(Boolean);

    const result = { prices, timestamp: Date.now() };
    
    // Cache the result
    cachedData = result;
    cacheTimestamp = Date.now();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching crypto prices:', message);
    
    // Return fallback on any error
    const fallbackResponse = { prices: fallbackPrices, timestamp: Date.now(), cached: true };
    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
