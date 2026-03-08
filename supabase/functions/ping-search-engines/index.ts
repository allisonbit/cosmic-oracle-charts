const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://oraclebull.com";
const INDEXNOW_KEY = "oraclebull2026indexnow";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const googlePing = fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`
    ).then(r => ({ engine: "google", status: r.status, ok: r.ok }))
     .catch(e => ({ engine: "google", status: 0, ok: false, error: e.message }));

    const bingPing = fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`
    ).then(r => ({ engine: "bing", status: r.status, ok: r.ok }))
     .catch(e => ({ engine: "bing", status: 0, ok: false, error: e.message }));

    const keyPages = [
      "/", "/dashboard", "/predictions", "/sentiment", "/explorer",
      "/strength-meter", "/factory", "/portfolio", "/learn", "/insights",
      "/market/best-crypto-to-buy-today", "/market/next-crypto-to-explode",
      "/price-prediction/bitcoin/daily", "/price-prediction/ethereum/daily",
      "/price-prediction/solana/daily",
    ];

    const indexNowPing = fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "oraclebull.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList: keyPages.map(p => `${SITE_URL}${p}`),
      }),
    }).then(r => ({ engine: "indexnow", status: r.status, ok: r.ok }))
     .catch(e => ({ engine: "indexnow", status: 0, ok: false, error: e.message }));

    const results = await Promise.all([googlePing, bingPing, indexNowPing]);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      results,
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
