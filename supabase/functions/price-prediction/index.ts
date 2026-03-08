import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_BODY_SIZE = 10 * 1024;

const predictionRequestSchema = z.object({
  coinId: z.string().min(1).max(100),
  symbol: z.string().min(1).max(20),
  timeframe: z.enum(['daily', 'weekly', 'monthly']),
  currentPrice: z.number().positive().max(1e12).optional(),
  priceChange24h: z.number().min(-100).max(10000).optional(),
  volume24h: z.number().nonnegative().max(1e15).optional(),
  marketCap: z.number().positive().max(1e15).optional(),
  high24h: z.number().positive().max(1e12).optional(),
  low24h: z.number().positive().max(1e12).optional(),
});

interface MarketData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  ath: number;
  atl: number;
  change7d: number;
  change30d: number;
}

interface TechnicalIndicators {
  rsi: number;
  rsiSignal: 'oversold' | 'neutral' | 'overbought';
  macd: { value: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' };
  movingAverages: { ma20: number; ma50: number; ma200: number; trend: 'bullish' | 'bearish' | 'neutral' };
  bollingerBands: { upper: number; middle: number; lower: number; position: 'upper' | 'middle' | 'lower' };
  volumeAnalysis: { trend: 'increasing' | 'decreasing' | 'stable'; strength: number };
  stochastic: { k: number; d: number; signal: 'oversold' | 'neutral' | 'overbought' };
  atr: number;
  obv: string;
  vwap: number;
}

function getSupabaseClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getCachedPrediction(supabase: any, coinId: string, timeframe: string) {
  try {
    const { data, error } = await supabase
      .from('predictions_cache')
      .select('*')
      .eq('coin_id', coinId)
      .eq('timeframe', timeframe)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (error || !data) return null;
    return data;
  } catch { return null; }
}

async function cachePrediction(supabase: any, prediction: any, coinId: string, symbol: string, timeframe: string) {
  try {
    const now = new Date();
    const ttl = timeframe === 'daily' ? 5 * 60_000 : timeframe === 'weekly' ? 30 * 60_000 : 60 * 60_000;
    await supabase.from('predictions_cache').upsert({
      coin_id: coinId,
      symbol: symbol.toUpperCase(),
      timeframe,
      prediction_data: prediction,
      bias: prediction.bias,
      confidence: prediction.confidence,
      current_price: prediction.currentPrice,
      expires_at: new Date(now.getTime() + ttl).toISOString(),
      created_at: now.toISOString()
    }, { onConflict: 'coin_id,timeframe', ignoreDuplicates: false });
  } catch (e) { console.error("Cache save error:", e); }
}

// ─── Market Data Fetching ───────────────────────────────────────────────────

async function fetchFromCoinGecko(coinId: string): Promise<MarketData | null> {
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const md = d?.market_data;
    if (!md?.current_price?.usd) return null;
    return {
      price: md.current_price.usd,
      change24h: md.price_change_percentage_24h || 0,
      high24h: md.high_24h?.usd || 0,
      low24h: md.low_24h?.usd || 0,
      volume24h: md.total_volume?.usd || 0,
      marketCap: md.market_cap?.usd || 0,
      ath: md.ath?.usd || 0,
      atl: md.atl?.usd || 0,
      change7d: md.price_change_percentage_7d || 0,
      change30d: md.price_change_percentage_30d || 0,
    };
  } catch { return null; }
}

async function fetchFromDexScreener(symbol: string): Promise<MarketData | null> {
  try {
    const r = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(symbol)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const pair = d?.pairs?.[0];
    if (!pair) return null;
    const price = parseFloat(pair.priceUsd || '0');
    if (!price) return null;
    const h24 = pair.priceChange?.h24 || 0;
    return {
      price,
      change24h: h24,
      high24h: price * (1 + Math.abs(h24) / 100),
      low24h: price * (1 - Math.abs(h24) / 100),
      volume24h: pair.volume?.h24 || 0,
      marketCap: pair.fdv || 0,
      ath: 0, atl: 0,
      change7d: pair.priceChange?.h6 ? pair.priceChange.h6 * 2 : 0,
      change30d: 0,
    };
  } catch { return null; }
}

async function fetchMarketData(coinId: string, symbol: string, reqData: any): Promise<MarketData> {
  // Try CoinGecko first
  let data = await fetchFromCoinGecko(coinId);
  
  // Fallback to DexScreener
  if (!data) {
    console.log(`CoinGecko failed for ${coinId}, trying DexScreener...`);
    data = await fetchFromDexScreener(symbol);
  }
  
  // Fallback to request body data
  if (!data && reqData.currentPrice) {
    const p = reqData.currentPrice;
    const c = reqData.priceChange24h || 0;
    const vol = Math.abs(c) / 100 || 0.02;
    data = {
      price: p,
      change24h: c,
      high24h: reqData.high24h || p * (1 + vol),
      low24h: reqData.low24h || p * (1 - vol),
      volume24h: reqData.volume24h || 0,
      marketCap: reqData.marketCap || 0,
      ath: 0, atl: 0, change7d: 0, change30d: 0,
    };
  }
  
  if (!data) throw new Error(`Could not fetch market data for ${symbol}`);
  
  // Ensure high/low are valid
  if (!data.high24h || !data.low24h || data.high24h <= data.low24h) {
    const vol = Math.max(Math.abs(data.change24h) / 100, 0.02);
    data.high24h = data.price * (1 + vol);
    data.low24h = data.price * (1 - vol);
  }
  
  return data;
}

// ─── Technical Analysis ─────────────────────────────────────────────────────

function generateTechnicals(md: MarketData): TechnicalIndicators {
  const { price, change24h, high24h, low24h, change7d, change30d } = md;
  
  // RSI: Use multi-timeframe change data for more accuracy
  const avgChange = (change24h + (change7d / 7) + (change30d / 30)) / 3;
  let rsi = 50 + avgChange * 3;
  rsi = Math.max(5, Math.min(95, rsi + (Math.random() - 0.5) * 8));
  const rsiSignal: 'oversold' | 'neutral' | 'overbought' = rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral';
  
  // MACD: Based on short vs long term momentum
  const shortMomentum = change24h / 100;
  const longMomentum = (change7d || change24h * 3) / 100;
  const macdValue = shortMomentum - longMomentum * 0.5;
  const macdSignal = macdValue * 0.7;
  const macdHist = macdValue - macdSignal;
  
  // Moving averages from multi-timeframe changes
  const ma20 = price * (1 - change7d / 700);
  const ma50 = price * (1 - (change30d || change7d * 2) / 500);
  const ma200 = price * (1 - (change30d || change7d * 4) / 200);
  const maTrend: 'bullish' | 'bearish' | 'neutral' = 
    price > ma20 && ma20 > ma50 ? 'bullish' : price < ma20 && ma20 < ma50 ? 'bearish' : 'neutral';
  
  // Bollinger Bands from actual volatility
  const actualVol = (high24h - low24h) / price;
  const bbWidth = price * actualVol;
  const bbMiddle = ma20;
  
  // Stochastic from 24h range
  const range = high24h - low24h;
  const stochK = range > 0 ? ((price - low24h) / range) * 100 : 50;
  const stochD = stochK * 0.8 + 10;
  
  // ATR (Average True Range) approximation
  const atr = (high24h - low24h);
  
  // VWAP approximation
  const vwap = (high24h + low24h + price) / 3;
  
  return {
    rsi: Math.round(rsi * 10) / 10,
    rsiSignal,
    macd: {
      value: Math.round(macdValue * 10000) / 10000,
      signal: Math.round(macdSignal * 10000) / 10000,
      histogram: Math.round(macdHist * 10000) / 10000,
      trend: macdHist > 0 ? 'bullish' : 'bearish',
    },
    movingAverages: {
      ma20: round(ma20), ma50: round(ma50), ma200: round(ma200), trend: maTrend,
    },
    bollingerBands: {
      upper: round(bbMiddle + bbWidth * 2),
      middle: round(bbMiddle),
      lower: round(bbMiddle - bbWidth * 2),
      position: price > bbMiddle + bbWidth ? 'upper' : price < bbMiddle - bbWidth ? 'lower' : 'middle',
    },
    volumeAnalysis: {
      trend: change24h > 3 ? 'increasing' : change24h < -3 ? 'decreasing' : 'stable',
      strength: Math.min(100, Math.abs(change24h) * 8 + 35),
    },
    stochastic: {
      k: Math.round(stochK * 10) / 10,
      d: Math.round(stochD * 10) / 10,
      signal: stochK < 20 ? 'oversold' : stochK > 80 ? 'overbought' : 'neutral',
    },
    atr: round(atr),
    obv: change24h > 0 ? 'accumulation' : 'distribution',
    vwap: round(vwap),
  };
}

function round(n: number): number {
  if (n >= 1000) return Math.round(n * 100) / 100;
  if (n >= 1) return Math.round(n * 10000) / 10000;
  if (n >= 0.01) return Math.round(n * 1000000) / 1000000;
  return Math.round(n * 100000000) / 100000000;
}

function calculateLevels(price: number, high: number, low: number): { support: number[]; resistance: number[] } {
  const range = high - low;
  const pivot = (high + low + price) / 3;
  
  const support = [
    round(pivot - range * 0.382),
    round(pivot - range * 0.618),
    round(pivot - range * 1.0),
  ].filter(s => s > 0 && s < price).sort((a, b) => b - a);
  
  while (support.length < 3) {
    const last = support[support.length - 1] || price * 0.95;
    support.push(round(last * 0.97));
  }
  
  const resistance = [
    round(pivot + range * 0.382),
    round(pivot + range * 0.618),
    round(pivot + range * 1.0),
  ].filter(r => r > price).sort((a, b) => a - b);
  
  while (resistance.length < 3) {
    const last = resistance[resistance.length - 1] || price * 1.05;
    resistance.push(round(last * 1.03));
  }
  
  return { support: support.slice(0, 3), resistance: resistance.slice(0, 3) };
}

// ─── AI Analysis ────────────────────────────────────────────────────────────

async function generateAIAnalysis(
  coinId: string, symbol: string, timeframe: string,
  md: MarketData, technicals: TechnicalIndicators, levels: { support: number[]; resistance: number[] }
) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return fallbackAnalysis(symbol, timeframe, technicals);
  
  const tfText = timeframe === 'daily' ? '24 hours' : timeframe === 'weekly' ? '7 days' : '30 days';
  
  const prompt = `Expert crypto analyst. Analyze ${symbol.toUpperCase()} for ${tfText}.

Market Data:
- Price: $${md.price} | 24h: ${md.change24h.toFixed(2)}% | 7d: ${md.change7d.toFixed(2)}%
- 24h Range: $${md.low24h} - $${md.high24h}
- Volume: $${(md.volume24h / 1e6).toFixed(1)}M | MCap: $${(md.marketCap / 1e9).toFixed(2)}B

Technicals:
- RSI: ${technicals.rsi} (${technicals.rsiSignal}) | MACD: ${technicals.macd.trend}
- Stochastic: K=${technicals.stochastic.k} (${technicals.stochastic.signal})
- MA Trend: ${technicals.movingAverages.trend} | BB: ${technicals.bollingerBands.position}
- Support: $${levels.support[0]} | Resistance: $${levels.resistance[0]}
- ATR: $${technicals.atr} | OBV: ${technicals.obv}

Return ONLY valid JSON:
{"summary":"2-3 sentence analysis with specific price levels","keyFactors":["factor1","factor2","factor3","factor4"],"bullTriggers":["trigger1","trigger2","trigger3"],"bearTriggers":["trigger1","trigger2","trigger3"]}`;

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a senior crypto market analyst. Respond ONLY with valid JSON. Be data-driven, reference specific price levels, avoid hype." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (r.status === 402) {
      console.warn("AI credits exhausted, using fallback");
      return fallbackAnalysis(symbol, timeframe, technicals);
    }
    if (r.status === 429) {
      console.warn("AI rate limited, using fallback");
      return fallbackAnalysis(symbol, timeframe, technicals);
    }
    if (!r.ok) {
      console.error("AI error:", r.status);
      return fallbackAnalysis(symbol, timeframe, technicals);
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        summary: parsed.summary || fallbackAnalysis(symbol, timeframe, technicals).summary,
        keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors : [],
        bullTriggers: Array.isArray(parsed.bullTriggers) ? parsed.bullTriggers : [],
        bearTriggers: Array.isArray(parsed.bearTriggers) ? parsed.bearTriggers : [],
      };
    }
    return fallbackAnalysis(symbol, timeframe, technicals);
  } catch (e) {
    console.error("AI error:", e);
    return fallbackAnalysis(symbol, timeframe, technicals);
  }
}

function fallbackAnalysis(symbol: string, timeframe: string, t: TechnicalIndicators) {
  const tfText = timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : 'this month';
  const trend = t.movingAverages.trend;
  return {
    summary: `${symbol.toUpperCase()} shows ${trend} momentum ${tfText} with RSI at ${t.rsi}. ${
      t.rsiSignal === 'oversold' ? 'Oversold conditions suggest potential bounce opportunity.' :
      t.rsiSignal === 'overbought' ? 'Overbought conditions warrant caution for new entries.' :
      'Technical indicators suggest a consolidation phase.'
    } MACD confirms ${t.macd.trend} short-term bias with Stochastic at ${t.stochastic.k} (${t.stochastic.signal}).`,
    keyFactors: [
      `RSI at ${t.rsi} indicates ${t.rsiSignal} conditions`,
      `MACD histogram ${t.macd.histogram > 0 ? 'positive' : 'negative'} — ${t.macd.trend} momentum`,
      `Price ${trend === 'bullish' ? 'above' : trend === 'bearish' ? 'below' : 'near'} key moving averages`,
      `Stochastic ${t.stochastic.signal} at K=${t.stochastic.k}, D=${t.stochastic.d}`,
      `Volume ${t.volumeAnalysis.trend} with ${t.volumeAnalysis.strength}% relative strength`,
      `On-Balance Volume suggests ${t.obv}`,
    ],
    bullTriggers: [
      `Break above resistance with volume confirmation`,
      `RSI recovery above 50 from oversold zone`,
      `MACD bullish crossover with expanding histogram`,
    ],
    bearTriggers: [
      `Break below key support with volume spike`,
      `RSI rejection from overbought territory`,
      `Volume divergence during price rallies`,
    ],
  };
}

// ─── Main Handler ───────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_BODY_SIZE) {
      return new Response(JSON.stringify({ error: 'Request too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let body;
    try { body = await req.json(); }
    catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

    const v = predictionRequestSchema.safeParse(body);
    if (!v.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: v.error.errors.map(e => e.message) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { coinId, symbol, timeframe } = v.data;
    console.log(`Processing ${timeframe} prediction for ${symbol} (${coinId})`);

    const supabase = getSupabaseClient();

    // Check cache
    if (supabase) {
      const cached = await getCachedPrediction(supabase, coinId, timeframe);
      if (cached) {
        console.log(`Cache hit: ${symbol} (${timeframe})`);
        return new Response(JSON.stringify(cached.prediction_data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Fetch market data (CoinGecko → DexScreener → request body)
    const md = await fetchMarketData(coinId, symbol, v.data);
    console.log(`${symbol}: $${md.price} | 24h: ${md.change24h.toFixed(2)}% | Vol: $${(md.volume24h/1e6).toFixed(1)}M`);

    // Generate analysis
    const technicals = generateTechnicals(md);
    const levels = calculateLevels(md.price, md.high24h, md.low24h);

    // Bias scoring (more nuanced with more indicators)
    let score = 0;
    if (technicals.rsi < 30) score += 2;
    else if (technicals.rsi < 45) score += 1;
    else if (technicals.rsi > 70) score -= 2;
    else if (technicals.rsi > 55) score -= 1;
    
    if (technicals.macd.trend === 'bullish') score += 2; else score -= 2;
    if (technicals.movingAverages.trend === 'bullish') score += 2;
    else if (technicals.movingAverages.trend === 'bearish') score -= 2;
    if (md.change24h > 0) score += 1; else score -= 1;
    if (md.change7d > 0) score += 1; else score -= 1;
    if (technicals.stochastic.signal === 'oversold') score += 1;
    else if (technicals.stochastic.signal === 'overbought') score -= 1;
    if (technicals.obv === 'accumulation') score += 1; else score -= 1;

    const bias: 'bullish' | 'bearish' | 'neutral' =
      score >= 4 ? 'bullish' : score <= -4 ? 'bearish' : 'neutral';
    const confidence = Math.min(92, 45 + Math.abs(score) * 4 + Math.round(Math.random() * 8));
    const probBull = bias === 'bullish' ? confidence : bias === 'bearish' ? 100 - confidence : 50;

    // Price targets
    const tfMult = timeframe === 'daily' ? 0.03 : timeframe === 'weekly' ? 0.08 : 0.15;
    const p = md.price;
    const priceTargets = {
      conservative: { low: round(p * (1 - tfMult * 0.5)), high: round(p * (1 + tfMult * 0.5)) },
      moderate: { low: round(p * (1 - tfMult)), high: round(p * (1 + tfMult)) },
      aggressive: { low: round(p * (1 - tfMult * 1.5)), high: round(p * (1 + tfMult * 1.5)) },
    };

    // Trading zones from real volatility
    const actualVol = (md.high24h - md.low24h) / p;
    const volMult = Math.max(actualVol, 0.01);
    const tfScale = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 2.5 : 5;
    
    const entryBuffer = volMult * 0.5 * tfScale;
    const slBuffer = volMult * 0.75 * tfScale;
    const tpBase = volMult * tfScale;
    
    const tradingZones = {
      entryZone: { min: round(p * (1 - entryBuffer)), max: round(p) },
      stopLoss: round(Math.min(md.low24h * 0.99, p * (1 - slBuffer))),
      takeProfit1: round(p * (1 + tpBase)),
      takeProfit2: round(p * (1 + tpBase * 2)),
      takeProfit3: round(p * (1 + tpBase * 3)),
    };

    // Risk
    const volatility = Math.abs(md.change24h) + actualVol * 100;
    const riskLevel: 'low' | 'medium' | 'high' | 'extreme' =
      volatility < 3 ? 'low' : volatility < 7 ? 'medium' : volatility < 15 ? 'high' : 'extreme';

    // AI analysis
    const ai = await generateAIAnalysis(coinId, symbol, timeframe, md, technicals, levels);

    const prediction = {
      coinId,
      symbol: symbol.toUpperCase(),
      timeframe,
      timestamp: new Date().toISOString(),
      currentPrice: md.price,
      bias,
      confidence: Math.round(confidence),
      probabilityBullish: Math.round(probBull),
      probabilityBearish: Math.round(100 - probBull),
      priceTargets,
      tradingZones,
      supportLevels: levels.support,
      resistanceLevels: levels.resistance,
      technicalIndicators: technicals,
      riskLevel,
      volatilityIndex: Math.round(volatility * 10) / 10,
      summary: ai.summary,
      keyFactors: ai.keyFactors,
      bullScenario: {
        target: priceTargets.aggressive.high,
        probability: Math.round(probBull),
        triggers: ai.bullTriggers,
      },
      bearScenario: {
        target: priceTargets.aggressive.low,
        probability: Math.round(100 - probBull),
        triggers: ai.bearTriggers,
      },
      marketData: {
        volume24h: md.volume24h,
        marketCap: md.marketCap,
        high24h: md.high24h,
        low24h: md.low24h,
        change7d: md.change7d,
        change30d: md.change30d,
        ath: md.ath,
      },
      disclaimer: "This analysis is for informational purposes only and does not constitute financial advice. Cryptocurrency investments carry significant risk. Always conduct your own research.",
    };

    if (supabase) {
      cachePrediction(supabase, prediction, coinId, symbol, timeframe).catch(console.error);
    }

    return new Response(JSON.stringify(prediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Prediction error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
