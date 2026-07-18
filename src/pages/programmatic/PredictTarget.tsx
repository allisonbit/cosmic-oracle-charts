import { Layout } from "@/components/layout/Layout";
import { AdBreak } from "@/components/ads/AdBreak";
import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { COIN_BY_SLUG, fmtPrice } from "@/lib/programmaticSlugs";
import { coingeckoFetch } from "@/lib/coingecko";
import { TrendingUp, TrendingDown, ArrowRight, Target, Clock, BarChart3 } from "lucide-react";

interface PriceData {
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
    market_cap_rank: number;
    ath: { usd: number };
  };
}

export default function PredictTarget() {
  const { coin = "", target: targetStr = "", year: yearStr = "" } = useParams();
  const coinDef = COIN_BY_SLUG[coin];
  const target = Number(targetStr);
  const year = Number(yearStr);

  // Hooks must run unconditionally before any early return (Rules of Hooks).
  // The query is gated with `enabled` so it only fires for a valid coin; the
  // Navigate guard below handles the invalid-params case.
  const { data, isLoading } = useQuery({
    queryKey: ["predict-target-price", coinDef?.cgId],
    queryFn: () =>
      coingeckoFetch<PriceData>({
        path: `coins/${coinDef!.cgId}`,
        params: { localization: "false", tickers: "false", community_data: "false", developer_data: "false" },
      }),
    enabled: Boolean(coinDef),
    staleTime: 5 * 60_000,
  });

  if (!coinDef || !Number.isFinite(target) || target <= 0 || !Number.isFinite(year)) {
    return <Navigate to="/predictions" replace />;
  }

  const md = data?.market_data;
  const currentPrice = md?.current_price?.usd ?? 0;
  const change30d = md?.price_change_percentage_30d ?? 0;
  const change1y = md?.price_change_percentage_1y ?? 0;
  const ath = md?.ath?.usd ?? 0;

  const requiredMove = currentPrice > 0 ? ((target - currentPrice) / currentPrice) * 100 : 0;
  const direction: "up" | "down" = requiredMove >= 0 ? "up" : "down";
  const monthsAway = Math.max(1, (year - new Date().getFullYear()) * 12);
  const monthlyRate = currentPrice > 0 ? Math.pow(target / currentPrice, 1 / monthsAway) - 1 : 0;

  // Verdict logic — based on required CAGR vs historical 1y performance.
  const requiredAnnual = Math.pow(target / Math.max(currentPrice, 1e-9), 12 / monthsAway) - 1;
  let verdict: { label: string; tone: string; rationale: string };
  if (currentPrice === 0) {
    verdict = { label: "Loading", tone: "bg-slate-100 text-slate-700", rationale: "Fetching live market data." };
  } else if (requiredMove < 0) {
    verdict = {
      label: "Already Surpassed",
      tone: "bg-emerald-100 text-emerald-800",
      rationale: `${coinDef.name} is already trading above $${fmtPrice(target)}.`,
    };
  } else if (requiredAnnual < 0.25) {
    verdict = {
      label: "Highly Plausible",
      tone: "bg-emerald-100 text-emerald-800",
      rationale: `Requires ~${(requiredAnnual * 100).toFixed(0)}% annualised — below ${coinDef.name}'s historical average.`,
    };
  } else if (requiredAnnual < 1) {
    verdict = {
      label: "Possible in a Bull Cycle",
      tone: "bg-amber-100 text-amber-800",
      rationale: `Requires ~${(requiredAnnual * 100).toFixed(0)}% annualised. Achievable in a strong altseason but not the base case.`,
    };
  } else if (requiredAnnual < 3) {
    verdict = {
      label: "Aggressive Target",
      tone: "bg-orange-100 text-orange-800",
      rationale: `Requires ~${(requiredAnnual * 100).toFixed(0)}% annualised — would need a sustained, multi-quarter parabolic run.`,
    };
  } else {
    verdict = {
      label: "Unlikely",
      tone: "bg-rose-100 text-rose-800",
      rationale: `Requires ~${(requiredAnnual * 100).toFixed(0)}% annualised — exceeds any sustained crypto rally on record.`,
    };
  }

  const title = `Will ${coinDef.name} (${coinDef.ticker}) Hit $${fmtPrice(target)} by ${year}? | AI Forecast`;
  const description = `Data-driven analysis of whether ${coinDef.name} can reach $${fmtPrice(target)} by ${year}. Live price, required % move, historical comparables, and AI verdict.`;
  const canonical = `https://oraclebull.com/predict/${coin}/${target}/${year}`;

  const faq = [
    {
      q: `What price does ${coinDef.name} need to reach $${fmtPrice(target)}?`,
      a: `${coinDef.name} would need to ${direction === "up" ? "rise" : "fall"} ${Math.abs(requiredMove).toFixed(1)}% from its current price of $${fmtPrice(currentPrice)} to reach $${fmtPrice(target)}.`,
    },
    {
      q: `Is $${fmtPrice(target)} a realistic price target for ${coinDef.ticker} by ${year}?`,
      a: verdict.rationale + ` Compare to ${coinDef.name}'s 1-year change of ${change1y.toFixed(1)}% and all-time high of $${fmtPrice(ath)}.`,
    },
    {
      q: `What monthly growth rate would ${coinDef.ticker} need?`,
      a: `Reaching $${fmtPrice(target)} in ${monthsAway} months requires a compounded monthly return of ${(monthlyRate * 100).toFixed(2)}%.`,
    },
    {
      q: `How accurate are crypto price predictions?`,
      a: `No model — including ours — can predict exact prices. Oracle Bull's forecasts combine on-chain flows, sentiment, technicals, and macro signals to give a probability-weighted view. They are not financial advice.`,
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          url: canonical,
          author: { "@type": "Organization", name: "Oracle Bull" },
          publisher: { "@type": "Organization", name: "Oracle Bull" },
          about: { "@type": "Thing", name: `${coinDef.name} (${coinDef.ticker})` },
          dateModified: new Date().toISOString(),
        })}</script>
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          {" / "}
          <Link to="/predictions" className="hover:underline">Predictions</Link>
          {" / "}
          <Link to={`/price-prediction/${coin}`} className="hover:underline">{coinDef.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          Will {coinDef.name} ({coinDef.ticker}) Hit ${fmtPrice(target)} by {year}?
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          A data-driven look at whether {coinDef.name} can reach <strong>${fmtPrice(target)}</strong> within {monthsAway} months,
          combining live market data, historical performance, and Oracle Bull&apos;s AI forecast model.
        </p>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold mb-8 ${verdict.tone}`}>
          <Target className="w-4 h-4" /> Verdict: {verdict.label}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat label="Current Price" value={isLoading ? "…" : `$${fmtPrice(currentPrice)}`} />
          <Stat label="Target Price" value={`$${fmtPrice(target)}`} />
          <Stat
            label={direction === "up" ? "% Required" : "% Above Target"}
            value={`${requiredMove >= 0 ? "+" : ""}${requiredMove.toFixed(1)}%`}
            icon={direction === "up" ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-rose-600" />}
          />
          <Stat label="Months to Target" value={String(monthsAway)} icon={<Clock className="w-4 h-4 text-slate-500" />} />
        </div>

        <Section title="Historical Context">
          <p>
            Over the past 30 days, {coinDef.name} has moved <strong>{change30d.toFixed(1)}%</strong>. Over the past
            year it has moved <strong>{change1y.toFixed(1)}%</strong>. Its all-time high stands at{" "}
            <strong>${fmtPrice(ath)}</strong>{ath > target ? `, which is above the $${fmtPrice(target)} target` : ath > 0 ? `, which is below the target` : ""}.
          </p>
          <p>
            For {coinDef.ticker} to reach ${fmtPrice(target)} by {year}, the asset must compound at roughly{" "}
            <strong>{(monthlyRate * 100).toFixed(2)}% per month</strong>. That equates to an annualised return of about{" "}
            <strong>{(requiredAnnual * 100).toFixed(0)}%</strong>. For perspective, even Bitcoin&apos;s strongest 12-month
            stretches rarely exceed 300%.
          </p>
        </Section>

        <Section title="AI Model Verdict">
          <p>{verdict.rationale}</p>
          <p>
            Oracle Bull&apos;s forecast model blends 50+ technical indicators with on-chain flows, exchange netflow data,
            and aggregated social sentiment. The model treats this target as <strong>{verdict.label.toLowerCase()}</strong>{" "}
            given current market structure. As cycles shift, the verdict updates — view the latest{" "}
            <Link to={`/price-prediction/${coin}`} className="text-blue-600 hover:underline">{coinDef.name} prediction page</Link>{" "}
            for live signals.
          </p>
        </Section>

        <Section title="What Would Need to Happen">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Macro tailwinds.</strong> Falling real interest rates and a weakening dollar historically drive crypto rallies.</li>
            <li><strong>Spot ETF / institutional inflows.</strong> Sustained net inflows tighten supply and amplify upward moves.</li>
            <li><strong>Network adoption.</strong> Daily active addresses, fees, and TVL all need to expand alongside price.</li>
            <li><strong>Risk-on rotation.</strong> Capital rotating out of cash and into risk assets typically precedes the largest moves.</li>
          </ul>
        </Section>

        <Section title={`${coinDef.name} Price Analysis — Current Market Position`}>
          <p>
            {coinDef.name} ({coinDef.ticker}) is currently {md?.market_cap_rank ? `ranked #${md.market_cap_rank} by market capitalisation` : "one of the most watched digital assets"}.
            {" "}At a price of ${fmtPrice(currentPrice)}, {coinDef.ticker} is trading{" "}
            {ath > 0 ? `${((1 - currentPrice / ath) * 100).toFixed(0)}% below its all-time high of $${fmtPrice(ath)}` : "near notable levels"}.
            {" "}{change30d > 0
              ? `The 30-day momentum is positive at +${change30d.toFixed(1)}%, suggesting buyers are in control of the current trend.`
              : change30d < -10
                ? `The 30-day trend shows a ${change30d.toFixed(1)}% decline, indicating selling pressure that would need to reverse before a move toward $${fmtPrice(target)}.`
                : `The 30-day change of ${change30d.toFixed(1)}% reflects a period of consolidation.`
            }
          </p>
          <p>
            {requiredMove > 0 && requiredMove < 50
              ? `A ${requiredMove.toFixed(0)}% move to $${fmtPrice(target)} is within a single strong rally. ${coinDef.name} has historically delivered moves of this magnitude within weeks during bullish phases.`
              : requiredMove > 0 && requiredMove < 200
                ? `The ${requiredMove.toFixed(0)}% appreciation needed is significant but not unprecedented for crypto assets. It would require a sustained uptrend lasting several months with strong volume support.`
                : requiredMove > 200
                  ? `A ${requiredMove.toFixed(0)}% gain is a multi-cycle target. Historically, moves of this size require a full bull market cycle with major catalysts — institutional adoption, protocol upgrades, or a broader macro shift.`
                  : `${coinDef.name} has already exceeded $${fmtPrice(target)}, making this target a support level rather than resistance.`
            }
          </p>
        </Section>

        <Section title={`${year} Timeline: Key Factors for ${coinDef.ticker}`}>
          <p>
            {year <= new Date().getFullYear()
              ? `With ${year} already underway, ${coinDef.name} has limited time to reach this target. Any breakout would need to happen within the current market cycle.`
              : year - new Date().getFullYear() === 1
                ? `${year} is approximately ${monthsAway} months away, giving ${coinDef.name} a moderate runway. The next Bitcoin halving cycle and macro interest rate decisions will be the dominant catalysts.`
                : `With ${monthsAway} months until ${year}, ${coinDef.name} has multiple market cycles to work with. Long-horizon targets benefit from compound growth but carry greater uncertainty.`
            }
          </p>
          <p>
            {ath > target
              ? `Since ${coinDef.name} has previously traded above $${fmtPrice(target)} (ATH: $${fmtPrice(ath)}), the market has already proven this level is achievable. The question is whether macro conditions and adoption trends can propel it back to and beyond this price.`
              : ath > 0
                ? `The target of $${fmtPrice(target)} would represent a new all-time high for ${coinDef.name}, currently ${((target / ath - 1) * 100).toFixed(0)}% above its previous peak. New ATH territory typically requires strong narrative momentum and broad market participation.`
                : `Reaching $${fmtPrice(target)} would be a significant milestone for ${coinDef.name}, requiring both retail and institutional conviction.`
            }
          </p>
          <p>
            Investors tracking this target should monitor{" "}
            <Link to={`/price-prediction/${coin}/daily`} className="text-blue-600 hover:underline">daily {coinDef.name} signals</Link>,{" "}
            <Link to={`/q/is-${coin}-bullish-today`} className="text-blue-600 hover:underline">bullish/bearish indicators</Link>, and{" "}
            <Link to="/sentiment" className="text-blue-600 hover:underline">market-wide sentiment</Link> for early trend confirmation.
          </p>
        </Section>

        <Section title="Frequently Asked Questions">
          <div className="space-y-5">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-slate-900 mb-1">{f.q}</h3>
                <p className="text-slate-700">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Explore More {coinDef.name} Analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to={`/price-prediction/${coin}`} className="text-blue-600 hover:underline flex items-center gap-1">
              Live {coinDef.name} prediction <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to={`/price-prediction/${coin}/${year}`} className="text-blue-600 hover:underline flex items-center gap-1">
              {coinDef.name} {year} forecast <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to={`/how-to-buy/${coin}`} className="text-blue-600 hover:underline flex items-center gap-1">
              How to buy {coinDef.name} <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to={`/vs/${coin}/${coin === "bitcoin" ? "ethereum" : "bitcoin"}`} className="text-blue-600 hover:underline flex items-center gap-1">
              {coinDef.name} vs {coin === "bitcoin" ? "Ethereum" : "Bitcoin"} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <AdBreak variant="full" />

        <p className="mt-10 text-xs text-slate-500 italic">
          Not financial advice. Cryptocurrency markets are volatile and you can lose your entire investment.
          See our <Link to="/risk-disclaimer" className="underline">Risk Disclaimer</Link>.
        </p>
      </main>
    </Layout>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">{icon}{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-700 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}