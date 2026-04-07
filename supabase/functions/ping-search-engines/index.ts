import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://oraclebull.com";
const INDEXNOW_KEY = "b4e2f8a1c3d5e7f9a0b2c4d6e8f0a1b3";

async function getAllArticleUrls(): Promise<string[]> {
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const urls: string[] = [];
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await sb
        .from("blog_articles")
        .select("slug, source")
        .order("published_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error || !data || data.length === 0) break;

      for (const row of data) {
        const prefix = row.source === "ai-blog" ? "/learn" : "/insights";
        urls.push(`${SITE_URL}${prefix}/${row.slug}`);
      }

      if (data.length < pageSize) break;
      offset += pageSize;
    }

    return urls;
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const articleUrls = await getAllArticleUrls();

    const corePages = [
      "/", "/dashboard", "/predictions", "/sentiment", "/explorer",
      "/strength-meter", "/factory", "/portfolio", "/learn", "/insights",
      "/trade", "/scanner",
      "/factory/events", "/factory/onchain", "/factory/narratives", "/factory/news",
      "/about", "/contact", "/sitemap",
      "/market/best-crypto-to-buy-today", "/market/next-crypto-to-explode",
      "/market/top-crypto-gainers-today", "/market/crypto-market-prediction-today",
      "/market/best-crypto-under-1-dollar", "/market/trending-crypto-today",
      "/market/best-long-term-crypto", "/market/best-altcoins-to-buy",
      "/price-prediction/bitcoin", "/price-prediction/ethereum",
      "/price-prediction/solana", "/price-prediction/ripple",
      "/price-prediction/cardano", "/price-prediction/dogecoin",
      "/price-prediction/shiba-inu", "/price-prediction/pepe",
      "/price-prediction/chainlink", "/price-prediction/polkadot",
      "/price-prediction/toncoin", "/price-prediction/sui",
      "/price-prediction/avalanche-2", "/price-prediction/near",
      "/price-prediction/arbitrum", "/price-prediction/optimism",
      "/chain/ethereum", "/chain/solana", "/chain/base", "/chain/arbitrum",
      "/chain/polygon", "/chain/optimism", "/chain/avalanche", "/chain/bnb",
      "/my", "/my/portfolio", "/my/scanner", "/my/watchlist", "/my/alerts",
      "/my/signals", "/my/journal", "/my/news", "/my/dca", "/my/copy", "/my/social",
      "/my/tracker",
    ].map(p => `${SITE_URL}${p}`);

    const allUrls = [...corePages, ...articleUrls];

    // 1. Ping Google & Bing with all sitemaps including sitemap index
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const sitemapUrls = [
      `${SITE_URL}/sitemap.xml`,
      `${supabaseUrl}/functions/v1/sitemap?type=index`,
      `${supabaseUrl}/functions/v1/sitemap`,
    ];

    const sitemapPings = sitemapUrls.flatMap(sitemapUrl => [
      fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
        .then(r => ({ engine: "google", sitemap: sitemapUrl, status: r.status, ok: r.ok }))
        .catch(e => ({ engine: "google", sitemap: sitemapUrl, status: 0, ok: false, error: e.message })),
      fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
        .then(r => ({ engine: "bing", sitemap: sitemapUrl, status: r.status, ok: r.ok }))
        .catch(e => ({ engine: "bing", sitemap: sitemapUrl, status: 0, ok: false, error: e.message })),
    ]);

    // 2. IndexNow - submit in batches
    const indexNowEndpoints = [
      "https://api.indexnow.org/IndexNow",
      "https://www.bing.com/IndexNow",
      "https://yandex.com/indexnow",
    ];

    const batchSize = 100;
    const indexNowResults: any[] = [];
    const priorityUrls = allUrls.slice(0, 1000);

    for (let i = 0; i < priorityUrls.length; i += batchSize) {
      const batch = priorityUrls.slice(i, i + batchSize);
      const payload = {
        host: "oraclebull.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: batch,
      };

      const batchResults = await Promise.allSettled(
        indexNowEndpoints.map(endpoint =>
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload),
          }).then(r => ({ endpoint, status: r.status, ok: r.ok, batch: Math.floor(i / batchSize) }))
        )
      );

      indexNowResults.push(...batchResults.map(r =>
        r.status === "fulfilled" ? r.value : { error: String(r.reason) }
      ));
    }

    const pingResults = await Promise.all(sitemapPings);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      totalUrlsSubmitted: allUrls.length,
      articleUrls: articleUrls.length,
      sitemapPings: pingResults,
      indexNow: indexNowResults,
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
