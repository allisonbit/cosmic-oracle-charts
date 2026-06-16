const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const SITE_HOST = "oraclebull.com";
const SITE_URL = `https://${SITE_HOST}`;
// Key now lives in env (rotatable without a deploy); fall back to the legacy value.
const INDEXNOW_KEY = Deno.env.get("INDEXNOW_KEY") || "oraclebull2026indexnow";
const MAX_URLS = 1000;

// This endpoint submits URLs to Bing/Yandex/IndexNow under OUR host+key, so it must
// not be an open relay. Require the shared webhook secret.
function verifyApiKey(req: Request): boolean {
  const provided = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const expected = Deno.env.get("WEBHOOK_API_KEY");
  if (!expected) return false; // fail closed: WEBHOOK_API_KEY must be configured
  return !!provided && provided === expected;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!verifyApiKey(req)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "urls array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Normalize to absolute URLs and accept ONLY our own host (no off-domain spam).
    const fullUrls = (urls as string[])
      .map((u) => (typeof u === "string" ? u.trim() : ""))
      .filter(Boolean)
      .map((u) => (u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`))
      .filter((u) => {
        try {
          return new URL(u).hostname === SITE_HOST;
        } catch {
          return false;
        }
      })
      .slice(0, MAX_URLS);

    if (fullUrls.length === 0) {
      return new Response(JSON.stringify({ error: `no valid ${SITE_HOST} URLs` }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const indexNowPayload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/indexnow-key.txt`,
      urlList: fullUrls,
    };

    const endpoints = [
      "https://api.indexnow.org/IndexNow",
      "https://www.bing.com/IndexNow",
      "https://yandex.com/indexnow",
    ];

    const results = await Promise.allSettled(
      endpoints.map((endpoint) =>
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(indexNowPayload),
          signal: AbortSignal.timeout(8000),
        }).then((r) => ({ endpoint, status: r.status, ok: r.ok }))
      )
    );

    const googlePing = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + "/sitemap.xml")}`,
      { signal: AbortSignal.timeout(8000) }
    )
      .then((r) => ({ status: r.status, ok: r.ok }))
      .catch(() => ({ status: 0, ok: false }));

    return new Response(
      JSON.stringify({
        success: true,
        submitted: fullUrls.length,
        indexnow: results.map((r) => (r.status === "fulfilled" ? r.value : { error: String(r.reason) })),
        google_ping: googlePing,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (_error) {
    // Don't echo raw error.message to the client (info disclosure).
    return new Response(JSON.stringify({ error: "internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
