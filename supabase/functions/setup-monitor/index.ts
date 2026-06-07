import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ════════════════════════════════════════════════════════════════════════════
// setup-monitor — resolves active trade_setups against live prices.
//
// Runs on a schedule (cron). For each active global setup it fetches the live
// price (CoinGecko for known ids, DexScreener for contract tokens), updates
// last_price / peak_price / pnl_percent, and transitions the status when a TP or
// the stop is hit. This is what makes setups "play out" and produces an honest
// track record. Idempotent and batched.
// ════════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSupabase() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

async function priceFromCoinGecko(coinId: string): Promise<number | null> {
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!r.ok) return null;
    const d = await r.json();
    const p = d?.[coinId]?.usd;
    return typeof p === "number" && p > 0 ? p : null;
  } catch { return null; }
}

async function priceFromDexScreener(address: string, chain?: string): Promise<number | null> {
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const pairs = d?.pairs || [];
    if (pairs.length === 0) return null;
    const onChain = chain ? pairs.filter((p: any) => p.chainId === chain) : [];
    const pool = (onChain.length > 0 ? onChain : pairs)
      .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    const p = parseFloat(pool[0]?.priceUsd || "0");
    return p > 0 ? p : null;
  } catch { return null; }
}

async function livePrice(s: any): Promise<number | null> {
  if (s.contract_address) {
    const p = await priceFromDexScreener(s.contract_address, s.chain);
    if (p) return p;
  }
  return priceFromCoinGecko(s.coin_id);
}

// After a setup resolves, immediately scan for the NEXT one by forcing a fresh
// prediction (bypassing cache). Fire-and-forget — failures are non-fatal.
async function scanForNextSetup(s: any) {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    await fetch(`${url}/functions/v1/price-prediction`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        coinId: s.coin_id,
        symbol: s.symbol,
        timeframe: s.timeframe,
        contractAddress: s.contract_address || undefined,
        chain: s.chain || undefined,
        forceFresh: true,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (_) { /* non-fatal */ }
}

/** Decide the new status given the levels and the live price.
 *
 * The script: ENTRY / SL / TP stay frozen until the trade reaches its target.
 * The FIRST take-profit hit COUNTS AS A WIN and resolves the setup (terminal) so
 * the slot frees and the next setup can be scanned. A stop or expiry is terminal
 * too. We still record how far price ran (tp1/tp2/tp3) for an honest record, and
 * we book P&L at the exact level reached (not the overshoot at detection time).
 */
function evaluate(s: any, price: number) {
  const bullish = s.bias !== "bearish"; // treat neutral as long-biased setup
  const entry = Number(s.entry_price) || price;
  const sl = Number(s.stop_loss);
  const tp1 = Number(s.take_profit_1), tp2 = Number(s.take_profit_2), tp3 = Number(s.take_profit_3);

  let status = s.status as string;
  let hitTargets = Number(s.hit_targets) || 0;
  let exitPrice = price; // level used to book the result

  if (bullish) {
    if (sl && price <= sl) { status = "stopped"; exitPrice = sl; }
    else if (tp1 && price >= tp1) {
      // First target reached → WIN. Note the furthest TP touched for the record.
      if (tp3 && price >= tp3) { status = "hit_tp3"; hitTargets = 3; exitPrice = tp3; }
      else if (tp2 && price >= tp2) { status = "hit_tp2"; hitTargets = 2; exitPrice = tp2; }
      else { status = "hit_tp1"; hitTargets = 1; exitPrice = tp1; }
    }
  } else {
    if (sl && price >= sl) { status = "stopped"; exitPrice = sl; }
    else if (tp1 && price <= tp1) {
      if (tp3 && price <= tp3) { status = "hit_tp3"; hitTargets = 3; exitPrice = tp3; }
      else if (tp2 && price <= tp2) { status = "hit_tp2"; hitTargets = 2; exitPrice = tp2; }
      else { status = "hit_tp1"; hitTargets = 1; exitPrice = tp1; }
    }
  }

  // Expiry: if the window passed without a decisive hit, close it out at last price.
  if (status === s.status && s.expires_at && new Date(s.expires_at).getTime() < Date.now()) {
    status = "expired";
    exitPrice = price;
  }

  const pnl = entry > 0 ? ((exitPrice - entry) / entry) * 100 * (bullish ? 1 : -1) : 0;
  // ANY take-profit hit is a win and terminal; stop and expiry are terminal too.
  const terminal =
    status === "hit_tp1" || status === "hit_tp2" || status === "hit_tp3" ||
    status === "stopped" || status === "expired";

  return { status, hitTargets, pnl: Math.round(pnl * 100) / 100, terminal };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = getSupabase();
  if (!supabase) {
    return new Response(JSON.stringify({ error: "No service credentials" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    // Monitor only ACTIVE global setups — a TP/SL/expiry resolves them terminally,
    // so there's exactly one open trade per coin/timeframe at a time (cap per run).
    const { data: setups, error } = await supabase
      .from("trade_setups")
      .select("*")
      .eq("scope", "global")
      .eq("status", "active")
      .order("updated_at", { ascending: true })
      .limit(60);

    if (error) throw error;

    let checked = 0, resolved = 0, updated = 0;

    for (const s of setups || []) {
      const price = await livePrice(s);
      if (!price) continue;
      checked++;

      const ev = evaluate(s, price);
      const peak = s.bias === "bearish"
        ? Math.min(Number(s.peak_price) || price, price)
        : Math.max(Number(s.peak_price) || price, price);

      const patch: any = {
        last_price: price,
        peak_price: peak,
        pnl_percent: ev.pnl,
        hit_targets: ev.hitTargets,
        status: ev.status,
        updated_at: new Date().toISOString(),
      };
      if (ev.terminal && !s.resolved_at) {
        patch.resolved_at = new Date().toISOString();
        resolved++;
      }
      if (ev.status !== s.status) updated++;

      await supabase.from("trade_setups").update(patch).eq("id", s.id);

      // Win/loss booked → immediately scan for the next setup for this coin.
      if (ev.terminal && !s.resolved_at) {
        await scanForNextSetup(s);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, total: setups?.length || 0, checked, statusChanges: updated, resolved }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("setup-monitor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
