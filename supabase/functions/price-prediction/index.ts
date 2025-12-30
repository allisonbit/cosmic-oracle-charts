import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRequest {
  coinId: string;
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  currentPrice?: number;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

interface TechnicalIndicators {
  rsi: number;
  rsiSignal: 'oversold' | 'neutral' | 'overbought';
  macd: { value: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' };
  movingAverages: { ma20: number; ma50: number; ma200: number; trend: 'bullish' | 'bearish' | 'neutral' };
  bollingerBands: { upper: number; middle: number; lower: number; position: 'upper' | 'middle' | 'lower' };
  volumeAnalysis: { trend: 'increasing' | 'decreasing' | 'stable'; strength: number };
}

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

// Check cache for existing prediction
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
  } catch {
    return null;
  }
}

// Save prediction to cache
async function cachePrediction(supabase: any, prediction: any, coinId: string, symbol: string, timeframe: string) {
  try {
    // Calculate expiration based on timeframe
    const now = new Date();
    let expiresAt: Date;
    if (timeframe === 'daily') {
      expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
    } else if (timeframe === 'weekly') {
      expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours
    } else {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    }

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

    console.log(`Cached prediction for ${symbol} (${timeframe})`);
  } catch (error) {
    console.error("Cache save error:", error);
  }
}

// Calculate RSI simulation
function calculateRSI(priceChange: number): { value: number; signal: 'oversold' | 'neutral' | 'overbought' } {
  let baseRSI = 50 + (priceChange * 2);
  baseRSI = Math.max(10, Math.min(90, baseRSI + (Math.random() - 0.5) * 15));
  
  let signal: 'oversold' | 'neutral' | 'overbought' = 'neutral';
  if (baseRSI < 30) signal = 'oversold';
  else if (baseRSI > 70) signal = 'overbought';
  
  return { value: Math.round(baseRSI * 10) / 10, signal };
}

// Calculate MACD simulation
function calculateMACD(priceChange: number): { value: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' } {
  const value = priceChange * 0.1 + (Math.random() - 0.5) * 0.05;
  const signal = value * 0.8 + (Math.random() - 0.5) * 0.02;
  const histogram = value - signal;
  
  return {
    value: Math.round(value * 1000) / 1000,
    signal: Math.round(signal * 1000) / 1000,
    histogram: Math.round(histogram * 1000) / 1000,
    trend: histogram > 0 ? 'bullish' : 'bearish'
  };
}

// Generate technical indicators
function generateTechnicalIndicators(currentPrice: number, priceChange: number): TechnicalIndicators {
  const rsiData = calculateRSI(priceChange);
  const macdData = calculateMACD(priceChange);
  
  const ma20 = currentPrice * (1 + (Math.random() - 0.5) * 0.03);
  const ma50 = currentPrice * (1 + (Math.random() - 0.5) * 0.08);
  const ma200 = currentPrice * (1 + (Math.random() - 0.5) * 0.15);
  
  let maTrend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (currentPrice > ma20 && ma20 > ma50) maTrend = 'bullish';
  else if (currentPrice < ma20 && ma20 < ma50) maTrend = 'bearish';
  
  const bbMiddle = ma20;
  const bbWidth = currentPrice * 0.05;
  
  return {
    rsi: rsiData.value,
    rsiSignal: rsiData.signal,
    macd: macdData,
    movingAverages: {
      ma20: Math.round(ma20 * 100) / 100,
      ma50: Math.round(ma50 * 100) / 100,
      ma200: Math.round(ma200 * 100) / 100,
      trend: maTrend
    },
    bollingerBands: {
      upper: Math.round((bbMiddle + bbWidth * 2) * 100) / 100,
      middle: Math.round(bbMiddle * 100) / 100,
      lower: Math.round((bbMiddle - bbWidth * 2) * 100) / 100,
      position: currentPrice > bbMiddle + bbWidth ? 'upper' : currentPrice < bbMiddle - bbWidth ? 'lower' : 'middle'
    },
    volumeAnalysis: {
      trend: priceChange > 2 ? 'increasing' : priceChange < -2 ? 'decreasing' : 'stable',
      strength: Math.min(100, Math.abs(priceChange) * 10 + 40)
    }
  };
}

// Calculate support and resistance levels
function calculateLevels(currentPrice: number, high: number, low: number): { support: number[]; resistance: number[] } {
  const range = high - low;
  const pivot = (high + low + currentPrice) / 3;
  
  const support = [
    Math.round((pivot - range * 0.382) * 100) / 100,
    Math.round((pivot - range * 0.618) * 100) / 100,
    Math.round(low * 0.98 * 100) / 100
  ].sort((a, b) => b - a);
  
  const resistance = [
    Math.round((pivot + range * 0.382) * 100) / 100,
    Math.round((pivot + range * 0.618) * 100) / 100,
    Math.round(high * 1.02 * 100) / 100
  ].sort((a, b) => a - b);
  
  return { support, resistance };
}

// Generate AI analysis
async function generateAIPrediction(
  coinId: string,
  symbol: string,
  timeframe: string,
  currentPrice: number,
  technicals: TechnicalIndicators,
  levels: { support: number[]; resistance: number[] }
) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    return generateFallbackAnalysis(symbol, timeframe, technicals);
  }
  
  const timeframeText = timeframe === 'daily' ? '24 hours' : timeframe === 'weekly' ? '7 days' : '30 days';
  
  const prompt = `You are an expert crypto analyst. Analyze ${symbol.toUpperCase()} for the next ${timeframeText}.

Current Data:
- Price: $${currentPrice}
- RSI: ${technicals.rsi} (${technicals.rsiSignal})
- MACD: ${technicals.macd.trend}
- MA Trend: ${technicals.movingAverages.trend}
- Support: $${levels.support[0]}
- Resistance: $${levels.resistance[0]}

Provide a JSON response with:
{
  "summary": "2-3 sentence professional analysis",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "bullTriggers": ["trigger1", "trigger2"],
  "bearTriggers": ["trigger1", "trigger2"]
}

Be professional, data-driven, avoid hype. Include specific price levels.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional crypto analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateFallbackAnalysis(symbol, timeframe, technicals);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || generateFallbackAnalysis(symbol, timeframe, technicals).summary,
        keyFactors: parsed.keyFactors || [],
        bullTriggers: parsed.bullTriggers || [],
        bearTriggers: parsed.bearTriggers || []
      };
    }
    
    return generateFallbackAnalysis(symbol, timeframe, technicals);
  } catch (error) {
    console.error("AI prediction error:", error);
    return generateFallbackAnalysis(symbol, timeframe, technicals);
  }
}

function generateFallbackAnalysis(symbol: string, timeframe: string, technicals: TechnicalIndicators) {
  const timeframeText = timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : 'this month';
  const trend = technicals.movingAverages.trend;
  
  return {
    summary: `${symbol.toUpperCase()} shows ${trend} momentum ${timeframeText} with RSI at ${technicals.rsi}. ${
      technicals.rsiSignal === 'oversold' ? 'Oversold conditions suggest potential bounce.' :
      technicals.rsiSignal === 'overbought' ? 'Overbought conditions warrant caution.' :
      'Technical indicators suggest consolidation phase.'
    } MACD confirms ${technicals.macd.trend} short-term bias.`,
    keyFactors: [
      `RSI at ${technicals.rsi} indicates ${technicals.rsiSignal} conditions`,
      `MACD histogram ${technicals.macd.histogram > 0 ? 'positive' : 'negative'} showing ${technicals.macd.trend} momentum`,
      `Price ${technicals.movingAverages.trend === 'bullish' ? 'above' : 'below'} key moving averages`,
      `Volume ${technicals.volumeAnalysis.trend} with ${technicals.volumeAnalysis.strength}% strength`
    ],
    bullTriggers: [
      `Break above resistance with volume confirmation`,
      `RSI recovery from oversold territory`,
      `MACD bullish crossover signal`
    ],
    bearTriggers: [
      `Break below key support levels`,
      `RSI rejection from overbought zone`,
      `Volume decline during rallies`
    ]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coinId, symbol, timeframe, currentPrice, priceChange24h, high24h, low24h } = await req.json() as PredictionRequest;
    
    console.log(`Processing ${timeframe} prediction for ${symbol}`);
    
    const supabase = getSupabaseClient();
    
    // Check cache first
    if (supabase) {
      const cached = await getCachedPrediction(supabase, coinId, timeframe);
      if (cached) {
        console.log(`Cache hit for ${symbol} (${timeframe})`);
        return new Response(
          JSON.stringify(cached.prediction_data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Use provided data or fetch from CoinGecko
    let price = currentPrice || 0;
    let change = priceChange24h || 0;
    let high = high24h || price * 1.05;
    let low = low24h || price * 0.95;
    
    if (!price) {
      const cgResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      );
      
      if (cgResponse.ok) {
        const cgData = await cgResponse.json();
        if (cgData[coinId]) {
          price = cgData[coinId].usd || 0;
          change = cgData[coinId].usd_24h_change || 0;
        }
      }
    }
    
    if (!price) {
      return new Response(
        JSON.stringify({ error: "Could not fetch price data" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate technical indicators
    const technicals = generateTechnicalIndicators(price, change);
    
    // Calculate support and resistance
    const levels = calculateLevels(price, high, low);
    
    // Determine bias based on technicals
    let bullishScore = 0;
    if (technicals.rsi < 30) bullishScore += 2;
    else if (technicals.rsi < 50) bullishScore += 1;
    else if (technicals.rsi > 70) bullishScore -= 2;
    else if (technicals.rsi > 50) bullishScore -= 1;
    
    if (technicals.macd.trend === 'bullish') bullishScore += 2;
    else bullishScore -= 2;
    
    if (technicals.movingAverages.trend === 'bullish') bullishScore += 2;
    else if (technicals.movingAverages.trend === 'bearish') bullishScore -= 2;
    
    if (change > 0) bullishScore += 1;
    else bullishScore -= 1;
    
    const bias: 'bullish' | 'bearish' | 'neutral' = 
      bullishScore >= 3 ? 'bullish' : bullishScore <= -3 ? 'bearish' : 'neutral';
    
    const confidence = Math.min(85, 50 + Math.abs(bullishScore) * 5 + Math.random() * 10);
    const probabilityBullish = bias === 'bullish' ? confidence : bias === 'bearish' ? 100 - confidence : 50;
    
    // Calculate price targets based on timeframe
    const timeframeMultiplier = timeframe === 'daily' ? 0.03 : timeframe === 'weekly' ? 0.08 : 0.15;
    
    const priceTargets = {
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
    };
    
    // Trading zones for future bot integration
    const tradingZones = {
      entryZone: {
        min: levels.support[0],
        max: Math.round((levels.support[0] + price) / 2 * 100) / 100
      },
      stopLoss: Math.round(levels.support[1] * 0.98 * 100) / 100,
      takeProfit1: levels.resistance[0],
      takeProfit2: levels.resistance[1],
      takeProfit3: levels.resistance[2]
    };
    
    // Risk assessment
    const volatility = Math.abs(change) + (high - low) / price * 100;
    const riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 
      volatility < 3 ? 'low' : volatility < 7 ? 'medium' : volatility < 15 ? 'high' : 'extreme';
    
    // Generate AI analysis
    const aiAnalysis = await generateAIPrediction(coinId, symbol, timeframe, price, technicals, levels);
    
    // Scenarios
    const bullScenario = {
      target: priceTargets.aggressive.high,
      probability: Math.round(probabilityBullish),
      triggers: aiAnalysis.bullTriggers
    };
    
    const bearScenario = {
      target: priceTargets.aggressive.low,
      probability: Math.round(100 - probabilityBullish),
      triggers: aiAnalysis.bearTriggers
    };
    
    const prediction = {
      coinId,
      symbol: symbol.toUpperCase(),
      timeframe,
      timestamp: new Date().toISOString(),
      currentPrice: price,
      bias,
      confidence: Math.round(confidence),
      probabilityBullish: Math.round(probabilityBullish),
      probabilityBearish: Math.round(100 - probabilityBullish),
      priceTargets,
      tradingZones,
      supportLevels: levels.support,
      resistanceLevels: levels.resistance,
      technicalIndicators: technicals,
      riskLevel,
      volatilityIndex: Math.round(volatility * 10) / 10,
      summary: aiAnalysis.summary,
      keyFactors: aiAnalysis.keyFactors,
      bullScenario,
      bearScenario,
      disclaimer: "This analysis is for informational purposes only and does not constitute financial advice. Cryptocurrency investments carry significant risk. Past performance does not guarantee future results. Always conduct your own research before making investment decisions."
    };
    
    // Cache the prediction in background
    if (supabase) {
      cachePrediction(supabase, prediction, coinId, symbol, timeframe).catch(console.error);
    }
    
    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Prediction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});