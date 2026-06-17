// GA4 Measurement Protocol proxy.
//
// Why: most ad-blockers (uBlock, Brave Shields, Pi-hole, AdGuard) block
// `google-analytics.com` and `googletagmanager.com` outright. By pointing
// gtag's `transport_url` at this function, the browser POSTs hit data to
// our own supabase.co subdomain — which the major blocklists do NOT block
// — and we forward it server-to-server to GA4. The net effect is recovering
// 20–40% of analytics traffic that GA4 currently never sees.
//
// We accept the request at ANY subpath (gtag will hit
// /functions/v1/ga-collect/g/collect) and forward to
// https://www.google-analytics.com/g/collect with the same query string
// and body. We also forward the client IP via the `_uip` query param so
// GA4 still attributes geo / city correctly.

const GA_ENDPOINT = "https://www.google-analytics.com/g/collect";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
};

function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const incoming = new URL(req.url);
    const target = new URL(GA_ENDPOINT);
    // Forward every query param GA4 sent (tid, cid, en, dl, dt, etc.)
    incoming.searchParams.forEach((v, k) => target.searchParams.append(k, v));

    // Attach client IP so GA4 geo-resolves real visitor location, not Supabase's.
    const ip = clientIp(req);
    if (ip && !target.searchParams.has("_uip")) target.searchParams.set("_uip", ip);

    const body = req.method === "POST" ? await req.arrayBuffer() : undefined;

    const upstream = await fetch(target.toString(), {
      method: req.method,
      headers: {
        "User-Agent": req.headers.get("user-agent") || "Mozilla/5.0",
        "Content-Type": req.headers.get("content-type") || "text/plain;charset=UTF-8",
        // GA uses these for de-duplication and bot detection.
        ...(req.headers.get("accept-language")
          ? { "Accept-Language": req.headers.get("accept-language")! }
          : {}),
      },
      body,
    });

    // GA4 returns 204 No Content on success. Mirror its status; body is
    // typically empty.
    return new Response(null, {
      status: upstream.status,
      headers: corsHeaders,
    });
  } catch (_e) {
    // Never break the host page if GA forwarding fails — return 204.
    return new Response(null, { status: 204, headers: corsHeaders });
  }
});