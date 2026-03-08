import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://oraclebull.com";
const INDEXNOW_KEY = "oraclebull2026indexnow";

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
    // Fetch all article URLs from database
    const articleUrls = await getAllArticleUrls();

    // Core pages always submitted
    const corePages = [
      "/", "/dashboard", "/predictions", "/sentiment", "/explorer",
      "/strength-meter", "/factory", "/portfolio", "/learn", "/insights",
      "/factory/events", "/factory/onchain", "/factory/narratives", "/factory/news",
      "/about", "/contact", "/sitemap",
      "/market/best-crypto-to-buy-today", "/market/next-crypto-to-explode",
      "/market/top-crypto-gainers-today", "/market/crypto-market-prediction-today",
      "/price-prediction/bitcoin", "/price-prediction/ethereum",
      "/price-prediction/solana", "/price-prediction/ripple",
      "/price-prediction/cardano", "/price-prediction/dogecoin",
      "/chain/ethereum", "/chain/solana", "/chain/base", "/chain/arbitrum",
    ].map(p => `${SITE_URL}${p}`);

    const allUrls = [...corePages, ...articleUrls];

    // 1. Ping Google with both sitemaps
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const googlePing1 = fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`
    ).then(r => ({ engine: "google-static", status: r.status, ok: r.ok }))
     .catch(e => ({ engine: "google-static", status: 0, ok: false, error: e.message }));

    const googlePing2 = fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(supabaseUrl + "/functions/v1/sitemap")}`
    ).then(r => ({ engine: "google-dynamic", status: r.status, ok: r.ok }))
     .catch(e => ({ engine: "google-dynamic", status: 0, ok: false, error: e.message }));

    // 2. Ping Bing with both sitemaps
    const bingPing1 = fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`
    ).then(r => ({ engine: "bing-static", status: r.status, ok: r.ok }))
     .catch(e => ({ engine: "bing-static", status: 0, ok: false, error: e.message }));

    const bingPing2 = fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(supabaseUrl + "/functions/v1/sitemap")}`
    ).then(r => ({ engine: "bing-dynamic", status: r.status, ok: r.ok }))
     .catch(e => ({ engine: "bing-dynamic", status: 0, ok: false, error: e.message }));

    // 3. IndexNow - submit in batches of 10,000 (API limit)
    const indexNowEndpoints = [
      "https://api.indexnow.org/IndexNow",
      "https://www.bing.com/IndexNow",
      "https://yandex.com/indexnow",
    ];

    const batchSize = 10000;
    const indexNowResults: any[] = [];

    for (let i = 0; i < allUrls.length; i += batchSize) {
      const batch = allUrls.slice(i, i + batchSize);
      const payload = {
        host: "oraclebull.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList: batch,
      };

      const batchResults = await Promise.allSettled(
        indexNowEndpoints.map(endpoint =>
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload),
          }).then(r => ({ endpoint, status: r.status, ok: r.ok, batch: i / batchSize }))
        )
      );

      indexNowResults.push(...batchResults.map(r =>
        r.status === "fulfilled" ? r.value : { error: String(r.reason) }
      ));
    }

    const pingResults = await Promise.all([googlePing1, googlePing2, bingPing1, bingPing2]);

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
