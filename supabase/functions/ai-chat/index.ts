import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch live market data for context
async function fetchMarketContext(message: string): Promise<string> {
  try {
    // Extract coin mentions from message
    const coinMap: Record<string, string> = {
      btc: "bitcoin", bitcoin: "bitcoin",
      eth: "ethereum", ethereum: "ethereum",
      sol: "solana", solana: "solana",
      bnb: "binancecoin", xrp: "ripple",
      ada: "cardano", doge: "dogecoin",
      avax: "avalanche-2", dot: "polkadot",
      matic: "polygon", link: "chainlink",
      uni: "uniswap", atom: "cosmos",
      near: "near", sui: "sui", apt: "aptos",
      arb: "arbitrum", op: "optimism",
    };

    const lowerMsg = message.toLowerCase();
    const mentionedCoins: string[] = [];
    for (const [keyword, id] of Object.entries(coinMap)) {
      if (lowerMsg.includes(keyword)) mentionedCoins.push(id);
    }

    // Always include BTC + ETH for market context
    const defaultCoins = ["bitcoin", "ethereum"];
    const allCoins = [...new Set([...mentionedCoins, ...defaultCoins])];
    const ids = allCoins.slice(0, 8).join(",");

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) return "Market data temporarily unavailable.";
    const data = await res.json();

    let context = "📊 LIVE MARKET DATA:\n";
    for (const [coin, info] of Object.entries(data)) {
      const d = info as any;
      const name = coin.charAt(0).toUpperCase() + coin.slice(1);
      const change = d.usd_24h_change?.toFixed(2) || "N/A";
      const arrow = parseFloat(change) >= 0 ? "🟢" : "🔴";
      context += `${arrow} ${name}: $${d.usd?.toLocaleString()} (${change}% 24h) | MCap: $${(d.usd_market_cap / 1e9)?.toFixed(1)}B\n`;
    }

    // Fetch global market data
    try {
      const globalRes = await fetch("https://api.coingecko.com/api/v3/global", { signal: AbortSignal.timeout(3000) });
      if (globalRes.ok) {
        const global = await globalRes.json();
        const gd = global.data;
        context += `\n🌐 GLOBAL: Total MCap $${(gd.total_market_cap?.usd / 1e12)?.toFixed(2)}T | BTC Dom: ${gd.market_cap_percentage?.btc?.toFixed(1)}% | 24h Vol: $${(gd.total_volume?.usd / 1e9)?.toFixed(0)}B`;
      }
    } catch { /* skip global */ }

    return context;
  } catch (e) {
    console.error("Market fetch error:", e);
    return "Market data temporarily unavailable.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    // Fetch live market data based on user's question
    const marketContext = await fetchMarketContext(message);

    const systemPrompt = `You are Oracle Bull AI, a friendly and knowledgeable crypto market assistant with access to LIVE market data. You help users understand cryptocurrency markets, price predictions, trading strategies, and blockchain technology. 

Key traits:
- Use a confident but not financial-advice tone
- ALWAYS reference the live market data provided below when discussing prices or market conditions
- Be concise (2-3 paragraphs max)
- Add relevant emojis sparingly for personality
- Always remind users this is not financial advice when discussing specific trades
- Reference Oracle Bull's tools (predictions, sentiment analysis, strength meter) when relevant
- When users ask about prices, give them the EXACT current data from the live feed

${marketContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ reply: "⚡ I'm getting too many requests right now. Please try again in a moment!" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (response.status === 402) {
      return new Response(JSON.stringify({ reply: "💳 AI usage limit reached. Please try again later." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response right now. Please try again!";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ reply: "Something went wrong. Please try again!" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
