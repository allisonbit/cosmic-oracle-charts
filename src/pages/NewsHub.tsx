import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Newspaper, Brain, TrendingUp, Clock, Search, ArrowRight, RefreshCw,
  Loader2, Bookmark, Flame, X, Sparkles, Activity, Zap, Radar,
} from "lucide-react";
import { InArticleAd } from "@/components/ads";
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

// ── Trending rail ──────────────────────────────────────────────────────────────
function TrendingSection({ articles }: { articles: NewsArticleData[] }) {
  if (articles.length < 5) return null;
  const trending = articles.slice(1, 6);
  return (
    <div className="mb-10 border-b border-border pb-8">
      <div className="flex items-center gap-2 mb-5">
        <Flame className="w-4 h-4 text-danger animate-pulse" />
        <span className="section-label text-danger">TRENDING NOW</span>
      </div>
      <div className="flex gap-10 overflow-x-auto pb-2 scrollbar-none snap-x">
        {trending.map((a, i) => {
          const s = sentimentStyle(a.sentiment);
          return (
            <Link key={a.id} to={`/news/${a.slug}`} className="min-w-[260px] w-[260px] shrink-0 snap-start group">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="font-mono text-muted-foreground/40 w-4 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-primary font-bold uppercase tracking-wider">{a.sourceName}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(a.publishedAt)}</span>
              </div>
              <h3 className="font-bold font-display text-base md:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors tracking-tight mb-2">
                {a.title}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${s.className}`}>{s.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Featured hero (full-bleed image + text overlay) ────────────────────────────
function HeroCard({ article }: { article: NewsArticleData }) {
  const s = sentimentStyle(article.sentiment);
  return (
    <Link to={`/news/${article.slug}`} className="group block mb-14 pb-14 border-b border-border">
      {/* Full-bleed image with gradient */}
      <div className="relative w-full aspect-[16/8] md:aspect-[21/9] overflow-hidden bg-muted mb-6">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="eager"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> BREAKING
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider backdrop-blur-sm ${s.className}`}>
            AI: {s.label}
          </span>
        </div>

        {/* Bottom overlay headline */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 lg:p-10">
          <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
            <span className="font-bold text-white/90 text-sm">{article.sourceName}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{timeAgo(article.publishedAt)}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{article.readTime} read</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-display leading-tight tracking-tight text-white group-hover:text-primary/80 transition-colors max-w-5xl">
            {article.title}
          </h2>
        </div>
      </div>

      {/* Teaser + CTA below image */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        <p className="flex-1 text-lg md:text-xl text-muted-foreground leading-relaxed line-clamp-2">
          {article.metaDescription}
        </p>
        <span className="inline-flex items-center gap-2 text-primary font-bold whitespace-nowrap group-hover:gap-3 transition-all text-base">
          Read Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

// ── Article row ────────────────────────────────────────────────────────────────
function NewsCard({ article }: { article: NewsArticleData }) {
  const s = sentimentStyle(article.sentiment);
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(article.id);

  return (
    <Link to={`/news/${article.slug}`} className="py-8 flex flex-col sm:flex-row gap-6 md:gap-8 group border-b border-border relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(article.id); }}
        aria-label={saved ? "Remove bookmark" : "Save for later"}
        className={`absolute top-8 right-0 z-10 p-1.5 transition-all hover:text-primary ${
          saved ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Bookmark className={`w-5 h-5 ${saved ? "fill-primary" : ""}`} />
      </button>

      {/* Thumbnail */}
      <div className="w-full sm:w-72 md:w-80 h-52 sm:h-44 md:h-48 overflow-hidden shrink-0 bg-muted">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-between pr-7">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="text-primary font-bold uppercase tracking-wider">{article.category}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(article.publishedAt)}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>{article.readTime} read</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-foreground font-medium">{article.sourceName}</span>
          </div>

          <h3 className="font-bold font-display text-2xl md:text-3xl leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors tracking-tight">
            {article.title}
          </h3>

          <p className="text-base md:text-lg text-muted-foreground line-clamp-2 leading-relaxed">
            {article.metaDescription}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <div className={`shrink-0 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${s.className}`}>
            {s.label}
          </div>
          {article.coins.slice(0, 3).map((c) => (
            <span key={c.id} className="text-xs font-semibold text-muted-foreground hidden sm:inline">${c.symbol}</span>
          ))}
          <span className="text-sm text-primary font-semibold ml-auto inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="py-8 flex flex-col sm:flex-row gap-8 animate-pulse">
          <div className="w-full sm:w-72 h-52 sm:h-44 bg-muted shrink-0" />
          <div className="flex-1 space-y-4 py-1">
            <div className="flex gap-2">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-20" />
            </div>
            <div className="h-8 bg-muted rounded w-full" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-5 bg-muted rounded w-full mt-2" />
            <div className="h-5 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function NewsHub() {
  const [category, setCategory] = useState<string>(() => readStorage<string>(CATEGORY_KEY, "All"));
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setQuery(searchInput.trim()); setVisibleCount(12); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, refetch } = useNewsFeed({ category, q: query, limit: 60 });
  const articles = useMemo(() => data?.articles ?? [], [data?.articles]);
  const categories = useMemo(() => ["All", ...(data?.categories ?? [])], [data?.categories]);
  const searching = query.length > 0;
  const isDefaultView = category === "All" && !searching;

  // Track when feed last refreshed
  useEffect(() => {
    if (data) setLastUpdated(new Date());
  }, [data]);

  const handleCategoryChange = (c: string) => {
    setCategory(c);
    setVisibleCount(12);
    writeStorage(CATEGORY_KEY, c);
  };

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= articles.length) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setVisibleCount((p) => Math.min(p + 8, articles.length));
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [articles.length, visibleCount]);

  const itemListLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: articles.slice(0, 20).map((a, i) => ({
      "@type": "ListItem", position: i + 1, url: `${SITE_URL}/news/${a.slug}`, name: a.title,
    })),
  }), [articles]);

  const sentimentCounts = useMemo(() => {
    const c = { bullish: 0, bearish: 0, neutral: 0 };
    for (const a of articles.slice(0, 30)) c[a.sentiment as keyof typeof c] = (c[a.sentiment as keyof typeof c] || 0) + 1;
    return c;
  }, [articles]);

  const feedStart = isDefaultView ? 1 : 0;

  return (
    <Layout>
      <Helmet>
        <title>Crypto News Today – Live Headlines + AI Sentiment | Oracle Bull</title>
        <meta name="description" content="Breaking cryptocurrency news from 50+ trusted sources, each rated Bullish, Bearish or Neutral by Oracle AI. Bitcoin, Ethereum, Solana, DeFi & regulation — auto-refreshes every 5 minutes." />
        <meta name="keywords" content="crypto news today, bitcoin news, ethereum news, crypto market news, latest cryptocurrency news, crypto headlines" />
        <link rel="canonical" href={`${SITE_URL}/news`} />
        <meta property="og:title" content="Crypto News Today – Live Headlines + AI Sentiment | Oracle Bull" />
        <meta property="og:description" content="Breaking crypto news with AI Bullish / Bearish / Neutral ratings, updated every 5 minutes. Bitcoin, Ethereum, Solana, DeFi & regulation." />
        <meta property="og:url" content={`${SITE_URL}/news`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "CollectionPage",
          name: "Crypto News Today | Oracle Bull",
          description: "Live crypto news with AI sentiment ratings, auto-refreshes every 5 minutes.",
          url: `${SITE_URL}/news`,
          isPartOf: { "@type": "WebSite", name: "Oracle Bull", url: SITE_URL },
          publisher: { "@type": "Organization", name: "Oracle Bull", url: SITE_URL },
        })}</script>
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
          ],
        })}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">News</span>
          </nav>

          {/* Page header */}
          <div className="border-b border-border pb-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  <span className="section-label text-danger">LIVE</span>
                  <span className="section-label">· CRYPTO NEWS</span>
                  {isFetching ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" /> Refreshing…
                    </span>
                  ) : lastUpdated ? (
                    <span className="text-xs text-muted-foreground">
                      Updated {timeAgo(lastUpdated.toISOString())}
                    </span>
                  ) : null}
                </div>

                <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight leading-[1.05] mb-4">
                  Crypto News Today
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
                  Breaking headlines from 50+ trusted crypto publications — every story rated{" "}
                  <span className="text-success font-semibold">Bullish</span>,{" "}
                  <span className="text-danger font-semibold">Bearish</span> or{" "}
                  <span className="text-warning font-semibold">Neutral</span> by Oracle AI.
                  Auto-refreshes every 5 minutes.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-80 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search crypto news…"
                  aria-label="Search crypto news"
                  className="w-full bg-background border border-border pl-10 pr-9 py-3 text-base focus:outline-none focus:border-primary transition-all"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category tabs — saved to localStorage */}
          <div className="flex items-end gap-0 overflow-x-auto scrollbar-none border-b border-border mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryChange(c)}
                className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all shrink-0 -mb-px border-b-2 ${
                  category === c
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => refetch()}
              className="ml-auto shrink-0 p-2.5 -mb-px text-muted-foreground hover:text-primary transition-colors"
              aria-label="Refresh news feed"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search result count */}
          {searching && (
            <p className="text-base text-muted-foreground mb-6">
              {articles.length > 0 ? (
                <>Showing <span className="text-foreground font-semibold">{articles.length}</span> result{articles.length !== 1 && "s"} for{" "}
                  <span className="text-foreground font-semibold">"{query}"</span></>
              ) : (
                <>No results for <span className="text-foreground font-semibold">"{query}"</span></>
              )}
            </p>
          )}

          {isLoading ? (
            <FeedSkeleton />
          ) : articles.length > 0 ? (
            <>
              {isDefaultView && <TrendingSection articles={articles} />}

              <div className="grid lg:grid-cols-[1fr_300px] gap-12">
                {/* Main feed */}
                <div>
                  {feedStart === 1 && <HeroCard article={articles[0]} />}
                  <div>
                    {articles.slice(feedStart, visibleCount).map((a, i) => (
                      <div key={a.id}>
                        <NewsCard article={a} />
                        {(i + 1) % 6 === 0 && <InArticleAd className="my-8" />}
                      </div>
                    ))}
                  </div>

                  {visibleCount < articles.length && (
                    <>
                      <div ref={sentinelRef} aria-hidden className="h-1" />
                      <div className="pt-10 pb-4 text-center">
                        <button
                          onClick={() => setVisibleCount((p) => Math.min(p + 8, articles.length))}
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading more stories…
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="hidden lg:block">
                  <div className="sticky top-24">

                    {/* Sentiment */}
                    <div className="pb-8">
                      <div className="flex items-center gap-2 mb-5">
                        <Brain className="w-4 h-4 text-primary" />
                        <h2 className="font-bold font-display text-base">News Sentiment</h2>
                      </div>
                      {(() => {
                        const total = sentimentCounts.bullish + sentimentCounts.bearish + sentimentCounts.neutral || 1;
                        const rows = [
                          { label: "Bullish", count: sentimentCounts.bullish, color: "bg-success", text: "text-success" },
                          { label: "Bearish", count: sentimentCounts.bearish, color: "bg-danger", text: "text-danger" },
                          { label: "Neutral", count: sentimentCounts.neutral, color: "bg-warning", text: "text-warning" },
                        ];
                        return (
                          <div className="space-y-4">
                            {rows.map((r) => (
                              <div key={r.label}>
                                <div className="flex justify-between text-sm mb-1.5">
                                  <span className={`font-bold ${r.text}`}>{r.label}</span>
                                  <span className="text-muted-foreground font-medium">{r.count} ({Math.round((r.count / total) * 100)}%)</span>
                                </div>
                                <div className="h-2 bg-muted overflow-hidden">
                                  <div className={`h-full ${r.color} transition-all duration-700`} style={{ width: `${(r.count / total) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                              {sentimentCounts.bullish > sentimentCounts.bearish + 2
                                ? "News flow is leaning bullish. Sentiment extremes can precede short-term rallies."
                                : sentimentCounts.bearish > sentimentCounts.bullish + 2
                                  ? "Bearish headlines dominate. Fear-driven dips often present accumulation zones."
                                  : "Mixed signals across the latest headlines. Wait for a clear catalyst."}
                            </p>
                          </div>
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

                    {/* Popular coins */}
                    <div className="border-t border-border pt-8">
                      <h3 className="section-label mb-5">Popular Predictions</h3>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_COINS.map(([id, name]) => (
                          <Link
                            key={id}
                            to={`/price-prediction/${id}`}
                            className="text-xs font-semibold px-3 py-1.5 border border-border hover:border-primary/60 hover:text-primary transition-colors"
                          >
                            {name}
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
              <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-lg leading-relaxed">
                {searching
                  ? "Try a different keyword or browse a category above."
                  : "The news engine refreshes every 5 minutes — check back shortly."}
              </p>
              <button
                onClick={() => refetch()}
                className="text-primary font-bold hover:underline inline-flex items-center gap-2 text-lg"
              >
                <RefreshCw className="w-5 h-5" /> Refresh Feed
              </button>
            </div>
          )}

          {/* SEO block */}
          <section className="mt-16 pt-10 border-t border-border max-w-3xl">
            <h2 className="text-2xl font-bold font-display mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> The fastest way to read crypto news
            </h2>
            <div className="space-y-5 text-muted-foreground leading-loose text-base">
              <p>
                Oracle Bull aggregates breaking cryptocurrency news from 50+ trusted publications — including CoinDesk,
                Cointelegraph, Decrypt and The Block — and runs every headline through our AI sentiment engine so you
                instantly know whether a story is{" "}
                <span className="text-success font-semibold">bullish</span>,{" "}
                <span className="text-danger font-semibold">bearish</span> or{" "}
                <span className="text-warning font-semibold">neutral</span> for the market.
              </p>
              <p>
                Every brief links back to the original publisher and to the coins it affects, so you can jump straight
                from a headline to a live{" "}
                <Link to="/predictions" className="text-primary hover:underline">AI price prediction</Link>,
                the{" "}
                <Link to="/sentiment" className="text-primary hover:underline">Fear &amp; Greed Index</Link>, or the{" "}
                <Link to="/strength-meter" className="text-primary hover:underline">Crypto Strength Meter</Link>.
                Your selected category is remembered between visits, and the feed auto-refreshes every 5 minutes.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
