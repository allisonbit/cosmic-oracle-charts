import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Newspaper, Brain, TrendingUp, Clock, Search, ArrowRight, RefreshCw,
  Loader2, Bookmark, Flame, X, ExternalLink, Sparkles, Activity, Zap, Radar,
} from "lucide-react";
import { InArticleAd } from "@/components/ads";
import { SITE_URL } from "@/lib/siteConfig";
import {
  useNewsFeed, timeAgo, sentimentStyle, type NewsArticleData,
} from "@/hooks/useNews";

// ── Persistent bookmarks (localStorage) ───────────────────────────────────────
const BOOKMARK_KEY = "oraclebull:news:bookmarks";
function readBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"); } catch { return []; }
}
function useBookmarks() {
  const [ids, setIds] = useState<string[]>(() => readBookmarks());
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  return { ids, toggle, isBookmarked: (id: string) => ids.includes(id) };
}

// Popular coins for the internal-link rail (drives crawl depth into predictions).
const POPULAR_COINS = [
  ["bitcoin", "Bitcoin"], ["ethereum", "Ethereum"], ["solana", "Solana"], ["ripple", "XRP"],
  ["dogecoin", "Dogecoin"], ["cardano", "Cardano"], ["chainlink", "Chainlink"], ["avalanche", "Avalanche"],
];

// ── Trending strip ────────────────────────────────────────────────────────────
function TrendingSection({ articles }: { articles: NewsArticleData[] }) {
  if (articles.length < 5) return null;
  const trending = articles.slice(1, 6);
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-danger animate-pulse" />
        <h2 className="font-bold font-display text-lg">Trending Now</h2>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x">
        {trending.map((a) => (
          <Link key={a.id} to={`/news/${a.slug}`} className="min-w-[260px] w-[260px] shrink-0 snap-start group">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
              <span className="text-primary font-bold uppercase tracking-wider">{a.sourceName}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(a.publishedAt)}</span>
            </div>
            <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {a.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Featured hero card ────────────────────────────────────────────────────────
function HeroCard({ article }: { article: NewsArticleData }) {
  const s = sentimentStyle(article.sentiment);
  return (
    <Link to={`/news/${article.slug}`} className="group flex flex-col mb-12 pb-12 border-b border-border">
      <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 relative bg-muted">
        {article.imageUrl && (
          <img
            src={article.imageUrl} alt={article.title} loading="eager"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
      </div>
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/50 bg-primary/20 text-primary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> BREAKING
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${s.className}`}>
            AI: {s.label}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-border bg-background/80 text-muted-foreground uppercase tracking-wider">
            {article.category}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display leading-tight mb-5 group-hover:text-primary transition-colors tracking-tight">
          {article.title}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
          {article.metaDescription}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{timeAgo(article.publishedAt)}</span>
          <span className="flex items-center gap-1.5 border-l border-border pl-4">{article.readTime} read</span>
          <span className="flex items-center gap-1.5 border-l border-border pl-4 text-foreground font-bold">{article.sourceName}</span>
        </div>
        <span className="inline-flex items-center gap-2 text-primary font-bold self-start hover:underline text-lg">
          Read Full Story <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

// ── News card ─────────────────────────────────────────────────────────────────
function NewsCard({ article }: { article: NewsArticleData }) {
  const s = sentimentStyle(article.sentiment);
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(article.id);
  return (
    <Link to={`/news/${article.slug}`} className="py-8 flex flex-col sm:flex-row gap-8 group border-b border-border relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(article.id); }}
        aria-label={saved ? "Remove bookmark" : "Save for later"}
        className={`absolute top-8 right-0 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border transition-all hover:text-primary ${saved ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <Bookmark className={`w-4 h-4 ${saved ? "fill-primary" : ""}`} />
      </button>
      <div className="w-full sm:w-64 h-48 sm:h-40 rounded-2xl overflow-hidden shrink-0 bg-muted relative">
        {article.imageUrl && (
          <img
            src={article.imageUrl} alt={article.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between pr-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="text-primary font-bold uppercase tracking-wider">{article.category}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(article.publishedAt)}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>{article.readTime} read</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="text-foreground font-medium">{article.sourceName}</span>
          </div>
          <h3 className="font-bold font-display text-xl md:text-2xl leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors tracking-tight">
            {article.title}
          </h3>
          <p className="text-base text-muted-foreground line-clamp-2 mb-4">{article.metaDescription}</p>
        </div>
        <div className="flex items-center gap-3 mt-auto">
          <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${s.className}`}>
            {s.label}
          </div>
          {article.coins.slice(0, 3).map((c) => (
            <span key={c.id} className="text-[10px] font-semibold text-muted-foreground hidden sm:inline">${c.symbol}</span>
          ))}
          <span className="text-xs text-primary font-semibold ml-auto inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="py-8 flex flex-col sm:flex-row gap-8 animate-pulse">
          <div className="w-full sm:w-64 h-48 sm:h-40 rounded-2xl bg-muted shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="flex gap-2"><div className="h-3 bg-muted rounded w-16" /><div className="h-3 bg-muted rounded w-20" /></div>
            <div className="h-5 bg-muted rounded w-full" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NewsHub() {
  const [category, setCategory] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => { setQuery(searchInput.trim()); setVisibleCount(12); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, refetch } = useNewsFeed({ category, q: query, limit: 60 });
  const articles = useMemo(() => data?.articles ?? [], [data?.articles]);
  const serverCategories = data?.categories ?? [];
  const categories = useMemo(() => ["All", ...serverCategories], [serverCategories]);
  const searching = query.length > 0;
  const isDefaultView = category === "All" && !searching;

  const handleCategoryChange = (c: string) => { setCategory(c); setVisibleCount(12); };

  // Infinite scroll.
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

  const feedStart = isDefaultView && visibleCount >= 12 ? 1 : 0; // hero takes slot 0

  return (
    <Layout>
      <Helmet>
        <title>Crypto News Today – Live Headlines + AI Sentiment | Oracle Bull</title>
        <meta name="description" content="Breaking cryptocurrency news from 50+ trusted sources, each rated Bullish, Bearish or Neutral by Oracle AI. Bitcoin, Ethereum, Solana, DeFi & regulation — updated every 30 minutes." />
        <meta name="keywords" content="crypto news today, bitcoin news, ethereum news, crypto market news, latest cryptocurrency news, crypto headlines" />
        <link rel="canonical" href={`${SITE_URL}/news`} />
        <meta property="og:title" content="Crypto News Today – Live Headlines + AI Sentiment | Oracle Bull" />
        <meta property="og:description" content="Breaking crypto news with AI Bullish / Bearish / Neutral ratings, updated every 30 minutes. Bitcoin, Ethereum, Solana, DeFi & regulation." />
        <meta property="og:url" content={`${SITE_URL}/news`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "CollectionPage",
          name: "Crypto News Today | Oracle Bull",
          description: "Live crypto news with AI sentiment ratings, updated every 30 minutes.",
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
          {/* Header */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span><span className="text-foreground">News</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> LIVE · UPDATED EVERY 30 MIN
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight">Crypto News Today</h1>
              <p className="text-muted-foreground mt-3 max-w-xl text-lg">
                Breaking headlines from 50+ trusted crypto publications — every story rated{" "}
                <span className="text-success font-semibold">Bullish</span>,{" "}
                <span className="text-danger font-semibold">Bearish</span> or{" "}
                <span className="text-warning font-semibold">Neutral</span> by Oracle AI.
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
                className="w-full bg-background border border-border rounded-xl pl-10 pr-9 py-3 text-sm focus:outline-none focus:border-primary transition-all"
              />
              {searchInput && (
                <button onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6 border-b border-border">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryChange(c)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                  category === c ? "bg-foreground text-background shadow-md"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
            {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-1 shrink-0" />}
          </div>

          {searching && (
            <p className="text-sm text-muted-foreground mb-6">
              {articles.length > 0
                ? <>Showing {articles.length} result{articles.length !== 1 && "s"} for <span className="text-foreground font-semibold">“{query}”</span></>
                : <>No results for <span className="text-foreground font-semibold">“{query}”</span></>}
            </p>
          )}

          {isLoading ? (
            <FeedSkeleton />
          ) : articles.length > 0 ? (
            <>
              {isDefaultView && <TrendingSection articles={articles} />}
              <div className="grid lg:grid-cols-[1fr_320px] gap-8">
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
                      <div className="pt-8 pb-4 text-center">
                        <button onClick={() => setVisibleCount((p) => Math.min(p + 8, articles.length))}
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading more stories…
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-8 hidden lg:block">
                  <div className="sticky top-24 space-y-8">
                    {/* Sentiment */}
                    <div>
                      <h2 className="font-bold font-display text-lg mb-5 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" /> News Sentiment
                      </h2>
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
                                  <span className="text-muted-foreground font-medium">{Math.round((r.count / total) * 100)}%</span>
                                </div>
                                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${r.color} transition-all duration-700`} style={{ width: `${(r.count / total) * 100}%` }} />
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
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Trade the News</h3>
                      <div className="space-y-1.5">
                        <Link to="/predictions" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"><TrendingUp className="w-4 h-4 text-primary" /> AI Price Predictions</Link>
                        <Link to="/sentiment" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"><Activity className="w-4 h-4 text-primary" /> Fear &amp; Greed Index</Link>
                        <Link to="/strength-meter" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"><Zap className="w-4 h-4 text-primary" /> Crypto Strength Meter</Link>
                        <Link to="/scanner" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"><Radar className="w-4 h-4 text-primary" /> Token Scanner</Link>
                      </div>
                    </div>

                    {/* Coin predictions */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Popular Predictions</h3>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_COINS.map(([id, name]) => (
                          <Link key={id} to={`/price-prediction/${id}`} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-background border border-border hover:border-primary/50 hover:text-primary transition-colors">
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
              <Newspaper className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{searching ? "No stories match your search" : "No stories yet"}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                {searching ? "Try a different keyword or browse a category above." : "The news engine refreshes every 30 minutes — check back shortly."}
              </p>
              <button onClick={() => refetch()} className="text-primary font-bold hover:underline inline-flex items-center gap-2 mx-auto">
                <RefreshCw className="w-4 h-4" /> Refresh Feed
              </button>
            </div>
          )}

          {/* SEO copy block */}
          <section className="mt-16 pt-10 border-t border-border max-w-3xl">
            <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> The fastest way to read crypto news
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Oracle Bull aggregates breaking cryptocurrency news from 50+ trusted publications — including CoinDesk,
                Cointelegraph, Decrypt and The Block — and runs every headline through our AI sentiment engine so you
                instantly know whether a story is <span className="text-success font-semibold">bullish</span>,{" "}
                <span className="text-danger font-semibold">bearish</span> or{" "}
                <span className="text-warning font-semibold">neutral</span> for the market.
              </p>
              <p>
                Every brief links back to the original publisher and to the coins it affects, so you can jump straight
                from a headline to a live <Link to="/predictions" className="text-primary hover:underline">AI price prediction</Link>,
                the <Link to="/sentiment" className="text-primary hover:underline">Fear &amp; Greed Index</Link>, or the{" "}
                <Link to="/strength-meter" className="text-primary hover:underline">Crypto Strength Meter</Link>. The feed
                refreshes automatically every 30 minutes, around the clock.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
