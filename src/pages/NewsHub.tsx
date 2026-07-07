import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Newspaper, Brain, TrendingUp, Clock, Search, ArrowRight, RefreshCw,
  Loader2, Bookmark, Flame, X, Sparkles, Activity, Zap, Radar, ChevronRight,
} from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";
import {
  useNewsFeed, timeAgo, sentimentStyle, type NewsArticleData,
} from "@/hooks/useNews";

// ── Persistent state ───────────────────────────────────────────────────────────
const BOOKMARK_KEY = "oraclebull:news:bookmarks";
const CATEGORY_KEY = "oraclebull:news:category";

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}
function writeStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function useBookmarks() {
  const [ids, setIds] = useState<string[]>(() => readStorage<string[]>(BOOKMARK_KEY, []));
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeStorage(BOOKMARK_KEY, next);
      return next;
    });
  }, []);
  return { ids, toggle, isBookmarked: (id: string) => ids.includes(id) };
}

const POPULAR_COINS = [
  ["bitcoin", "Bitcoin"], ["ethereum", "Ethereum"], ["solana", "Solana"], ["ripple", "XRP"],
  ["dogecoin", "Dogecoin"], ["cardano", "Cardano"], ["chainlink", "Chainlink"], ["avalanche", "Avalanche"],
];

// ── Scrolling headline ticker ──────────────────────────────────────────────────
function HeadlineTicker({ articles }: { articles: NewsArticleData[] }) {
  if (articles.length < 3) return null;
  const items = articles.slice(0, 10);
  return (
    <div className="border-y border-border/50 py-2.5 mb-10 overflow-hidden relative">
      <div className="flex items-center gap-3">
        <span className="shrink-0 section-label text-danger flex items-center gap-1.5 pr-3 border-r border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" /> LATEST
        </span>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 animate-[marquee_40s_linear_infinite] whitespace-nowrap w-max">
            {[...items, ...items].map((a, i) => {
              const s = sentimentStyle(a.sentiment);
              return (
                <Link key={`${a.id}-${i}`} to={`/news/${a.slug}`}
                  className="inline-flex items-center gap-2 text-sm hover:text-primary transition-colors shrink-0">
                  <span className={`text-[10px] font-bold px-1.5 py-px border uppercase tracking-wider shrink-0 ${s.className}`}>{s.label}</span>
                  <span className="font-medium">{a.title}</span>
                  <span className="text-muted-foreground/50">·</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero: 1 main + 2 secondary ─────────────────────────────────────────────────
function HeroGrid({ articles }: { articles: NewsArticleData[] }) {
  const [main, ...rest] = articles;
  const secondary = rest.slice(0, 2);
  const ms = sentimentStyle(main.sentiment);

  return (
    <div className="grid lg:grid-cols-[3fr_2fr] gap-0 mb-0 border-b border-border pb-10 mb-10">
      {/* Main hero */}
      <Link to={`/news/${main.slug}`} className="group lg:border-r lg:border-border lg:pr-8 block">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted mb-5">
          {main.imageUrl && (
            <img src={main.imageUrl} alt={main.title} loading="eager"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-[10px] font-bold px-2 py-1 bg-red-600 text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> BREAKING
            </span>
            <span className={`text-[10px] font-bold px-2 py-1 border uppercase tracking-wider backdrop-blur-sm ${ms.className}`}>
              {ms.label}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="section-label text-white/70 block mb-2">{main.sourceName} · {timeAgo(main.publishedAt)}</span>
          </div>
        </div>

        <span className="section-label text-primary mb-2 block">{main.category}</span>
        <h2 className="font-bold font-display text-xl sm:text-2xl md:text-3xl leading-tight tracking-tight mb-3 group-hover:text-primary transition-colors">
          {main.title}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {main.metaDescription}
        </p>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3.5 h-3.5" />{main.readTime} read</span>
          {main.coins.slice(0, 2).map(c => (
            <span key={c.id} className="text-xs font-bold text-muted-foreground/70">${c.symbol}</span>
          ))}
          <span className="ml-auto text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Read story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>

      {/* Two secondary stories */}
      <div className="lg:pl-8 flex flex-col justify-between gap-0 mt-8 lg:mt-0">
        {secondary.map((a, i) => {
          const s = sentimentStyle(a.sentiment);
          return (
            <Link key={a.id} to={`/news/${a.slug}`}
              className={`group flex gap-4 py-6 ${i < secondary.length - 1 ? "border-b border-border" : ""}`}>
              <div className="w-28 h-20 md:w-32 md:h-24 overflow-hidden shrink-0 bg-muted">
                {a.imageUrl && (
                  <img src={a.imageUrl} alt={a.title} loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="section-label text-primary">{a.category}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-px border uppercase tracking-wider ${s.className}`}>{s.label}</span>
                  </div>
                  <h3 className="font-bold font-display text-base md:text-lg leading-snug line-clamp-3 group-hover:text-primary transition-colors tracking-tight">
                    {a.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">{a.sourceName}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(a.publishedAt)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Trending — numbered with thumbnails ────────────────────────────────────────
function TrendingSection({ articles }: { articles: NewsArticleData[] }) {
  if (articles.length < 6) return null;
  const trending = articles.slice(3, 8);
  return (
    <div className="mb-12 border-b border-border pb-10">
      <div className="section-header mb-6">
        <h2 className="font-bold font-display text-lg flex items-center gap-2">
          <Flame className="w-4 h-4 text-danger" /> Trending Now
        </h2>
        <Link to="/news" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
          See all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {trending.map((a, i) => {
          const s = sentimentStyle(a.sentiment);
          return (
            <Link key={a.id} to={`/news/${a.slug}`} className="group flex flex-col gap-3">
              <div className="relative aspect-video overflow-hidden bg-muted">
                {a.imageUrl && (
                  <img src={a.imageUrl} alt={a.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <span className="absolute top-2 left-2 font-mono text-xs font-bold bg-black/70 text-white px-2 py-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-px border uppercase tracking-wider ${s.className}`}>
                  {s.label}
                </span>
              </div>
              <div>
                <span className="section-label text-primary block mb-1">{a.sourceName}</span>
                <h3 className="font-bold font-display text-sm leading-snug line-clamp-3 group-hover:text-primary transition-colors tracking-tight">
                  {a.title}
                </h3>
                <span className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{timeAgo(a.publishedAt)} · {a.readTime}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Article row — editorial with strong hierarchy ──────────────────────────────
function NewsCard({ article, large = false }: { article: NewsArticleData; large?: boolean }) {
  const s = sentimentStyle(article.sentiment);
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(article.id);

  return (
    <Link
      to={`/news/${article.slug}`}
      className={`group flex gap-5 md:gap-7 border-b border-border relative ${large ? "py-8" : "py-6"}`}
    >
      {/* Bookmark */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(article.id); }}
        aria-label={saved ? "Remove bookmark" : "Bookmark"}
        className={`absolute top-6 right-0 z-10 transition-all hover:text-primary ${saved ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <Bookmark className={`w-4 h-4 ${saved ? "fill-primary" : ""}`} />
      </button>

      {/* Thumbnail */}
      <div className={`overflow-hidden shrink-0 bg-muted ${large ? "w-32 sm:w-52 md:w-72 h-24 sm:h-36 md:h-48" : "w-24 sm:w-36 md:w-52 h-16 sm:h-24 md:h-36"}`}>
        {article.imageUrl && (
          <img src={article.imageUrl} alt={article.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-between pr-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="section-label text-primary">{article.category}</span>
            <span className={`text-[10px] font-bold px-1.5 py-px border uppercase tracking-wider ${s.className}`}>{s.label}</span>
          </div>
          <h3 className={`font-bold font-display leading-snug tracking-tight group-hover:text-primary transition-colors mb-2 ${large ? "text-base sm:text-lg md:text-xl line-clamp-3" : "text-sm md:text-base line-clamp-2"}`}>
            {article.title}
          </h3>
          {large && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {article.metaDescription}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{article.sourceName}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.publishedAt)}</span>
          <span>·</span>
          <span>{article.readTime}</span>
          {article.coins.slice(0, 2).map(c => (
            <span key={c.id} className="text-muted-foreground/60 hidden sm:inline">${c.symbol}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div>
      <div className="grid lg:grid-cols-[3fr_2fr] gap-8 mb-10 pb-10 border-b border-border animate-pulse">
        <div className="space-y-4">
          <div className="w-full aspect-[16/9] bg-muted" />
          <div className="h-8 bg-muted rounded w-full" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-5 bg-muted rounded w-full" />
        </div>
        <div className="space-y-6">
          {[0, 1].map(i => (
            <div key={i} className="flex gap-4 py-5 border-b border-border last:border-0">
              <div className="w-28 h-20 bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-20" />
                <div className="h-5 bg-muted rounded w-full" />
                <div className="h-5 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[0,1,2].map(i => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="space-y-0">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="flex gap-5 py-6 border-b border-border animate-pulse">
            <div className="w-36 h-24 bg-muted shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-5 bg-muted rounded w-full" />
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function NewsHub() {
  const [category, setCategory] = useState<string>(() => readStorage<string>(CATEGORY_KEY, "All"));
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(16);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(searchInput.trim()); setVisibleCount(16); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, refetch } = useNewsFeed({ category, q: query, limit: 80 });
  const articles = useMemo(() => data?.articles ?? [], [data?.articles]);
  const categories = useMemo(() => ["All", ...(data?.categories ?? [])], [data?.categories]);
  const searching = query.length > 0;
  const isDefaultView = category === "All" && !searching;

  useEffect(() => {
    if (data) setLastUpdated(new Date());
  }, [data]);

  const handleCategoryChange = (c: string) => {
    setCategory(c);
    setVisibleCount(16);
    writeStorage(CATEGORY_KEY, c);
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= articles.length) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setVisibleCount((p) => Math.min(p + 10, articles.length));
    }, { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [articles.length, visibleCount]);

  const itemListLd = useMemo(() => ({
    "@context": "https://schema.org", "@type": "ItemList",
    itemListElement: articles.slice(0, 20).map((a, i) => ({
      "@type": "ListItem", position: i + 1, url: `${SITE_URL}/news/${a.slug}`, name: a.title,
    })),
  }), [articles]);

  const sentimentCounts = useMemo(() => {
    const c = { bullish: 0, bearish: 0, neutral: 0 };
    for (const a of articles.slice(0, 40)) c[a.sentiment as keyof typeof c] = (c[a.sentiment as keyof typeof c] || 0) + 1;
    return c;
  }, [articles]);

  // Default layout: hero grid uses first 3, trending uses 3-8, feed starts at 8
  const feedStart = isDefaultView ? 8 : 0;

  return (
    <Layout>
      <Helmet>
        <title>Crypto News Today – Live Headlines + AI Sentiment | Oracle Bull</title>
        <meta name="description" content="Breaking cryptocurrency news from 50+ trusted sources with AI Bullish/Bearish/Neutral ratings. Bitcoin, Ethereum, Solana, DeFi & regulation — auto-refreshes every 5 minutes." />
        
        
        
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <div>

          {/* Masthead */}
          <div className="border-b-2 border-foreground pb-4 mb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  <span className="section-label text-danger">LIVE</span>
                  <span className="section-label text-muted-foreground">· ORACLE BULL CRYPTO NEWS</span>
                  {isFetching ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" /> Refreshing…
                    </span>
                  ) : lastUpdated ? (
                    <span className="text-xs text-muted-foreground">· Updated {timeAgo(lastUpdated.toISOString())}</span>
                  ) : null}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tighter leading-none">
                  Crypto News
                </h1>
              </div>
              {/* Search */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search stories…"
                  aria-label="Search crypto news"
                  className="w-full bg-background border border-border pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                />
                {searchInput && (
                  <button onClick={() => setSearchInput("")} aria-label="Clear"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-end gap-0 overflow-x-auto scrollbar-none">
              {categories.map((c) => (
                <button key={c} onClick={() => handleCategoryChange(c)}
                  className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all shrink-0 -mb-px border-b-2 ${
                    category === c
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  {c}
                </button>
              ))}
              <button onClick={() => refetch()} className="ml-auto shrink-0 p-2 -mb-px text-muted-foreground hover:text-primary transition-colors" aria-label="Refresh">
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search result info */}
          {searching && (
            <p className="text-base text-muted-foreground mt-4 mb-6">
              {articles.length > 0
                ? <><span className="text-foreground font-semibold">{articles.length}</span> results for <span className="text-foreground font-semibold">"{query}"</span></>
                : <>No results for <span className="text-foreground font-semibold">"{query}"</span></>}
            </p>
          )}

          {isLoading ? (
            <FeedSkeleton />
          ) : articles.length > 0 ? (
            <>
              {/* Headline ticker */}
              {isDefaultView && <HeadlineTicker articles={articles} />}

              {/* Hero grid: articles 0, 1, 2 */}
              {isDefaultView && articles.length >= 3 && (
                <HeroGrid articles={articles.slice(0, 3)} />
              )}

              {/* Trending grid: articles 3-7 */}
              {isDefaultView && articles.length >= 8 && (
                <TrendingSection articles={articles} />
              )}

              <div className="grid lg:grid-cols-[1fr_300px] gap-10">
                {/* Main feed: articles 8+ */}
                <div>
                  {!isDefaultView && (
                    <div className="mb-2 mt-6 section-header">
                      <h2 className="font-display font-bold text-lg">
                        {searching ? `Results for "${query}"` : category}
                      </h2>
                    </div>
                  )}
                  {isDefaultView && (
                    <div className="section-header mb-2 mt-0">
                      <h2 className="font-display font-bold text-lg">More Stories</h2>
                    </div>
                  )}

                  {articles.slice(feedStart, visibleCount).map((a, i) => (
                    <div key={a.id}>
                      <NewsCard article={a} large={i % 5 === 0} />
                    </div>
                  ))}

                  {visibleCount < articles.length && (
                    <>
                      <div ref={sentinelRef} aria-hidden className="h-1" />
                      <div className="py-10 text-center">
                        <button onClick={() => setVisibleCount(p => Math.min(p + 10, articles.length))}
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading more…
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="hidden lg:block">
                  <div className="sticky top-24 space-y-0">

                    {/* AI Sentiment meter */}
                    <div className="pb-8">
                      <div className="flex items-center gap-2 mb-5">
                        <Brain className="w-4 h-4 text-primary" />
                        <h2 className="font-bold font-display text-base">AI News Sentiment</h2>
                      </div>
                      {(() => {
                        const total = sentimentCounts.bullish + sentimentCounts.bearish + sentimentCounts.neutral || 1;
                        const bull = Math.round((sentimentCounts.bullish / total) * 100);
                        const bear = Math.round((sentimentCounts.bearish / total) * 100);
                        const neut = 100 - bull - bear;
                        const rows = [
                          { label: "Bullish", pct: bull, color: "bg-success", text: "text-success" },
                          { label: "Bearish", pct: bear, color: "bg-danger", text: "text-danger" },
                          { label: "Neutral", pct: neut, color: "bg-warning", text: "text-warning" },
                        ];
                        const dominant = bull > bear + 10 ? "bullish" : bear > bull + 10 ? "bearish" : "mixed";
                        return (
                          <>
                            {/* Single stacked bar */}
                            <div className="h-3 flex overflow-hidden mb-4">
                              <div className="bg-success transition-all duration-700" style={{ width: `${bull}%` }} />
                              <div className="bg-warning transition-all duration-700" style={{ width: `${neut}%` }} />
                              <div className="bg-danger transition-all duration-700" style={{ width: `${bear}%` }} />
                            </div>
                            <div className="space-y-2.5 mb-4">
                              {rows.map(r => (
                                <div key={r.label} className="flex justify-between text-sm">
                                  <span className={`font-bold ${r.text}`}>{r.label}</span>
                                  <span className="text-muted-foreground font-mono">{r.pct}%</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                              {dominant === "bullish"
                                ? "News flow is bullish. Positive sentiment often precedes short-term price rises."
                                : dominant === "bearish"
                                  ? "Bearish headlines dominate. Fear-driven dips can be accumulation opportunities."
                                  : "Mixed signals. No clear directional bias from the current news cycle."}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    {/* Tools */}
                    <div className="border-t border-border py-8">
                      <h3 className="section-label mb-5">Trade the News</h3>
                      <div>
                        <Link to="/predictions" className="editorial-row items-center gap-3 text-sm text-foreground">
                          <TrendingUp className="w-4 h-4 text-primary shrink-0" /> AI Price Predictions
                        </Link>
                        <Link to="/sentiment" className="editorial-row items-center gap-3 text-sm text-foreground">
                          <Activity className="w-4 h-4 text-primary shrink-0" /> Fear &amp; Greed Index
                        </Link>
                        <Link to="/strength-meter" className="editorial-row items-center gap-3 text-sm text-foreground">
                          <Zap className="w-4 h-4 text-primary shrink-0" /> Crypto Strength Meter
                        </Link>
                        <Link to="/scanner" className="editorial-row items-center gap-3 text-sm text-foreground">
                          <Radar className="w-4 h-4 text-primary shrink-0" /> Token Scanner
                        </Link>
                      </div>
                    </div>

                    {/* Popular predictions */}
                    <div className="border-t border-border pt-8">
                      <h3 className="section-label mb-5">Price Predictions</h3>
                      <div className="space-y-0">
                        {POPULAR_COINS.map(([id, name]) => (
                          <Link key={id} to={`/price-prediction/${id}`}
                            className="editorial-row items-center justify-between text-sm text-foreground group">
                            <span className="font-semibold">{name}</span>
                            <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              Predict <ChevronRight className="w-3 h-3" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <div className="text-center py-32">
              <Newspaper className="w-16 h-16 text-muted-foreground/40 mx-auto mb-5" />
              <h3 className="text-2xl font-bold mb-3 font-display">
                {searching ? "No stories match your search" : "No stories yet"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                {searching ? "Try a different keyword or browse a category above." : "The feed refreshes every 5 minutes."}
              </p>
              <button onClick={() => refetch()} className="text-primary font-bold hover:underline inline-flex items-center gap-2 text-sm">
                <RefreshCw className="w-5 h-5" /> Refresh Feed
              </button>
            </div>
          )}

          {/* SEO footer block */}
          <section className="mt-16 pt-10 border-t border-border max-w-3xl">
            <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> The fastest way to read crypto news
            </h2>
            <div className="space-y-4 text-muted-foreground leading-loose">
              <p>
                Oracle Bull aggregates breaking cryptocurrency news from 50+ trusted publications — CoinDesk,
                Cointelegraph, Decrypt, The Block — and rates every headline{" "}
                <span className="text-success font-semibold">Bullish</span>,{" "}
                <span className="text-danger font-semibold">Bearish</span> or{" "}
                <span className="text-warning font-semibold">Neutral</span> using Oracle AI.
              </p>
              <p>
                Jump from any headline straight to a live{" "}
                <Link to="/predictions" className="text-primary hover:underline">AI price prediction</Link>,
                the <Link to="/sentiment" className="text-primary hover:underline">Fear &amp; Greed Index</Link>, or the{" "}
                <Link to="/strength-meter" className="text-primary hover:underline">Crypto Strength Meter</Link>.
                Your selected category is remembered, and the feed auto-refreshes every 5 minutes.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
