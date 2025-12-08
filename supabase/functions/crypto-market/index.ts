import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching global market data...');

    // Fetch global market data
    const globalResponse = await fetch(
      'https://api.coingecko.com/api/v3/global',
      { headers: { 'Accept': 'application/json' } }
    );

    if (!globalResponse.ok) {
      throw new Error(`CoinGecko global API error: ${globalResponse.status}`);
    }

    const globalData = await globalResponse.json();
    console.log('Global data fetched');

    // Fetch fear & greed index from alternative.me
    let fearGreedIndex = 50;
    try {
      const fgResponse = await fetch('https://api.alternative.me/fng/?limit=1');
      if (fgResponse.ok) {
        const fgData = await fgResponse.json();
        fearGreedIndex = parseInt(fgData.data?.[0]?.value || '50');
        console.log('Fear & Greed Index:', fearGreedIndex);
      }
    } catch (e) {
      console.log('Could not fetch fear & greed, using default');
    }

    // Fetch trending coins
    let trending: any[] = [];
    try {
      const trendingResponse = await fetch(
        'https://api.coingecko.com/api/v3/search/trending',
        { headers: { 'Accept': 'application/json' } }
      );
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        trending = trendingData.coins?.slice(0, 5).map((coin: any) => ({
          symbol: coin.item.symbol.toUpperCase(),
          name: coin.item.name,
          rank: coin.item.market_cap_rank,
          priceChange: coin.item.data?.price_change_percentage_24h?.usd || 0,
        })) || [];
        console.log('Trending coins:', trending.length);
      }
    } catch (e) {
      console.log('Could not fetch trending');
    }

    // Fetch top gainers/losers
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
        console.log('Top coins fetched:', topCoins.length);
      }
    } catch (e) {
      console.log('Could not fetch markets');
    }

    const result = {
      global: {
        totalMarketCap: globalData.data?.total_market_cap?.usd || 0,
        totalVolume24h: globalData.data?.total_volume?.usd || 0,
        btcDominance: globalData.data?.market_cap_percentage?.btc || 0,
        ethDominance: globalData.data?.market_cap_percentage?.eth || 0,
        activeCryptocurrencies: globalData.data?.active_cryptocurrencies || 0,
        marketCapChange24h: globalData.data?.market_cap_change_percentage_24h_usd || 0,
      },
      fearGreedIndex,
      trending,
      topCoins,
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching market data:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
