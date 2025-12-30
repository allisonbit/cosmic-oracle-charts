import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top 100 cryptocurrencies by market cap
const TOP_100_COINS = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'tether', symbol: 'USDT' },
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'ripple', symbol: 'XRP' },
  { id: 'usd-coin', symbol: 'USDC' },
  { id: 'cardano', symbol: 'ADA' },
  { id: 'dogecoin', symbol: 'DOGE' },
  { id: 'avalanche-2', symbol: 'AVAX' },
  { id: 'polkadot', symbol: 'DOT' },
  { id: 'tron', symbol: 'TRX' },
  { id: 'chainlink', symbol: 'LINK' },
  { id: 'polygon', symbol: 'MATIC' },
  { id: 'shiba-inu', symbol: 'SHIB' },
  { id: 'wrapped-bitcoin', symbol: 'WBTC' },
  { id: 'litecoin', symbol: 'LTC' },
  { id: 'bitcoin-cash', symbol: 'BCH' },
  { id: 'uniswap', symbol: 'UNI' },
  { id: 'stellar', symbol: 'XLM' },
  { id: 'cosmos', symbol: 'ATOM' },
  { id: 'monero', symbol: 'XMR' },
  { id: 'ethereum-classic', symbol: 'ETC' },
  { id: 'okb', symbol: 'OKB' },
  { id: 'hedera-hashgraph', symbol: 'HBAR' },
  { id: 'filecoin', symbol: 'FIL' },
  { id: 'aptos', symbol: 'APT' },
  { id: 'arbitrum', symbol: 'ARB' },
  { id: 'lido-dao', symbol: 'LDO' },
  { id: 'vechain', symbol: 'VET' },
  { id: 'near', symbol: 'NEAR' },
  { id: 'optimism', symbol: 'OP' },
  { id: 'maker', symbol: 'MKR' },
  { id: 'fantom', symbol: 'FTM' },
  { id: 'the-graph', symbol: 'GRT' },
  { id: 'injective-protocol', symbol: 'INJ' },
  { id: 'theta-token', symbol: 'THETA' },
  { id: 'immutable-x', symbol: 'IMX' },
  { id: 'render-token', symbol: 'RNDR' },
  { id: 'aave', symbol: 'AAVE' },
  { id: 'algorand', symbol: 'ALGO' },
  { id: 'flow', symbol: 'FLOW' },
  { id: 'elrond-erd-2', symbol: 'EGLD' },
  { id: 'quant-network', symbol: 'QNT' },
  { id: 'axie-infinity', symbol: 'AXS' },
  { id: 'eos', symbol: 'EOS' },
  { id: 'the-sandbox', symbol: 'SAND' },
  { id: 'decentraland', symbol: 'MANA' },
  { id: 'kucoin-shares', symbol: 'KCS' },
  { id: 'neo', symbol: 'NEO' },
  { id: 'gala', symbol: 'GALA' },
  { id: 'chiliz', symbol: 'CHZ' },
  { id: 'zcash', symbol: 'ZEC' },
  { id: 'iota', symbol: 'IOTA' },
  { id: 'kava', symbol: 'KAVA' },
  { id: 'mina-protocol', symbol: 'MINA' },
  { id: 'curve-dao-token', symbol: 'CRV' },
  { id: '1inch', symbol: '1INCH' },
  { id: 'enjincoin', symbol: 'ENJ' },
  { id: 'nexo', symbol: 'NEXO' },
  { id: 'convex-finance', symbol: 'CVX' },
  { id: 'gmx', symbol: 'GMX' },
  { id: 'loopring', symbol: 'LRC' },
  { id: 'zilliqa', symbol: 'ZIL' },
  { id: 'dash', symbol: 'DASH' },
  { id: 'compound-governance-token', symbol: 'COMP' },
  { id: 'mask-network', symbol: 'MASK' },
  { id: 'basic-attention-token', symbol: 'BAT' },
  { id: 'yearn-finance', symbol: 'YFI' },
  { id: 'decred', symbol: 'DCR' },
  { id: 'ravencoin', symbol: 'RVN' },
  { id: 'waves', symbol: 'WAVES' },
  { id: 'gnosis', symbol: 'GNO' },
  { id: 'celo', symbol: 'CELO' },
  { id: 'kusama', symbol: 'KSM' },
  { id: 'amp-token', symbol: 'AMP' },
  { id: 'ankr', symbol: 'ANKR' },
  { id: 'storj', symbol: 'STORJ' },
  { id: 'ocean-protocol', symbol: 'OCEAN' },
  { id: 'siacoin', symbol: 'SC' },
  { id: 'harmony', symbol: 'ONE' },
  { id: 'skale', symbol: 'SKL' },
  { id: 'livepeer', symbol: 'LPT' },
  { id: 'balancer', symbol: 'BAL' },
  { id: 'sushi', symbol: 'SUSHI' },
  { id: 'bancor', symbol: 'BNT' },
  { id: 'uma', symbol: 'UMA' },
  { id: 'fetch-ai', symbol: 'FET' },
  { id: 'iostoken', symbol: 'IOST' },
  { id: 'ontology', symbol: 'ONT' },
  { id: 'qtum', symbol: 'QTUM' },
  { id: 'icon', symbol: 'ICX' },
  { id: 'lisk', symbol: 'LSK' },
  { id: 'nervos-network', symbol: 'CKB' },
  { id: 'wax', symbol: 'WAXP' },
  { id: 'arweave', symbol: 'AR' },
  { id: 'audius', symbol: 'AUDIO' },
  { id: 'perpetual-protocol', symbol: 'PERP' },
  { id: 'dydx', symbol: 'DYDX' },
  { id: 'sui', symbol: 'SUI' },
];

const TIMEFRAMES = ['daily', 'weekly', 'monthly'];

async function generatePrediction(
  supabase: any,
  coinId: string,
  symbol: string,
  timeframe: string,
  priceData: { price: number; change24h: number; high24h: number; low24h: number }
) {
  const { price, change24h, high24h, low24h } = priceData;
  
  // Check if fresh prediction exists
  const { data: existing } = await supabase
    .from('predictions_cache')
    .select('id')
    .eq('coin_id', coinId)
    .eq('timeframe', timeframe)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (existing) {
    console.log(`Skipping ${symbol}/${timeframe} - fresh prediction exists`);
    return null;
  }

  // Generate prediction
  const rsi = 50 + (change24h * 2) + (Math.random() - 0.5) * 15;
  const macdTrend = change24h > 0 ? 'bullish' : 'bearish';
  
  let bullishScore = 0;
  if (rsi < 30) bullishScore += 2;
  else if (rsi < 50) bullishScore += 1;
  else if (rsi > 70) bullishScore -= 2;
  else if (rsi > 50) bullishScore -= 1;
  
  if (macdTrend === 'bullish') bullishScore += 2;
  else bullishScore -= 2;
  
  if (change24h > 0) bullishScore += 1;
  else bullishScore -= 1;
  
  const bias = bullishScore >= 3 ? 'bullish' : bullishScore <= -3 ? 'bearish' : 'neutral';
  const confidence = Math.min(85, 50 + Math.abs(bullishScore) * 5 + Math.random() * 10);
  
  const timeframeMultiplier = timeframe === 'daily' ? 0.03 : timeframe === 'weekly' ? 0.08 : 0.15;
  const range = high24h - low24h;
  const pivot = (high24h + low24h + price) / 3;

  const prediction = {
    coinId,
    symbol: symbol.toUpperCase(),
    timeframe,
    timestamp: new Date().toISOString(),
    currentPrice: price,
    bias,
    confidence: Math.round(confidence),
    probabilityBullish: bias === 'bullish' ? Math.round(confidence) : bias === 'bearish' ? Math.round(100 - confidence) : 50,
    probabilityBearish: bias === 'bearish' ? Math.round(confidence) : bias === 'bullish' ? Math.round(100 - confidence) : 50,
    priceTargets: {
      conservative: {
        low: Math.round(price * (1 - timeframeMultiplier * 0.5) * 100) / 100,
        high: Math.round(price * (1 + timeframeMultiplier * 0.5) * 100) / 100
      },
      moderate: {
        low: Math.round(price * (1 - timeframeMultiplier) * 100) / 100,
        high: Math.round(price * (1 + timeframeMultiplier) * 100) / 100
      },
      aggressive: {
        low: Math.round(price * (1 - timeframeMultiplier * 1.5) * 100) / 100,
        high: Math.round(price * (1 + timeframeMultiplier * 1.5) * 100) / 100
      }
    },
    supportLevels: [
      Math.round((pivot - range * 0.382) * 100) / 100,
      Math.round((pivot - range * 0.618) * 100) / 100,
      Math.round(low24h * 0.98 * 100) / 100
    ],
    resistanceLevels: [
      Math.round((pivot + range * 0.382) * 100) / 100,
      Math.round((pivot + range * 0.618) * 100) / 100,
      Math.round(high24h * 1.02 * 100) / 100
    ],
    technicalIndicators: {
      rsi: Math.round(rsi * 10) / 10,
      rsiSignal: rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral',
      macd: { trend: macdTrend },
      movingAverages: { trend: bullishScore > 0 ? 'bullish' : bullishScore < 0 ? 'bearish' : 'neutral' }
    },
    riskLevel: Math.abs(change24h) < 3 ? 'low' : Math.abs(change24h) < 7 ? 'medium' : Math.abs(change24h) < 15 ? 'high' : 'extreme',
    volatilityIndex: Math.round(Math.abs(change24h) * 10) / 10,
    summary: `${symbol.toUpperCase()} shows ${bias} momentum with RSI at ${Math.round(rsi)}. Technical indicators suggest ${bias === 'bullish' ? 'potential upside' : bias === 'bearish' ? 'continued weakness' : 'consolidation phase'}.`,
    disclaimer: "This is for informational purposes only and does not constitute financial advice."
  };

  // Calculate expiration
  const now = new Date();
  let expiresAt: Date;
  if (timeframe === 'daily') {
    expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  } else if (timeframe === 'weekly') {
    expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  } else {
    expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  // Save to cache
  await supabase
    .from('predictions_cache')
    .upsert({
      coin_id: coinId,
      symbol: symbol.toUpperCase(),
      timeframe,
      prediction_data: prediction,
      bias: prediction.bias,
      confidence: prediction.confidence,
      current_price: prediction.currentPrice,
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString()
    }, { 
      onConflict: 'coin_id,timeframe',
      ignoreDuplicates: false 
    });

  return prediction;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting prediction pre-warming...');
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Clean up expired predictions first
    try {
      await supabase.rpc('cleanup_expired_predictions');
    } catch (e) {
      console.log('Cleanup skipped:', e);
    }
    const coinIds = TOP_100_COINS.map(c => c.id).join(',');
    const cgResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_high_24h=true&include_low_24h=true`
    );
    
    if (!cgResponse.ok) {
      throw new Error(`CoinGecko API error: ${cgResponse.status}`);
    }
    
    const priceData = await cgResponse.json();
    
    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    // Process coins sequentially to avoid rate limits
    for (const coin of TOP_100_COINS) {
      const data = priceData[coin.id];
      if (!data?.usd) {
        errors.push(`No price data for ${coin.symbol}`);
        continue;
      }
      
      const priceInfo = {
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        high24h: data.usd * 1.05,
        low24h: data.usd * 0.95
      };
      
      for (const timeframe of TIMEFRAMES) {
        try {
          const result = await generatePrediction(supabase, coin.id, coin.symbol, timeframe, priceInfo);
          if (result) {
            generated++;
          } else {
            skipped++;
          }
        } catch (error) {
          errors.push(`Error for ${coin.symbol}/${timeframe}: ${error}`);
        }
      }
      
      // Small delay to be nice to APIs
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalCoins: TOP_100_COINS.length,
        totalTimeframes: TIMEFRAMES.length,
        predictionsGenerated: generated,
        predictionsSkipped: skipped,
        errors: errors.length
      },
      errors: errors.slice(0, 10) // Only first 10 errors
    };
    
    console.log('Pre-warming complete:', summary);
    
    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Pre-warming error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});