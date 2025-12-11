import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    
    // Fetch trending coins from CoinGecko
    const trendingResponse = await fetch('https://api.coingecko.com/api/v3/search/trending');
    const trendingData = await trendingResponse.json();
    console.log('Trending data received');

    // Fetch top gainers/losers
    const marketResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
    );
    const marketData = await marketResponse.json();
    console.log('Market data received, count:', marketData.length);

    // Process trending coins (Rising category)
    if (trendingData.coins) {
      for (const item of trendingData.coins.slice(0, 6)) {
        const coin = item.item;
        const marketInfo = marketData.find((m: any) => m.id === coin.id);
        
        tokens.push({
          symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
          name: coin.name || coin.symbol,
          price: marketInfo?.current_price || coin.data?.price || 0,
          change24h: marketInfo?.price_change_percentage_24h || coin.data?.price_change_percentage_24h?.usd || 0,
          change7d: marketInfo?.price_change_percentage_7d_in_currency || 0,
          volume24h: marketInfo?.total_volume || coin.data?.total_volume || 0,
          marketCap: marketInfo?.market_cap || coin.data?.market_cap || 0,
          rank: coin.market_cap_rank || marketInfo?.market_cap_rank || 999,
          logo: coin.thumb || coin.large || marketInfo?.image || '',
          category: 'rising',
          momentum: Math.min(100, (marketInfo?.price_change_percentage_24h || 0) * 5 + 50),
          volumeSpike: calculateVolumeSpike(marketInfo),
          socialScore: coin.score ? Math.min(100, coin.score * 10) : Math.random() * 40 + 40,
          volatility: calculateVolatility(marketInfo?.sparkline_in_7d?.price || []),
          liquidityScore: calculateLiquidityScore(marketInfo),
          sparkline: marketInfo?.sparkline_in_7d?.price?.slice(-24) || [],
          coingeckoId: coin.id,
        });
      }
    }

    // Find crashing tokens (biggest losers in last 24h)
    const losers = marketData
      .filter((coin: any) => coin.price_change_percentage_24h < -5)
      .sort((a: any, b: any) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 6);

    for (const coin of losers) {
      tokens.push({
        symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
        name: coin.name,
        price: coin.current_price || 0,
        change24h: coin.price_change_percentage_24h || 0,
        change7d: coin.price_change_percentage_7d_in_currency || 0,
        volume24h: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        rank: coin.market_cap_rank || 999,
        logo: coin.image || '',
        category: 'crashing',
        momentum: Math.max(0, 50 + (coin.price_change_percentage_24h || 0) * 3),
        volumeSpike: calculateVolumeSpike(coin),
        socialScore: Math.random() * 30 + 20,
        volatility: calculateVolatility(coin.sparkline_in_7d?.price || []),
        liquidityScore: calculateLiquidityScore(coin),
        sparkline: coin.sparkline_in_7d?.price?.slice(-24) || [],
        coingeckoId: coin.id,
      });
    }

    // Find new/hot coins (high volume spike, newer to top 100)
    const newHot = marketData
      .filter((coin: any) => {
        const volumeRatio = coin.total_volume / (coin.market_cap || 1);
        return volumeRatio > 0.15 && coin.price_change_percentage_24h > 0;
      })
      .sort((a: any, b: any) => {
        const ratioA = a.total_volume / (a.market_cap || 1);
        const ratioB = b.total_volume / (b.market_cap || 1);
        return ratioB - ratioA;
      })
      .slice(0, 6);

    for (const coin of newHot) {
      if (!tokens.find(t => t.coingeckoId === coin.id)) {
        tokens.push({
          symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
          name: coin.name,
          price: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0,
          change7d: coin.price_change_percentage_7d_in_currency || 0,
          volume24h: coin.total_volume || 0,
          marketCap: coin.market_cap || 0,
          rank: coin.market_cap_rank || 999,
          logo: coin.image || '',
          category: 'new',
          momentum: Math.min(100, 60 + (coin.price_change_percentage_24h || 0) * 2),
          volumeSpike: calculateVolumeSpike(coin),
          socialScore: Math.random() * 40 + 50,
          volatility: calculateVolatility(coin.sparkline_in_7d?.price || []),
          liquidityScore: calculateLiquidityScore(coin),
          sparkline: coin.sparkline_in_7d?.price?.slice(-24) || [],
          coingeckoId: coin.id,
        });
      }
    }

    // Find unusual activity (high volatility, abnormal volume)
    const unusual = marketData
      .filter((coin: any) => {
        const volatility = calculateVolatility(coin.sparkline_in_7d?.price || []);
        const volumeRatio = coin.total_volume / (coin.market_cap || 1);
        return volatility > 15 || volumeRatio > 0.25;
      })
      .sort((a: any, b: any) => {
        const volA = calculateVolatility(a.sparkline_in_7d?.price || []);
        const volB = calculateVolatility(b.sparkline_in_7d?.price || []);
        return volB - volA;
      })
      .slice(0, 6);

    for (const coin of unusual) {
      if (!tokens.find(t => t.coingeckoId === coin.id)) {
        tokens.push({
          symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
          name: coin.name,
          price: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0,
          change7d: coin.price_change_percentage_7d_in_currency || 0,
          volume24h: coin.total_volume || 0,
          marketCap: coin.market_cap || 0,
          rank: coin.market_cap_rank || 999,
          logo: coin.image || '',
          category: 'unusual',
          momentum: Math.abs(coin.price_change_percentage_24h || 0) * 3 + 30,
          volumeSpike: calculateVolumeSpike(coin),
          socialScore: Math.random() * 30 + 30,
          volatility: calculateVolatility(coin.sparkline_in_7d?.price || []),
          liquidityScore: calculateLiquidityScore(coin),
          sparkline: coin.sparkline_in_7d?.price?.slice(-24) || [],
          coingeckoId: coin.id,
        });
      }
    }

    console.log(`Returning ${tokens.length} discovery tokens`);

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

function calculateVolumeSpike(coin: any): number {
  if (!coin?.total_volume || !coin?.market_cap) return 50;
  const ratio = coin.total_volume / coin.market_cap;
  // Normal is ~0.05-0.1, high is >0.2
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
  if (!coin?.market_cap || !coin?.total_volume) return 50;
  // Higher market cap and volume = better liquidity
  const mcScore = Math.min(50, Math.log10(coin.market_cap) * 5);
  const volScore = Math.min(50, Math.log10(coin.total_volume) * 5);
  return mcScore + volScore;
}
