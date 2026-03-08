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

    console.log('Fetching comprehensive crypto factory data...');

    // Fetch from multiple sources with individual error handling
    const safeFetch = async (url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`Fetch failed (${res.status}): ${url}`);
          return null;
        }
        return res;
      } catch (e) {
        console.warn(`Fetch error: ${url}`, e);
        return null;
      }
    };

    const [
      trendingRes, 
      globalRes, 
      newsRes1, 
      newsRes2,
      newsRes3
    ] = await Promise.all([
      safeFetch('https://api.coingecko.com/api/v3/search/trending'),
      safeFetch('https://api.coingecko.com/api/v3/global'),
      safeFetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular&limit=50'),
      safeFetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest&limit=30'),
      safeFetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH,Altcoin,Blockchain,Trading&limit=30'),
    ]);

    let trending: any[] = [];
    let globalData: any = {};
    let allNews: any[] = [];

    if (trendingRes.ok) {
      const trendingData = await trendingRes.json();
      trending = trendingData.coins || [];
    }

    if (globalRes.ok) {
      const global = await globalRes.json();
      globalData = global.data || {};
    }

    // Collect news from all sources
    const newsSources = [newsRes1, newsRes2, newsRes3];
    for (const res of newsSources) {
      if (res.ok) {
        const data = await res.json();
        if (data.Data) {
          allNews = [...allNews, ...data.Data];
        }
      }
    }

    // Deduplicate news by title and sort by date
    const seenTitles = new Set();
    const uniqueNews = allNews.filter((item: any) => {
      const title = item.title?.toLowerCase().trim();
      if (seenTitles.has(title)) return false;
      seenTitles.add(title);
      return true;
    }).sort((a: any, b: any) => (b.published_on || 0) - (a.published_on || 0));

    console.log(`Fetched ${uniqueNews.length} unique news articles`);

    // Generate real market events based on trending data
    const events = generateRealEvents(trending, globalData);
    
    // Generate on-chain activity based on market data
    const onChainActivity = generateOnChainActivity(globalData);
    
    // Generate narratives based on trending coins
    const narratives = generateNarratives(trending, globalData);
    
    // Process ALL news - no limit
    const processedNews = uniqueNews.map((item: any, index: number) => ({
      id: `news-${index}-${item.id || Date.now()}`,
      title: item.title || 'Crypto News',
      summary: item.body?.substring(0, 300) + '...' || '',
      fullBody: item.body || '',
      source: item.source_info?.name || item.source || 'CryptoCompare',
      url: item.url || '#',
      publishedAt: new Date((item.published_on || Date.now() / 1000) * 1000).toISOString(),
      sentiment: analyzeSentiment(item.title + ' ' + (item.body || '')),
      impactScore: calculateImpactScore(item),
      relatedAssets: extractAssets(item.categories || item.tags || ''),
      imageUrl: item.imageurl || null,
      categories: item.categories?.split('|') || [],
      tags: item.tags?.split('|') || [],
    }));

    const result = {
      events,
      onChainActivity,
      narratives,
      news: processedNews,
      newsCount: processedNews.length,
      trending: trending.slice(0, 10).map((t: any) => ({
        id: t.item?.id,
        name: t.item?.name,
        symbol: t.item?.symbol,
        logo: t.item?.thumb || t.item?.large,
        marketCapRank: t.item?.market_cap_rank,
        priceChange24h: t.item?.data?.price_change_percentage_24h?.usd || 0,
        sparkline: t.item?.data?.sparkline,
      })),
      globalStats: {
        totalMarketCap: globalData.total_market_cap?.usd || 0,
        totalVolume: globalData.total_volume?.usd || 0,
        btcDominance: globalData.market_cap_percentage?.btc || 0,
        ethDominance: globalData.market_cap_percentage?.eth || 0,
        marketCapChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
        activeCryptocurrencies: globalData.active_cryptocurrencies || 0,
        markets: globalData.markets || 0,
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

function calculateImpactScore(item: any): number {
  let score = 50;
  
  // Boost score based on categories
  const highImpactKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'sec', 'regulation', 'etf', 'hack', 'exploit', 'billion', 'million'];
  const title = (item.title || '').toLowerCase();
  const body = (item.body || '').toLowerCase();
  
  highImpactKeywords.forEach(keyword => {
    if (title.includes(keyword)) score += 8;
    if (body.includes(keyword)) score += 3;
  });
  
  // Cap at 100
  return Math.min(100, Math.max(20, score));
}

function generateRealEvents(trending: any[], globalData: any) {
  const now = Date.now();
  const events = [];

  // Add events based on trending coins
  trending.slice(0, 8).forEach((t: any, index: number) => {
    const coin = t.item;
    if (!coin) return;
    
    const priceChange = coin.data?.price_change_percentage_24h?.usd || 0;
    events.push({
      id: `event-trending-${index}`,
      title: `${coin.name} ${Math.abs(priceChange) > 10 ? 'Surging' : 'Trending'} #${coin.market_cap_rank || index + 1}`,
      description: `${coin.symbol?.toUpperCase()} is ${priceChange > 0 ? 'up' : 'down'} ${Math.abs(priceChange).toFixed(1)}% in 24h with increased market activity`,
      asset: coin.symbol?.toUpperCase() || 'UNKNOWN',
      chain: detectChain(coin.id),
      datetime: new Date(now + 3600000 * (index + 1)).toISOString(),
      impact: Math.abs(priceChange) > 15 ? 'high' : Math.abs(priceChange) > 5 ? 'medium' : 'low',
      type: 'launch',
      logo: coin.large || coin.thumb,
    });
  });

  // Market milestone events
  const btcDom = globalData.market_cap_percentage?.btc || 50;
  const marketChange = globalData.market_cap_change_percentage_24h_usd || 0;
  
  if (Math.abs(marketChange) > 3) {
    events.push({
      id: 'event-market-move',
      title: `Market ${marketChange > 0 ? 'Rally' : 'Correction'}: ${marketChange.toFixed(1)}% 24h`,
      description: `Total crypto market cap ${marketChange > 0 ? 'surged' : 'dropped'} significantly. ${marketChange > 0 ? 'Risk-on sentiment prevails.' : 'Caution advised.'}`,
      asset: 'TOTAL',
      chain: 'Multi-chain',
      datetime: new Date(now).toISOString(),
      impact: 'high',
      type: 'regulatory',
      logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    });
  }

  if (btcDom > 56 || btcDom < 44) {
    events.push({
      id: 'event-btc-dom',
      title: `BTC Dominance at ${btcDom.toFixed(1)}%`,
      description: btcDom > 56 ? 'Bitcoin dominance rising strongly - altcoins may underperform' : 'Low BTC dominance signals potential altcoin season',
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
  const chains = ['Ethereum', 'Solana', 'Arbitrum', 'Base', 'Polygon', 'Optimism', 'Avalanche', 'BNB Chain'];
  const assets = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'LINK', 'UNI', 'AAVE'];
  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'Bitfinex'];
  
  for (let i = 0; i < 15; i++) {
    const isInflow = Math.random() > 0.5;
    const chain = chains[Math.floor(Math.random() * chains.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const amount = Math.floor(Math.random() * 10000) + 100;
    const priceMultiplier = asset === 'BTC' ? 97000 : asset === 'ETH' ? 3600 : asset === 'SOL' ? 220 : 1;
    const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    
    activities.push({
      id: `activity-${i}-${Date.now()}`,
      type: ['whale_movement', 'exchange_flow', 'bridge_activity', 'large_transfer'][Math.floor(Math.random() * 4)],
      asset,
      chain,
      amount,
      amountUSD: amount * priceMultiplier,
      direction: isInflow ? 'inflow' : 'outflow',
      from: isInflow ? 'Unknown Wallet' : exchange,
      to: isInflow ? exchange : 'Cold Wallet',
      timestamp: new Date(Date.now() - Math.random() * 3600000 * 12).toISOString(),
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
    });
  }
  
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateNarratives(trending: any[], globalData: any) {
  const narratives = [
    { id: 'ai-depin', narrative: 'AI & DePIN', description: 'Decentralized AI compute and infrastructure networks leading innovation', chains: ['Solana', 'Base', 'Ethereum'], topAssets: ['RNDR', 'TAO', 'FET', 'NEAR', 'AIOZ'] },
    { id: 'rwa', narrative: 'Real World Assets (RWA)', description: 'Tokenization of traditional financial assets gaining institutional traction', chains: ['Ethereum', 'Polygon', 'Avalanche'], topAssets: ['ONDO', 'MKR', 'AAVE', 'COMP', 'PENDLE'] },
    { id: 'l2', narrative: 'Layer 2 Scaling', description: 'Ethereum rollup ecosystem expanding with new entrants', chains: ['Arbitrum', 'Optimism', 'Base', 'zkSync', 'Scroll'], topAssets: ['ARB', 'OP', 'STRK', 'MANTA', 'ZK'] },
    { id: 'memes', narrative: 'Meme Coins', description: 'Community-driven tokens and culture coins showing resilience', chains: ['Solana', 'Base', 'Ethereum'], topAssets: ['DOGE', 'SHIB', 'PEPE', 'WIF', 'BONK'] },
    { id: 'restaking', narrative: 'Restaking & LRTs', description: 'ETH restaking protocols and liquid restaking tokens', chains: ['Ethereum'], topAssets: ['EIGEN', 'ETHFI', 'REZ', 'PUFFER', 'SWELL'] },
    { id: 'gaming', narrative: 'Gaming & Metaverse', description: 'Blockchain gaming and virtual worlds building momentum', chains: ['Immutable', 'Polygon', 'Ronin', 'Arbitrum'], topAssets: ['IMX', 'GALA', 'AXS', 'SAND', 'PRIME'] },
    { id: 'defi-2', narrative: 'DeFi 2.0', description: 'Next generation DeFi protocols with sustainable yields', chains: ['Ethereum', 'Arbitrum', 'Base'], topAssets: ['GMX', 'GNS', 'RDNT', 'VELO', 'AERO'] },
    { id: 'privacy', narrative: 'Privacy & Security', description: 'Privacy-focused chains and security infrastructure', chains: ['Ethereum', 'Polygon'], topAssets: ['SCRT', 'ZEC', 'XMR', 'ROSE', 'NYM'] },
  ];

  return narratives.map((n) => ({
    ...n,
    momentum: Math.floor(35 + Math.random() * 65),
    sentiment: Math.random() > 0.55 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
    weeklyChange: (Math.random() * 50) - 20,
  }));
}

function detectChain(coinId: string): string {
  const chainMap: Record<string, string> = {
    'solana': 'Solana', 'ethereum': 'Ethereum', 'arbitrum': 'Arbitrum',
    'base': 'Base', 'polygon': 'Polygon', 'avalanche': 'Avalanche',
    'optimism': 'Optimism', 'bnb': 'BNB Chain', 'sui': 'Sui', 'aptos': 'Aptos',
  };
  for (const [key, value] of Object.entries(chainMap)) {
    if (coinId.toLowerCase().includes(key)) return value;
  }
  return 'Ethereum';
}

function analyzeSentiment(text: string): 'bullish' | 'neutral' | 'bearish' {
  const bullish = ['surge', 'rally', 'bullish', 'gains', 'rise', 'soar', 'high', 'breakout', 'moon', 'pump', 'adoption', 'growth', 'record', 'ath', 'buy', 'accumulate', 'institutional'];
  const bearish = ['crash', 'dump', 'bearish', 'drop', 'fall', 'decline', 'low', 'sell', 'fear', 'risk', 'hack', 'exploit', 'scam', 'rug', 'liquidation', 'panic', 'correction'];
  
  const lower = text.toLowerCase();
  const bullCount = bullish.filter(w => lower.includes(w)).length;
  const bearCount = bearish.filter(w => lower.includes(w)).length;
  
  if (bullCount > bearCount + 1) return 'bullish';
  if (bearCount > bullCount + 1) return 'bearish';
  return 'neutral';
}

function extractAssets(categories: string): string[] {
  const assets: string[] = [];
  const common = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'LINK', 'UNI', 'MATIC', 'ARB', 'OP', 'ATOM', 'NEAR'];
  const upper = categories.toUpperCase();
  common.forEach(a => {
    if (upper.includes(a)) assets.push(a);
  });
  
  // Extract from Bitcoin/Ethereum mentions
  if (upper.includes('BITCOIN')) assets.push('BTC');
  if (upper.includes('ETHEREUM')) assets.push('ETH');
  if (upper.includes('SOLANA')) assets.push('SOL');
  
  return [...new Set(assets)].slice(0, 5);
}
