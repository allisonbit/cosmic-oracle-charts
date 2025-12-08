import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY_1');

// Token contract addresses on Ethereum mainnet
const tokenAddresses: Record<string, string> = {
  'ETH': 'native',
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  'UNI': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching crypto prices from CoinGecko...');

    // Use CoinGecko free API for price data
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot,avalanche-2,matic-network,chainlink,uniswap,cosmos,litecoin,tron,near&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('CoinGecko response:', JSON.stringify(data));

    // Map to our format
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
      'tron': { symbol: 'TRX', name: 'Tron' },
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

    console.log('Processed prices:', prices.length);

    return new Response(JSON.stringify({ prices, timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching crypto prices:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
