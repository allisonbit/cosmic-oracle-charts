import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coinData, analysisType } = await req.json();
    console.log('AI Forecast request:', { analysisType, coins: coinData?.length });

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (analysisType === 'market_sentiment') {
      systemPrompt = `You are a crypto market analyst AI. Analyze the provided market data and give a brief, actionable sentiment analysis. Be concise and focus on key insights. Format your response as JSON with the following structure:
{
  "overallSentiment": "bullish" | "bearish" | "neutral",
  "confidence": 0-100,
  "keyInsights": ["insight1", "insight2", "insight3"],
  "shortTermOutlook": "brief 1-2 sentence outlook",
  "riskLevel": "low" | "medium" | "high"
}`;
      userPrompt = `Analyze this market data: ${JSON.stringify(coinData)}`;
    } else if (analysisType === 'coin_forecast') {
      systemPrompt = `You are a crypto analyst AI. Analyze the provided coin data and give a forecast. Be concise and data-driven. Format your response as JSON:
{
  "trend": "bullish" | "bearish" | "neutral",
  "strength": "weak" | "moderate" | "strong",
  "prediction24h": "up" | "down" | "sideways",
  "supportLevel": number,
  "resistanceLevel": number,
  "reasoning": "brief explanation"
}`;
      userPrompt = `Analyze this coin: ${JSON.stringify(coinData)}`;
    } else {
      systemPrompt = `You are a helpful crypto market analyst. Provide brief, actionable insights.`;
      userPrompt = `Analyze: ${JSON.stringify(coinData)}`;
    }

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    console.log('OpenAI response received');

    // Try to parse as JSON, fallback to text
    let result;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { analysis: content };
      }
    } catch (e) {
      result = { analysis: content };
    }

    return new Response(JSON.stringify({ forecast: result, timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in AI forecast:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
