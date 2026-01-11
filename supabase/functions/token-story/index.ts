import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  rank?: number;
}

interface SentimentData {
  fearGreedIndex: number;
  socialSentiment: number;
  volatilityIndex: number;
  whaleActivity: number;
  marketMomentum: string;
  whaleMood: string;
  netflow: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, sentimentData } = await req.json() as {
      token: TokenData;
      sentimentData: SentimentData;
    };

    if (!token || !token.symbol) {
      return new Response(
        JSON.stringify({ error: "Token data required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert crypto market analyst at Oracle Bull. Generate a compelling, insightful narrative summary combining all available sentiment data for a cryptocurrency. 

Your analysis should:
1. Start with a clear overall assessment (Bullish/Bearish/Neutral with conviction level)
2. Explain the "story" - what's driving current market dynamics
3. Highlight key signals from whale activity, social sentiment, and price action
4. Identify potential opportunities or risks
5. Provide actionable insight for traders

Keep it concise (200-300 words), professional, and data-driven. Use specific numbers when available. Format with clear sections.`;

    const userPrompt = `Generate a comprehensive market story for ${token.name} (${token.symbol}):

TOKEN DATA:
- Current Price: $${token.price.toLocaleString()}
- 24h Change: ${token.change24h.toFixed(2)}%
- 24h Volume: $${(token.volume / 1e9).toFixed(2)}B
- Market Cap: $${(token.marketCap / 1e9).toFixed(2)}B
${token.rank ? `- Rank: #${token.rank}` : ''}

SENTIMENT DATA:
- Fear & Greed Index: ${sentimentData.fearGreedIndex}/100
- Social Sentiment: ${sentimentData.socialSentiment}/100
- Volatility Index: ${sentimentData.volatilityIndex}/100
- Whale Activity Score: ${sentimentData.whaleActivity}/100
- Market Momentum: ${sentimentData.marketMomentum}
- Whale Mood: ${sentimentData.whaleMood} (Net Flow: ${sentimentData.netflow > 0 ? '+' : ''}${sentimentData.netflow.toFixed(2)} ETH)

Generate the market story now:`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content || "Unable to generate analysis.";

    return new Response(
      JSON.stringify({
        success: true,
        story,
        token: token.symbol,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Token story error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});