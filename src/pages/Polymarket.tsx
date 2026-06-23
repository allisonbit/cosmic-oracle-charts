import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  Search, X, Loader2, ExternalLink, TrendingUp, TrendingDown, Gauge, Flame,
  Clock, Droplets, BarChart3, ArrowRight, ShieldCheck, ShieldAlert, Shield,
  Target, HelpCircle, Sparkles, Activity, Zap, RefreshCw,
} from "lucide-react";
import { SEO } from "@/components/MainSEO";
import { SITE_URL } from "@/lib/siteConfig";
import { usePolymarketMarkets, analyzeMarket, type PolymarketMarket, type RiskLevel } from "@/hooks/usePolymarket";
import { cn } from "@/lib/utils";

const SORTS = [
  { id: "volume24hr", label: "24h Volume" },
  { id: "liquidity", label: "Liquidity" },
  { id: "ending", label: "Ending Soon" },
  { id: "movers", label: "Biggest Movers" },
];

function fmtUsd(n: number): string {
  if (!n) return "$0";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function endsIn(iso: string | null): string {
  if (!iso) return "—";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Resolving";
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
  if (d > 30) return `${Math.floor(d / 30)}mo`;
  if (d > 0) return `${d}d ${h}h`;
  const min = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}
const RISK_META: Record<RiskLevel, { cls: string; icon: typeof Shield }> = {
  Low: { cls: "text-success border-success/30 bg-success/10", icon: ShieldCheck },
  Medium: { cls: "text-warning border-warning/30 bg-warning/10", icon: Shield },
  High: { cls: "text-danger border-danger/30 bg-danger/10", icon: ShieldAlert },
};
const OUTCOME_COLOR = (i: number) => ["hsl(142 71% 45%)", "hsl(0 84% 60%)", "hsl(217 90% 61%)", "hsl(38 92% 50%)", "hsl(265 84% 63%)"][i % 5];

function MarketCard({ m }: { m: PolymarketMarket }) {
  const s = analyzeMarket(m);
  const Risk = RISK_META[s.risk].icon;
  const top = s.probabilities.slice(0, m.outcomes.length === 2 ? 2 : 3);
  return (
    <a href={m.url} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl border border-border/50 bg-card/40 hover:border-primary/40 transition-all overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {m.image && <img src={m.image} alt="" loading="lazy" className="w-11 h-11 rounded-lg object-cover shrink-0 bg-muted" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{m.category}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto"><Clock className="w-2.5 h-2.5" /> {endsIn(m.endDate)}</span>
            </div>
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{m.question}</h3>
          </div>
        </div>

        {/* Implied probability bars */}
        <div className="space-y-1.5">
          {top.map((p, i) => (
            <div key={p.outcome}>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="font-medium truncate max-w-[70%]">{p.outcome}</span>
                <span className="font-mono font-bold" style={{ color: OUTCOME_COLOR(i) }}>{p.prob.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${p.prob}%`, background: OUTCOME_COLOR(i) }} /></div>
            </div>
          ))}
        </div>

        {/* Signal row */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border", RISK_META[s.risk].cls)}><Risk className="w-3 h-3" /> {s.risk} risk</span>
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5"><Target className="w-3 h-3" /> Clarity {s.clarity}</span>
          {Math.abs(s.edge) >= 1 && (
            <span className={cn("text-[10px] font-mono inline-flex items-center gap-0.5", s.edge >= 0 ? "text-success" : "text-danger")}>
              {s.edge >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{s.edge >= 0 ? "+" : ""}{s.edge.toFixed(1)}pt 24h
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-2">
          <span className="font-semibold text-foreground">Signal:</span> {s.label}
        </p>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {fmtUsd(m.volume24hr)} 24h</span>
          <span className="inline-flex items-center gap-1"><Droplets className="w-3 h-3" /> {fmtUsd(m.liquidity)} liq</span>
          <span className="inline-flex items-center gap-0.5 text-primary group-hover:underline">Polymarket <ExternalLink className="w-2.5 h-2.5" /></span>
        </div>
      </div>
    </a>
  );
}

export default function Polymarket() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("volume24hr");

  useEffect(() => { const t = setTimeout(() => setQ(input.trim()), 400); return () => clearTimeout(t); }, [input]);

  const { data, isLoading, isFetching, refetch } = usePolymarketMarkets(q);
  const allMarkets = useMemo(() => data?.markets ?? [], [data?.markets]);
  const categories = useMemo(() => ["All", ...(data?.categories ?? [])].filter((c, i, a) => a.indexOf(c) === i), [data?.categories]);

  const markets = useMemo(() => {
    let list = [...allMarkets];
    if (category !== "All") list = list.filter((m) => m.category === category);
    switch (sort) {
      case "liquidity": list.sort((a, b) => b.liquidity - a.liquidity); break;
      case "ending": list.sort((a, b) => new Date(a.endDate || 8.64e15).getTime() - new Date(b.endDate || 8.64e15).getTime()); break;
      case "movers": list.sort((a, b) => Math.abs(b.oneDayPriceChange) - Math.abs(a.oneDayPriceChange)); break;
      default: list.sort((a, b) => b.volume24hr - a.volume24hr);
    }
    return list;
  }, [allMarkets, category, sort]);

  const canonical = `${SITE_URL}/polymarket`;
  const faqs = [
    { q: "What is a Polymarket implied probability?", a: "Polymarket prices each outcome between $0 and $1, and that price is the market's implied probability of the outcome happening. A 'Yes' share trading at $0.72 means the market is pricing roughly a 72% chance of Yes. Our analyzer converts every market's live prices into clear percentages." },
    { q: "How is the risk level calculated?", a: "The risk rating blends three live signals: how decisive the market is (a near 50/50 toss-up is riskier than an 85% favorite), the market's liquidity depth (thin markets move violently), and the bid/ask spread. It is an informational read of uncertainty — not betting advice." },
    { q: "What does 'clarity' mean?", a: "Clarity (0–100) measures how far the leading outcome is from a coin-flip. 0 is a perfect 50/50 toss-up; 100 is a near-certain outcome. Higher clarity means the market strongly favors one side." },
    { q: "What is the 24h edge / movers signal?", a: "Edge shows how much the favored outcome's probability moved in the last 24 hours. Big swings flag markets where new information is repricing the odds — useful for spotting momentum before it settles." },
    { q: "Can I search any Polymarket market?", a: "Yes. Use the search bar to query any market on Polymarket by keyword — politics, crypto, sports, economy and more — or browse by theme. Every result is analyzed live for implied odds and risk." },
    { q: "Is this financial or betting advice?", a: "No. This tool analyzes public, market-implied probabilities from Polymarket for informational and research purposes only. Prediction markets carry risk and may be restricted in your jurisdiction. Always do your own research." },
  ];
  const webAppLd = {
    "@context": "https://schema.org", "@type": "WebApplication", name: "Polymarket Signals & Odds Analyzer", url: canonical,
    description: "Analyze any Polymarket prediction market: live implied probabilities, favored outcome, clarity and risk signals, volume and liquidity. Search any market or browse by theme.",
    applicationCategory: "FinanceApplication", operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Oracle Bull", url: SITE_URL },
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <Layout>
      <SEO
        title="Polymarket Signals — Live Odds, Implied Probability & Risk Analysis | Oracle Bull"
        description="Analyze any Polymarket prediction market in real time. See implied probabilities, the favored outcome, a risk rating and 24h momentum for politics, crypto, sports & more. Search any market free."
        canonicalPath="/polymarket"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(webAppLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Hero */}
        <div>
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Link to="/" className="hover:text-primary">Home</Link><span>/</span><span className="text-foreground">Polymarket Signals</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-2.5"><span className="p-2 rounded-xl bg-primary/15"><Gauge className="w-6 h-6 text-primary" /></span> Polymarket Signals</h1>
              <h2 className="text-muted-foreground mt-2 text-base max-w-2xl">Analyze any Polymarket market in real time — implied probability, the favored outcome, a risk rating and 24h momentum. Search any market or browse by theme.</h2>
            </div>
            <button onClick={() => refetch()} className="self-start inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border hover:text-primary hover:border-primary/40 transition-colors">
              <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} /> Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search any Polymarket market… (e.g. election, bitcoin, fed rate, super bowl)"
            className="w-full h-12 pl-10 pr-10 rounded-xl bg-card/50 border border-border text-sm focus:outline-none focus:border-primary" />
          {input && <button onClick={() => setInput("")} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted-foreground" /></button>}
          {isFetching && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
        </div>

        {/* Theme menu + sort */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <Flame className="w-4 h-4 text-muted-foreground shrink-0" />
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border shrink-0", category === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground")}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Sort:</span>
            {SORTS.map((s) => (
              <button key={s.id} onClick={() => setSort(s.id)} className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors", sort === s.id ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground")}>{s.label}</button>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">{markets.length} markets {q && `· "${q}"`}</span>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-muted/30 animate-pulse" />)}</div>
        ) : markets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{markets.map((m) => <MarketCard key={m.id} m={m} />)}</div>
        ) : (
          <div className="text-center py-20">
            <Gauge className="w-14 h-14 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{q ? `No markets found for "${q}"` : "No markets available right now"}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">{q ? "Try a different keyword or browse a theme above." : "The Polymarket feed is temporarily unavailable — try refreshing."}</p>
          </div>
        )}

        {/* SEO content */}
        <article className="prose prose-neutral dark:prose-invert max-w-3xl mt-8">
          <h2>What Is Polymarket and How Do the Odds Work?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Polymarket is the world's largest prediction market, where people trade shares on the outcome of real-world events — elections, crypto prices, Fed decisions, sports and more. Each outcome trades between $0 and $1, and that price <em>is</em> the market's implied probability: a "Yes" share at $0.72 means the crowd is pricing a ~72% chance. This page reads those live prices for any market and turns them into clean, comparable signals.</p>
          <h2>How the Signal &amp; Risk Rating Work</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">For every market we surface the <strong>favored outcome</strong> and its implied probability, a <strong>clarity score</strong> (how far from a 50/50 toss-up), a <strong>risk rating</strong> (blending decisiveness, liquidity depth and bid/ask spread), and a <strong>24h edge</strong> showing how the odds have moved. A high-probability favorite in a deep, tight market reads as lower risk; a near-even market or a thin, wide-spread one reads as higher risk and higher potential payout. None of this is betting advice — it is an informational read of what the market itself is pricing.</p>
          <h2 className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions</h2>
          <div className="not-prose space-y-3">
            {faqs.map((f) => <div key={f.q} className="border-b border-border/30 pb-3 last:border-0"><h3 className="text-sm font-semibold text-foreground mb-1">{f.q}</h3><p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p></div>)}
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-4">Informational analysis of public prediction-market data only. Not financial or betting advice. Prediction markets carry risk and may be restricted in some jurisdictions.</p>
          <h2 className="not-prose mt-6 mb-3 text-xl font-display font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> More Free Tools</h2>
          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { to: "/crypto-strength-meter", label: "Strength Meter", icon: Zap },
              { to: "/sentiment", label: "Fear & Greed", icon: Gauge },
              { to: "/compare", label: "Compare Tokens", icon: Activity },
              { to: "/crypto-factory", label: "Crypto Factory", icon: Flame },
              { to: "/scanner", label: "Token Scanner", icon: Search },
              { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
            ].map((l) => <Link key={l.to} to={l.to} className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-primary/5 border border-border hover:border-primary/40 hover:text-primary transition-colors group"><l.icon className="w-4 h-4 shrink-0" /><span className="truncate">{l.label}</span><ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" /></Link>)}
          </div>
        </article>
      </div>
    </Layout>
  );
}
