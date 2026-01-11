import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_BODY_SIZE = 50 * 1024; // 50KB

// Input validation schema
const chainForecastSchema = z.object({
  chainId: z.string().max(50),
  chainData: z.object({
    overview: z.object({
      marketCap: z.number().positive().max(1e15).optional(),
      volume24h: z.number().nonnegative().max(1e15).optional(),
      activeWallets: z.number().int().nonnegative().max(1e9).optional(),
      defiTvl: z.number().nonnegative().max(1e15).optional(),
      priceChange24h: z.number().min(-100).max(1000).optional()
    }).passthrough().optional()
  }).passthrough().optional()
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check body size limit
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Request body too large. Maximum size is 50KB.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = chainForecastSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validationResult.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { chainId, chainData } = validationResult.data;
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

    let analysis = "";
    
    if (openAIApiKey) {
      try {
        const marketCap = (chainData?.overview?.marketCap ?? 0) / 1e9;
        const volume = (chainData?.overview?.volume24h ?? 0) / 1e9;
        const wallets = chainData?.overview?.activeWallets ?? 0;
        const tvl = (chainData?.overview?.defiTvl ?? 0) / 1e9;
        const prompt = `Analyze ${chainId} blockchain with current metrics: Market Cap ${marketCap.toFixed(1)}B, 24h Volume ${volume.toFixed(2)}B, Active Wallets ${wallets.toLocaleString()}, DeFi TVL ${tvl.toFixed(2)}B. Provide a brief 2-sentence market analysis and outlook.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200,
          }),
        });

        if (response.ok) {
          const aiData = await response.json();
          analysis = aiData.choices[0].message.content;
        }
      } catch (e) {
        console.log("AI analysis failed, using defaults");
      }
    }

    // Generate forecasts based on price change
    const priceChange = chainData?.overview?.priceChange24h || 0;
    const trend = priceChange > 2 ? "bullish" : priceChange < -2 ? "bearish" : "neutral";
    
    const result = {
      forecast: {
        shortTerm: { 
          prediction: trend, 
          confidence: 65 + Math.floor(Math.random() * 20), 
          priceTarget: chainData?.overview?.marketCap ? chainData.overview.marketCap * (1 + priceChange * 0.01) : 0,
          timeframe: "1-4 hours", 
          reasoning: analysis.slice(0, 150) || `${chainId.charAt(0).toUpperCase() + chainId.slice(1)} showing ${trend} momentum in short-term trading.`
        },
        midTerm: { 
          prediction: trend === "bullish" ? "bullish" : trend === "bearish" ? "neutral" : "neutral", 
          confidence: 55 + Math.floor(Math.random() * 25), 
          priceTarget: chainData?.overview?.marketCap ? chainData.overview.marketCap * (1 + priceChange * 0.02) : 0,
          timeframe: "24-48 hours", 
          reasoning: analysis.slice(100, 250) || "Medium-term outlook depends on broader market conditions and on-chain activity."
        },
        longTerm: { 
          prediction: "bullish", 
          confidence: 60 + Math.floor(Math.random() * 20), 
          priceTarget: chainData?.overview?.marketCap ? chainData.overview.marketCap * 1.1 : 0,
          timeframe: "3-7 days", 
          reasoning: "Long-term fundamentals remain strong with continued ecosystem development."
        },
        keyTriggers: [
          "Whale accumulation patterns",
          "Network upgrade announcements",
          "DeFi TVL changes",
          "Cross-chain bridge activity",
          "Market sentiment shifts"
        ],
        riskLevel: Math.floor(30 + Math.random() * 40),
        overallConfidence: Math.floor(60 + Math.random() * 25),
        dailySummary: analysis || `${chainId.charAt(0).toUpperCase() + chainId.slice(1)} network activity shows ${trend} signals. Monitor whale movements and DeFi metrics for trading opportunities.`,
      },
      tokenRisks: Array.from({ length: 12 }, (_, i) => ({
        symbol: `TOKEN${i + 1}`,
        name: `Token ${i + 1}`,
        riskLevel: ["low", "medium", "high", "extreme"][Math.floor(Math.random() * 4)] as string,
        riskScore: Math.random() * 100,
        reasons: [
          ["Stable liquidity", "Strong fundamentals"][Math.floor(Math.random() * 2)],
          ["Active development", "Growing community"][Math.floor(Math.random() * 2)],
        ],
        liquidity: Math.random() * 10e6,
        volatility: Math.random() * 100,
      })),
      socialSentiment: {
        twitter: { positive: 40 + Math.floor(Math.random() * 20), neutral: 30 + Math.floor(Math.random() * 15), negative: 15 + Math.floor(Math.random() * 15), volume: Math.floor(10000 + Math.random() * 20000) },
        reddit: { positive: 35 + Math.floor(Math.random() * 25), neutral: 35 + Math.floor(Math.random() * 15), negative: 15 + Math.floor(Math.random() * 20), volume: Math.floor(3000 + Math.random() * 8000) },
        telegram: { positive: 45 + Math.floor(Math.random() * 20), neutral: 25 + Math.floor(Math.random() * 20), negative: 15 + Math.floor(Math.random() * 15), volume: Math.floor(5000 + Math.random() * 10000) },
        news: { positive: 30 + Math.floor(Math.random() * 25), neutral: 40 + Math.floor(Math.random() * 15), negative: 15 + Math.floor(Math.random() * 20), count: Math.floor(30 + Math.random() * 50) },
        overallSentiment: 55 + Math.floor(Math.random() * 25),
      },
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
