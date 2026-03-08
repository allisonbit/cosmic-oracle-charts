import { corsHeaders } from "../_shared/cors.ts";

// IndexNow API key - also needs to be served at /indexnow-key.txt
const INDEXNOW_KEY = "oraclebull2026indexnow";
const SITE_URL = "https://oraclebull.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Format URLs with full domain
    const fullUrls = urls.map((u: string) => u.startsWith("http") ? u : `${SITE_URL}${u}`);

    // Submit to IndexNow (Bing, Yandex, Seznam, Naver)
    const indexNowPayload = {
      host: "oraclebull.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/indexnow-key.txt`,
      urlList: fullUrls.slice(0, 10000), // Max 10k per request
    };

    const endpoints = [
      "https://api.indexnow.org/IndexNow",
      "https://www.bing.com/IndexNow",
      "https://yandex.com/indexnow",
    ];

    const results = await Promise.allSettled(
      endpoints.map(endpoint =>
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(indexNowPayload),
        }).then(async r => ({
          endpoint,
          status: r.status,
          ok: r.ok,
        }))
      )
    );

    // Also ping Google sitemap
    const googlePing = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`
    ).then(r => ({ status: r.status, ok: r.ok })).catch(() => ({ status: 0, ok: false }));

    return new Response(JSON.stringify({
      success: true,
      submitted: fullUrls.length,
      indexnow: results.map(r => r.status === "fulfilled" ? r.value : { error: String(r.reason) }),
      google_ping: googlePing,
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
