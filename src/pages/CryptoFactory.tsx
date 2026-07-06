import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCryptoFactory } from "@/hooks/useCryptoFactory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Activity, TrendingUp, TrendingDown, Newspaper, Search, RefreshCw,
  ArrowRight, BarChart3, Wifi, Globe, Shield, Eye, Flame, Zap, Gauge, ExternalLink,
  ArrowUpRight, ArrowDownRight, HelpCircle, Sparkles, Brain, Rss, Layers, Bell,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

const EXPLORER_TX: Record<string, string> = {
  ethereum: "https://etherscan.io/tx/", bitcoin: "https://mempool.space/tx/", solana: "https://solscan.io/tx/",
  bnb: "https://bscscan.com/tx/", "bnb chain": "https://bscscan.com/tx/", bsc: "https://bscscan.com/tx/",
  arbitrum: "https://arbiscan.io/tx/", optimism: "https://optimistic.etherscan.io/tx/", base: "https://basescan.org/tx/",
  polygon: "https://polygonscan.com/tx/", avalanche: "https://snowtrace.io/tx/", tron: "https://tronscan.org/#/transaction/",
};

function formatCompact(n: number): string {
  if (!n) return "$0";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${(n ?? 0).toFixed(0)}`;
}
const SENT_BADGE: Record<string, string> = {
  bullish: "bg-success/15 text-success border-success/30",
  bearish: "bg-danger/15 text-danger border-danger/30",
  neutral: "bg-warning/15 text-warning border-warning/30",
};
const safeTime = (s?: string) => { try { return formatDistanceToNow(new Date(s || ""), { addSuffix: true }); } catch { return ""; } };

// ── Intel feed item ─────────────────────────────────────────────────────────
function FeedItem({ n, navigate }: { n: any; navigate: (p: string) => void }) {
  const high = (n.impactScore ?? 0) >= 75;
  return (
    <Card className={cn("border-t border-border/30 pt-5 group", high && "border-l-2 border-l-primary")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {n.imageUrl && <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 hidden sm:block bg-muted"><img src={n.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">{n.title}</a>
              <Badge className={cn("shrink-0 border text-[10px] capitalize", SENT_BADGE[n.sentiment] || SENT_BADGE.neutral)}>{n.sentiment}</Badge>
            </div>
            {n.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-semibold text-muted-foreground">{n.source}</span>
              <span className="text-[10px] text-muted-foreground">· {safeTime(n.publishedAt)}</span>
              {high && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">Impact {Math.round(n.impactScore)}</Badge>}
              <div className="ml-auto flex items-center gap-1">
                {(n.relatedAssets || []).slice(0, 3).map((a: string) => (
                  <button key={a} onClick={() => navigate(`/price-prediction/${a.toLowerCase()}/daily`)} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/40 hover:border-primary/40 hover:text-primary transition-colors">{a}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NarrativeRow({ n, navigate }: { n: any; navigate: (p: string) => void }) {
  const sent: Record<string, string> = { bullish: "text-success", neutral: "text-warning", bearish: "text-danger" };
  const mom = Math.min(100, Math.max(0, n.momentum ?? 0));
  return (
    <div className="border-t border-border/20 pt-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-sm flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" />{n.narrative}</h3>
        <span className={cn("text-xs font-mono font-bold", sent[n.sentiment] || "text-muted-foreground")}>{(n.weeklyChange ?? 0) >= 0 ? "+" : ""}{(n.weeklyChange ?? 0).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5"><div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${mom}%` }} /></div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(n.topAssets || []).slice(0, 4).map((a: string) => (
            <button key={a} onClick={() => navigate(`/price-prediction/${a.toLowerCase()}/daily`)} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/40 hover:border-primary/40 hover:text-primary transition-colors">{a}</button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">Momentum {Math.round(mom)}</span>
      </div>
    </div>
  );
}

function WhaleCard({ a }: { a: any }) {
  const out = a.direction === "outflow";
  const exp = EXPLORER_TX[(a.chain || "").toLowerCase()];
  return (
    <div className="border-t border-border/20 pt-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-semibold flex items-center gap-1.5">{a.asset} <span className="text-muted-foreground font-normal capitalize">{(a.type || "").replace(/_/g, " ")}</span></span>
        <span className="text-[10px] text-muted-foreground shrink-0">{safeTime(a.timestamp)}</span>
      </div>
      <div className="font-mono font-bold text-sm">{formatCompact(a.amountUSD)} <span className="text-xs text-muted-foreground font-normal">on {a.chain}</span></div>
      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
        <span className="truncate max-w-[90px]">{a.from}</span><ArrowRight className="w-3 h-3 shrink-0" /><span className="truncate max-w-[90px]">{a.to}</span>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <Badge className={cn("text-[10px] border", out ? "bg-success/10 text-success border-success/30" : "bg-danger/10 text-danger border-danger/30")}>{out ? "↗ Outflow" : "↘ Inflow"}</Badge>
        {exp && a.txHash && <a href={`${exp}${a.txHash}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary inline-flex items-center gap-0.5 hover:underline">TX <ExternalLink className="w-2.5 h-2.5" /></a>}
      </div>
    </div>
  );
}

function EventRow({ e, navigate }: { e: any; navigate: (p: string) => void }) {
  const impact: Record<string, string> = { high: "bg-danger/15 text-danger border-danger/30", medium: "bg-warning/15 text-warning border-warning/30", low: "bg-success/15 text-success border-success/30" };
  const future = (() => { try { return new Date(e.datetime).getTime() > Date.now(); } catch { return false; } })();
  return (
    <button onClick={() => navigate(`/price-prediction/${(e.asset || "bitcoin").toLowerCase()}/daily`)} className="w-full text-left border-b border-border/20 py-3 hover:bg-muted/20 transition-all">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" />{e.asset}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">{future ? "in " : ""}{safeTime(e.datetime).replace("in ", "").replace(" ago", future ? "" : " ago")}</span>
      </div>
      <p className="text-xs font-medium line-clamp-1">{e.title}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Badge variant="outline" className="text-[10px] capitalize">{e.type}</Badge>
        <Badge className={cn("text-[10px] border", impact[e.impact] || impact.low)}>{(e.impact || "").toUpperCase()}</Badge>
      </div>
    </button>
  );
}

const MOBILE_TABS = [
  { id: "feed", label: "Feed", icon: Rss },
  { id: "narratives", label: "Narratives", icon: Flame },
  { id: "onchain", label: "On-Chain", icon: Activity },
  { id: "events", label: "Events", icon: Calendar },
];

export default function CryptoFactory() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const minImpact = Number(params.get("min") || 0);
  const sentiment = params.get("sentiment") || "all";
  const sort = params.get("sort") || "latest";
  const mobileTab = params.get("tab") || "feed";
  const [countdown, setCountdown] = useState(60);

  const setParam = (k: string, v: string | null) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    if (!v || v === "all" || v === "latest" || v === "0" || v === "feed" || v === "") next.delete(k); else next.set(k, v);
    return next;
  }, { replace: true });

  const { data, isLoading, refetch, isFetching } = useCryptoFactory({ asset: q || undefined });

  // 60s auto-refresh countdown
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? 60 : c - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { setCountdown(60); }, [data?.timestamp]);

  const fearGreed = (data as any)?.fearGreed || { value: 50, classification: "Neutral" };
  const topMovers = (data as any)?.topMovers || [];
  const fgColor = fearGreed.value < 25 ? "text-red-400" : fearGreed.value < 45 ? "text-orange-400" : fearGreed.value < 55 ? "text-yellow-400" : fearGreed.value < 75 ? "text-green-400" : "text-emerald-400";

  const news = useMemo(() => {
    let items = data?.news || [];
    if (q) { const s = q.toLowerCase(); items = items.filter((n) => n.title.toLowerCase().includes(s) || (n.relatedAssets || []).some((a) => a.toLowerCase().includes(s))); }
    if (sentiment !== "all") items = items.filter((n) => n.sentiment === sentiment);
    if (minImpact > 0) items = items.filter((n) => (n.impactScore ?? 0) >= minImpact);
    items = [...items].sort((a, b) => sort === "impact" ? (b.impactScore ?? 0) - (a.impactScore ?? 0) : new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return items;
  }, [data?.news, q, sentiment, minImpact, sort]);

  const narratives = data?.narratives || [];
  const onchain = useMemo(() => [...(data?.onChainActivity || [])].sort((a, b) => (b.amountUSD || 0) - (a.amountUSD || 0)), [data?.onChainActivity]);
  const events = useMemo(() => {
    let items = data?.events || [];
    if (q) { const s = q.toLowerCase(); items = items.filter((e) => e.title.toLowerCase().includes(s) || e.asset.toLowerCase().includes(s)); }
    return items;
  }, [data?.events, q]);

  // Real composite sentiment from scored news
  const sentBreakdown = useMemo(() => {
    const all = data?.news || [];
    const c = { bullish: 0, bearish: 0, neutral: 0 };
    all.forEach((n) => { c[n.sentiment as keyof typeof c] = (c[n.sentiment as keyof typeof c] || 0) + 1; });
    const total = c.bullish + c.bearish + c.neutral || 1;
    const composite = Math.round((c.bullish / total) * 100 * 0.6 + fearGreed.value * 0.4);
    return { ...c, total, composite, label: composite >= 60 ? "Bullish" : composite >= 45 ? "Neutral" : "Bearish" };
  }, [data?.news, fearGreed.value]);

  const itemsToday = (data?.news?.length || 0) + (events.length) + (onchain.length);

  const canonical = `${SITE_URL}/crypto-factory`;
  const faqs = [
    { q: "What is the Crypto Factory?", a: "Crypto Factory is Oracle Bull's real-time market intelligence hub that aggregates crypto news, on-chain whale flows, market narratives and key events into one auto-updating command center, scored by impact so you see what matters fast." },
    { q: "How often does Crypto Factory update?", a: "The feed auto-refreshes every 60 seconds. Whale and on-chain flow cards reflect large transactions as they confirm, and a live countdown shows the next refresh." },
    { q: "What is a crypto market narrative?", a: "A narrative is the dominant theme driving capital right now — for example AI tokens, Bitcoin ETF, RWA or memecoins. Crypto Factory ranks active narratives by momentum so you can see where attention and money are rotating." },
    { q: "What are on-chain flows in crypto?", a: "On-chain flows are movements of crypto between wallets on the blockchain. Large exchange inflows often precede selling, outflows suggest accumulation, and big wallet-to-wallet transfers can signal OTC deals or positioning before it shows up in price." },
    { q: "Is Crypto Factory free?", a: "Yes. Crypto Factory and the rest of Oracle Bull's analytics are completely free, with no signup required." },
  ];
  const webAppLd = {
    "@context": "https://schema.org", "@type": "WebApplication", name: "Crypto Factory", url: canonical,
    description: "Real-time cryptocurrency market intelligence hub aggregating events, narratives, on-chain whale flows and news with automatic updates.",
    applicationCategory: "FinanceApplication", operatingSystem: "Any",
    featureList: ["Real-time crypto news aggregation", "On-chain whale transaction tracking", "Market narrative detection", "Crypto event calendar", "Impact scoring", "Auto-updating feed"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Oracle Bull", url: SITE_URL },
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  const Column = ({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) => (
    <div className={cn("lg:block", mobileTab === id ? "block" : "hidden", className)}>{children}</div>
  );

  return (
    <Layout>
      <SEO
        title="Crypto Factory — Real-Time Market Intelligence, On-Chain Flows & Narratives | Oracle Bull"
        description="Live crypto intelligence hub tracking events, narratives, whale flows, news and sentiment — all auto-updating. The fastest way to know what's moving the market right now."
        canonicalPath="/crypto-factory"
      />
      <Helmet>
        
        
      </Helmet>

      <div className="min-h-screen cosmic-bg">
        {/* Sticky live status bar */}
        <div className="sticky top-14 md:top-16 z-30 border-b border-border/30 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex items-center gap-1.5 shrink-0"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 font-mono">LIVE</span></span>
              <span className="text-muted-foreground font-mono shrink-0 hidden sm:inline">refresh in {countdown}s</span>
              <span className={cn("font-mono font-bold whitespace-nowrap", fgColor)}>F&amp;G {fearGreed.value}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-muted-foreground hidden md:inline">{itemsToday.toLocaleString()} items today</span>
              <span className="text-muted-foreground hidden sm:inline">50+ sources</span>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => refetch()}><RefreshCw className={cn("w-3 h-3 mr-1", isFetching && "animate-spin")} /> Refresh</Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-5 space-y-5">
          {/* Hero */}
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Link to="/" className="hover:text-primary">Home</Link><span>/</span><Link to="/tools" className="hover:text-primary">Tools</Link><span>/</span><span className="text-foreground">Crypto Factory</span>
            </nav>
            <h1 className="font-display text-2xl md:text-4xl font-bold flex items-center gap-2.5"><span className="p-2 rounded-xl bg-primary/15"><Zap className="w-6 h-6 text-primary" /></span> Crypto Factory</h1>
            <h2 className="text-muted-foreground mt-2 text-sm md:text-base max-w-2xl">Real-time market intelligence. Events, narratives, on-chain flows and news from 50+ sources — all auto-updating.</h2>
          </div>

          {/* Global stats */}
          {data?.globalStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { label: "Total MCap", value: formatCompact(data.globalStats.totalMarketCap), change: data.globalStats.marketCapChange24h, icon: BarChart3 },
                { label: "24h Volume", value: formatCompact(data.globalStats.totalVolume), icon: Activity },
                { label: "BTC Dom", value: `${data.globalStats.btcDominance?.toFixed(1)}%`, icon: Shield, color: "text-amber-400" },
                { label: "ETH Dom", value: `${data.globalStats.ethDominance?.toFixed(1)}%`, icon: Globe, color: "text-indigo-400" },
                { label: "Fear & Greed", value: `${fearGreed.value}`, icon: Gauge, color: fgColor },
                { label: "Active Coins", value: `${(data.globalStats.activeCryptocurrencies || 0).toLocaleString()}`, icon: Eye },
              ].map((s) => (
                <Card key={s.label} className="border-t border-border/30 pt-5"><CardContent className="p-2.5">
                  <div className="flex items-center gap-1.5"><s.icon className={cn("w-3.5 h-3.5 text-muted-foreground", s.color)} /><span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{s.label}</span></div>
                  <p className={cn("text-base font-bold font-mono mt-0.5", s.color)}>{s.value}</p>
                  {s.change !== undefined && <span className={cn("text-[11px] font-mono", s.change >= 0 ? "text-green-400" : "text-red-400")}>{s.change >= 0 ? "+" : ""}{(s.change ?? 0).toFixed(2)}%</span>}
                </CardContent></Card>
              ))}
            </div>
          )}

          {/* Top movers ticker */}
          {topMovers.length > 0 && (
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max pb-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">Movers</span>
                {topMovers.slice(0, 15).map((c: any) => {
                  const up = (c.change24h || 0) >= 0;
                  return <button key={c.id} onClick={() => navigate(`/price-prediction/${c.id}/daily`)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/30 hover:bg-muted/30 whitespace-nowrap">
                    {c.logo && <img src={c.logo} alt="" className="w-4 h-4 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                    <span className="text-xs font-semibold">{c.symbol}</span>
                    <span className={cn("text-xs font-mono", up ? "text-green-400" : "text-red-400")}>{up ? "+" : ""}{(c.change24h || 0).toFixed(1)}%</span>
                  </button>;
                })}
              </div>
            </div>
          )}

          {/* Composite sentiment (real, from scored news + F&G) */}
          <Card className="border-t border-border/30 pt-5"><CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-1.5"><Brain className="w-4 h-4 text-primary" /> Market Sentiment</h2>
              <span className={cn("text-sm font-bold", sentBreakdown.composite >= 60 ? "text-success" : sentBreakdown.composite >= 45 ? "text-warning" : "text-danger")}>{sentBreakdown.label} · {sentBreakdown.composite}/100</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
              <div className="bg-success" style={{ width: `${(sentBreakdown.bullish / sentBreakdown.total) * 100}%` }} />
              <div className="bg-warning" style={{ width: `${(sentBreakdown.neutral / sentBreakdown.total) * 100}%` }} />
              <div className="bg-danger" style={{ width: `${(sentBreakdown.bearish / sentBreakdown.total) * 100}%` }} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
              <span className="text-success">● {sentBreakdown.bullish} bullish</span>
              <span className="text-warning">● {sentBreakdown.neutral} neutral</span>
              <span className="text-danger">● {sentBreakdown.bearish} bearish</span>
              <Link to="/sentiment" className="ml-auto text-primary hover:underline inline-flex items-center gap-1">Full Fear &amp; Greed <ArrowRight className="w-3 h-3" /></Link>
            </div>
          </CardContent></Card>

          {/* Mobile tab switch */}
          <div className="lg:hidden grid grid-cols-4 gap-1.5">
            {MOBILE_TABS.map((t) => (
              <button key={t.id} onClick={() => setParam("tab", t.id)} className={cn("flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] font-medium transition-colors", mobileTab === t.id ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground")}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          {/* 3-column command center */}
          <div className="grid lg:grid-cols-[300px_1fr_320px] gap-5 items-start">
            {/* LEFT — Narratives */}
            <Column id="narratives" className="space-y-3 lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-400" /> Narratives</h2>
                <Link to="/factory/narratives" className="text-[11px] text-primary inline-flex items-center gap-0.5">All <ArrowRight className="w-3 h-3" /></Link>
              </div>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                : narratives.length ? narratives.slice(0, 8).map((n) => <NarrativeRow key={n.id} n={n} navigate={navigate} />)
                : <p className="text-xs text-muted-foreground">No active narratives right now.</p>}
            </Column>

            {/* CENTER — Intel feed */}
            <Column id="feed" className="space-y-3 min-w-0">
              {/* Feed controls */}
              <Card className="border-t border-border/30 pt-5"><CardContent className="p-3 space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Filter feed by asset or keyword…" value={q} onChange={(e) => setParam("q", e.target.value)} className="pl-9 h-9 bg-background/50 border-border/40 text-sm" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-muted/40 rounded-lg p-0.5">
                    {["all", "bullish", "bearish"].map((s) => <button key={s} onClick={() => setParam("sentiment", s)} className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium capitalize", sentiment === s ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{s}</button>)}
                  </div>
                  <div className="flex bg-muted/40 rounded-lg p-0.5">
                    {[["latest", "Latest"], ["impact", "Top Impact"]].map(([v, l]) => <button key={v} onClick={() => setParam("sort", v)} className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium", sort === v ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{l}</button>)}
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">Impact ≥ {minImpact}</span>
                    <input type="range" min={0} max={100} step={5} value={minImpact} onChange={(e) => setParam("min", e.target.value)} className="w-20 accent-primary" aria-label="Minimum impact" />
                  </div>
                </div>
              </CardContent></Card>

              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base flex items-center gap-1.5"><Rss className="w-4 h-4 text-primary" /> Intel Feed</h2>
                <span className="text-[11px] text-muted-foreground">{news.length} items</span>
              </div>
              {isLoading ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
                : news.length ? <div className="space-y-3">{news.map((n) => <FeedItem key={n.id} n={n} navigate={navigate} />)}</div>
                : <Card className="border-t border-border/30 pt-5"><CardContent className="p-8 text-center text-muted-foreground text-sm">No items match your filters.</CardContent></Card>}
            </Column>

            {/* RIGHT — On-chain + events */}
            <div className={cn("space-y-5 lg:block lg:sticky lg:top-28", (mobileTab === "onchain" || mobileTab === "events") ? "block" : "hidden")}>
              <div className={cn(mobileTab === "events" && "hidden lg:block")}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-base flex items-center gap-1.5"><Activity className="w-4 h-4 text-green-400" /> On-Chain Flows</h2>
                  <Link to="/factory/onchain" className="text-[11px] text-primary inline-flex items-center gap-0.5">All <ArrowRight className="w-3 h-3" /></Link>
                </div>
                <div className="space-y-3">
                  {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                    : onchain.length ? onchain.slice(0, 8).map((a) => <WhaleCard key={a.id} a={a} />)
                    : <p className="text-xs text-muted-foreground">No large on-chain flows in the last window.</p>}
                </div>
              </div>
              <div className={cn(mobileTab === "onchain" && "hidden lg:block")}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-base flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> Events</h2>
                  <Link to="/factory/events" className="text-[11px] text-primary inline-flex items-center gap-0.5">All <ArrowRight className="w-3 h-3" /></Link>
                </div>
                <div className="space-y-3">
                  {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                    : events.length ? events.slice(0, 8).map((e) => <EventRow key={e.id} e={e} navigate={navigate} />)
                    : <p className="text-xs text-muted-foreground">No upcoming events match your filter.</p>}
                </div>
              </div>
            </div>
          </div>


          {/* ─── SEO CONTENT ─── */}
          <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto">
            <h2>What Is Crypto Factory?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Crypto Factory is Oracle Bull's real-time market intelligence hub — one place that replaces refreshing a dozen news sites, whale-alert bots and social feeds. Every item is scored for impact, tagged with the assets it affects and ranked so you see what matters in seconds. It is a market-intelligence layer, not financial advice, a price tracker or a social feed.</p>
            <h2>What Is a Crypto Market Narrative?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">A narrative is the dominant theme moving capital at a given time — the AI-token narrative, the Bitcoin-ETF narrative, RWA, DePIN or the memecoin supercycle. Narratives rotate, and catching one early is one of the highest-leverage edges in crypto. Crypto Factory ranks active narratives by momentum so you can see where attention and money are flowing right now.</p>
            <h2>On-Chain Flows, Explained</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">On-chain flows are movements of crypto between wallets recorded on the blockchain. Large <strong>exchange inflows</strong> often precede selling (more supply hits the order book); <strong>outflows</strong> to private wallets suggest accumulation; and big <strong>wallet-to-wallet</strong> transfers can signal OTC deals or positioning before it shows up in price. Crypto Factory surfaces large transactions across Bitcoin, Ethereum, Solana, BNB Chain, Arbitrum, Base and more with direction and explorer links.</p>
            <h2 className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions</h2>
            <div className="not-prose space-y-3">
              {faqs.map((f) => <div key={f.q} className="border-b border-border/30 pb-3 last:border-0"><h3 className="text-sm font-semibold text-foreground mb-1">{f.q}</h3><p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p></div>)}
            </div>
            <h2 className="flex items-center gap-2 not-prose mt-6 mb-3 text-xl font-display font-bold"><Sparkles className="w-5 h-5 text-primary" /> More Free Tools</h2>
            <div className="not-prose grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { to: "/crypto-strength-meter", label: "Strength Meter", icon: Zap },
                { to: "/sentiment", label: "Fear & Greed", icon: Gauge },
                { to: "/compare", label: "Compare Tokens", icon: Layers },
                { to: "/scanner", label: "Token Scanner", icon: Search },
                { to: "/airdrops", label: "Airdrop Tracker", icon: Bell },
                { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
              ].map((l) => <Link key={l.to} to={l.to} className="flex items-center gap-2 text-sm p-2.5 rounded-xl bg-primary/5 border border-border hover:border-primary/40 hover:text-primary transition-colors group"><l.icon className="w-4 h-4 shrink-0" /><span className="truncate">{l.label}</span><ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" /></Link>)}
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
}
