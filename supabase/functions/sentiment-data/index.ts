const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function safeFetch(url: string, timeout = 8000): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`Fetch failed for ${url}:`, e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch all data sources in parallel
    const [newsData, trendingData, fearGreedData, globalData, topCoinsData] = await Promise.all([
      // CryptoCompare latest news
      safeFetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest'),
      // CoinGecko trending
      safeFetch('https://api.coingecko.com/api/v3/search/trending'),
      // Fear & Greed Index
      safeFetch('https://api.alternative.me/fng/?limit=7&format=json'),
      // Global market data
      safeFetch('https://api.coingecko.com/api/v3/global'),
      // Top coins for dev activity correlation
      safeFetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false'),
    ]);

    // Process real news
    const news = (newsData?.Data || []).slice(0, 15).map((article: any) => {
      const sentiment = analyzeSentiment(article.title + ' ' + (article.body || ''));
      return {
        title: article.title,
        source: article.source_info?.name || article.source || 'Unknown',
        url: article.url || article.guid || '#',
        imageUrl: article.imageurl || null,
        publishedAt: article.published_on ? article.published_on * 1000 : Date.now(),
        categories: article.categories || '',
        sentiment,
        body: (article.body || '').slice(0, 200),
      };
    });

    // Process trending coins
    const trending = (trendingData?.coins || []).slice(0, 10).map((item: any) => ({
      id: item.item?.id || '',
      name: item.item?.name || '',
      symbol: item.item?.symbol || '',
      thumb: item.item?.thumb || '',
      large: item.item?.large || '',
      marketCapRank: item.item?.market_cap_rank || 0,
      priceBtc: item.item?.price_btc || 0,
      score: item.item?.score || 0,
      slug: item.item?.slug || '',
    }));

    // Process Fear & Greed history
    const fearGreed = (fearGreedData?.data || []).map((entry: any) => ({
      value: parseInt(entry.value),
      classification: entry.value_classification,
      timestamp: parseInt(entry.timestamp) * 1000,
    }));

    // Process global data
    const global = globalData?.data ? {
      totalMarketCap: globalData.data.total_market_cap?.usd || 0,
      totalVolume: globalData.data.total_volume?.usd || 0,
      btcDominance: globalData.data.market_cap_percentage?.btc || 0,
      ethDominance: globalData.data.market_cap_percentage?.eth || 0,
      activeCryptos: globalData.data.active_cryptocurrencies || 0,
      marketCapChange24h: globalData.data.market_cap_change_percentage_24h_usd || 0,
    } : null;

    // Process top coins for social/dev metrics
    const topCoins = (topCoinsData || []).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol?.toUpperCase(),
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      high24h: coin.high_24h || 0,
      low24h: coin.low_24h || 0,
      ath: coin.ath || 0,
      athChangePercentage: coin.ath_change_percentage || 0,
      circulatingSupply: coin.circulating_supply || 0,
      totalSupply: coin.total_supply || 0,
    }));

    // Trending NFTs from CoinGecko
    const trendingNfts = (trendingData?.nfts || []).slice(0, 5).map((nft: any) => ({
      name: nft.name || '',
      symbol: nft.symbol || '',
      thumb: nft.thumb || '',
      floorPrice: nft.data?.floor_price || '',
      change24h: nft.data?.floor_price_in_usd_24h_percentage_change || 0,
    }));

    // Trending categories
    const trendingCategories = (trendingData?.categories || []).slice(0, 5).map((cat: any) => ({
      name: cat.name || '',
      marketCap: cat.data?.market_cap || 0,
      marketCapChange24h: cat.data?.market_cap_change_percentage_24h?.usd || 0,
      volume: cat.data?.total_volume || 0,
      coinsCount: cat.data?.coins_count || 0,
    }));

    return new Response(JSON.stringify({
      news,
      trending,
      trendingNfts,
      trendingCategories,
      fearGreed,
      global,
      topCoins,
      lastUpdated: new Date().toISOString(),
      source: 'live',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sentiment data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch sentiment data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();
  const positiveWords = ['surge', 'rally', 'bullish', 'soar', 'gain', 'high', 'record', 'growth', 'adoption', 'partnership', 'upgrade', 'launch', 'milestone', 'breakthrough', 'approval', 'inflow', 'accumulate', 'outperform', 'boom'];
  const negativeWords = ['crash', 'drop', 'bearish', 'plunge', 'decline', 'hack', 'scam', 'fraud', 'lawsuit', 'ban', 'warning', 'risk', 'loss', 'sell-off', 'dump', 'investigation', 'penalty', 'delay', 'reject', 'concern'];
  
  const posCount = positiveWords.filter(w => lower.includes(w)).length;
  const negCount = negativeWords.filter(w => lower.includes(w)).length;
  
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}
