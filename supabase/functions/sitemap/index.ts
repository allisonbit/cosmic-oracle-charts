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
  { path: "/trade", priority: "0.8", changefreq: "hourly" },
  { path: "/scanner", priority: "0.7", changefreq: "daily" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/sitemap", priority: "0.4", changefreq: "weekly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/risk-disclaimer", priority: "0.3", changefreq: "yearly" },
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
  { path: "/my/tracker", priority: "0.6", changefreq: "daily" },
];

const chains = [
  "ethereum", "solana", "base", "arbitrum", "polygon", "optimism",
  "avalanche", "bnb", "fantom", "zksync", "linea", "scroll", "mantle",
  "bitcoin", "cardano", "polkadot", "cosmos", "near", "aptos", "sui", "tron",
];

// Expanded to 100+ coins for maximum coverage
const topCryptos = [
  "bitcoin", "ethereum", "solana", "binancecoin", "ripple", "cardano", "dogecoin",
  "polkadot", "chainlink", "avalanche-2", "matic-network", "shiba-inu", "litecoin",
  "uniswap", "cosmos", "near", "arbitrum", "optimism", "aptos", "sui", "pepe", "floki", "bonk",
  "toncoin", "tron", "stellar", "monero", "okb", "hedera", "filecoin", "vechain",
  "internet-computer", "render-token", "fetch-ai", "injective-protocol", "kaspa", "theta-token",
  "aave", "maker", "lido-dao", "the-graph", "ens", "immutable-x", "gala",
  "worldcoin-wld", "sei-network", "celestia", "jupiter-exchange-solana", "jito-governance-token",
  "pyth-network", "wormhole", "ondo-finance", "ethena", "pendle", "eigenlayer",
  "starknet", "zksync", "mantle", "mantra-dao", "bittensor", "akash-network",
  "arweave", "helium", "iota", "eos", "neo", "zilliqa", "algorand", "elrond-erd-2",
  "quant-network", "fantom", "decentraland", "the-sandbox", "axie-infinity",
  "enjincoin", "flow-token", "mina-protocol", "oasis-network", "celo", "harmony",
  "kava", "thorchain", "1inch", "sushi", "compound-governance-token", "yearn-finance",
  "curve-dao-token", "balancer", "synthetix-network-token", "rocket-pool",
  "frax-share", "convex-finance", "ribbon-finance", "gmx", "dydx",
  "pancakeswap-token", "raydium", "orca", "marinade-staked-sol",
  "trump", "melania", "brett", "popcat", "wen-4", "cat-in-a-dogs-world",
  "solayer", "grass", "ai16z", "virtual-protocol", "griffain",
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
  "best-crypto-under-1-dollar", "best-long-term-crypto", "crypto-to-buy-before-bull-run",
  "best-staking-crypto", "highest-apy-crypto", "best-layer-2-crypto",
  "best-gaming-crypto", "best-metaverse-crypto", "best-privacy-coins",
  "best-crypto-for-passive-income", "trending-crypto-today",
  "crypto-bull-run-prediction", "will-crypto-crash-today", "crypto-market-outlook",
  "best-crypto-to-buy-2026", "best-crypto-to-buy-2027", "crypto-with-highest-potential-2027",
  "bitcoin-prediction-today", "ethereum-prediction-today", "solana-prediction-today",
  "xrp-prediction-today", "will-bitcoin-reach-100k", "will-ethereum-reach-10k",
  "best-crypto-for-beginners", "most-undervalued-crypto", "crypto-to-hold-long-term",
  "best-crypto-presale", "top-100-crypto", "which-crypto-to-buy-right-now",
  "best-crypto-exchange", "crypto-market-cap-today", "bitcoin-vs-ethereum",
  "will-solana-go-up", "will-xrp-go-up", "will-cardano-go-up",
];

const qCoins = [
  "bitcoin", "ethereum", "solana", "ripple", "cardano", "dogecoin", "shiba-inu",
  "pepe", "chainlink", "polkadot", "avalanche", "toncoin", "sui", "aptos",
  "near", "arbitrum", "optimism", "bonk", "floki", "kaspa",
  "render-token", "fetch-ai", "injective", "worldcoin", "sei",
  "litecoin", "uniswap", "cosmos", "stellar", "monero",
  "hedera", "vechain", "filecoin", "aave", "maker",
  "the-graph", "immutable-x", "gala", "celestia", "jupiter",
  "tron", "bnb", "polygon", "internet-computer", "theta",
  "bittensor", "pendle", "ondo", "starknet", "trump",
];

const qPatterns = [
  "what-will-{coin}-price-be-today", "will-{coin}-go-up-today", "{coin}-price-prediction-today",
  "is-{coin}-bullish-today", "should-i-buy-{coin}-today", "{coin}-forecast-today",
  "is-{coin}-going-up-or-down-today", "{coin}-price-tomorrow", "{coin}-price-right-now",
  "is-{coin}-a-buy-today",
  "what-will-{coin}-price-be-this-week", "will-{coin}-go-up-this-week",
  "{coin}-price-prediction-this-week", "{coin}-weekly-forecast",
  "should-i-buy-{coin}-this-week", "{coin}-analysis-this-week", "{coin}-price-next-week",
  "what-will-{coin}-price-be-this-month", "is-{coin}-a-good-investment-this-month",
  "{coin}-price-prediction-this-month", "{coin}-monthly-forecast",
  "should-i-buy-{coin}-now", "{coin}-price-prediction-2026", "{coin}-price-prediction-2027",
  "is-{coin}-a-good-investment", "{coin}-buy-or-sell", "will-{coin}-reach-new-highs",
  "{coin}-technical-analysis", "{coin}-whale-activity", "{coin}-vs-bitcoin",
  "{coin}-price-prediction-long-term", "is-{coin}-worth-buying",
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

      if (error) break;
      if (!data || data.length === 0) break;
      allArticles.push(...data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    return allArticles;
  } catch {
    return [];
  }
}

function generateSitemapIndex(articleCount: number): string {
  const now = new Date().toISOString();
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap?type=core</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap?type=predictions</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap?type=chains</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap?type=market</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap?type=questions</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap?type=articles</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${supabaseUrl}/functions/v1/sitemap?type=learn</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function url(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
}

function wrapUrlset(urls: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n${urls}</urlset>`;
}

function generateCoreSitemap(): string {
  const now = new Date().toISOString();
  let urls = "";
  for (const route of staticRoutes) {
    urls += url(`${SITE_URL}${route.path}`, now, route.changefreq, route.priority);
  }
  return wrapUrlset(urls);
}

function generatePredictionsSitemap(): string {
  const now = new Date().toISOString();
  let urls = "";
  for (const crypto of topCryptos) {
    for (const tf of ["", "/daily", "/weekly", "/monthly"]) {
      urls += url(`${SITE_URL}/price-prediction/${crypto}${tf}`, now, "hourly", "0.9");
    }
  }
  return wrapUrlset(urls);
}

function generateChainsSitemap(): string {
  const now = new Date().toISOString();
  let urls = "";
  for (const chain of chains) {
    urls += url(`${SITE_URL}/chain/${chain}`, now, "hourly", "0.8");
  }
  return wrapUrlset(urls);
}

function generateMarketSitemap(): string {
  const now = new Date().toISOString();
  let urls = "";
  for (const q of marketQuestions) {
    urls += url(`${SITE_URL}/market/${q}`, now, "daily", "0.8");
  }
  for (const crypto of topCryptos) {
    urls += url(`${SITE_URL}/markets/${crypto}`, now, "daily", "0.7");
  }
  return wrapUrlset(urls);
}

function generateQuestionsSitemap(): string {
  const today = new Date().toISOString().split("T")[0];
  let urls = "";
  for (const coin of qCoins) {
    for (const pattern of qPatterns) {
      urls += url(`${SITE_URL}/q/${pattern.replace("{coin}", coin)}`, today, "daily", "0.6");
    }
  }
  return wrapUrlset(urls);
}

function generateArticlesSitemap(articles: BlogArticleRow[]): string {
  const today = new Date().toISOString().split("T")[0];
  const learnSlugs = new Set(educationalSlugs);
  const seen = new Set<string>();
  let urls = "";

  for (const article of articles) {
    if (learnSlugs.has(article.slug) || seen.has(article.slug)) continue;
    seen.add(article.slug);
    const lastmod = article.published_at ? article.published_at.split("T")[0] : today;
    const prefix = article.source === "ai-blog" ? "/learn" : "/insights";
    urls += url(`${SITE_URL}${prefix}/${article.slug}`, lastmod, "daily", "0.7");
  }
  return wrapUrlset(urls);
}

function generateLearnSitemap(): string {
  const today = new Date().toISOString().split("T")[0];
  let urls = "";
  for (const slug of educationalSlugs) {
    urls += url(`${SITE_URL}/learn/${slug}`, today, "weekly", "0.7");
  }
  return wrapUrlset(urls);
}

// Legacy: Generate full single sitemap (backward compatible)
function generateFullSitemap(articles: BlogArticleRow[]): string {
  const now = new Date().toISOString();
  const today = now.split("T")[0];
  let urls = "";

  for (const route of staticRoutes) {
    urls += url(`${SITE_URL}${route.path}`, now, route.changefreq, route.priority);
  }
  for (const chain of chains) {
    urls += url(`${SITE_URL}/chain/${chain}`, now, "hourly", "0.8");
  }
  for (const crypto of topCryptos) {
    for (const tf of ["", "/daily", "/weekly", "/monthly"]) {
      urls += url(`${SITE_URL}/price-prediction/${crypto}${tf}`, now, "hourly", "0.9");
    }
  }
  for (const q of marketQuestions) {
    urls += url(`${SITE_URL}/market/${q}`, now, "daily", "0.8");
  }
  for (const crypto of topCryptos) {
    urls += url(`${SITE_URL}/markets/${crypto}`, now, "daily", "0.7");
  }
  for (const slug of educationalSlugs) {
    urls += url(`${SITE_URL}/learn/${slug}`, today, "weekly", "0.7");
  }

  const learnSlugs = new Set(educationalSlugs);
  const seen = new Set<string>();
  for (const article of articles) {
    if (learnSlugs.has(article.slug) || seen.has(article.slug)) continue;
    seen.add(article.slug);
    const lastmod = article.published_at ? article.published_at.split("T")[0] : today;
    const prefix = article.source === "ai-blog" ? "/learn" : "/insights";
    urls += url(`${SITE_URL}${prefix}/${article.slug}`, lastmod, "daily", "0.7");
  }

  for (const coin of qCoins) {
    for (const pattern of qPatterns) {
      urls += url(`${SITE_URL}/q/${pattern.replace("{coin}", coin)}`, today, "daily", "0.6");
    }
  }

  return wrapUrlset(urls);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqUrl = new URL(req.url);
    const type = reqUrl.searchParams.get("type");

    const articles = (type === "core" || type === "chains" || type === "predictions" || 
                      type === "market" || type === "questions" || type === "learn" || !type)
      ? [] : await fetchAllArticleSlugs();

    // If type=index, return sitemap index
    let sitemap: string;

    if (type === "index") {
      sitemap = generateSitemapIndex(articles.length);
    } else if (type === "core") {
      sitemap = generateCoreSitemap();
    } else if (type === "predictions") {
      sitemap = generatePredictionsSitemap();
    } else if (type === "chains") {
      sitemap = generateChainsSitemap();
    } else if (type === "market") {
      sitemap = generateMarketSitemap();
    } else if (type === "questions") {
      sitemap = generateQuestionsSitemap();
    } else if (type === "articles") {
      const allArticles = await fetchAllArticleSlugs();
      sitemap = generateArticlesSitemap(allArticles);
    } else if (type === "learn") {
      sitemap = generateLearnSitemap();
    } else {
      // Default: full sitemap for backward compatibility
      const allArticles = await fetchAllArticleSlugs();
      sitemap = generateFullSitemap(allArticles);
    }

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
