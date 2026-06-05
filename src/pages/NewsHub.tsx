import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Newspaper, Brain, TrendingUp, Clock, ExternalLink,
  Zap, ArrowRight, RefreshCw, Tag
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
export interface NewsItem {
  id: string;
  guid: string;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  body: string;
  tags: string;
  categories: string;
  source: string;
  source_info: { name: string; img: string; lang: string };
}

// ── AI Sentiment generator ───────────────────────────────────────────────────
export function generateAISentiment(article: NewsItem): { label: string; color: string; commentary: string } {
  const title = (article.title + " " + article.body).toLowerCase();
  const bullish = ["bull", "surge", "rally", "gain", "rise", "pump", "ath", "high", "break", "moon", "buy", "adoption", "launch", "approve", "etf", "growth"];
  const bearish = ["bear", "crash", "drop", "fall", "plunge", "loss", "hack", "ban", "sec", "lawsuit", "fear", "dump", "sell", "warning", "decline", "low"];

  let bScore = bullish.filter(w => title.includes(w)).length;
  let beScore = bearish.filter(w => title.includes(w)).length;

  if (bScore > beScore + 1) {
    return {
      label: "Bullish",
      color: "text-success border-success/30 bg-success/10",
      commentary: "Oracle AI reads a bullish signal in this story. Positive catalysts like this historically precede short-term price appreciation. Cross-reference with our live momentum data before acting."
    };
  } else if (beScore > bScore + 1) {
    return {
      label: "Bearish",
      color: "text-danger border-danger/30 bg-danger/10",
      commentary: "Oracle AI detects bearish undertones in this story. Events like this can trigger fear-driven sell-offs. Monitor the Fear & Greed Index for confirmation before making any moves."
    };
  } else {
    return {
      label: "Neutral",
      color: "text-warning border-warning/30 bg-warning/10",
      commentary: "Oracle AI classifies this as market-neutral news. No directional edge is clear yet. Watch for volume spikes on related assets as a secondary confirmation signal."
    };
  }
}

// ── API hook ─────────────────────────────────────────────────────────────────
function useNews(category: string) {
  return useQuery<{ Data: NewsItem[] }>({
    queryKey: ["crypto-news", category],
    queryFn: async () => {
      const url = category === "All"
        ? "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest"
        : `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${category}&sortOrder=latest`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 min
    refetchOnWindowFocus: true,
  });
}

// ── Slug util ─────────────────────────────────────────────────────────────────
export function articleToSlug(article: NewsItem): string {
  return `${article.id}-${article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const CATEGORIES = ["All", "BTC", "ETH", "SOL", "XRP", "DOGE", "DeFi", "NFT", "Regulation", "Mining"];

// ── Estimated Read Time Helper ────────────────────────────────────────────────
function getReadTime(body: string): number {
  return Math.max(2, Math.ceil((body?.length || 0) / 100));
}

// ── Featured Hero Card ────────────────────────────────────────────────────────
function HeroCard({ article }: { article: NewsItem }) {
  const sentiment = generateAISentiment(article);
  const slug = articleToSlug(article);
  const categories = article.categories.split("|").slice(0, 2);

  return (
    <Link to={`/news/${slug}`} state={{ article }} className="group relative holo-card overflow-hidden flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden shrink-0">
        <img
          src={article.imageurl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "/og-image.jpg"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background md:bg-gradient-to-r md:from-transparent md:to-background to-transparent md:opacity-0 opacity-80" />
      </div>
      <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            BREAKING
          </span>
          {categories.map(cat => (
            <span key={cat} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-border bg-background/80 text-muted-foreground uppercase tracking-wider">
              {cat}
            </span>
          ))}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display leading-tight mb-4 group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        <p className="text-base text-muted-foreground line-clamp-3 mb-6">
          {article.body?.slice(0, 200)}...
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{timeAgo(article.published_on)}</span>
          <span className="flex items-center gap-1.5 border-l border-border pl-4">{getReadTime(article.body)} min read</span>
          <span className="flex items-center gap-1.5 border-l border-border pl-4 text-foreground font-medium">{article.source_info?.name ?? article.source}</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all self-start shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          Read Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

// ── News Card ─────────────────────────────────────────────────────────────────
function NewsCard({ article }: { article: NewsItem }) {
  const sentiment = generateAISentiment(article);
  const slug = articleToSlug(article);
  const category = article.categories.split("|")[0];

  return (
    <Link to={`/news/${slug}`} state={{ article }} className="holo-card p-4 md:p-5 flex flex-col sm:flex-row gap-5 group hover:border-primary/50 transition-all">
      <div className="w-full sm:w-40 h-48 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-muted relative">
        <img
          src={article.imageurl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "/og-image.jpg"; }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-background/90 backdrop-blur-sm ${sentiment.color}`}>
            {sentiment.label}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs text-muted-foreground mb-2">
          <span className="text-primary font-bold uppercase tracking-wider">{category}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.published_on)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>{getReadTime(article.body)} min read</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="text-foreground">{article.source_info?.name ?? article.source}</span>
        </div>
        <h3 className="font-bold text-base md:text-lg leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
          {article.body?.slice(0, 150)}
        </p>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NewsHub() {
  const [category, setCategory] = useState("All");
  const { data, isLoading, refetch, isFetching } = useNews(category);
  const articles = data?.Data ?? [];

  return (
    <Layout>
      <Helmet>
        <title>Crypto News & AI Market Analysis | Oracle Bull</title>
        <meta name="description" content="Live cryptocurrency news with AI-powered sentiment analysis. Every story rated Bullish, Bearish or Neutral by Oracle AI - so you know how the market might react." />
        <link rel="canonical" href="https://oraclebull.com/news" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Crypto News & AI Market Analysis | Oracle Bull",
          "description": "Live crypto news with AI sentiment ratings - Bullish, Bearish or Neutral - updated every 5 minutes.",
          "url": "https://oraclebull.com/news",
          "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" }
        })}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-3">
                <Newspaper className="w-4 h-4" />
                <span>LIVE - AUTO-UPDATES EVERY 5 MIN</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display glow-text">
                Crypto News + AI Analysis
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Every story rated <span className="text-success font-semibold">Bullish</span>, <span className="text-danger font-semibold">Bearish</span>, or <span className="text-warning font-semibold">Neutral</span> by Oracle AI - so you know how the market might react.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="shrink-0 inline-flex items-center gap-2 bg-background/50 border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
              Refresh Feed
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-8">
            <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="holo-card p-4 flex gap-4 animate-pulse">
                  <div className="w-24 h-24 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-3 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          {!isLoading && articles.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-8">

              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                {/* Hero - first article */}
                <HeroCard article={articles[0]} />
                {/* Rest of articles */}
                <div className="space-y-3">
                  {articles.slice(1, 20).map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Sentiment Tracker */}
                <div className="holo-card p-5">
                  <h2 className="font-bold font-display text-base mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" /> News Sentiment Tracker
                  </h2>
                  {(() => {
                    const sentiments = articles.slice(0, 20).map(a => generateAISentiment(a).label);
                    const bullCount = sentiments.filter(s => s === "Bullish").length;
                    const bearCount = sentiments.filter(s => s === "Bearish").length;
                    const neutCount = sentiments.filter(s => s === "Neutral").length;
                    const total = bullCount + bearCount + neutCount;
                    return (
                      <div className="space-y-3">
                        {[
                          { label: "Bullish", count: bullCount, color: "bg-success", textColor: "text-success" },
                          { label: "Bearish", count: bearCount, color: "bg-danger", textColor: "text-danger" },
                          { label: "Neutral", count: neutCount, color: "bg-warning", textColor: "text-warning" },
                        ].map(({ label, count, color, textColor }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className={`font-semibold ${textColor}`}>{label}</span>
                              <span className="text-muted-foreground">{count}/{total} stories</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${color} transition-all duration-700`}
                                style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          Based on the last 20 headlines. {bullCount > bearCount + 2
                            ? "The news flow is overwhelmingly bullish. Caution - sentiment extremes often precede reversals."
                            : bearCount > bullCount + 2
                              ? "Bearish news is dominating. Fear-driven dips can be opportunities for the prepared."
                              : "Mixed signals in the news cycle. No clear directional edge - wait for a catalyst."}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Tools */}
                <div className="holo-card p-5">
                  <h2 className="font-bold font-display text-base mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> React to the News
                  </h2>
                  <div className="space-y-2">
                    {[
                      { to: "/predictions", label: "AI Price Predictions", icon: TrendingUp, desc: "See where AI thinks prices go next" },
                      { to: "/sentiment", label: "Fear & Greed Index", icon: Brain, desc: "Live market emotion tracker" },
                      { to: "/tools/profit-calculator", label: "Profit Calculator", icon: Zap, desc: "Calculate gains at your target price" },
                      { to: "/compare", label: "Compare Coins", icon: ArrowRight, desc: "Which coin wins after this news?" },
                    ].map(({ to, label, icon: Icon, desc }) => (
                      <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border hover:border-primary/40 hover:text-primary transition-all group">
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <div className="text-sm font-semibold">{label}</div>
                          <div className="text-[10px] text-muted-foreground">{desc}</div>
                        </div>
                        <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* More news */}
                <div className="holo-card p-5">
                  <h2 className="font-bold font-display text-base mb-4">More Stories</h2>
                  <div className="space-y-3">
                    {articles.slice(20, 28).map(article => {
                      const sentiment = generateAISentiment(article);
                      const slug = articleToSlug(article);
                      return (
                        <Link key={article.id} to={`/news/${slug}`} state={{ article }} className="block group">
                          <div className="flex gap-1.5 mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${sentiment.color}`}>{sentiment.label}</span>
                          </div>
                          <div className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">{timeAgo(article.published_on)}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Empty state */}
          {!isLoading && articles.length === 0 && (
            <div className="text-center py-20">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Could not load news feed. Please try refreshing.</p>
              <button onClick={() => refetch()} className="mt-4 text-primary hover:underline text-sm">Retry</button>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
