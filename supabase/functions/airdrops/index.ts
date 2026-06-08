// ──────────────────────────────────────────────────────────────────────────────
// airdrops — real, data-driven airdrop candidates from DefiLlama.
//
// The strongest *honest* airdrop signal is a protocol that has real TVL and (often)
// VC funding but NO token yet. DefiLlama marks tokenless protocols with symbol "-".
// We fetch /protocols + /raises, keep funded/high-TVL tokenless DeFi protocols,
// attach their funding, and derive a transparent TVL-based "potential" tier.
//
// No fabricated dollar payouts — only real metrics (TVL, chains, category, funding).
// Cached 1h, CORS-enabled. Informational only.
// ──────────────────────────────────────────────────────────────────────────────
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXCLUDE_CATEGORIES = new Set(["CEX", "Chain", "Bridge", "Staking Pool", "Infrastructure", "RWA", "Stablecoins", "Basis Trading"]);
const MIN_TVL = 3_000_000;

const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function tier(tvl: number, funded: boolean): string {
  if (tvl >= 100_000_000 || (tvl >= 40_000_000 && funded)) return "High";
  if (tvl >= 20_000_000 || (tvl >= 8_000_000 && funded)) return "Notable";
  return "Emerging";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const [protoRes, raiseRes] = await Promise.allSettled([
      fetch("https://api.llama.fi/protocols"),
      fetch("https://api.llama.fi/raises"),
    ]);

    const protocols: any[] = protoRes.status === "fulfilled" && protoRes.value.ok ? await protoRes.value.json() : [];

    // Build funding map keyed by normalized name.
    const fundMap = new Map<string, { amount: number; round: string; investors: string[]; date: number }>();
    if (raiseRes.status === "fulfilled" && raiseRes.value.ok) {
      const rj = await raiseRes.value.json();
      for (const r of rj?.raises || []) {
        const k = norm(r?.name);
        if (!k) continue;
        const amount = Number(r?.amount) || 0; // millions
        const prev = fundMap.get(k);
        const investors = [...(r?.leadInvestors || []), ...(r?.investors || [])].filter(Boolean).slice(0, 6);
        if (!prev || amount > prev.amount) fundMap.set(k, { amount, round: r?.round || "", investors, date: Number(r?.date) || 0 });
      }
    }

    const candidates = [];
    const seen = new Set<string>();
    for (const p of protocols) {
      const symbol = p?.symbol;
      const tokenless = !symbol || symbol === "-" || symbol === "";
      if (!tokenless) continue;
      const tvl = Number(p?.tvl) || 0;
      if (tvl < MIN_TVL) continue;
      const category = p?.category || "DeFi";
      if (EXCLUDE_CATEGORIES.has(category)) continue;
      const key = norm(p?.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);

      const fund = fundMap.get(key);
      candidates.push({
        name: p?.name || "Unknown",
        slug: p?.slug || key,
        logo: p?.logo || "",
        url: p?.url || (p?.slug ? `https://defillama.com/protocol/${p.slug}` : "https://defillama.com"),
        defillama: p?.slug ? `https://defillama.com/protocol/${p.slug}` : "https://defillama.com",
        chains: Array.isArray(p?.chains) ? p.chains.slice(0, 5) : [],
        category,
        tvl,
        change7d: Number(p?.change_7d) || 0,
        funding: fund ? { amountM: fund.amount, round: fund.round, investors: fund.investors } : null,
        potential: tier(tvl, !!fund),
      });
    }

    candidates.sort((a, b) => b.tvl - a.tvl);
    const top = candidates.slice(0, 150);
    const chains = Array.from(new Set(top.flatMap((c) => c.chains))).slice(0, 24);

    return new Response(JSON.stringify({ candidates: top, count: candidates.length, chains, source: "DefiLlama" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ candidates: [], count: 0, chains: [], error: String(e) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
