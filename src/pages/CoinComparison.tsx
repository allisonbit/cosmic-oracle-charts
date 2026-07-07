import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { Brain, TrendingUp, TrendingDown, ArrowRight, GitCompare, Zap, BarChart3, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinImage } from "@/components/ui/CoinImage";
import { SITE_URL } from "@/lib/siteConfig";
import { useCompareToken, type CompareToken } from "@/hooks/useCompareToken";

const formatNum = (n?: number) => {
  if (n === undefined || n === null || !n) return "N/A";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};
const formatPrice = (n?: number) => {
  if (!n) return "$0.00";
  if (n < 0.0001) return `$${n.toFixed(8)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};
const formatPct = (n?: number) => (n === undefined || n === null) ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const prettify = (s: string) => s.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const has = (n?: number) => typeof n === "number" && isFinite(n);

function CoinColumn({ data, slug, isLoading }: { data?: CompareToken | null; slug: string; isLoading: boolean }) {
  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-muted/40 rounded-lg animate-pulse" />)}</div>;
  }
  if (!data) {
    return (
      <div className="text-center py-6 border-t border-border/20">
        <div className="font-bold mb-1">{prettify(slug).slice(0, 24)}</div>
        <p className="text-xs text-muted-foreground">Couldn't load live data for this token. Try searching it again from the compare hub.</p>
      </div>
    );
  }

  const rows: { label: string; value: string; positive?: boolean }[] = [];
  if (has(data.marketCap)) rows.push({ label: "Market Cap", value: formatNum(data.marketCap) });
  if (has(data.marketCapRank)) rows.push({ label: "Rank", value: `#${data.marketCapRank}` });
  if (has(data.volume24h)) rows.push({ label: "24h Volume", value: formatNum(data.volume24h) });
  if (has(data.liquidity)) rows.push({ label: "Liquidity", value: formatNum(data.liquidity) });
  if (has(data.change7d)) rows.push({ label: "7D Change", value: formatPct(data.change7d), positive: (data.change7d ?? 0) >= 0 });
  if (has(data.change30d)) rows.push({ label: "30D Change", value: formatPct(data.change30d), positive: (data.change30d ?? 0) >= 0 });
  if (has(data.fdv)) rows.push({ label: "FDV", value: formatNum(data.fdv) });
  if (has(data.ath)) rows.push({ label: "All-Time High", value: formatNum(data.ath) });
  if (has(data.athChangePct)) rows.push({ label: "From ATH", value: formatPct(data.athChangePct), positive: false });
  if (has(data.communityScore)) rows.push({ label: "Community Score", value: (data.communityScore ?? 0).toFixed(1) });
  if (has(data.liquidityScore)) rows.push({ label: "Liquidity Score", value: (data.liquidityScore ?? 0).toFixed(1) });

  const up = (data.change24h ?? 0) >= 0;
  return (
    <div className="space-y-3">
      <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
        <CoinImage symbol={data.symbol} image={data.image} size={56} className="mx-auto mb-2" />
        <div className="font-bold font-display text-xl">{data.name}</div>
        <div className="text-xs text-muted-foreground font-mono">{data.symbol}{data.chain ? ` · ${data.chain}` : ""}</div>
        <div className="text-2xl font-bold mt-1">{formatPrice(data.price)}</div>
        <div className={cn("text-sm font-semibold mt-1", up ? "text-success" : "text-danger")}>
          {up ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}{formatPct(data.change24h)} (24h)
        </div>
      </div>
      {rows.map((r) => (
        <div key={r.label} className="px-3 py-2.5 rounded-lg bg-background/50 border border-border text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{r.label}</div>
          <div className={cn("font-bold text-sm", r.positive !== undefined ? (r.positive ? "text-success" : "text-danger") : "text-foreground")}>{r.value}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ label, a, b, higherIsBetter = true }: { label: string; a: number; b: number; higherIsBetter?: boolean }) {
  const maxVal = Math.max(Math.abs(a), Math.abs(b)) || 1;
  const pctA = (Math.abs(a) / maxVal) * 100;
  const pctB = (Math.abs(b) / maxVal) * 100;
  const aWins = higherIsBetter ? a > b : a < b;
  const bWins = higherIsBetter ? b > a : b < a;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 border-b border-border/50 last:border-none">
      <div className="flex justify-end"><div className="h-2 rounded-full transition-all" style={{ width: `${pctA}%`, background: aWins ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", opacity: aWins ? 1 : 0.4 }} /></div>
      <div className="text-center text-xs text-muted-foreground font-medium min-w-28 px-2">{label}</div>
      <div className="flex justify-start"><div className="h-2 rounded-full transition-all" style={{ width: `${pctB}%`, background: bWins ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", opacity: bWins ? 1 : 0.4 }} /></div>
    </div>
  );
}

function AIVerdict({ a, b }: { a: CompareToken; b: CompareToken }) {
  const metrics: { label: string; a?: number; b?: number; higher: boolean; weight: number }[] = [
    { label: "Market Cap", a: a.marketCap, b: b.marketCap, higher: true, weight: 2 },
    { label: "24h Momentum", a: a.change24h, b: b.change24h, higher: true, weight: 2 },
    { label: "7D Performance", a: a.change7d, b: b.change7d, higher: true, weight: 2 },
    { label: "24h Volume", a: a.volume24h, b: b.volume24h, higher: true, weight: 1 },
    { label: "Liquidity", a: a.liquidity, b: b.liquidity, higher: true, weight: 1 },
    { label: "Community", a: a.communityScore, b: b.communityScore, higher: true, weight: 1 },
  ];
  const usable = metrics.filter((m) => has(m.a) && has(m.b));
  let scoreA = 0, scoreB = 0;
  usable.forEach((m) => {
    const aWins = m.higher ? (m.a! > m.b!) : (m.a! < m.b!);
    if (aWins) scoreA += m.weight; else scoreB += m.weight;
  });
  const total = scoreA + scoreB || 1;
  const pctA = Math.round((scoreA / total) * 100);
  const pctB = 100 - pctA;
  const winner = scoreA >= scoreB ? a : b;
  const winnerPct = Math.max(pctA, pctB);

  return (
    <div className="holo-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl"><Brain className="w-6 h-6 text-primary" /></div>
        <div><h2 className="font-bold font-display text-xl">Oracle AI Verdict</h2><p className="text-xs text-muted-foreground">Based on the live metrics available for both tokens</p></div>
      </div>
      <div className="bg-primary/5 border border-primary/30 rounded-xl p-5 mb-6 text-center">
        <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">AI Leans Toward</div>
        <div className="text-3xl font-display font-black mb-1">{winner.name}</div>
        <div className="text-sm text-muted-foreground">Confidence: <span className="text-primary font-bold">{winnerPct}%</span>{usable.length < 3 && " · limited data for this pair"}</div>
      </div>
      {usable.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-[1fr_auto_1fr] text-xs text-muted-foreground font-bold mb-3 px-2">
            <div className="text-right">{a.symbol}</div><div className="text-center min-w-28 px-2">METRIC</div><div className="text-left">{b.symbol}</div>
          </div>
          {usable.map((m) => <ScoreBar key={m.label} label={m.label} a={m.a!} b={m.b!} higherIsBetter={m.higher} />)}
        </div>
      )}
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
        <p><strong className="text-foreground">{a.name} ({a.symbol})</strong> trades at <strong className="text-foreground">{formatPrice(a.price)}</strong> ({formatPct(a.change24h)} 24h){has(a.marketCap) ? <> with a <strong className="text-foreground">{formatNum(a.marketCap)}</strong> market cap</> : ""}.</p>
        <p><strong className="text-foreground">{b.name} ({b.symbol})</strong> trades at <strong className="text-foreground">{formatPrice(b.price)}</strong> ({formatPct(b.change24h)} 24h){has(b.marketCap) ? <> with a <strong className="text-foreground">{formatNum(b.marketCap)}</strong> market cap</> : ""}.</p>
        <p>Across {usable.length} comparable {usable.length === 1 ? "metric" : "metrics"}, <strong className="text-foreground">{winner.name}</strong> scores higher with a <strong className="text-primary">{winnerPct}% AI confidence rating</strong>. This is research, not financial advice.</p>
      </div>
      <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
        {a.coingeckoId && <Link to={`/price-prediction/${a.coingeckoId}`} className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-colors"><BarChart3 className="w-4 h-4" /> {a.symbol} Prediction</Link>}
        {b.coingeckoId && <Link to={`/price-prediction/${b.coingeckoId}`} className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-colors"><BarChart3 className="w-4 h-4" /> {b.symbol} Prediction</Link>}
        <Link to="/sentiment" className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-colors"><Activity className="w-4 h-4" /> Market Sentiment</Link>
        <Link to="/strength-meter" className="inline-flex items-center gap-2 text-sm bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors"><Zap className="w-4 h-4" /> Strength Meter <ArrowRight className="w-3 h-3" /></Link>
      </div>
    </div>
  );
}

export default function CoinComparison() {
  const { coins } = useParams<{ coins: string }>();
  const vsIndex = coins?.indexOf("-vs-") ?? -1;
  const slugA = vsIndex !== -1 ? coins!.substring(0, vsIndex) : "";
  const slugB = vsIndex !== -1 ? coins!.substring(vsIndex + 4) : "";

  const { data: dataA, isLoading: loadingA } = useCompareToken(slugA);
  const { data: dataB, isLoading: loadingB } = useCompareToken(slugB);

  const nameA = dataA?.name || prettify(slugA);
  const nameB = dataB?.name || prettify(slugB);
  const tickA = dataA?.symbol || prettify(slugA).slice(0, 6).toUpperCase();
  const tickB = dataB?.symbol || prettify(slugB).slice(0, 6).toUpperCase();

  const pageTitle = `${nameA} vs ${nameB} — Live Comparison & AI Verdict | Oracle Bull`;
  const pageDesc = `${nameA} (${tickA}) vs ${nameB} (${tickB}): live price, market cap, volume, momentum and an AI verdict on which crypto is the better buy today. Compare any token on any chain.`;
  const canonicalUrl = `${SITE_URL}/compare/${slugA}-vs-${slugB}`;

  if (!slugA || !slugB) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Invalid Comparison</h1>
          <p className="text-muted-foreground mb-6">Use the format <code>/compare/bitcoin-vs-ethereum</code> — or pick two tokens from the compare hub.</p>
          <Link to="/compare" className="text-primary hover:underline">← Back to Compare</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-primary">Home</Link><span>/</span>
            <Link to="/compare" className="hover:text-primary">Compare</Link><span>/</span>
            <span className="text-foreground">{tickA} vs {tickB}</span>
          </nav>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <GitCompare className="w-4 h-4" /><span>LIVE AI COMPARISON</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4 glow-text flex items-center justify-center gap-3 flex-wrap">
              {dataA && <CoinImage symbol={dataA.symbol} image={dataA.image} size={40} />}
              {nameA} <span className="text-muted-foreground text-xl">vs</span> {nameB}
              {dataB && <CoinImage symbol={dataB.symbol} image={dataB.image} size={40} />}
            </h1>
            <p className="text-muted-foreground">Which is the better crypto right now? Live data across every available metric, with an AI verdict.</p>
          </div>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 mb-8">
            <CoinColumn data={dataA} slug={slugA} isLoading={loadingA} />
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center sticky top-24"><span className="font-black text-primary text-xs">VS</span></div>
            </div>
            <CoinColumn data={dataB} slug={slugB} isLoading={loadingB} />
          </div>

          {(loadingA || loadingB) && !(dataA && dataB) && (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Resolving live token data…</div>
          )}

          {dataA && dataB && <AIVerdict a={dataA} b={dataB} />}

          {/* SEO content */}
          <div className="mt-14 prose prose-neutral dark:prose-invert max-w-none">
            <h2>How to Compare {nameA} and {nameB}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When choosing between <strong>{nameA} ({tickA})</strong> and <strong>{nameB} ({tickB})</strong>, weigh market capitalization and rank,
              trading volume and liquidity, short- and long-term price momentum, and project fundamentals. The live data above pulls from DexScreener,
              CoinGecko and on-chain sources so it works for major coins and newer DEX tokens alike.
            </p>
            <h3>Market Cap, Liquidity & Volume</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A larger market cap and deeper liquidity generally mean lower volatility and easier entries and exits. Explore both tokens further in the{" "}
              <Link to="/explorer" className="text-primary">Token Explorer</Link> for holder and on-chain detail.
            </p>
            <h3>Momentum & Timing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              24-hour and weekly performance show where momentum is right now. The{" "}
              <Link to="/strength-meter" className="text-primary">Crypto Strength Meter</Link> ranks 100+ assets live so you can confirm which side has the edge.
            </p>
            {(dataA?.coingeckoId || dataB?.coingeckoId) && (
              <>
                <h3>AI Price Predictions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For a forward-looking view, see{" "}
                  {dataA?.coingeckoId && <Link to={`/price-prediction/${dataA.coingeckoId}`} className="text-primary">{nameA} price prediction</Link>}
                  {dataA?.coingeckoId && dataB?.coingeckoId && " and "}
                  {dataB?.coingeckoId && <Link to={`/price-prediction/${dataB.coingeckoId}`} className="text-primary">{nameB} price prediction</Link>}.
                </p>
              </>
            )}
          </div>

          <div className="mt-10">
            <Link to="/compare" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <GitCompare className="w-4 h-4" /> Compare other tokens →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
