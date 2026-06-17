import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { COIN_BY_SLUG, fmtPrice } from "@/lib/programmaticSlugs";
import { coingeckoFetch } from "@/lib/coingecko";
import { Crown, ArrowRight } from "lucide-react";

interface CoinMarket {
  id: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  price_change_percentage_1y_in_currency?: number;
  ath: number;
  ath_change_percentage: number;
}

export default function VsCompare() {
  const { coinA = "", coinB = "" } = useParams();
  const a = COIN_BY_SLUG[coinA];
  const b = COIN_BY_SLUG[coinB];

  if (!a || !b) return <Navigate to="/compare" replace />;
  if (a.slug === b.slug) return <Navigate to={`/price-prediction/${a.slug}`} replace />;

  const { data, isLoading } = useQuery({
    queryKey: ["vs-markets", a.cgId, b.cgId],
    queryFn: () =>
      coingeckoFetch<CoinMarket[]>({
        path: "coins/markets",
        params: {
          vs_currency: "usd",
          ids: `${a.cgId},${b.cgId}`,
          price_change_percentage: "24h,7d,30d,1y",
        },
      }),
    staleTime: 2 * 60_000,
  });

  const mA = data?.find((m) => m.id === a.cgId);
  const mB = data?.find((m) => m.id === b.cgId);

  const rows: Array<{ label: string; aVal: string; bVal: string; aWins?: boolean }> = [
    { label: "Current Price",     aVal: `$${fmtPrice(mA?.current_price ?? 0)}`, bVal: `$${fmtPrice(mB?.current_price ?? 0)}` },
    { label: "Market Cap",        aVal: fmtMarketCap(mA?.market_cap), bVal: fmtMarketCap(mB?.market_cap), aWins: (mA?.market_cap ?? 0) > (mB?.market_cap ?? 0) },
    { label: "Market Cap Rank",   aVal: `#${mA?.market_cap_rank ?? "—"}`, bVal: `#${mB?.market_cap_rank ?? "—"}`, aWins: (mA?.market_cap_rank ?? 9999) < (mB?.market_cap_rank ?? 9999) },
    { label: "24h Volume",        aVal: fmtMarketCap(mA?.total_volume), bVal: fmtMarketCap(mB?.total_volume), aWins: (mA?.total_volume ?? 0) > (mB?.total_volume ?? 0) },
    { label: "24h Change",        aVal: pct(mA?.price_change_percentage_24h), bVal: pct(mB?.price_change_percentage_24h), aWins: (mA?.price_change_percentage_24h ?? 0) > (mB?.price_change_percentage_24h ?? 0) },
    { label: "7d Change",         aVal: pct(mA?.price_change_percentage_7d_in_currency), bVal: pct(mB?.price_change_percentage_7d_in_currency), aWins: (mA?.price_change_percentage_7d_in_currency ?? 0) > (mB?.price_change_percentage_7d_in_currency ?? 0) },
    { label: "30d Change",        aVal: pct(mA?.price_change_percentage_30d_in_currency), bVal: pct(mB?.price_change_percentage_30d_in_currency), aWins: (mA?.price_change_percentage_30d_in_currency ?? 0) > (mB?.price_change_percentage_30d_in_currency ?? 0) },
    { label: "1y Change",         aVal: pct(mA?.price_change_percentage_1y_in_currency), bVal: pct(mB?.price_change_percentage_1y_in_currency), aWins: (mA?.price_change_percentage_1y_in_currency ?? 0) > (mB?.price_change_percentage_1y_in_currency ?? 0) },
    { label: "All-Time High",     aVal: `$${fmtPrice(mA?.ath ?? 0)}`, bVal: `$${fmtPrice(mB?.ath ?? 0)}` },
    { label: "% From ATH",        aVal: pct(mA?.ath_change_percentage), bVal: pct(mB?.ath_change_percentage), aWins: (mA?.ath_change_percentage ?? -100) > (mB?.ath_change_percentage ?? -100) },
  ];

  const aWinCount = rows.filter((r) => r.aWins === true).length;
  const bWinCount = rows.filter((r) => r.aWins === false).length;
  const winner = aWinCount > bWinCount ? a : bWinCount > aWinCount ? b : null;

  const title = `${a.name} vs ${b.name} (${a.ticker} vs ${b.ticker}): Which Is the Better Buy?`;
  const description = `Live ${a.name} vs ${b.name} comparison — price, market cap, returns, volatility, and AI verdict. Side-by-side data updated every 2 minutes.`;
  const canonical = `https://oraclebull.com/vs/${a.slug}/${b.slug}`;

  const faq = [
    {
      q: `Is ${a.name} better than ${b.name}?`,
      a: winner
        ? `Based on current market metrics — market cap, recent momentum, and proximity to all-time highs — ${winner.name} leads in ${winner.slug === a.slug ? aWinCount : bWinCount} of ${rows.filter((r) => r.aWins !== undefined).length} measured categories. This is a snapshot, not a forecast.`
        : `${a.name} and ${b.name} are evenly matched across the metrics we track. The right pick depends on your time horizon and risk tolerance.`,
    },
    {
      q: `What is the market cap difference between ${a.ticker} and ${b.ticker}?`,
      a: `${a.name}'s market cap is ${fmtMarketCap(mA?.market_cap)}, while ${b.name}'s is ${fmtMarketCap(mB?.market_cap)}.`,
    },
    {
      q: `Should I buy ${a.ticker} or ${b.ticker} in ${new Date().getFullYear()}?`,
      a: `Neither asset is a guaranteed winner. Compare each project's fundamentals, ecosystem, and momentum. See live AI signals on the individual ${a.name} and ${b.name} prediction pages.`,
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}</script>
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link>{" / "}
          <Link to="/compare" className="hover:underline">Compare</Link>{" / "}
          {a.ticker} vs {b.ticker}
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          {a.name} vs {b.name}: Which Is the Better Buy?
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          A live, side-by-side comparison of <strong>{a.name} ({a.ticker})</strong> and <strong>{b.name} ({b.ticker})</strong>{" "}
          across price, market capitalisation, returns, and volatility.
        </p>

        {winner && !isLoading && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-600" />
            <div>
              <div className="font-semibold text-slate-900">Current Edge: {winner.name}</div>
              <div className="text-sm text-slate-600">
                Wins {winner.slug === a.slug ? aWinCount : bWinCount} of {rows.filter((r) => r.aWins !== undefined).length} measured categories.
                This reflects today&apos;s market data, not a long-term forecast.
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-4 px-4 mb-10">
          <table className="w-full bg-white border border-slate-200 rounded-xl text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Metric</th>
                <th className="text-right px-4 py-3 font-semibold">{a.name} ({a.ticker})</th>
                <th className="text-right px-4 py-3 font-semibold">{b.name} ({b.ticker})</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{r.label}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.aWins === true ? "font-semibold text-emerald-700" : "text-slate-900"}`}>{r.aVal}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${r.aWins === false ? "font-semibold text-emerald-700" : "text-slate-900"}`}>{r.bVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Section title={`${a.name} Overview`}>
          <p>
            {a.name} ({a.ticker}) currently ranks #{mA?.market_cap_rank ?? "—"} by market capitalisation. Its 24-hour
            trading volume of {fmtMarketCap(mA?.total_volume)} reflects the liquidity available to traders. View the live
            <Link to={`/price-prediction/${a.slug}`} className="text-blue-600 hover:underline"> {a.name} prediction</Link> for AI-driven price targets.
          </p>
        </Section>

        <Section title={`${b.name} Overview`}>
          <p>
            {b.name} ({b.ticker}) currently ranks #{mB?.market_cap_rank ?? "—"} by market capitalisation. Its 24-hour
            trading volume of {fmtMarketCap(mB?.total_volume)} reflects the liquidity available to traders. View the live
            <Link to={`/price-prediction/${b.slug}`} className="text-blue-600 hover:underline"> {b.name} prediction</Link> for AI-driven price targets.
          </p>
        </Section>

        <Section title="Which Should You Buy?">
          <p>
            There is no universally correct answer — only what suits your risk tolerance, time horizon, and conviction
            in each project&apos;s thesis. Use this page as a snapshot of the current market state, not as a buy
            recommendation. Always verify by reading the live prediction pages for each coin and consulting our risk disclaimer.
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
          <h2 className="text-lg font-semibold mb-3">More Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Link to={`/vs/${a.slug}/bitcoin`} className="text-blue-600 hover:underline flex items-center gap-1">{a.name} vs Bitcoin <ArrowRight className="w-3 h-3" /></Link>
            <Link to={`/vs/${b.slug}/bitcoin`} className="text-blue-600 hover:underline flex items-center gap-1">{b.name} vs Bitcoin <ArrowRight className="w-3 h-3" /></Link>
            <Link to={`/vs/${a.slug}/ethereum`} className="text-blue-600 hover:underline flex items-center gap-1">{a.name} vs Ethereum <ArrowRight className="w-3 h-3" /></Link>
            <Link to={`/vs/${b.slug}/ethereum`} className="text-blue-600 hover:underline flex items-center gap-1">{b.name} vs Ethereum <ArrowRight className="w-3 h-3" /></Link>
          </div>
        </div>

        <p className="mt-10 text-xs text-slate-500 italic">
          Not financial advice. See our <Link to="/risk-disclaimer" className="underline">Risk Disclaimer</Link>.
        </p>
      </main>
    </Layout>
  );
}

function pct(n: number | undefined | null): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtMarketCap(n: number | undefined | null): string {
  if (!n || !Number.isFinite(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-700 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}