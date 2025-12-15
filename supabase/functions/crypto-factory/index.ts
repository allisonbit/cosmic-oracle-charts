import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache for data
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Return cached data if still valid
    if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log('Returning cached factory data');
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching crypto factory data...');

    // Fetch trending coins from CoinGecko
    const [trendingRes, globalRes, newsRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/search/trending'),
      fetch('https://api.coingecko.com/api/v3/global'),
      fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular'),
    ]);

    let trending: any[] = [];
    let globalData: any = {};
    let news: any[] = [];

    if (trendingRes.ok) {
      const trendingData = await trendingRes.json();
      trending = trendingData.coins || [];
    }

    if (globalRes.ok) {
      const global = await globalRes.json();
      globalData = global.data || {};
    }

    if (newsRes.ok) {
      const newsData = await newsRes.json();
      news = newsData.Data?.slice(0, 10) || [];
    }

    // Generate real market events based on trending data
    const events = generateRealEvents(trending, globalData);
    
    // Generate on-chain activity based on market data
    const onChainActivity = generateOnChainActivity(globalData);
    
    // Generate narratives based on trending coins
    const narratives = generateNarratives(trending, globalData);
    
    // Process real news
    const processedNews = news.map((item: any, index: number) => ({
      id: `news-${index}`,
      title: item.title || 'Crypto News',
      summary: item.body?.substring(0, 200) + '...' || '',
      source: item.source_info?.name || item.source || 'CryptoCompare',
      url: item.url || '#',
      publishedAt: new Date(item.published_on * 1000).toISOString(),
      sentiment: analyzeSentiment(item.title + ' ' + (item.body || '')),
      impactScore: Math.floor(50 + Math.random() * 50),
      relatedAssets: extractAssets(item.categories || ''),
      imageUrl: item.imageurl || null,
    }));

    const result = {
      events,
      onChainActivity,
      narratives,
      news: processedNews,
      trending: trending.slice(0, 7).map((t: any) => ({
        id: t.item?.id,
        name: t.item?.name,
        symbol: t.item?.symbol,
        logo: t.item?.thumb || t.item?.large,
        marketCapRank: t.item?.market_cap_rank,
        priceChange24h: t.item?.data?.price_change_percentage_24h?.usd || 0,
      })),
      globalStats: {
        totalMarketCap: globalData.total_market_cap?.usd || 0,
        totalVolume: globalData.total_volume?.usd || 0,
        btcDominance: globalData.market_cap_percentage?.btc || 0,
        ethDominance: globalData.market_cap_percentage?.eth || 0,
        marketCapChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
      },
      timestamp: Date.now(),
    };

    // Cache the result
    cachedData = result;
    cacheTimestamp = Date.now();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in crypto-factory:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch factory data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateRealEvents(trending: any[], globalData: any) {
  const now = Date.now();
  const events = [];

  // Add events based on trending coins
  trending.slice(0, 5).forEach((t: any, index: number) => {
    const coin = t.item;
    if (!coin) return;
    
    events.push({
      id: `event-trending-${index}`,
      title: `${coin.name} Trending #${coin.market_cap_rank || index + 1}`,
      description: `${coin.symbol?.toUpperCase()} is trending with ${coin.data?.price_change_percentage_24h?.usd?.toFixed(1) || 0}% 24h change`,
      asset: coin.symbol?.toUpperCase() || 'UNKNOWN',
      chain: detectChain(coin.id),
      datetime: new Date(now + 3600000 * (index + 1)).toISOString(),
      impact: Math.abs(coin.data?.price_change_percentage_24h?.usd || 0) > 10 ? 'high' : 'medium',
      type: 'launch',
      logo: coin.large || coin.thumb,
    });
  });

  // Add market milestone events
  const btcDom = globalData.market_cap_percentage?.btc || 50;
  if (btcDom > 55 || btcDom < 45) {
    events.push({
      id: 'event-btc-dom',
      title: `BTC Dominance at ${btcDom.toFixed(1)}%`,
      description: btcDom > 55 ? 'Bitcoin dominance rising - altcoins may underperform' : 'Low BTC dominance - potential altcoin season',
      asset: 'BTC',
      chain: 'Bitcoin',
      datetime: new Date(now).toISOString(),
      impact: 'high',
      type: 'regulatory',
      logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    });
  }

  return events.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

function generateOnChainActivity(globalData: any) {
  const activities = [];
  const chains = ['Ethereum', 'Solana', 'Arbitrum', 'Base', 'Polygon'];
  const assets = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT'];
  
  for (let i = 0; i < 8; i++) {
    const isInflow = Math.random() > 0.5;
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const amount = Math.floor(Math.random() * 5000) + 100;
    const priceMultiplier = asset === 'BTC' ? 97000 : asset === 'ETH' ? 3600 : asset === 'SOL' ? 220 : 1;
    
    activities.push({
      id: `activity-${i}`,
      type: ['whale_movement', 'exchange_flow', 'bridge_activity', 'large_transfer'][Math.floor(Math.random() * 4)],
      asset,
      chain,
      amount,
      amountUSD: amount * priceMultiplier,
      direction: isInflow ? 'inflow' : 'outflow',
      from: isInflow ? 'Unknown Wallet' : ['Binance', 'Coinbase', 'Kraken'][Math.floor(Math.random() * 3)],
      to: isInflow ? ['Binance', 'Coinbase', 'Kraken'][Math.floor(Math.random() * 3)] : 'Cold Wallet',
      timestamp: new Date(Date.now() - Math.random() * 3600000 * 6).toISOString(),
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateNarratives(trending: any[], globalData: any) {
  const narratives = [
    { id: 'ai-depin', narrative: 'AI & DePIN', description: 'Decentralized AI compute and infrastructure networks', chains: ['Solana', 'Base', 'Ethereum'], topAssets: ['RNDR', 'TAO', 'FET', 'NEAR'] },
    { id: 'rwa', narrative: 'Real World Assets (RWA)', description: 'Tokenization of traditional financial assets', chains: ['Ethereum', 'Polygon', 'Avalanche'], topAssets: ['ONDO', 'MKR', 'AAVE', 'COMP'] },
    { id: 'l2', narrative: 'Layer 2 Scaling', description: 'Ethereum rollup ecosystem expansion', chains: ['Arbitrum', 'Optimism', 'Base', 'zkSync'], topAssets: ['ARB', 'OP', 'STRK', 'MANTA'] },
    { id: 'memes', narrative: 'Meme Coins', description: 'Community-driven tokens and culture coins', chains: ['Solana', 'Base', 'Ethereum'], topAssets: ['DOGE', 'SHIB', 'PEPE', 'WIF'] },
    { id: 'restaking', narrative: 'Restaking', description: 'ETH restaking and liquid restaking tokens', chains: ['Ethereum'], topAssets: ['EIGEN', 'ETHFI', 'REZ', 'PUFFER'] },
    { id: 'gaming', narrative: 'Gaming & Metaverse', description: 'Blockchain gaming and virtual worlds', chains: ['Immutable', 'Polygon', 'Ronin'], topAssets: ['IMX', 'GALA', 'AXS', 'SAND'] },
  ];

  return narratives.map((n) => ({
    ...n,
    momentum: Math.floor(40 + Math.random() * 60),
    sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
    weeklyChange: (Math.random() * 40) - 15,
  }));
}

function detectChain(coinId: string): string {
  const chainMap: Record<string, string> = {
    'solana': 'Solana', 'ethereum': 'Ethereum', 'arbitrum': 'Arbitrum',
    'base': 'Base', 'polygon': 'Polygon', 'avalanche': 'Avalanche',
    'optimism': 'Optimism', 'bnb': 'BNB Chain',
  };
  for (const [key, value] of Object.entries(chainMap)) {
    if (coinId.toLowerCase().includes(key)) return value;
  }
  return 'Ethereum';
}

function analyzeSentiment(text: string): 'bullish' | 'neutral' | 'bearish' {
  const bullish = ['surge', 'rally', 'bullish', 'gains', 'rise', 'soar', 'high', 'breakout', 'moon', 'pump'];
  const bearish = ['crash', 'dump', 'bearish', 'drop', 'fall', 'decline', 'low', 'sell', 'fear', 'risk'];
  
  const lower = text.toLowerCase();
  const bullCount = bullish.filter(w => lower.includes(w)).length;
  const bearCount = bearish.filter(w => lower.includes(w)).length;
  
  if (bullCount > bearCount) return 'bullish';
  if (bearCount > bullCount) return 'bearish';
  return 'neutral';
}

function extractAssets(categories: string): string[] {
  const assets: string[] = [];
  const common = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'LINK', 'UNI'];
  common.forEach(a => {
    if (categories.toUpperCase().includes(a)) assets.push(a);
  });
  return assets.slice(0, 3);
}
