const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OX_API_KEY = Deno.env.get("OX_API_KEY") || "";
const OX_BASE = "https://api.0x.org";
const LIFI_API = "https://li.quest/v1";

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

    // === 0x v2 SWAP QUOTE ===
    if (action === "quote") {
      const chainId = url.searchParams.get("chainId") || "1";
      const sellToken = url.searchParams.get("sellToken") || "";
      const buyToken = url.searchParams.get("buyToken") || "";
      const sellAmount = url.searchParams.get("sellAmount") || "";
      const taker = url.searchParams.get("taker") || "";

      if (!sellToken || !buyToken || !sellAmount) {
        return new Response(JSON.stringify({ error: "Missing sellToken, buyToken, or sellAmount" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const params = new URLSearchParams({
        chainId,
        sellToken,
        buyToken,
        sellAmount,
        ...(taker ? { taker } : {}),
      });

      const res = await fetch(`${OX_BASE}/swap/allowance-holder/quote?${params}`, {
        headers: { "0x-api-key": OX_API_KEY, "0x-version": "v2" },
      });
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === 0x v2 SWAP PRICE (indicative) ===
    if (action === "price") {
      const chainId = url.searchParams.get("chainId") || "1";
      const sellToken = url.searchParams.get("sellToken") || "";
      const buyToken = url.searchParams.get("buyToken") || "";
      const sellAmount = url.searchParams.get("sellAmount") || "";

      const params = new URLSearchParams({ chainId, sellToken, buyToken, sellAmount });

      const res = await fetch(`${OX_BASE}/swap/allowance-holder/price?${params}`, {
        headers: { "0x-api-key": OX_API_KEY, "0x-version": "v2" },
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
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Trading function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
