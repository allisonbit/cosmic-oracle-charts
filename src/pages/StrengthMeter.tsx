import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/MainSEO";
import { SITE_URL } from "@/lib/siteConfig";
import { useRealtimeStrength } from "@/hooks/useRealtimeStrength";
import type { StrengthData } from "@/hooks/useStrengthMeter";
import { CoinImage } from "@/components/ui/CoinImage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Zap, RefreshCw, Wifi, WifiOff, Search, X, ArrowUp, ArrowDown, Minus,
  ArrowUpDown, Share2, TrendingUp, Activity, HelpCircle, Sparkles, ArrowRight, Target,
  Trophy, LayoutGrid, GitCompare, Grid3x3, SlidersHorizontal,
} from "lucide-react";
import {
  StrengthComparisonGauge,
  WeightingPlayground,
  ExpandableStrengthCard,
  SectorStrengthHeatmap,
  DivergenceWatchlist,
  DailyStrengthReport,
  TokenStrengthSearch,
} from "@/components/strength";

// ── Config ────────────────────────────────────────────────────────────────────
const TIMEFRAMES = [
  { value: "1h", label: "1H" }, { value: "4h", label: "4H" },
  { value: "24h", label: "24H" }, { value: "7d", label: "7D" },
];

const CATEGORY_MAP: Record<string, string> = {
  BTC: "Layer 1", ETH: "Layer 1", SOL: "Layer 1", BNB: "Layer 1", XRP: "Layer 1", ADA: "Layer 1",
  AVAX: "Layer 1", TRX: "Layer 1", DOT: "Layer 1", NEAR: "Layer 1", APT: "Layer 1", SUI: "Layer 1",
  TON: "Layer 1", LTC: "Layer 1", ATOM: "Layer 1", HBAR: "Layer 1", ICP: "Layer 1", KAS: "Layer 1", XLM: "Layer 1",
  MATIC: "Layer 2", POL: "Layer 2", ARB: "Layer 2", OP: "Layer 2", STRK: "Layer 2", MNT: "Layer 2",
  LINK: "DeFi", UNI: "DeFi", AAVE: "DeFi", MKR: "DeFi", LDO: "DeFi", CRV: "DeFi", PENDLE: "DeFi", ENA: "DeFi", ENS: "DeFi",
  DOGE: "Meme", SHIB: "Meme", PEPE: "Meme", WIF: "Meme", BONK: "Meme", FLOKI: "Meme",
  RENDER: "AI", FET: "AI", TAO: "AI", RNDR: "AI", AGIX: "AI",
  IMX: "Gaming", SAND: "Gaming", AXS: "Gaming", GALA: "Gaming",
  ONDO: "RWA",
  USDT: "Stablecoin", USDC: "Stablecoin", DAI: "Stablecoin",
};
const CATEGORY_ORDER = ["Layer 1", "Layer 2", "DeFi", "AI", "Meme", "Gaming", "RWA"];
const categoryOf = (symbol: string) => CATEGORY_MAP[symbol?.toUpperCase()] || "Other";

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 81) return "hsl(152 70% 45%)";
  if (s >= 61) return "hsl(142 71% 45%)";
  if (s >= 41) return "hsl(38 92% 50%)";
  if (s >= 21) return "hsl(25 95% 53%)";
  return "hsl(0 84% 60%)";
}
function scoreLabel(s: number) {
  if (s >= 81) return "Extremely Strong";
  if (s >= 61) return "Strong";
  if (s >= 41) return "Neutral";
  if (s >= 21) return "Weak";
  return "Extremely Weak";
}
function signalOf(s: number): { label: string; cls: string } {
  if (s >= 80) return { label: "STRONG BUY", cls: "text-success border-success/40 bg-success/10" };
  if (s >= 65) return { label: "BUY", cls: "text-success/90 border-success/30 bg-success/5" };
  if (s >= 45) return { label: "NEUTRAL", cls: "text-warning border-warning/30 bg-warning/10" };
  if (s >= 25) return { label: "SELL", cls: "text-danger/90 border-danger/30 bg-danger/5" };
  return { label: "STRONG SELL", cls: "text-danger border-danger/40 bg-danger/10" };
}
const pct = (n?: number) => `${(n ?? 0) >= 0 ? "+" : ""}${(n ?? 0).toFixed(2)}%`;
const changeCls = (n?: number) => (n ?? 0) > 0.05 ? "text-success" : (n ?? 0) < -0.05 ? "text-danger" : "text-muted-foreground";

function TrendIcon({ change }: { change: number }) {
  if (change > 0.5) return <span className="inline-flex items-center gap-0.5 text-success"><ArrowUp className="w-3.5 h-3.5" /> Up</span>;
  if (change < -0.5) return <span className="inline-flex items-center gap-0.5 text-danger"><ArrowDown className="w-3.5 h-3.5" /> Down</span>;
  return <span className="inline-flex items-center gap-0.5 text-muted-foreground"><Minus className="w-3.5 h-3.5" /> Flat</span>;
}

function StrengthGauge({ score }: { score: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * c;
  const color = scoreColor(clamped);
  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" opacity="0.4" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>{Math.round(clamped)}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

export default function StrengthMeter() {
  const [params, setParams] = useSearchParams();
  const timeframe = params.get("tf") || "24h";
  const view = (params.get("view") as "assets" | "chains") || "assets";
  const category = params.get("cat") || "All";
  const minStrength = Number(params.get("min") || 0);
  const query = params.get("q") || "";
  const [tool, setTool] = useState("leaderboard");
  const [sortCol, setSortCol] = useState<keyof StrengthData | "signal">("strengthScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const setParam = (key: string, value: string | null) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === "All" || value === "0" || value === "") next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });
  };

  const { assets, chains, lastUpdate, isConnected, refresh } = useRealtimeStrength(timeframe);
  const base = view === "assets" ? assets : chains;
  const isLoading = base.length === 0;

  const categories = useMemo(() => {
    const present = new Set(assets.map((a) => categoryOf(a.symbol)));
    return ["All", ...CATEGORY_ORDER.filter((c) => present.has(c))];
  }, [assets]);

  const rows = useMemo(() => {
    let list = [...base];
    if (view === "assets" && category !== "All") list = list.filter((a) => categoryOf(a.symbol) === category);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    if (minStrength > 0) list = list.filter((a) => a.strengthScore >= minStrength);
    list.sort((a, b) => {
      const av = sortCol === "signal" ? a.strengthScore : (a[sortCol] as number) ?? 0;
      const bv = sortCol === "signal" ? b.strengthScore : (b[sortCol] as number) ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return list;
  }, [base, view, category, query, minStrength, sortCol, sortDir]);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) || rows[0], [rows, selectedId]);

  const toggleSort = (col: keyof StrengthData | "signal") => {
    if (sortCol === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 30_000); return () => clearInterval(t); }, []);
  const minsAgo = Math.max(0, Math.floor((Date.now() - lastUpdate) / 60000));

  const shareTop = () => {
    const top3 = rows.slice(0, 3).map((r, i) => `#${i + 1} ${r.symbol} — ${r.strengthScore}/100`).join("\n");
    const text = `🔥 Crypto Strength Rankings (${timeframe.toUpperCase()})\n${top3}\n\nFull rankings 👉 ${SITE_URL}/crypto-strength-meter\n#crypto #bitcoin #trading`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const canonical = `${SITE_URL}/crypto-strength-meter`;
  const faqs = [
    { q: "Is a high crypto strength score a buy signal?", a: "A high strength score shows strong momentum, healthy volume flow and outperformance versus Bitcoin. It is a confirmation signal many traders use before entering a position — not a guarantee. Always combine it with your own analysis and risk management." },
    { q: "How often does the strength score update?", a: "The Oracle Bull strength meter refreshes live, roughly every 10–20 seconds, from real market data. The “updated” time at the top of the tool shows the last refresh." },
    { q: "What does the Strength Score measure?", a: "It is a 0–100 composite of price momentum (25%), volume flow (15%), volatility (10%), market-cap dominance change (10%), relative performance vs BTC/ETH (20%), sentiment (10%) and trend consistency (10%) — combined into one comparable number." },
    { q: "What does \"relative strength vs BTC\" mean?", a: "It compares an asset's recent % move to Bitcoin's over the same window. Positive relative strength means the asset is outperforming Bitcoin — often a sign of strong, specific market interest." },
    { q: "Can I use the strength meter for day trading?", a: "Yes. Switch the timeframe to 1H or 4H for shorter-term readings and use the leaderboard to spot intraday momentum leaders before confirming entries on your own charts." },
    { q: "Which cryptocurrencies are included?", a: "Bitcoin, Ethereum, Solana, BNB, XRP, Cardano, Avalanche, Chainlink, Dogecoin and dozens more across Layer 1, Layer 2, DeFi, AI, Meme and Gaming categories — ranked live by strength." },
  ];
  const webAppLd = {
    "@context": "https://schema.org", "@type": "WebApplication", name: "Crypto Strength Meter", url: canonical,
    description: "Real-time cryptocurrency strength meter ranking Bitcoin, Ethereum and 100+ altcoins by momentum, volume and trend strength.",
    applicationCategory: "FinanceApplication", operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Oracle Bull", url: SITE_URL },
  };
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const SortTh = ({ col, label, className }: { col: keyof StrengthData | "signal"; label: string; className?: string }) => (
    <th className={cn("px-3 py-2.5 text-[11px] font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap", className)} onClick={() => toggleSort(col)}>
      <span className={cn("inline-flex items-center gap-1", className?.includes("text-right") && "flex-row-reverse")}>{label}{sortCol === col && <ArrowUpDown className="w-3 h-3 text-primary" />}</span>
    </th>
  );

  const toolTabs = [
    { value: "leaderboard", label: "Leaderboard", icon: Trophy },
    { value: "cards", label: "Cards", icon: LayoutGrid },
    { value: "compare", label: "Compare", icon: GitCompare },
    { value: "sectors", label: "Sectors", icon: Grid3x3 },
    { value: "weighting", label: "Weighting", icon: SlidersHorizontal },
  ];

  return (
    <Layout>
      <SEO
        title="Crypto Strength Meter — Real-Time Market Momentum Rankings | Oracle Bull"
        description="See which cryptocurrencies are gaining or losing strength right now. Our free real-time strength meter ranks Bitcoin, Ethereum, Solana and 100+ altcoins by momentum, volume and trend strength."
        canonicalPath="/crypto-strength-meter"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(webAppLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Hero */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Link to="/" className="hover:text-primary">Home</Link><span>/</span>
              <Link to="/tools" className="hover:text-primary">Tools</Link><span>/</span>
              <span className="text-foreground">Strength Meter</span>
            </nav>
            <h1 className="text-2xl md:text-4xl font-display font-bold flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary/15"><Zap className="w-6 h-6 text-primary" /></span>
              Crypto Strength Meter
            </h1>
            <h2 className="text-muted-foreground mt-2 text-base md:text-lg">Real-time strength rankings for 100+ cryptocurrencies</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted/40">
              {isConnected ? <><Wifi className="w-3 h-3 text-success animate-pulse" /><span className="text-success">LIVE</span></> : <><WifiOff className="w-3 h-3 text-danger" /><span className="text-danger">Offline</span></>}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Updated {minsAgo === 0 ? "just now" : `${minsAgo}m ago`}</span>
            <button onClick={refresh} className="p-2 rounded-lg border border-border hover:text-primary hover:border-primary/40 transition-colors" aria-label="Refresh"><RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /></button>
            <button onClick={shareTop} className="p-2 rounded-lg border border-border hover:text-primary hover:border-primary/40 transition-colors" aria-label="Share rankings"><Share2 className="w-4 h-4" /></button>
          </div>
        </section>

        {/* Daily AI strength report */}
        <DailyStrengthReport assets={assets} chains={chains} />

        {/* Controls */}
        <section className="border-t border-border/30 pt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-muted/40 rounded-lg p-0.5">
              {(["assets", "chains"] as const).map((v) => (
                <button key={v} onClick={() => setParam("view", v === "assets" ? null : v)} className={cn("px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{v}</button>
              ))}
            </div>
            <div className="flex bg-muted/40 rounded-lg p-0.5">
              {TIMEFRAMES.map((tf) => (
                <button key={tf.value} onClick={() => setParam("tf", tf.value === "24h" ? null : tf.value)} className={cn("px-3 py-1.5 rounded-md text-xs font-semibold transition-colors", timeframe === tf.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{tf.label}</button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={query} onChange={(e) => setParam("q", e.target.value || null)} placeholder="Search crypto… (e.g. BTC, Ethereum)" className="w-full h-9 pl-8 pr-8 rounded-lg bg-muted/40 border border-border text-xs focus:outline-none focus:border-primary" />
              {query && <button onClick={() => setParam("q", null)} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {view === "assets" && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map((c) => (
                  <button key={c} onClick={() => setParam("cat", c)} className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border", category === c ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:text-foreground")}>{c}</button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">Min strength: <strong className="text-foreground">{minStrength}</strong></span>
              <input type="range" min={0} max={100} step={5} value={minStrength} onChange={(e) => setParam("min", e.target.value)} className="w-28 accent-primary" aria-label="Minimum strength" />
            </div>
          </div>
        </section>

        {/* Selected asset gauge */}
        {selected && (
          <section className="border-t border-border/30 pt-5 flex flex-col sm:flex-row items-center gap-6">
            <StrengthGauge score={selected.strengthScore} />
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <CoinImage symbol={selected.symbol} image={selected.logo} size={28} />
                <h3 className="text-lg font-bold">{selected.name} <span className="text-muted-foreground font-mono text-sm">{selected.symbol}</span></h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: scoreColor(selected.strengthScore), borderColor: scoreColor(selected.strengthScore) + "55" }}>{scoreLabel(selected.strengthScore)}</span>
                <span className={cn("ml-auto text-[10px] font-bold px-2 py-0.5 rounded border", signalOf(selected.strengthScore).cls)}>{signalOf(selected.strengthScore).label}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {[
                  { l: "24h Change", v: pct(selected.priceChange24h), c: changeCls(selected.priceChange24h) },
                  { l: "Volume Flow", v: pct(selected.volumeChange), c: changeCls(selected.volumeChange) },
                  { l: "vs BTC", v: pct(selected.relativeStrengthVsBTC), c: changeCls(selected.relativeStrengthVsBTC) },
                  { l: "Trend", v: "", c: "" },
                ].map((m) => (
                  <div key={m.l}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.l}</p>
                    {m.l === "Trend" ? <p className="text-sm font-semibold"><TrendIcon change={selected.priceChange24h} /></p> : <p className={cn("text-sm font-bold font-mono", m.c)}>{m.v}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tool tabs */}
        <Tabs value={tool} onValueChange={setTool} className="w-full">
          <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
            <TabsList className="inline-flex w-auto bg-muted/30 border border-border/40 p-1 h-auto rounded-xl">
              {toolTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5">
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Strength Leaderboard {category !== "All" && view === "assets" ? `· ${category}` : ""}</h2>
              <span className="text-xs text-muted-foreground">{rows.length} {view}</span>
            </div>
            <div className="border-t border-border/30 pt-5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead className="bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-muted-foreground text-left w-10">#</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-muted-foreground text-left">Asset</th>
                      <SortTh col="strengthScore" label="Strength" />
                      <SortTh col="priceChange24h" label="24h" className="text-right" />
                      <SortTh col="volumeChange" label="Vol Flow" className="text-right" />
                      <SortTh col="relativeStrengthVsBTC" label="vs BTC" className="text-right" />
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-muted-foreground text-center">Trend</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-muted-foreground text-right">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 12 }).map((_, i) => <tr key={i} className="border-b border-border/30"><td colSpan={8} className="px-3 py-3"><div className="h-4 bg-muted/40 rounded animate-pulse" /></td></tr>)
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-14 text-muted-foreground">No assets match these filters.</td></tr>
                    ) : (
                      rows.map((r, i) => {
                        const sig = signalOf(r.strengthScore);
                        const active = selected?.id === r.id;
                        return (
                          <tr key={r.id} onClick={() => setSelectedId(r.id)} className={cn("border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/30", active && "bg-primary/5")}>
                            <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{i + 1}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <CoinImage symbol={r.symbol} image={r.logo} size={26} className="shrink-0" />
                                <div className="min-w-0"><div className="font-semibold leading-tight">{r.symbol}</div><div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{r.name}</div></div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block"><div className="h-full rounded-full transition-all" style={{ width: `${r.strengthScore}%`, background: scoreColor(r.strengthScore) }} /></div>
                                <span className="font-bold font-mono text-sm" style={{ color: scoreColor(r.strengthScore) }}>{r.strengthScore}</span>
                              </div>
                            </td>
                            <td className={cn("px-3 py-2.5 text-right font-mono", changeCls(r.priceChange24h))}>{pct(r.priceChange24h)}</td>
                            <td className={cn("px-3 py-2.5 text-right font-mono", changeCls(r.volumeChange))}>{pct(r.volumeChange)}</td>
                            <td className={cn("px-3 py-2.5 text-right font-mono", changeCls(r.relativeStrengthVsBTC))}>{pct(r.relativeStrengthVsBTC)}</td>
                            <td className="px-3 py-2.5 text-center text-xs"><TrendIcon change={r.priceChange24h} /></td>
                            <td className="px-3 py-2.5 text-right"><span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap", sig.cls)}>{sig.label}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Tap any row to load its strength gauge. Scores update live from real market data — not financial advice.</p>
          </TabsContent>

          {/* Cards (expandable) */}
          <TabsContent value="cards" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Strength Cards</h2>
              <span className="text-xs text-muted-foreground">Tap a card to expand its full breakdown</span>
            </div>
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />)}</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {rows.slice(0, 20).map((item, i) => <ExpandableStrengthCard key={item.id} data={item} rank={i + 1} />)}
              </div>
            )}
          </TabsContent>

          {/* Compare */}
          <TabsContent value="compare" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <StrengthComparisonGauge assets={assets} chains={chains} />
              <TokenStrengthSearch allAssets={assets} />
            </div>
          </TabsContent>

          {/* Sectors & divergence */}
          <TabsContent value="sectors" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <SectorStrengthHeatmap assets={assets} />
              <DivergenceWatchlist assets={assets} />
            </div>
          </TabsContent>

          {/* Weighting playground */}
          <TabsContent value="weighting" className="mt-4">
            <WeightingPlayground assets={assets} />
          </TabsContent>
        </Tabs>


        {/* ─── SEO CONTENT ─── */}
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-2">
          <section>
            <h2 className="text-xl font-display font-bold">What Is a Crypto Strength Meter?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A crypto strength meter is a real-time ranking tool that measures the momentum, volume and trend health of a
              cryptocurrency at any moment. Instead of looking at price alone, it combines several technical signals into a single
              score from 0 to 100, so you can compare dozens of assets at a glance. A score above 60 means an asset is gaining
              strength and may be entering a bullish phase; a score below 40 suggests it is losing momentum. Traders use it to spot
              rotation (capital moving from weak to strong coins), confirm entries, and avoid buying into fading trends.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-display font-bold">How Is the Strength Score Calculated?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Oracle Bull's Strength Score is a weighted composite of seven real market signals, normalized and combined into one 0–100 number:</p>
            <div className="overflow-x-auto not-prose my-3">
              <table className="w-full text-sm border border-border/50 rounded-lg">
                <thead className="bg-muted/30"><tr><th className="text-left p-2.5 text-xs font-semibold">Signal</th><th className="text-left p-2.5 text-xs font-semibold">Weight</th><th className="text-left p-2.5 text-xs font-semibold">What it measures</th></tr></thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Price momentum", "25%", "Direction and force of recent price action"],
                    ["Relative performance vs BTC/ETH", "20%", "Whether the asset is outperforming the majors"],
                    ["Volume flow", "15%", "Volume relative to market cap — is interest rising?"],
                    ["Volatility", "10%", "Lower, controlled volatility scores higher"],
                    ["Dominance change", "10%", "Shift in the asset's market-cap share"],
                    ["Sentiment", "10%", "Market mood derived from price behavior"],
                    ["Trend consistency", "10%", "Whether momentum agrees across timeframes"],
                  ].map(([s, w, d]) => (
                    <tr key={s} className="border-t border-border/40"><td className="p-2.5 font-medium text-foreground">{s}</td><td className="p-2.5 font-mono">{w}</td><td className="p-2.5">{d}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose grid grid-cols-2 sm:grid-cols-5 gap-2 my-3">
              {[["81–100", "Extremely Strong"], ["61–80", "Strong"], ["41–60", "Neutral"], ["21–40", "Weak"], ["0–20", "Extremely Weak"]].map(([range, label]) => {
                const mid = parseInt(range) + 5; const col = scoreColor(mid);
                return <div key={range} className="border-t border-border/20 pt-2 text-center"><div className="text-xs font-bold font-mono" style={{ color: col }}>{range}</div><div className="text-[10px] text-muted-foreground">{label}</div></div>;
              })}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-display font-bold">Which Crypto Is Strongest Right Now?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The leaderboard above updates live, so the strongest assets change throughout the day. As a rule of thumb: high
              strength with rising volume is the cleanest bullish signal; high strength with falling volume can mean momentum is
              stalling; rising strength from a low base can flag an early reversal; and falling strength from a high base often
              marks a distribution phase — trade it with caution.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-display font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions</h2>
            <div className="not-prose space-y-3 mt-2">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-border/30 pb-3 last:border-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{f.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="not-prose">
            <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> More Free Crypto Analysis Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { to: "/sentiment", label: "Fear & Greed Index", icon: Activity },
                { to: "/scanner", label: "Token Scanner", icon: Target },
                { to: "/predictions", label: "AI Price Predictions", icon: TrendingUp },
                { to: "/explorer", label: "Token Explorer", icon: Search },
                { to: "/dashboard", label: "Crypto Dashboard", icon: Zap },
                { to: "/tools", label: "All Tools", icon: ArrowRight },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-primary/5 border border-border hover:border-primary/40 hover:text-primary transition-colors group">
                  <l.icon className="w-4 h-4 shrink-0" /><span className="truncate">{l.label}</span><ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
    </Layout>
  );
}
