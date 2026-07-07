import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useNewsFeed, timeAgo, sentimentStyle, type NewsArticleData } from "@/hooks/useNews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/MainSEO";
import { cn } from "@/lib/utils";
import {
  Newspaper, Clock, Search, Bookmark, RefreshCw, Loader2, X,
  TrendingUp, TrendingDown, Zap, Brain, Eye, ChevronRight,
  ArrowRight, AlertTriangle, Activity,
} from "lucide-react";

const READ_KEY = "oraclebull:my-news:read";
const SAVED_KEY = "oraclebull:my-news:saved";
const CAT_KEY = "oraclebull:my-news:category";

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function writeStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded or private mode */ }
}

function usePersistentSet(key: string) {
  const [ids, setIds] = useState<string[]>(() => readStorage<string[]>(key, []));
  const toggle = useCallback((id: string) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      writeStorage(key, next);
      return next;
    });
  }, [key]);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const add = useCallback((id: string) => {
    setIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeStorage(key, next);
      return next;
    });
  }, [key]);
  return { ids, toggle, has, add };
}

type FeedTab = "all" | "watchlist" | string;

function LiveAlerts({ watchlist, className }: { watchlist: string[]; className?: string }) {
  const { data } = useCryptoPrices();
  const movers = useMemo(() => {
    const prices = data?.prices || [];
    return prices
      .filter(c => Math.abs(c.change24h || 0) > 3 || (watchlist.length > 0 && watchlist.includes(c.symbol?.toUpperCase())))
      .sort((a, b) => Math.abs(b.change24h || 0) - Math.abs(a.change24h || 0))
      .slice(0, 12);
  }, [data, watchlist]);

  if (movers.length === 0) return null;

  return (
    <div className={cn("overflow-x-auto scrollbar-none", className)}>
      <div className="flex gap-2 pb-1">
        <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-danger pr-2 border-r border-border mr-1">
          <Zap className="w-3 h-3" /> Live
        </span>
        {movers.map(coin => {
          const up = (coin.change24h || 0) >= 0;
          return (
            <Link key={coin.symbol} to={`/token/${coin.symbol?.toLowerCase()}`}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 hover:bg-muted transition-colors text-xs">
              {coin.image && <img src={coin.image} alt={`${coin.symbol} logo`} className="w-4 h-4 rounded-full" />}
              <span className="font-semibold">{coin.symbol}</span>
              <span className={cn("font-mono font-bold", up ? "text-success" : "text-danger")}>
                {up ? "+" : ""}{coin.change24h?.toFixed(1)}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SentimentBar({ articles }: { articles: NewsArticleData[] }) {
  const counts = useMemo(() => {
    const c = { bullish: 0, bearish: 0, neutral: 0 };
    for (const a of articles.slice(0, 40)) {
      const k = a.sentiment as keyof typeof c;
      if (k in c) c[k]++;
    }
    return c;
  }, [articles]);

  const total = counts.bullish + counts.bearish + counts.neutral || 1;
  const bull = Math.round((counts.bullish / total) * 100);
  const bear = Math.round((counts.bearish / total) * 100);
  const neut = 100 - bull - bear;
  const dominant = bull > bear + 10 ? "bullish" : bear > bull + 10 ? "bearish" : "mixed";

  return (
    <div className="flex items-center gap-3 text-xs">
      <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
      <div className="h-2 flex-1 flex overflow-hidden max-w-48">
        <div className="bg-success transition-all duration-700" style={{ width: `${bull}%` }} />
        <div className="bg-warning transition-all duration-700" style={{ width: `${neut}%` }} />
        <div className="bg-danger transition-all duration-700" style={{ width: `${bear}%` }} />
      </div>
      <span className="text-muted-foreground shrink-0">
        <span className="text-success font-bold">{bull}%</span> bull
        {" / "}
        <span className="text-danger font-bold">{bear}%</span> bear
      </span>
      <span className="hidden sm:inline text-muted-foreground">
        — {dominant === "bullish" ? "Positive flow" : dominant === "bearish" ? "Caution" : "Mixed signals"}
      </span>
    </div>
  );
}

function ArticleRow({
  article, isRead, isSaved, onRead, onToggleSave, large = false,
}: {
  article: NewsArticleData; isRead: boolean; isSaved: boolean;
  onRead: () => void; onToggleSave: () => void; large?: boolean;
}) {
  const s = sentimentStyle(article.sentiment);
  return (
    <div className={cn(
      "group flex gap-4 md:gap-6 border-b border-border/50 relative transition-all",
      large ? "py-6 md:py-8" : "py-4 md:py-5",
      isRead && "opacity-60",
    )}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); }}
        aria-label={isSaved ? "Remove bookmark" : "Bookmark"}
        className={cn(
          "absolute top-4 right-0 z-10 transition-all hover:text-primary",
          isSaved ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100 text-muted-foreground",
        )}
      >
        <Bookmark className={cn("w-4 h-4", isSaved && "fill-primary")} />
      </button>

      {article.imageUrl && (
        <Link to={`/news/${article.slug}`} onClick={onRead}
          className={cn("overflow-hidden shrink-0 bg-muted", large ? "w-44 md:w-64 h-28 md:h-40" : "w-28 md:w-44 h-20 md:h-28")}>
          <img src={article.imageUrl} alt={article.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </Link>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-between pr-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{article.category}</span>
            <span className={cn("text-[10px] font-bold px-1.5 py-px border uppercase tracking-wider", s.className)}>{s.label}</span>
            {isRead && <span className="text-[9px] text-muted-foreground">Read</span>}
          </div>
          <Link to={`/news/${article.slug}`} onClick={onRead}
            className={cn(
              "font-bold font-display leading-snug tracking-tight group-hover:text-primary transition-colors block mb-1.5",
              large ? "text-lg md:text-xl line-clamp-3" : "text-sm md:text-base line-clamp-2",
            )}>
            {article.title}
          </Link>
          {large && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
              {article.metaDescription}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {article.sourceIcon && <img src={article.sourceIcon} alt="" className="w-3.5 h-3.5 rounded-sm" />}
          <span className="font-semibold text-foreground">{article.sourceName}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.publishedAt)}</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">{article.readTime}</span>
          {article.coins.slice(0, 3).map(c => (
            <span key={c.id} className="text-muted-foreground/60 font-mono hidden sm:inline">${c.symbol}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex gap-5 py-5 border-b border-border/50 animate-pulse">
          <div className="w-28 md:w-44 h-20 md:h-28 bg-muted shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
            <div className="h-5 bg-muted rounded w-full" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyNewsFeed() {
  const { profile } = useAuth();
  const watchlist = useMemo(() => profile?.watchlist || [], [profile?.watchlist]);

  const [category, setCategory] = useState<FeedTab>(() => readStorage<FeedTab>(CAT_KEY, "all"));
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(16);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const readState = usePersistentSet(READ_KEY);
  const savedState = usePersistentSet(SAVED_KEY);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(searchInput.trim()); setVisibleCount(16); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const apiCategory = category === "all" || category === "watchlist" || category === "saved" ? "All" : category;
  const { data, isLoading, isFetching, refetch } = useNewsFeed({ category: apiCategory, q: query, limit: 80 });

  const allArticles = useMemo(() => data?.articles ?? [], [data?.articles]);
  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);

  useEffect(() => {
    if (data) setLastUpdated(new Date());
  }, [data]);

  const handleCategoryChange = (c: FeedTab) => {
    setCategory(c);
    setVisibleCount(16);
    writeStorage(CAT_KEY, c);
  };

  const filtered = useMemo(() => {
    let items = allArticles;
    if (category === "watchlist") {
      const wl = new Set(watchlist.map(s => s.toLowerCase()));
      items = items.filter(a =>
        a.coins.some(c => wl.has(c.symbol.toLowerCase()) || wl.has(c.name.toLowerCase()))
      );
    } else if (category === "saved") {
      items = items.filter(a => savedState.has(a.id));
    }
    return items;
  }, [allArticles, category, watchlist, savedState]);

  const unreadCount = useMemo(() => filtered.filter(a => !readState.has(a.id)).length, [filtered, readState]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= filtered.length) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setVisibleCount(p => Math.min(p + 10, filtered.length));
    }, { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length, visibleCount]);

  const tabs: { id: FeedTab; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "watchlist", label: "Watchlist" },
    { id: "saved", label: "Saved", count: savedState.ids.length },
    ...categories.map(c => ({ id: c as FeedTab, label: c })),
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="My News Feed -- Personalized Crypto Intelligence" description="Your personalized crypto news feed with real-time articles from CoinDesk, Cointelegraph, Decrypt and more. Live price alerts, sentiment analysis, and bookmark tracking." />
        <div className="container mx-auto px-4 py-6">

          {/* Header */}
          <div className="border-b-2 border-foreground pb-4 mb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-danger">Live</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">· My News Feed</span>
                  {isFetching ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" /> Refreshing...
                    </span>
                  ) : lastUpdated ? (
                    <span className="text-xs text-muted-foreground">· Updated {timeAgo(lastUpdated.toISOString())}</span>
                  ) : null}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tighter leading-none">
                  My News Feed
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread article{unreadCount !== 1 ? "s" : ""}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search stories..." aria-label="Search news"
                    className="w-full bg-background border border-border pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  {searchInput && (
                    <button onClick={() => setSearchInput("")} aria-label="Clear"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
                  <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
                </Button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-end gap-0 overflow-x-auto scrollbar-none -mb-px">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => handleCategoryChange(tab.id)}
                  className={cn(
                    "px-3 sm:px-4 py-2 text-sm font-bold whitespace-nowrap transition-all shrink-0 border-b-2",
                    category === tab.id
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
                  )}>
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 text-[10px] font-mono bg-primary/15 text-primary px-1.5 py-0.5">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Live price alerts */}
          <LiveAlerts watchlist={watchlist} className="py-3 border-b border-border/50" />

          {/* Sentiment bar */}
          {filtered.length > 0 && (
            <div className="py-3 border-b border-border/50">
              <SentimentBar articles={filtered} />
            </div>
          )}

          {/* Search results info */}
          {query && (
            <p className="text-sm text-muted-foreground mt-4 mb-2">
              {filtered.length > 0
                ? <><span className="text-foreground font-semibold">{filtered.length}</span> results for <span className="text-foreground font-semibold">"{query}"</span></>
                : <>No results for <span className="text-foreground font-semibold">"{query}"</span></>}
            </p>
          )}

          {/* Watchlist empty state */}
          {category === "watchlist" && watchlist.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold font-display mb-2">No coins in your watchlist</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Add coins to your watchlist to see personalized news filtered to your portfolio.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {/* Saved empty state */}
          {category === "saved" && savedState.ids.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold font-display mb-2">No saved articles</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">Bookmark articles to save them here for later reading.</p>
            </div>
          )}

          {/* Main feed */}
          {isLoading ? (
            <FeedSkeleton />
          ) : filtered.length > 0 ? (
            <div>
              {filtered.slice(0, visibleCount).map((article, i) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  large={i === 0 || i % 7 === 0}
                  isRead={readState.has(article.id)}
                  isSaved={savedState.has(article.id)}
                  onRead={() => readState.add(article.id)}
                  onToggleSave={() => savedState.toggle(article.id)}
                />
              ))}

              {visibleCount < filtered.length && (
                <>
                  <div ref={sentinelRef} aria-hidden className="h-1" />
                  <div className="py-8 text-center">
                    <button onClick={() => setVisibleCount(p => Math.min(p + 10, filtered.length))}
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading more...
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : !query && category !== "watchlist" && category !== "saved" ? (
            <div className="text-center py-20">
              <Newspaper className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold font-display mb-2">No stories yet</h3>
              <p className="text-muted-foreground text-sm mb-6">The feed refreshes every 5 minutes with news from 8+ crypto publications.</p>
              <button onClick={() => refetch()} className="text-primary font-bold hover:underline inline-flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4" /> Refresh Feed
              </button>
            </div>
          ) : null}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
