import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require an authenticated user — prevents anonymous abuse of paid LLM credits.
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(jwt);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { coins } = await req.json();
    const coinList = Array.isArray(coins) ? coins.slice(0, 10) : ["BTC", "ETH", "SOL"];

    // Fetch current prices from CoinGecko
    const ids = coinList.map((c: string) => {
      const map: Record<string, string> = {
        BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
        XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
        DOT: "polkadot", MATIC: "matic-network", LINK: "chainlink", UNI: "uniswap",
      };
      return map[c.toUpperCase()] || c.toLowerCase();
    });

    let priceData: Record<string, any> = {};
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      );
      if (res.ok) priceData = await res.json();
    } catch { /* fallback below */ }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const prompt = `You are a professional crypto trading analyst. Analyze these coins and provide trading signals.

Coins: ${coinList.join(", ")}
Price data: ${JSON.stringify(priceData)}

For each coin, provide a JSON signal with: coin, symbol, type (buy/sell/hold), strength (0-100), reason (1 sentence), entry price, target price, stopLoss price, confidence (0-100), timeframe (1h/4h/1d).

Return ONLY a JSON array of signal objects. No markdown, no explanation.`;

    if (LOVABLE_API_KEY) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const signals = JSON.parse(jsonMatch[0]);
            return new Response(JSON.stringify({ signals }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (e) {
        console.error("AI error:", e);
      }
    }

    // Fallback: DETERMINISTIC algorithmic signals derived purely from the real
    // 24h price move. No random numbers — strength/confidence/timeframe are
    // reproducible functions of actual market momentum. Coins with no real price
    // are skipped entirely (we never fabricate a price or a change).
    const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
    const signals = coinList
      .map((sym: string) => {
        const id = ids[coinList.indexOf(sym)];
        const data = priceData[id];
        const price = typeof data?.usd === "number" ? data.usd : null;
        const change = typeof data?.usd_24h_change === "number" ? data.usd_24h_change : null;
        if (price === null || change === null) return null; // no real data → no signal

        const mag = Math.abs(change);
        const isBullish = change > 0;
        // Strength = conviction from move magnitude; confidence scales with it too.
        const strength = Math.round(clamp(mag * 7, 5, 100));
        const confidence = Math.round(clamp(40 + mag * 4, 20, 90));
        // Bigger moves → shorter momentum timeframe; quiet markets → longer.
        const timeframe = mag > 5 ? "1h" : mag > 2 ? "4h" : "1d";
        return {
          coin: sym,
          symbol: sym.toUpperCase(),
          type: isBullish ? "buy" : change < -3 ? "sell" : "hold",
          strength,
          reason: isBullish
            ? `${sym} showing bullish momentum with ${change.toFixed(1)}% gain in 24h`
            : `${sym} under pressure with ${change.toFixed(1)}% drop — watch key support`,
          entry: parseFloat(price.toFixed(2)),
          target: parseFloat((price * (isBullish ? 1.06 : 0.94)).toFixed(2)),
          stopLoss: parseFloat((price * (isBullish ? 0.97 : 1.03)).toFixed(2)),
          confidence,
          timeframe,
          source: "algorithmic-momentum",
        };
      })
      .filter(Boolean);

    return new Response(JSON.stringify({ signals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
