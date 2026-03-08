import { corsHeaders } from "../_shared/cors.ts";

const SITE_URL = "https://oraclebull.com";

// All routes for the sitemap - server-side, always fresh
const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "hourly" },
  { path: "/dashboard", priority: "0.9", changefreq: "hourly" },
  { path: "/predictions", priority: "0.9", changefreq: "hourly" },
  { path: "/sentiment", priority: "0.9", changefreq: "hourly" },
  { path: "/explorer", priority: "0.8", changefreq: "hourly" },
  { path: "/strength-meter", priority: "0.8", changefreq: "hourly" },
  { path: "/factory", priority: "0.8", changefreq: "hourly" },
  { path: "/factory/events", priority: "0.7", changefreq: "daily" },
  { path: "/factory/onchain", priority: "0.7", changefreq: "daily" },
  { path: "/factory/narratives", priority: "0.7", changefreq: "daily" },
  { path: "/factory/news", priority: "0.7", changefreq: "hourly" },
  { path: "/portfolio", priority: "0.7", changefreq: "daily" },
  { path: "/learn", priority: "0.8", changefreq: "daily" },
  { path: "/insights", priority: "0.8", changefreq: "hourly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/sitemap", priority: "0.4", changefreq: "weekly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/risk-disclaimer", priority: "0.3", changefreq: "yearly" },
];

const chains = ["ethereum", "solana", "base", "arbitrum", "polygon", "optimism", "avalanche", "bnb"];

const topCryptos = [
  "bitcoin", "ethereum", "solana", "binancecoin", "ripple", "cardano", "dogecoin",
  "polkadot", "chainlink", "avalanche-2", "matic-network", "shiba-inu", "litecoin",
  "uniswap", "cosmos", "near", "arbitrum", "optimism", "aptos", "sui", "pepe", "floki", "bonk",
  "toncoin", "tron", "stellar", "monero", "okb", "hedera", "filecoin", "vechain",
  "internet-computer", "render-token", "fetch-ai", "injective-protocol", "kaspa", "theta-token"
];

const educationalSlugs = [
  "what-is-crypto-market-sentiment",
  "how-ai-is-used-in-crypto-market-analysis",
  "bitcoin-market-cycles-explained",
  "risk-management-in-volatile-crypto-markets",
  "how-to-analyze-altcoins-using-market-data",
  "technical-analysis-vs-sentiment-analysis",
  "on-chain-data-explained-for-beginners",
  "how-market-psychology-affects-crypto-prices",
  "how-whales-influence-market-trends",
  "understanding-liquidity-in-crypto-markets",
  "what-is-the-forex-market-and-how-does-it-work",
  "forex-market-structure-explained",
  "currency-sentiment-analysis-explained",
  "forex-vs-crypto-key-market-differences",
  "macroeconomic-factors-that-move-forex-markets",
  "how-ai-forecasting-models-work-in-finance",
  "limitations-of-ai-market-predictions",
  "indicators-vs-ai-models-whats-the-difference",
  "data-sources-used-in-market-intelligence-platforms",
  "how-to-read-market-analytics-dashboards",
];

const marketQuestions = [
  "best-crypto-to-buy-today", "top-crypto-gainers-today", "crypto-market-prediction-today",
  "which-crypto-will-go-up-today", "crypto-losers-today", "is-crypto-going-up-today",
  "best-crypto-to-buy-this-week", "crypto-prediction-this-week", "crypto-to-watch-this-week",
  "top-crypto-gainers-this-week", "next-crypto-to-explode", "safest-crypto-to-invest",
  "cheap-crypto-to-buy-now", "undervalued-crypto-to-buy", "crypto-with-most-potential",
  "best-altcoins-to-buy", "top-meme-coins", "best-defi-tokens", "top-ai-crypto-tokens",
];

function generateSitemap(): string {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  let urls = "";

  // Static routes
  for (const route of staticRoutes) {
    urls += `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
  }

  // Chain routes
  for (const chain of chains) {
    urls += `  <url>
    <loc>${SITE_URL}/chain/${chain}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  // Price prediction routes (high priority - money pages)
  for (const crypto of topCryptos) {
    for (const tf of ["", "/daily", "/weekly", "/monthly"]) {
      urls += `  <url>
    <loc>${SITE_URL}/price-prediction/${crypto}${tf}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
    }
  }

  // Market question pages
  for (const q of marketQuestions) {
    urls += `  <url>
    <loc>${SITE_URL}/market/${q}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  // Coin market pages
  for (const crypto of topCryptos) {
    urls += `  <url>
    <loc>${SITE_URL}/markets/${crypto}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  }

  // Educational articles
  for (const slug of educationalSlugs) {
    urls += `  <url>
    <loc>${SITE_URL}/learn/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  }

  // Question intent pages (top 10 coins × 12 patterns)
  const qCoins = ["bitcoin", "ethereum", "solana", "ripple", "cardano", "dogecoin", "shiba-inu", "pepe", "chainlink", "polkadot"];
  const qPatterns = [
    "what-will-{coin}-price-be-today", "will-{coin}-go-up-today", "{coin}-price-prediction-today",
    "is-{coin}-bullish-today", "what-will-{coin}-price-be-this-week", "will-{coin}-go-up-this-week",
    "{coin}-price-prediction-this-week", "{coin}-weekly-forecast", "what-will-{coin}-price-be-this-month",
    "is-{coin}-a-good-investment-this-month", "{coin}-price-prediction-this-month", "{coin}-monthly-forecast",
  ];
  for (const coin of qCoins) {
    for (const pattern of qPatterns) {
      const slug = pattern.replace("{coin}", coin);
      urls += `  <url>
    <loc>${SITE_URL}/q/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}</urlset>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sitemap = generateSitemap();
    
    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Robots-Tag": "noindex",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(`Error generating sitemap: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
