import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://oraclebull.com";

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
  // User hub pages
  { path: "/my", priority: "0.6", changefreq: "daily" },
  { path: "/my/portfolio", priority: "0.6", changefreq: "daily" },
  { path: "/my/scanner", priority: "0.6", changefreq: "daily" },
  { path: "/my/watchlist", priority: "0.6", changefreq: "daily" },
  { path: "/my/alerts", priority: "0.6", changefreq: "daily" },
  { path: "/my/signals", priority: "0.6", changefreq: "daily" },
  { path: "/my/journal", priority: "0.6", changefreq: "daily" },
  { path: "/my/news", priority: "0.6", changefreq: "hourly" },
  { path: "/my/dca", priority: "0.6", changefreq: "daily" },
  { path: "/my/copy", priority: "0.6", changefreq: "daily" },
  { path: "/my/social", priority: "0.5", changefreq: "daily" },
  { path: "/my/settings", priority: "0.4", changefreq: "monthly" },
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
  "what-is-crypto-market-sentiment", "how-ai-is-used-in-crypto-market-analysis",
  "bitcoin-market-cycles-explained", "risk-management-in-volatile-crypto-markets",
  "how-to-analyze-altcoins-using-market-data", "technical-analysis-vs-sentiment-analysis",
  "on-chain-data-explained-for-beginners", "how-market-psychology-affects-crypto-prices",
  "how-whales-influence-market-trends", "understanding-liquidity-in-crypto-markets",
  "what-is-the-forex-market-and-how-does-it-work", "forex-market-structure-explained",
  "currency-sentiment-analysis-explained", "forex-vs-crypto-key-market-differences",
  "macroeconomic-factors-that-move-forex-markets", "how-ai-forecasting-models-work-in-finance",
  "limitations-of-ai-market-predictions", "indicators-vs-ai-models-whats-the-difference",
  "data-sources-used-in-market-intelligence-platforms", "how-to-read-market-analytics-dashboards",
];

const marketQuestions = [
  "best-crypto-to-buy-today", "top-crypto-gainers-today", "crypto-market-prediction-today",
  "which-crypto-will-go-up-today", "crypto-losers-today", "is-crypto-going-up-today",
  "best-crypto-to-buy-this-week", "crypto-prediction-this-week", "crypto-to-watch-this-week",
  "top-crypto-gainers-this-week", "next-crypto-to-explode", "safest-crypto-to-invest",
  "cheap-crypto-to-buy-now", "undervalued-crypto-to-buy", "crypto-with-most-potential",
  "best-altcoins-to-buy", "top-meme-coins", "best-defi-tokens", "top-ai-crypto-tokens",
];

interface BlogArticleRow {
  slug: string;
  published_at: string;
  source: string;
}

async function fetchAllArticleSlugs(): Promise<BlogArticleRow[]> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const allArticles: BlogArticleRow[] = [];
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await sb
        .from("blog_articles")
        .select("slug, published_at, source")
        .order("published_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error("Error fetching articles:", error.message);
        break;
      }
      if (!data || data.length === 0) break;
      allArticles.push(...data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    return allArticles;
  } catch (e) {
    console.error("Failed to fetch articles for sitemap:", e);
    return [];
  }
}

function generateSitemap(articles: BlogArticleRow[]): string {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  let urls = "";

  for (const route of staticRoutes) {
    urls += `  <url>\n    <loc>${SITE_URL}${route.path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
  }

  for (const chain of chains) {
    urls += `  <url>\n    <loc>${SITE_URL}/chain/${chain}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  for (const crypto of topCryptos) {
    for (const tf of ["", "/daily", "/weekly", "/monthly"]) {
      urls += `  <url>\n    <loc>${SITE_URL}/price-prediction/${crypto}${tf}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }
  }

  for (const q of marketQuestions) {
    urls += `  <url>\n    <loc>${SITE_URL}/market/${q}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  for (const crypto of topCryptos) {
    urls += `  <url>\n    <loc>${SITE_URL}/markets/${crypto}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  for (const slug of educationalSlugs) {
    urls += `  <url>\n    <loc>${SITE_URL}/learn/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  // ═══════ Dynamic blog articles from database ═══════
  // Insights articles (source = "insights-engine" or similar)
  const insightSlugs = new Set<string>();
  const learnSlugs = new Set(educationalSlugs);

  for (const article of articles) {
    const slug = article.slug;
    if (learnSlugs.has(slug)) continue; // already added as educational

    if (!insightSlugs.has(slug)) {
      insightSlugs.add(slug);
      const lastmod = article.published_at ? article.published_at.split("T")[0] : today;

      // Determine if it's a learn or insights article
      const prefix = article.source === "ai-blog" ? "/learn" : "/insights";
      urls += `  <url>\n    <loc>${SITE_URL}${prefix}/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
  }

  const qCoins = ["bitcoin", "ethereum", "solana", "ripple", "cardano", "dogecoin", "shiba-inu", "pepe", "chainlink", "polkadot"];
  const qPatterns = [
    "what-will-{coin}-price-be-today", "will-{coin}-go-up-today", "{coin}-price-prediction-today",
    "is-{coin}-bullish-today", "should-i-buy-{coin}-today", "{coin}-forecast-today",
    "is-{coin}-going-up-or-down-today", "{coin}-price-tomorrow",
    "what-will-{coin}-price-be-this-week", "will-{coin}-go-up-this-week",
    "{coin}-price-prediction-this-week", "{coin}-weekly-forecast",
    "should-i-buy-{coin}-this-week", "{coin}-analysis-this-week",
    "what-will-{coin}-price-be-this-month", "is-{coin}-a-good-investment-this-month",
    "{coin}-price-prediction-this-month", "{coin}-monthly-forecast",
    "should-i-buy-{coin}-now", "{coin}-price-prediction-2026",
    "is-{coin}-a-good-investment", "{coin}-buy-or-sell", "will-{coin}-reach-new-highs",
  ];
  for (const coin of qCoins) {
    for (const pattern of qPatterns) {
      urls += `  <url>\n    <loc>${SITE_URL}/q/${pattern.replace("{coin}", coin)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n${urls}</urlset>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const articles = await fetchAllArticleSlugs();
    const sitemap = generateSitemap(articles);
    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Robots-Tag": "noindex",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
