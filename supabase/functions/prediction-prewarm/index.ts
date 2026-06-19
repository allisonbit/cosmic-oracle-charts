import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top 100 cryptocurrencies by market cap
const TOP_100_COINS = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'tether', symbol: 'USDT' },
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'ripple', symbol: 'XRP' },
  { id: 'usd-coin', symbol: 'USDC' },
  { id: 'cardano', symbol: 'ADA' },
  { id: 'dogecoin', symbol: 'DOGE' },
  { id: 'avalanche-2', symbol: 'AVAX' },
  { id: 'polkadot', symbol: 'DOT' },
  { id: 'tron', symbol: 'TRX' },
  { id: 'chainlink', symbol: 'LINK' },
  { id: 'polygon', symbol: 'MATIC' },
  { id: 'shiba-inu', symbol: 'SHIB' },
  { id: 'wrapped-bitcoin', symbol: 'WBTC' },
  { id: 'litecoin', symbol: 'LTC' },
  { id: 'bitcoin-cash', symbol: 'BCH' },
  { id: 'uniswap', symbol: 'UNI' },
  { id: 'stellar', symbol: 'XLM' },
  { id: 'cosmos', symbol: 'ATOM' },
  { id: 'monero', symbol: 'XMR' },
  { id: 'ethereum-classic', symbol: 'ETC' },
  { id: 'okb', symbol: 'OKB' },
  { id: 'hedera-hashgraph', symbol: 'HBAR' },
  { id: 'filecoin', symbol: 'FIL' },
  { id: 'aptos', symbol: 'APT' },
  { id: 'arbitrum', symbol: 'ARB' },
  { id: 'lido-dao', symbol: 'LDO' },
  { id: 'vechain', symbol: 'VET' },
  { id: 'near', symbol: 'NEAR' },
  { id: 'optimism', symbol: 'OP' },
  { id: 'maker', symbol: 'MKR' },
  { id: 'fantom', symbol: 'FTM' },
  { id: 'the-graph', symbol: 'GRT' },
  { id: 'injective-protocol', symbol: 'INJ' },
  { id: 'theta-token', symbol: 'THETA' },
  { id: 'immutable-x', symbol: 'IMX' },
  { id: 'render-token', symbol: 'RNDR' },
  { id: 'aave', symbol: 'AAVE' },
  { id: 'algorand', symbol: 'ALGO' },
  { id: 'flow', symbol: 'FLOW' },
  { id: 'elrond-erd-2', symbol: 'EGLD' },
  { id: 'quant-network', symbol: 'QNT' },
  { id: 'axie-infinity', symbol: 'AXS' },
  { id: 'eos', symbol: 'EOS' },
  { id: 'the-sandbox', symbol: 'SAND' },
  { id: 'decentraland', symbol: 'MANA' },
  { id: 'kucoin-shares', symbol: 'KCS' },
  { id: 'neo', symbol: 'NEO' },
  { id: 'gala', symbol: 'GALA' },
  { id: 'chiliz', symbol: 'CHZ' },
  { id: 'zcash', symbol: 'ZEC' },
  { id: 'iota', symbol: 'IOTA' },
  { id: 'kava', symbol: 'KAVA' },
  { id: 'mina-protocol', symbol: 'MINA' },
  { id: 'curve-dao-token', symbol: 'CRV' },
  { id: '1inch', symbol: '1INCH' },
  { id: 'enjincoin', symbol: 'ENJ' },
  { id: 'nexo', symbol: 'NEXO' },
  { id: 'convex-finance', symbol: 'CVX' },
  { id: 'gmx', symbol: 'GMX' },
  { id: 'loopring', symbol: 'LRC' },
  { id: 'zilliqa', symbol: 'ZIL' },
  { id: 'dash', symbol: 'DASH' },
  { id: 'compound-governance-token', symbol: 'COMP' },
  { id: 'mask-network', symbol: 'MASK' },
  { id: 'basic-attention-token', symbol: 'BAT' },
  { id: 'yearn-finance', symbol: 'YFI' },
  { id: 'decred', symbol: 'DCR' },
  { id: 'ravencoin', symbol: 'RVN' },
  { id: 'waves', symbol: 'WAVES' },
  { id: 'gnosis', symbol: 'GNO' },
  { id: 'celo', symbol: 'CELO' },
  { id: 'kusama', symbol: 'KSM' },
  { id: 'amp-token', symbol: 'AMP' },
  { id: 'ankr', symbol: 'ANKR' },
  { id: 'storj', symbol: 'STORJ' },
  { id: 'ocean-protocol', symbol: 'OCEAN' },
  { id: 'siacoin', symbol: 'SC' },
  { id: 'harmony', symbol: 'ONE' },
  { id: 'skale', symbol: 'SKL' },
  { id: 'livepeer', symbol: 'LPT' },
  { id: 'balancer', symbol: 'BAL' },
  { id: 'sushi', symbol: 'SUSHI' },
  { id: 'bancor', symbol: 'BNT' },
  { id: 'uma', symbol: 'UMA' },
  { id: 'fetch-ai', symbol: 'FET' },
  { id: 'iostoken', symbol: 'IOST' },
  { id: 'ontology', symbol: 'ONT' },
  { id: 'qtum', symbol: 'QTUM' },
  { id: 'icon', symbol: 'ICX' },
  { id: 'lisk', symbol: 'LSK' },
  { id: 'nervos-network', symbol: 'CKB' },
  { id: 'wax', symbol: 'WAXP' },
  { id: 'arweave', symbol: 'AR' },
  { id: 'audius', symbol: 'AUDIO' },
  { id: 'perpetual-protocol', symbol: 'PERP' },
  { id: 'dydx', symbol: 'DYDX' },
  { id: 'sui', symbol: 'SUI' },
];

// Daily is the hub-critical timeframe we keep warm here. Weekly/monthly setups are
// generated on demand (page visit) and advanced by setup-monitor when one resolves.
const TIMEFRAMES = ['daily'];

// Delegate to the REAL price-prediction function so the hub data and the
// monitored trade_setups use the same accurate, seeded, data-driven analysis
// (no more Math.random fabrication). The function handles its own cache +
// generate-once setup persistence, so repeat calls on fresh coins are cheap.
async function warmPrediction(coinId: string, symbol: string, timeframe: string): Promise<'generated' | 'skipped' | 'error'> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return 'error';
  try {
    const r = await fetch(`${url}/functions/v1/price-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ coinId, symbol, timeframe }),
      signal: AbortSignal.timeout(25000),
    });
    return r.ok ? 'generated' : 'error';
  } catch (_) {
    return 'error';
  }
}

// Run tasks with bounded concurrency and an overall time budget so we stay within
// the edge-function wall-clock limit.
async function runPool<T>(items: T[], concurrency: number, deadlineMs: number, worker: (item: T) => Promise<void>) {
  const start = Date.now();
  let i = 0;
  async function next(): Promise<void> {
    while (i < items.length && Date.now() - start < deadlineMs) {
      const item = items[i++];
      await worker(item);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => next()));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Optional shared-secret gate (fail-open until WEBHOOK_API_KEY is set) ──────
  // Cron-only function. This is the worst cost-bomb: each call fans out ~100 paid
  // AI predictions, so an anonymous POST = up to ~100 paid LLM calls. Once
  // WEBHOOK_API_KEY is set as a Supabase secret AND the cron job sends it as the
  // `x-webhook-key` header, anonymous callers are rejected. Until the secret is
  // set, behavior is unchanged (open) — so deploying this breaks nothing.
  const webhookKey = Deno.env.get('WEBHOOK_API_KEY');
  if (webhookKey && req.headers.get('x-webhook-key') !== webhookKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('Starting prediction pre-warming...');
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clean up expired predictions first
    try {
      await supabase.rpc('cleanup_expired_predictions');
    } catch (e) {
      console.log('Cleanup skipped:', e);
    }

    // Build the work list (coin × timeframe), then drive the REAL generator with
    // bounded concurrency under a wall-clock budget. Each call refreshes the
    // accurate prediction cache and (via generate-once) the monitored setup.
    const jobs = TOP_100_COINS.flatMap(c => TIMEFRAMES.map(tf => ({ coin: c, tf })));
    let generated = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    await runPool(jobs, 6, 110_000, async ({ coin, tf }) => {
      const res = await warmPrediction(coin.id, coin.symbol, tf);
      if (res === 'generated') generated++;
      else { errorsCount++; if (errors.length < 10) errors.push(`${coin.symbol}/${tf}`); }
    });

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalCoins: TOP_100_COINS.length,
        totalTimeframes: TIMEFRAMES.length,
        jobs: jobs.length,
        warmed: generated,
        errors: errorsCount,
      },
      errors,
    };
    
    console.log('Pre-warming complete:', summary);
    
    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Pre-warming error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});