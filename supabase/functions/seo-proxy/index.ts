import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory price cache (per invocation, resets on cold start)
const priceCache: Record<string, { price: number; change: number; ts: number }> = {};
const PRICE_TTL = 60_000; // 1 minute

async function getLivePrice(coinId: string): Promise<{ price: number; change: number } | null> {
  const cached = priceCache[coinId];
  if (cached && Date.now() - cached.ts < PRICE_TTL) {
    return { price: cached.price, change: cached.change };
  }
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const entry = data[coinId];
    if (!entry) return null;
    const result = { price: entry.usd, change: entry.usd_24h_change || 0 };
    priceCache[coinId] = { ...result, ts: Date.now() };
    return result;
  } catch {
    return null;
  }
}

// Map URL slug to CoinGecko ID + display name
const COIN_MAP: Record<string, { id: string; name: string; symbol: string }> = {
  bitcoin: { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  ethereum: { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  solana: { id: "solana", name: "Solana", symbol: "SOL" },
  ripple: { id: "ripple", name: "XRP", symbol: "XRP" },
  cardano: { id: "cardano", name: "Cardano", symbol: "ADA" },
  dogecoin: { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  polkadot: { id: "polkadot", name: "Polkadot", symbol: "DOT" },
  avalanche: { id: "avalanche-2", name: "Avalanche", symbol: "AVAX" },
  chainlink: { id: "chainlink", name: "Chainlink", symbol: "LINK" },
  uniswap: { id: "uniswap", name: "Uniswap", symbol: "UNI" },
  litecoin: { id: "litecoin", name: "Litecoin", symbol: "LTC" },
  "shiba-inu": { id: "shiba-inu", name: "Shiba Inu", symbol: "SHIB" },
  polygon: { id: "matic-network", name: "Polygon", symbol: "POL" },
  binancecoin: { id: "binancecoin", name: "BNB", symbol: "BNB" },
  cosmos: { id: "cosmos", name: "Cosmos", symbol: "ATOM" },
  near: { id: "near", name: "NEAR Protocol", symbol: "NEAR" },
  sui: { id: "sui", name: "Sui", symbol: "SUI" },
  arbitrum: { id: "arbitrum", name: "Arbitrum", symbol: "ARB" },
  optimism: { id: "optimism", name: "Optimism", symbol: "OP" },
  ton: { id: "the-open-network", name: "Toncoin", symbol: "TON" },
};

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

function buildMetaTags(params: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}): string {
  const img = params.imageUrl ||
    "https://oraclebull.com/og-image.jpg";
  return `
    <title>${params.title}</title>
    <meta name="title" content="${params.title}" />
    <meta name="description" content="${params.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${params.url}" />
    <meta property="og:title" content="${params.title}" />
    <meta property="og:description" content="${params.description}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Oracle Bull" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${params.title}" />
    <meta name="twitter:description" content="${params.description}" />
    <meta name="twitter:image" content="${img}" />
    <meta name="twitter:site" content="@oracle_bulls" />
    <link rel="canonical" href="${params.url}" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${params.title}",
      "description": "${params.description}",
      "url": "${params.url}",
      "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" }
    }
    </script>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/";
    const baseUrl = "https://oraclebull.com";
    const fullUrl = `${baseUrl}${path}`;

    let metaTags = "";

    // /price-prediction/:coinId or /price-prediction/:coinId/:timeframe
    const predictionMatch = path.match(/^\/price-prediction\/([^/]+)/);
    if (predictionMatch) {
      const slug = predictionMatch[1];
      const coin = COIN_MAP[slug];
      if (coin) {
        const priceData = await getLivePrice(coin.id);
        const priceStr = priceData ? formatPrice(priceData.price) : "Live Price";
        const changeStr = priceData
          ? `${priceData.change >= 0 ? "▲" : "▼"} ${Math.abs(priceData.change).toFixed(2)}%`
          : "";
        const sentiment = priceData && priceData.change > 0 ? "Bullish" : priceData && priceData.change < 0 ? "Bearish" : "Neutral";
        const title = `${coin.name} (${coin.symbol}) Price Prediction — ${priceStr} ${changeStr} | Oracle Bull`;
        const description = `AI-powered ${coin.name} price prediction today. ${coin.symbol} is at ${priceStr} (${changeStr}). ${sentiment} signal. Get daily, weekly & monthly forecasts, support/resistance levels, whale tracking & market sentiment analysis — free on Oracle Bull.`;
        metaTags = buildMetaTags({ title, description, url: fullUrl });
      }
    }

    // /chain/:chainId
    const chainMatch = path.match(/^\/chain\/([^/]+)/);
    if (!metaTags && chainMatch) {
      const chainId = chainMatch[1];
      const chainNames: Record<string, string> = {
        ethereum: "Ethereum", solana: "Solana", bitcoin: "Bitcoin",
        bnb: "BNB Chain", avalanche: "Avalanche", polygon: "Polygon",
        arbitrum: "Arbitrum", base: "Base", optimism: "Optimism",
        sui: "Sui", ton: "TON",
      };
      const name = chainNames[chainId] || chainId.charAt(0).toUpperCase() + chainId.slice(1);
      const title = `${name} Chain Analytics — Real-Time DeFi, TVL & Whale Data | Oracle Bull`;
      const description = `Live ${name} blockchain analytics: DeFi TVL, whale transactions, smart money flow, ecosystem token prices, gas fees, and on-chain metrics updated 24/7 on Oracle Bull.`;
      metaTags = buildMetaTags({ title, description, url: fullUrl });
    }

    // /insights/:slug or /learn/:slug
    const articleMatch = path.match(/^\/(insights|learn)\/(.+)/);
    if (!metaTags && articleMatch) {
      const section = articleMatch[1] === "insights" ? "Market Insight" : "Learn";
      const slug = articleMatch[2].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const title = `${slug} | ${section} | Oracle Bull`;
      const description = `${slug} — Expert cryptocurrency analysis and education on Oracle Bull. Free AI-powered market insights, trading guides, and blockchain education.`;
      metaTags = buildMetaTags({ title, description, url: fullUrl });
    }

    // /q/:slug (question intent pages)
    const questionMatch = path.match(/^\/q\/(.+)/);
    if (!metaTags && questionMatch) {
      const slug = questionMatch[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const title = `${slug} | AI Crypto Answer | Oracle Bull`;
      const description = `${slug}? Get the AI-powered answer with real-time price data, market sentiment, and expert analysis — free on Oracle Bull.`;
      metaTags = buildMetaTags({ title, description, url: fullUrl });
    }

    // Fallback: homepage
    if (!metaTags) {
      const title = "Free AI Crypto Price Predictions & Market Analytics | Oracle Bull";
      const description = "Free AI-powered cryptocurrency price predictions for Bitcoin, Ethereum, Solana & 1000+ tokens. Real-time charts, whale tracking, market sentiment analysis — 24/7 live data.";
      metaTags = buildMetaTags({ title, description, url: fullUrl });
    }

    return new Response(JSON.stringify({ metaTags, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
