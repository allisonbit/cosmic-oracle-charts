import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Newspaper, Brain, TrendingUp, Clock, ExternalLink,
  Zap, ArrowRight, RefreshCw, Tag, Loader2, Bookmark, Share2, Flame
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
      commentary: "Oracle AI flags this as a bullish catalyst. Potential for short-term price appreciation."
    };
  } else if (beScore > bScore + 1) {
    return {
      label: "Bearish",
      color: "text-danger border-danger/30 bg-danger/10",
      commentary: "Oracle AI detects bearish undertones. Watch for fear-driven sell-offs."
    };
  } else {
    return {
      label: "Neutral",
      color: "text-warning border-warning/30 bg-warning/10",
      commentary: "Oracle AI sees neutral impact. Monitor volume spikes for directional clues."
    };
  }
}

// ── Category Mapping ─────────────────────────────────────────────────────────
const DISPLAY_CATEGORIES = ["All", "Bitcoin", "Ethereum", "Solana", "Base", "Memecoins", "AI", "DeFi", "NFTs", "Regulation", "Market News"];

function mapCategoryToApi(cat: string) {
  switch (cat) {
    case "Bitcoin": return "BTC";
    case "Ethereum": return "ETH";
    case "Solana": return "SOL";
    case "Base": return "Altcoin"; 
    case "Memecoins": return "DOGE";
    case "AI": return "Technology";
    case "DeFi": return "DeFi";
    case "NFTs": return "NFT";
    case "Regulation": return "Regulation";
    case "Market News": return "Market";
    default: return "All";
  }
}

// ── API hook ─────────────────────────────────────────────────────────────────
function useNews(displayCategory: string) {
  const apiCat = mapCategoryToApi(displayCategory);
  return useQuery<{ Data: NewsItem[] }>({
    queryKey: ["crypto-news", apiCat],
    queryFn: async () => {
      const url = apiCat === "All"
        ? "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest&limit=50"
        : `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${apiCat}&sortOrder=latest&limit=50`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
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

function getReadTime(body: string): number {
  return Math.max(2, Math.ceil((body?.length || 0) / 100));
}

// ── Trending Section ──────────────────────────────────────────────────────────
function TrendingSection({ articles }: { articles: NewsItem[] }) {
  if (articles.length < 5) return null;
  // Mock trending by picking specific items
  const trending = articles.slice(1, 5);
  
  return (
    <div className="mb-8 overflow-hidden relative">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-danger animate-pulse" />
        <h2 className="font-bold font-display text-lg">Trending Now</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
        {trending.map(article => (
          <Link key={article.id} to={`/news/${articleToSlug(article)}`} state={{ article }} className="holo-card p-3 min-w-[280px] w-[280px] shrink-0 snap-start group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
              <span className="text-primary font-bold uppercase tracking-wider">{article.source_info?.name ?? article.source}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.published_on)}</span>
            </div>
            <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Featured Hero Card ────────────────────────────────────────────────────────
function HeroCard({ article }: { article: NewsItem }) {
  const sentiment = generateAISentiment(article);
  const slug = articleToSlug(article);
  const categories = article.categories.split("|").slice(0, 2);

  return (
    <Link to={`/news/${slug}`} state={{ article }} className="group relative holo-card overflow-hidden flex flex-col md:flex-row mb-6">
      <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden shrink-0">
        <img
          src={article.imageurl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
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

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alert("Saved to bookmarks!");
  };

  return (
    <Link to={`/news/${slug}`} state={{ article }} className="holo-card p-4 md:p-5 flex flex-col sm:flex-row gap-5 group hover:border-primary/50 transition-all relative">
      <button 
        onClick={handleBookmark}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-md border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
        title="Save for later"
      >
        <Bookmark className="w-4 h-4" />
      </button>

      <div className="w-full sm:w-40 h-48 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-muted relative">
        <img
          src={article.imageurl}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "/og-image.jpg"; }}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs text-muted-foreground mb-2">
            <span className="text-primary font-bold uppercase tracking-wider">{category}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.published_on)}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>{getReadTime(article.body)} min read</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-foreground">{article.source_info?.name ?? article.source}</span>
          </div>
          <h3 className="font-bold text-base md:text-lg leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors pr-8">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.body?.slice(0, 150)}
          </p>
        </div>
        
        {/* Minimal AI Insight Box */}
        <div className="mt-2 bg-background/40 border border-border rounded-lg p-2.5 flex items-start gap-2.5">
          <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sentiment.color.replace('bg-', 'bg-').replace('/10', '/20')}`}>
            {sentiment.label}
          </div>
          <p className="text-xs text-foreground/80 leading-snug flex-1">
            <span className="font-semibold text-primary">AI Insight: </span>
            {sentiment.commentary}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function NewsFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="holo-card p-4 md:p-5 flex flex-col sm:flex-row gap-5 animate-pulse">
          <div className="w-full sm:w-40 h-48 sm:h-32 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="flex gap-2">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-20" />
            </div>
            <div className="h-5 bg-muted rounded w-full" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full mt-4" />
            <div className="h-10 bg-muted rounded w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NewsHub() {
  const [category, setCategory] = useState("All");
  const { data, isLoading, refetch, isFetching } = useNews(category);
  const articles = data?.Data ?? [];
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(15);
  
  // Reset pagination when category changes
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setVisibleCount(15);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, articles.length));
  };

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
                <span>LIVE MEDIA FEED</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-display glow-text tracking-tight">
                Market News + AI Intel
              </h1>
              <p className="text-muted-foreground mt-3 max-w-xl text-lg">
                The fastest way to consume crypto news. Every story analyzed by Oracle AI for <span className="text-success font-semibold">Bullish</span> or <span className="text-danger font-semibold">Bearish</span> market impact.
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6 border-b border-border">
            {DISPLAY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                  category === cat
                    ? "bg-foreground text-background shadow-md"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {isLoading ? (
            <NewsFeedSkeleton />
          ) : (
            <>
              {articles.length > 0 ? (
                <>
                  {category === "All" && <TrendingSection articles={articles} />}
                  
                  <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                    
                    {/* Main Feed */}
                    <div className="space-y-6">
                      {category === "All" && visibleCount === 15 && <HeroCard article={articles[0]} />}
                      
                      <div className="space-y-4">
                        {articles.slice(category === "All" ? 1 : 0, visibleCount).map(article => (
                          <NewsCard key={article.id} article={article} />
                        ))}
                      </div>

                      {/* Load More */}
                      {visibleCount < articles.length && (
                        <div className="pt-8 pb-4 text-center">
                          <button 
                            onClick={handleLoadMore}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-background border-2 border-primary/20 text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                          >
                            Load More Stories
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 hidden lg:block">
                      {/* AI Sentiment Tracker */}
                      <div className="holo-card p-6 sticky top-24">
                        <h2 className="font-bold font-display text-lg mb-5 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-primary" /> Market Sentiment
                        </h2>
                        {(() => {
                          const sentiments = articles.slice(0, 20).map(a => generateAISentiment(a).label);
                          const bullCount = sentiments.filter(s => s === "Bullish").length;
                          const bearCount = sentiments.filter(s => s === "Bearish").length;
                          const neutCount = sentiments.filter(s => s === "Neutral").length;
                          const total = bullCount + bearCount + neutCount;
                          return (
                            <div className="space-y-4">
                              {[
                                { label: "Bullish Signals", count: bullCount, color: "bg-success", textColor: "text-success" },
                                { label: "Bearish Signals", count: bearCount, color: "bg-danger", textColor: "text-danger" },
                                { label: "Neutral News", count: neutCount, color: "bg-warning", textColor: "text-warning" },
                              ].map(({ label, count, color, textColor }) => (
                                <div key={label}>
                                  <div className="flex justify-between text-sm mb-1.5">
                                    <span className={`font-bold ${textColor}`}>{label}</span>
                                    <span className="text-muted-foreground font-medium">{Math.round((count/total)*100)}%</span>
                                  </div>
                                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${color} transition-all duration-700`}
                                      style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                              <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                <p className="text-xs text-foreground font-medium leading-relaxed">
                                  Oracle AI analyzed the latest 20 headlines. {bullCount > bearCount + 2
                                    ? "News flow is highly bullish. Sentiment extremes may precede short-term rallies."
                                    : bearCount > bullCount + 2
                                      ? "Bearish news dominates. Fear-driven dips often present accumulation opportunities."
                                      : "Mixed signals detected. Wait for a strong catalyst before entering new positions."}
                                </p>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="mt-6 pt-6 border-t border-border">
                          <h3 className="text-sm font-bold mb-3 text-muted-foreground">Quick Actions</h3>
                          <div className="space-y-2">
                            <Link to="/predictions" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted">
                              <TrendingUp className="w-4 h-4 text-primary" /> AI Price Predictions
                            </Link>
                            <Link to="/sentiment" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted">
                              <Brain className="w-4 h-4 text-primary" /> Fear & Greed Index
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-32 holo-card">
                  <Newspaper className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No stories found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">We couldn't find any recent news for this category. The market might be quiet right now.</p>
                  <button onClick={() => refetch()} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto">
                    <RefreshCw className="w-4 h-4" /> Refresh Feed
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}
