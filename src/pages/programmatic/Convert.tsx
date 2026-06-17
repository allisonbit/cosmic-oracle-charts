import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { COIN_BY_SLUG, SUPPORTED_FIATS, fmtPrice, type FiatCode } from "@/lib/programmaticSlugs";
import { coingeckoFetch } from "@/lib/coingecko";
import { ArrowLeftRight } from "lucide-react";

type SimplePrice = Record<string, Record<string, number>>;

const FIAT_BY_SLUG = Object.fromEntries(SUPPORTED_FIATS.map((f) => [f.slug, f]));

export default function Convert() {
  const { coin = "", fiat = "" } = useParams();
  const coinDef = COIN_BY_SLUG[coin];
  const fiatDef = FIAT_BY_SLUG[fiat as FiatCode];
  const [amount, setAmount] = useState("1");

  if (!coinDef || !fiatDef) return <Navigate to="/" replace />;

  const { data } = useQuery({
    queryKey: ["convert", coinDef.cgId, fiatDef.slug],
    queryFn: () =>
      coingeckoFetch<SimplePrice>({
        path: "simple/price",
        params: { ids: coinDef.cgId, vs_currencies: fiatDef.slug, include_24hr_change: "true" },
      }),
    staleTime: 60_000,
  });

  const rate = data?.[coinDef.cgId]?.[fiatDef.slug] ?? 0;
  const change24h = data?.[coinDef.cgId]?.[`${fiatDef.slug}_24h_change`] ?? 0;
  const amountNum = Number(amount.replace(/,/g, "")) || 0;
  const converted = rate * amountNum;

  const title = `${coinDef.name} to ${fiatDef.name} — ${coinDef.ticker} to ${fiatDef.slug.toUpperCase()} Converter`;
  const description = `Live ${coinDef.name} (${coinDef.ticker}) to ${fiatDef.name} (${fiatDef.slug.toUpperCase()}) exchange rate. 1 ${coinDef.ticker} = ${fiatDef.symbol}${fmtPrice(rate)}. Updated every 60 seconds.`;
  const canonical = `https://oraclebull.com/convert/${coin}/${fiat}`;

  const presets = [0.5, 1, 5, 10, 100];

  const faq = [
    {
      q: `How much is 1 ${coinDef.ticker} in ${fiatDef.slug.toUpperCase()}?`,
      a: `1 ${coinDef.name} is currently worth ${fiatDef.symbol}${fmtPrice(rate)}. The rate updates every minute and changes constantly with the market.`,
    },
    {
      q: `How do I convert ${coinDef.ticker} to ${fiatDef.slug.toUpperCase()}?`,
      a: `To convert ${coinDef.ticker} to ${fiatDef.name}, sell your ${coinDef.name} on a regulated exchange that supports ${fiatDef.slug.toUpperCase()} withdrawals, then withdraw via bank transfer.`,
    },
    {
      q: `Is the ${coinDef.ticker}/${fiatDef.slug.toUpperCase()} rate accurate?`,
      a: `Yes — the rate is pulled live from major exchanges and refreshed every 60 seconds. Actual execution prices on an exchange may differ slightly due to spread and order book depth.`,
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
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        })}</script>
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link>{" / "}
          {coinDef.ticker} to {fiatDef.slug.toUpperCase()}
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          {coinDef.name} to {fiatDef.name} Converter
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Live <strong>{coinDef.ticker}/{fiatDef.slug.toUpperCase()}</strong> rate: <strong>1 {coinDef.ticker} = {fiatDef.symbol}{fmtPrice(rate)}</strong>{" "}
          <span className={change24h >= 0 ? "text-emerald-600" : "text-rose-600"}>
            ({change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% 24h)
          </span>
        </p>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <label className="block">
              <span className="text-xs uppercase text-slate-500 mb-1 block">{coinDef.ticker}</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <ArrowLeftRight className="w-5 h-5 text-slate-400 mx-auto" />
            <div>
              <span className="text-xs uppercase text-slate-500 mb-1 block">{fiatDef.slug.toUpperCase()}</span>
              <div className="text-2xl font-semibold px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg tabular-nums">
                {fiatDef.symbol}{fmtPrice(converted)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
              >
                {p} {coinDef.ticker}
              </button>
            ))}
          </div>
        </div>

        <Section title={`About the ${coinDef.ticker}/${fiatDef.slug.toUpperCase()} Rate`}>
          <p>
            The {coinDef.name} to {fiatDef.name} exchange rate reflects the global price of {coinDef.ticker} aggregated
            across major spot exchanges. Rates fluctuate constantly with market activity — the figure above refreshes
            every minute. Actual prices on an exchange depend on order book depth and the spread you pay.
          </p>
          <p>
            For larger conversions, prefer a bank transfer (ACH, SEPA, or Faster Payments) over a card sale to minimise
            fees. Always verify the destination address and double-check the exchange&apos;s minimum withdrawal limits
            before transacting.
          </p>
        </Section>

        <Section title="Reference Conversions">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-slate-700">
            {[0.1, 0.5, 1, 5, 10, 100].map((q) => (
              <li key={q} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 tabular-nums">
                {q} {coinDef.ticker} = <strong>{fiatDef.symbol}{fmtPrice(rate * q)}</strong>
              </li>
            ))}
          </ul>
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

        <div className="mt-10 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-3">Other {coinDef.name} Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Link to={`/price-prediction/${coin}`} className="text-blue-600 hover:underline">{coinDef.name} price prediction</Link>
            <Link to={`/how-to-buy/${coin}`} className="text-blue-600 hover:underline">How to buy {coinDef.name}</Link>
            {SUPPORTED_FIATS.filter((f) => f.slug !== fiatDef.slug).map((f) => (
              <Link key={f.slug} to={`/convert/${coin}/${f.slug}`} className="text-blue-600 hover:underline">
                Convert {coinDef.ticker} to {f.slug.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Layout>
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