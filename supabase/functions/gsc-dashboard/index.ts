// GSC Dashboard proxy — queries Google Search Console via the Lovable connector gateway.
// Requires the google_search_console connector to be linked to this project.
import { corsHeaders, jsonResponse, preflight } from "../_shared/cors.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE_URL = "https://oraclebull.com/";

function authHeaders() {
  const lovable = Deno.env.get("LOVABLE_API_KEY");
  const gsc = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!lovable || !gsc) throw new Error("GSC connector not linked");
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": gsc,
    "Content-Type": "application/json",
  };
}

async function gsc(path: string, init: RequestInit = {}) {
  const res = await fetch(`${GATEWAY}${path}`, { ...init, headers: { ...authHeaders(), ...(init.headers || {}) } });
  const text = await res.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* keep text */ }
  return { ok: res.ok, status: res.status, body };
}

function daysAgo(n: number) {
  const d = new Date(Date.now() - n * 86400_000);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  const pre = preflight(req); if (pre) return pre;
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "summary";
    const site = encodeURIComponent(url.searchParams.get("siteUrl") ?? SITE_URL);
    const days = Number(url.searchParams.get("days") ?? "28");

    if (action === "sites") {
      const r = await gsc(`/webmasters/v3/sites`);
      return jsonResponse(r.body, { status: r.status });
    }

    if (action === "sitemaps") {
      const r = await gsc(`/webmasters/v3/sites/${site}/sitemaps`);
      return jsonResponse(r.body, { status: r.status });
    }

    if (action === "top-queries" || action === "top-pages") {
      const dim = action === "top-queries" ? "query" : "page";
      const r = await gsc(`/webmasters/v3/sites/${site}/searchAnalytics/query`, {
        method: "POST",
        body: JSON.stringify({
          startDate: daysAgo(days),
          endDate: daysAgo(1),
          dimensions: [dim],
          rowLimit: 50,
        }),
      });
      return jsonResponse(r.body, { status: r.status });
    }

    if (action === "inspect") {
      const inspectionUrl = url.searchParams.get("url");
      if (!inspectionUrl) return jsonResponse({ error: "url required" }, { status: 400 });
      const r = await gsc(`/v1/urlInspection/index:inspect`, {
        method: "POST",
        body: JSON.stringify({ inspectionUrl, siteUrl: decodeURIComponent(site) }),
      });
      return jsonResponse(r.body, { status: r.status });
    }

    // summary: totals + daily trend
    const totals = await gsc(`/webmasters/v3/sites/${site}/searchAnalytics/query`, {
      method: "POST",
      body: JSON.stringify({ startDate: daysAgo(days), endDate: daysAgo(1) }),
    });
    const daily = await gsc(`/webmasters/v3/sites/${site}/searchAnalytics/query`, {
      method: "POST",
      body: JSON.stringify({ startDate: daysAgo(days), endDate: daysAgo(1), dimensions: ["date"] }),
    });
    return jsonResponse({ totals: totals.body, daily: daily.body }, { status: 200 });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});