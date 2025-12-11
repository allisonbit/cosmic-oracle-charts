import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CoinGecko platform IDs for each chain
const CHAIN_PLATFORMS: Record<string, string> = {
  ethereum: 'ethereum',
  solana: 'solana',
  bnb: 'binance-smart-chain',
  avalanche: 'avalanche',
  polygon: 'polygon-pos',
  arbitrum: 'arbitrum-one',
  base: 'base',
  optimism: 'optimistic-ethereum',
};

// Category IDs for chain ecosystems (CoinGecko categories)
const CHAIN_CATEGORIES: Record<string, string> = {
  ethereum: 'ethereum-ecosystem',
  solana: 'solana-ecosystem',
  bnb: 'binance-smart-chain',
  avalanche: 'avalanche-ecosystem',
  polygon: 'polygon-ecosystem',
  arbitrum: 'arbitrum-ecosystem',
  base: 'base-meme-coins', // Base ecosystem uses this category
  optimism: 'optimism-ecosystem',
};

// Fallback token IDs for each chain's native ecosystem
const CHAIN_TOKEN_IDS: Record<string, string[]> = {
  ethereum: ['ethereum', 'uniswap', 'chainlink', 'aave', 'lido-dao', 'maker', 'curve-dao-token', 'compound-governance-token', 'ens', 'the-graph'],
  solana: ['solana', 'raydium', 'orca', 'jupiter-exchange-solana', 'jito-governance-token', 'bonk', 'pyth-network', 'marinade', 'magic-eden', 'tensor'],
  bnb: ['binancecoin', 'pancakeswap-token', 'venus', 'bakerytoken', 'trust-wallet-token', 'alpaca-finance', 'biswap', 'baby-doge-coin', 'floki', 'safemoon-2'],
  avalanche: ['avalanche-2', 'trader-joe', 'benqi', 'pangolin', 'spell-token', 'wonderland', 'platypus-finance', 'vector-finance', 'gmx', 'stargate-finance'],
  polygon: ['matic-network', 'quickswap', 'aavegotchi', 'sushi', 'balancer', 'gains-network', 'polymath', 'tellor', 'cartesi', 'vulcan-forged'],
  arbitrum: ['arbitrum', 'gmx', 'magic', 'radiant-capital', 'gains-network', 'jones-dao', 'dopex', 'pendle', 'camelot-token', 'treasure-lol'],
  base: ['aerodrome-finance', 'brett', 'degen-base', 'toshi', 'higher', 'normie-base', 'basenji', 'mochi-token', 'based-brett', 'virtual-protocol'],
  optimism: ['optimism', 'velodrome-finance', 'synthetix-network-token', 'lyra-finance', 'thales', 'extra-finance', 'sonne-finance', 'exactly-token', 'poolz-finance', 'hop-protocol'],
};

interface DiscoveryToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  logo: string;
  category: 'rising' | 'crashing' | 'new' | 'unusual';
  momentum: number;
  volumeSpike: number;
  socialScore: number;
  volatility: number;
  liquidityScore: number;
  sparkline?: number[];
  coingeckoId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chain = 'ethereum' } = await req.json();
    console.log('Token discovery request for chain:', chain);

    const tokens: DiscoveryToken[] = [];
    const categoryId = CHAIN_CATEGORIES[chain] || 'ethereum-ecosystem';
    
    // Fetch chain-specific tokens from CoinGecko by category
    let marketData: any[] = [];
    
    try {
      // First try category-based fetch for chain-specific tokens
      const categoryUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
      console.log('Fetching category:', categoryUrl);
      
      const marketResponse = await fetch(categoryUrl);
      
      if (marketResponse.ok) {
        marketData = await marketResponse.json();
        console.log(`${chain} category data received, count:`, marketData.length);
      }
    } catch (e) {
      console.log('Category fetch failed, using fallback:', e);
    }

    // Fallback: fetch specific tokens by ID for this chain
    if (!marketData || marketData.length < 5) {
      console.log('Using token ID fallback for:', chain);
      const tokenIds = CHAIN_TOKEN_IDS[chain] || CHAIN_TOKEN_IDS.ethereum;
      const idsParam = tokenIds.join(',');
      const idsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`;
      
      try {
        const idsResponse = await fetch(idsUrl);
        if (idsResponse.ok) {
          const idsData = await idsResponse.json();
          if (Array.isArray(idsData) && idsData.length > 0) {
            marketData = idsData;
            console.log(`Got ${marketData.length} tokens by ID for ${chain}`);
          }
        }
      } catch (e) {
        console.log('ID fetch failed:', e);
      }
    }

    // Final fallback to general market if still no data
    if (!marketData || marketData.length < 5) {
      console.log('Using general fallback for:', chain);
      const fallbackUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d';
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      if (Array.isArray(fallbackData)) {
        marketData = fallbackData;
      }
    }

    if (!Array.isArray(marketData)) {
      console.error('Market data is not an array:', typeof marketData);
      marketData = [];
    }

    console.log('Processing', marketData.length, 'tokens for', chain);

    // Categorize tokens for this chain
    // Rising: Top gainers with positive momentum
    const rising = marketData
      .filter((coin: any) => (coin.price_change_percentage_24h || 0) > 3)
      .sort((a: any, b: any) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 6);

    for (const coin of rising) {
      tokens.push(createToken(coin, 'rising'));
    }

    // Crashing: Biggest losers
    const crashing = marketData
      .filter((coin: any) => (coin.price_change_percentage_24h || 0) < -3)
      .sort((a: any, b: any) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
      .slice(0, 6);

    for (const coin of crashing) {
      if (!tokens.find(t => t.coingeckoId === coin.id)) {
        tokens.push(createToken(coin, 'crashing'));
      }
    }

    // High Activity: High volume relative to market cap
    const highActivity = marketData
      .filter((coin: any) => {
        const volumeRatio = (coin.total_volume || 0) / (coin.market_cap || 1);
        return volumeRatio > 0.1 && (coin.price_change_percentage_24h || 0) > 0;
      })
      .sort((a: any, b: any) => {
        const ratioA = (a.total_volume || 0) / (a.market_cap || 1);
        const ratioB = (b.total_volume || 0) / (b.market_cap || 1);
        return ratioB - ratioA;
      })
      .slice(0, 6);

    for (const coin of highActivity) {
      if (!tokens.find(t => t.coingeckoId === coin.id)) {
        tokens.push(createToken(coin, 'new'));
      }
    }

    // Unusual: High volatility
    const unusual = marketData
      .filter((coin: any) => {
        const volatility = calculateVolatility(coin.sparkline_in_7d?.price || []);
        return volatility > 12;
      })
      .sort((a: any, b: any) => {
        const volA = calculateVolatility(a.sparkline_in_7d?.price || []);
        const volB = calculateVolatility(b.sparkline_in_7d?.price || []);
        return volB - volA;
      })
      .slice(0, 6);

    for (const coin of unusual) {
      if (!tokens.find(t => t.coingeckoId === coin.id)) {
        tokens.push(createToken(coin, 'unusual'));
      }
    }

    // Ensure we have at least some tokens in each category
    if (tokens.filter(t => t.category === 'rising').length === 0 && marketData.length > 0) {
      const topCoins = marketData.slice(0, 4);
      for (const coin of topCoins) {
        if (!tokens.find(t => t.coingeckoId === coin.id)) {
          tokens.push(createToken(coin, 'rising'));
        }
      }
    }

    console.log(`Returning ${tokens.length} discovery tokens for ${chain}`);

    return new Response(
      JSON.stringify({ 
        tokens, 
        chain, 
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Token discovery error:', error);
    return new Response(
      JSON.stringify({ tokens: [], error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function createToken(coin: any, category: 'rising' | 'crashing' | 'new' | 'unusual'): DiscoveryToken {
  return {
    symbol: (coin.symbol || 'UNKNOWN').toUpperCase(),
    name: coin.name || coin.symbol || 'Unknown',
    price: Number(coin.current_price) || 0,
    change24h: Number(coin.price_change_percentage_24h) || 0,
    change7d: Number(coin.price_change_percentage_7d_in_currency) || 0,
    volume24h: Number(coin.total_volume) || 0,
    marketCap: Number(coin.market_cap) || 0,
    rank: coin.market_cap_rank || 999,
    logo: coin.image || '',
    category,
    momentum: calculateMomentum(coin),
    volumeSpike: calculateVolumeSpike(coin),
    socialScore: Math.random() * 40 + 40, // Simulated for now
    volatility: calculateVolatility(coin.sparkline_in_7d?.price || []),
    liquidityScore: calculateLiquidityScore(coin),
    sparkline: coin.sparkline_in_7d?.price?.slice(-24) || [],
    coingeckoId: coin.id,
  };
}

function calculateMomentum(coin: any): number {
  const change24h = Number(coin.price_change_percentage_24h) || 0;
  const change7d = Number(coin.price_change_percentage_7d_in_currency) || 0;
  return Math.min(100, Math.max(0, 50 + change24h * 3 + change7d * 0.5));
}

function calculateVolumeSpike(coin: any): number {
  const volume = Number(coin.total_volume) || 0;
  const marketCap = Number(coin.market_cap) || 1;
  const ratio = volume / marketCap;
  return Math.min(100, ratio * 400);
}

function calculateVolatility(prices: number[]): number {
  if (!prices || prices.length < 2) return 50;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  if (returns.length === 0) return 50;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance) * 100;
  return Math.min(100, stdDev * 10);
}

function calculateLiquidityScore(coin: any): number {
  const marketCap = Number(coin.market_cap) || 0;
  const volume = Number(coin.total_volume) || 0;
  if (marketCap === 0 || volume === 0) return 50;
  const mcScore = Math.min(50, Math.log10(marketCap) * 5);
  const volScore = Math.min(50, Math.log10(volume) * 5);
  return mcScore + volScore;
}
