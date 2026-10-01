// Engine self-test: runs the real prediction math over realistic synthetic
// price series (GBM with regime shifts) and asserts sane, varied outputs.
// Run: npx tsx scripts/verify-engine.ts
import { buildPrediction, backtestSeries } from "../src/lib/marketEngine.ts";
import { computeLocalSignal } from "../src/lib/localSignal.ts";

function gbmSeries(seed, days, driftPctDaily, volPctDaily) {
  // mulberry32
  let a = seed;
  const rng = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [];
  let price = 97000;
  const now = Date.now();
  for (let i = 0; i < days; i++) {
    const shock = (rng() + rng() + rng() + rng() - 2) * volPctDaily; // approx normal
    price = price * (1 + driftPctDaily / 100 + shock / 100);
    out.push({ time: now - (days - i) * 86400000, price });
  }
  return out;
}

const coin = {
  id: "bitcoin", symbol: "BTC", name: "Bitcoin", image: "", rank: 1,
  price: 0, change1h: 0, change24h: 0, change7d: 0, volume24h: 28e9,
  marketCap: 1.9e12, high24h: 0, low24h: 0, ath: 126000, athChangePct: -20,
  circulating: 19.8e6,
};

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok  ${name}${detail ? " — " + detail : ""}`); }
  else { fail++; console.error(`FAIL  ${name}${detail ? " — " + detail : ""}`); }
}

// ── 1. Bullish regime series → bullish prediction with sane fields ──────────
{
  const series = gbmSeries(42, 120, +0.15, 1.2);
  coin.price = series[series.length - 1].price;
  coin.high24h = coin.price * 1.02;
  coin.low24h = coin.price * 0.98;
  const p = buildPrediction(coin, series, "daily");
  check("bull series produces a prediction", !!p);
  if (p) {
    check("bull bias is bullish", p.bias === "bullish", `bias=${p.bias}`);
    check("RSI in [5,95]", p.technicalIndicators.rsi >= 5 && p.technicalIndicators.rsi <= 95, `rsi=${p.technicalIndicators.rsi}`);
    check("probabilities sum to 100", p.probabilityBullish + p.probabilityBearish === 100, `${p.probabilityBullish}/${p.probabilityBearish}`);
    check("TP1 above price for long", p.tradingZones.takeProfit1 > p.currentPrice);
    check("SL below price for long", p.tradingZones.stopLoss < p.currentPrice);
    check("summary mentions real numbers", p.summary.includes("RSI") && p.summary.includes("MACD"));
    check("confidence in [40,92]", p.confidence >= 40 && p.confidence <= 92, `conf=${p.confidence}`);
  }
}

// ── 2. Bearish regime series → bearish prediction ────────────────────────────
{
  const series = gbmSeries(7, 120, -0.2, 1.5);
  coin.price = series[series.length - 1].price;
  const p = buildPrediction(coin, series, "daily");
  check("bear series produces a prediction", !!p);
  if (p) check("bear bias is bearish", p?.bias === "bearish", `bias=${p?.bias}`);
}

// ── 3. Thin data refused honestly ─────────────────────────────────────────────
{
  const short = gbmSeries(3, 10, 0.1, 1);
  const p = buildPrediction(coin, short, "daily");
  check("thin series refused (null, no fabrication)", p === null);
}

// ── 4. Weekly/monthly scale targets wider ────────────────────────────────────
{
  const series = gbmSeries(11, 400, 0.05, 1.0);
  coin.price = series[series.length - 1].price;
  const d = buildPrediction(coin, series, "daily");
  const w = buildPrediction(coin, series, "weekly");
  const m = buildPrediction(coin, series, "monthly");
  if (d && w && m) {
    const band = (x) => Math.abs(x.tradingZones.takeProfit1 / x.currentPrice - 1);
    check("target band grows daily<weekly<monthly", band(d) < band(w) && band(w) < band(m),
      `${(band(d)*100).toFixed(2)}% < ${(band(w)*100).toFixed(2)}% < ${(band(m)*100).toFixed(2)}%`);
  } else check("weekly/monthly predictions built", false);
}

// ── 5. Backtest runs and produces mixed results ──────────────────────────────
{
  const series = gbmSeries(99, 240, 0.08, 1.3);
  const outcomes = backtestSeries({ id: "bitcoin", symbol: "BTC" }, series);
  check("backtest produced checkpoints", outcomes.length >= 10, `${outcomes.length} checkpoints`);
  const hits = outcomes.filter(o => o.hit).length;
  const rate = hits / outcomes.length;
  check("hit rate is neither 0% nor 100% (real-ish)", rate > 0.05 && rate < 0.98, `hit rate ${(rate*100).toFixed(1)}%`);
}

// ── 6. localSignal still deterministic and varied ────────────────────────────
{
  const a = computeLocalSignal({ symbol: "BTC", price: 97000, change24h: 2.4, change7d: 6 }, "daily");
  const b = computeLocalSignal({ symbol: "BTC", price: 97000, change24h: 2.4, change7d: 6 }, "daily");
  const c = computeLocalSignal({ symbol: "ETH", price: 3400, change24h: -1.8, change7d: -4 }, "daily");
  check("localSignal deterministic", a.probabilityBullish === b.probabilityBullish);
  check("localSignal varies by coin", a.probabilityBullish !== c.probabilityBullish,
    `BTC ${a.probabilityBullish}% vs ETH ${c.probabilityBullish}%`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
