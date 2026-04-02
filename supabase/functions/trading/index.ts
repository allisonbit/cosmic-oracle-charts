import { corsHeaders } from "@supabase/supabase-js/cors";

const OX_API_KEY = Deno.env.get("OX_API_KEY") || "";
const LIFI_API = "https://li.quest/v1";

// 0x API v2 endpoints per chain
const OX_ENDPOINTS: Record<number, string> = {
  1: "https://api.0x.org",        // Ethereum
  137: "https://polygon.api.0x.org", // Polygon
  56: "https://bsc.api.0x.org",     // BSC
  42161: "https://arbitrum.api.0x.org", // Arbitrum
  10: "https://optimism.api.0x.org",    // Optimism
  43114: "https://avalanche.api.0x.org", // Avalanche
  8453: "https://base.api.0x.org",      // Base
  59144: "https://linea.api.0x.org",     // Linea
  534352: "https://scroll.api.0x.org",   // Scroll
  324: "https://zksync.api.0x.org",      // zkSync
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === 0x SWAP QUOTE ===
    if (action === "quote") {
      const chainId = Number(url.searchParams.get("chainId") || "1");
      const sellToken = url.searchParams.get("sellToken") || "";
      const buyToken = url.searchParams.get("buyToken") || "";
      const sellAmount = url.searchParams.get("sellAmount") || "";
      const taker = url.searchParams.get("taker") || "";

      if (!sellToken || !buyToken || !sellAmount) {
        return new Response(JSON.stringify({ error: "Missing sellToken, buyToken, or sellAmount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const baseUrl = OX_ENDPOINTS[chainId] || OX_ENDPOINTS[1];
      const params = new URLSearchParams({
        sellToken,
        buyToken,
        sellAmount,
        ...(taker ? { taker } : {}),
      });

      const res = await fetch(`${baseUrl}/swap/v1/quote?${params}`, {
        headers: { "0x-api-key": OX_API_KEY },
      });
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === 0x SWAP PRICE (indicative, no commitment) ===
    if (action === "price") {
      const chainId = Number(url.searchParams.get("chainId") || "1");
      const sellToken = url.searchParams.get("sellToken") || "";
      const buyToken = url.searchParams.get("buyToken") || "";
      const sellAmount = url.searchParams.get("sellAmount") || "";

      const baseUrl = OX_ENDPOINTS[chainId] || OX_ENDPOINTS[1];
      const params = new URLSearchParams({ sellToken, buyToken, sellAmount });

      const res = await fetch(`${baseUrl}/swap/v1/price?${params}`, {
        headers: { "0x-api-key": OX_API_KEY },
      });
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === 0x TOKEN LIST ===
    if (action === "tokens") {
      const chainId = Number(url.searchParams.get("chainId") || "1");
      const baseUrl = OX_ENDPOINTS[chainId] || OX_ENDPOINTS[1];

      const res = await fetch(`${baseUrl}/swap/v1/tokens`, {
        headers: { "0x-api-key": OX_API_KEY },
      });
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === LI.FI BRIDGE QUOTE ===
    if (action === "bridge-quote") {
      const body = await req.json();
      const { fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount, fromAddress } = body;

      if (!fromChainId || !toChainId || !fromTokenAddress || !toTokenAddress || !fromAmount) {
        return new Response(JSON.stringify({ error: "Missing bridge parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const params = new URLSearchParams({
        fromChain: String(fromChainId),
        toChain: String(toChainId),
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount,
        ...(fromAddress ? { fromAddress } : {}),
      });

      const res = await fetch(`${LIFI_API}/quote?${params}`);
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === LI.FI SUPPORTED CHAINS ===
    if (action === "bridge-chains") {
      const res = await fetch(`${LIFI_API}/chains`);
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === LI.FI SUPPORTED TOKENS ===
    if (action === "bridge-tokens") {
      const chains = url.searchParams.get("chains") || "";
      const params = chains ? new URLSearchParams({ chains }) : new URLSearchParams();

      const res = await fetch(`${LIFI_API}/tokens?${params}`);
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === LI.FI ROUTE (advanced multi-hop) ===
    if (action === "bridge-route") {
      const body = await req.json();

      const res = await fetch(`${LIFI_API}/advanced/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Trading function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
