// Restrict CORS to our own origins (defense-in-depth: this function proxies a
// PAID 0x API key). Override with the ALLOWED_ORIGINS env var if the prod domain
// differs. CORS is browser-enforced only — the config.toml rate_limit is the
// real abuse backstop.
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ||
  "https://oraclebull.com,https://www.oraclebull.com")
  .split(",").map((s) => s.trim()).filter(Boolean);

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/([a-z0-9-]+\.)?(pages\.dev|lovable\.app|lovableproject\.com)$/.test(origin) ||
    /^http:\/\/localhost(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

// A 0x/Jupiter chain id is a small positive integer. Reject anything else so the
// upstream paid API only ever sees well-formed params.
function isValidChainId(v: string): boolean {
  return /^\d{1,7}$/.test(v);
}
// Token addresses / amounts are bounded strings (EVM 0x addr, SPL mint, or symbol).
function isBoundedToken(v: string): boolean {
  return v.length > 0 && v.length <= 64 && /^[A-Za-z0-9.:_-]+$/.test(v);
}
function isBoundedAmount(v: string): boolean {
  return /^\d{1,40}$/.test(v);
}

const OX_API_KEY = Deno.env.get("OX_API_KEY") || "";
const OX_BASE = "https://api.0x.org";
const LIFI_API = "https://li.quest/v1";
const JUPITER_API = "https://quote-api.jup.ag/v6";
// Native SOL mint placeholder used by Jupiter for the SOL side of a swap.
const SOL_MINT = "So11111111111111111111111111111111111111112";

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
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

      if (!isValidChainId(chainId) || !isBoundedToken(sellToken) || !isBoundedToken(buyToken) ||
          !isBoundedAmount(sellAmount) || (taker && !isBoundedToken(taker))) {
        return new Response(JSON.stringify({ error: "Invalid quote parameters" }), {
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

      if (!isValidChainId(chainId) || !isBoundedToken(sellToken) || !isBoundedToken(buyToken) ||
          !isBoundedAmount(sellAmount)) {
        return new Response(JSON.stringify({ error: "Invalid price parameters" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

    // === JUPITER (SOLANA) SWAP QUOTE ===
    // Makes "trade for all coins" true on Solana: any SPL mint can be quoted.
    // Defaults to buying the token with SOL; pass side=sell to flip.
    if (action === "quote-jup") {
      const mint = url.searchParams.get("mint") || url.searchParams.get("buyToken") || "";
      const amount = url.searchParams.get("amount") || url.searchParams.get("sellAmount") || "100000000"; // 0.1 SOL default (lamports)
      const slippageBps = url.searchParams.get("slippageBps") || "100";
      const side = url.searchParams.get("side") || "buy"; // buy = SOL→mint, sell = mint→SOL

      if (!mint) {
        return new Response(JSON.stringify({ error: "Missing mint" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const inputMint = side === "sell" ? mint : SOL_MINT;
      const outputMint = side === "sell" ? SOL_MINT : mint;
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount,
        slippageBps,
      });

      const res = await fetch(`${JUPITER_API}/quote?${params}`);
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
