import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, preflight, jsonResponse } from "../_shared/cors.ts";
import { getOrSet } from "../_shared/cache.ts";

// 30s TTL keeps CoinGecko upstream calls bounded even with global 5s client polling.
const CACHE_KEY = "crypto-prices:markets";
const CACHE_TTL = 30_000;

// Fallback — includes CoinGecko image CDN URLs for all coins
const fallbackPrices = [
  { symbol: 'BTC',  name: 'Bitcoin',       price: 97500,  change24h:  2.5,  volume24h: 45e9,  marketCap: 1.9e12, high24h: 99000, low24h: 95000, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  { symbol: 'ETH',  name: 'Ethereum',      price: 3650,   change24h:  1.8,  volume24h: 18e9,  marketCap: 440e9,  high24h: 3750,  low24h: 3580,  image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { symbol: 'SOL',  name: 'Solana',        price: 225,    change24h:  3.2,  volume24h: 4.5e9, marketCap: 105e9,  high24h: 232,   low24h: 215,   image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  { symbol: 'BNB',  name: 'BNB',           price: 680,    change24h:  1.2,  volume24h: 2e9,   marketCap: 100e9,  high24h: 695,   low24h: 670,   image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  { symbol: 'XRP',  name: 'XRP',           price: 2.35,   change24h: -0.5,  volume24h: 8e9,   marketCap: 130e9,  high24h: 2.45,  low24h: 2.28,  image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
  { symbol: 'ADA',  name: 'Cardano',       price: 1.05,   change24h:  4.1,  volume24h: 1.2e9, marketCap: 37e9,   high24h: 1.10,  low24h: 0.99,  image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
  { symbol: 'DOGE', name: 'Dogecoin',      price: 0.41,   change24h: -1.2,  volume24h: 3.5e9, marketCap: 60e9,   high24h: 0.43,  low24h: 0.39,  image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
  { symbol: 'DOT',  name: 'Polkadot',      price: 9.50,   change24h:  2.8,  volume24h: 500e6, marketCap: 14e9,   high24h: 9.80,  low24h: 9.10,  image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
  { symbol: 'AVAX', name: 'Avalanche',     price: 52,     change24h:  5.2,  volume24h: 800e6, marketCap: 21e9,   high24h: 54,    low24h: 49,    image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
  { symbol: 'MATIC',name: 'Polygon',       price: 0.62,   change24h:  1.5,  volume24h: 400e6, marketCap: 6e9,    high24h: 0.64,  low24h: 0.60,  image: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
  { symbol: 'LINK', name: 'Chainlink',     price: 28,     change24h:  2.1,  volume24h: 600e6, marketCap: 17e9,   high24h: 29,    low24h: 27,    image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
  { symbol: 'UNI',  name: 'Uniswap',       price: 16.5,   change24h:  0.8,  volume24h: 250e6, marketCap: 10e9,   high24h: 17,    low24h: 16,    image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
  { symbol: 'ATOM', name: 'Cosmos',        price: 12,     change24h:  1.9,  volume24h: 300e6, marketCap: 4.5e9,  high24h: 12.5,  low24h: 11.5,  image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png' },
  { symbol: 'LTC',  name: 'Litecoin',      price: 115,    change24h:  0.5,  volume24h: 700e6, marketCap: 8.5e9,  high24h: 118,   low24h: 112,   image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
  { symbol: 'ARB',  name: 'Arbitrum',      price: 1.15,   change24h:  3.5,  volume24h: 450e6, marketCap: 4.6e9,  high24h: 1.20,  low24h: 1.10,  image: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
  { symbol: 'NEAR', name: 'NEAR Protocol', price: 7.20,   change24h:  4.8,  volume24h: 350e6, marketCap: 8e9,    high24h: 7.50,  low24h: 6.90,  image: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg' },
];

// CoinGecko ID → symbol/name mapping
const coinMapping: Record<string, { symbol: string; name: string }> = {
  'bitcoin':       { symbol: 'BTC',  name: 'Bitcoin'       },
  'ethereum':      { symbol: 'ETH',  name: 'Ethereum'      },
  'solana':        { symbol: 'SOL',  name: 'Solana'        },
  'binancecoin':   { symbol: 'BNB',  name: 'BNB'           },
  'ripple':        { symbol: 'XRP',  name: 'XRP'           },
  'cardano':       { symbol: 'ADA',  name: 'Cardano'       },
  'dogecoin':      { symbol: 'DOGE', name: 'Dogecoin'      },
  'polkadot':      { symbol: 'DOT',  name: 'Polkadot'      },
  'avalanche-2':   { symbol: 'AVAX', name: 'Avalanche'     },
  'matic-network': { symbol: 'MATIC',name: 'Polygon'       },
  'chainlink':     { symbol: 'LINK', name: 'Chainlink'     },
  'uniswap':       { symbol: 'UNI',  name: 'Uniswap'       },
  'cosmos':        { symbol: 'ATOM', name: 'Cosmos'        },
  'litecoin':      { symbol: 'LTC',  name: 'Litecoin'      },
  'arbitrum':      { symbol: 'ARB',  name: 'Arbitrum'      },
  'near':          { symbol: 'NEAR', name: 'NEAR Protocol' },
};

const COIN_IDS = Object.keys(coinMapping).join(',');

async function fetchFromCoinGecko() {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error(`CoinGecko ${response.status}`);

  const markets: any[] = await response.json();
  const prices = markets
    .map((coin: any) => {
      const meta = coinMapping[coin.id];
      if (!meta) return null;
      return {
        symbol: meta.symbol,
        name: meta.name,
        price: coin.current_price || 0,
        change24h: coin.price_change_percentage_24h || 0,
        volume24h: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        high24h: coin.high_24h || 0,
        low24h: coin.low_24h || 0,
        image: coin.image || "",
        rank: coin.market_cap_rank || 0,
      };
    })
    .filter(Boolean);

  return { prices, timestamp: Date.now(), source: "coingecko" as const };
}

serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    // Concurrent requests during a cache miss now share one upstream fetch.
    const result = await getOrSet(CACHE_KEY, { ttlMs: CACHE_TTL }, fetchFromCoinGecko);
    return jsonResponse(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn("crypto-prices upstream error, serving fallback:", message);
    return jsonResponse({ prices: fallbackPrices, timestamp: Date.now(), source: "fallback" });
  }
});
