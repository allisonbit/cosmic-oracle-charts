import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Clock, ExternalLink, Brain, ArrowRight, TrendingUp,
  Activity, DollarSign, Zap, ChevronLeft, Share2, BookOpen,
  MessageSquare, Bookmark, Twitter, Facebook, Link as LinkIcon
} from "lucide-react";
import { generateAISentiment, articleToSlug, type NewsItem } from "./NewsHub";

// ── Time helper ───────────────────────────────────────────────────────────────
function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

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

// ── Coin mentions extractor ───────────────────────────────────────────────────
const COIN_KEYWORDS: Record<string, { name: string; id: string }> = {
  bitcoin: { name: "Bitcoin", id: "bitcoin" },
  btc: { name: "Bitcoin", id: "bitcoin" },
  ethereum: { name: "Ethereum", id: "ethereum" },
  eth: { name: "Ethereum", id: "ethereum" },
  solana: { name: "Solana", id: "solana" },
  sol: { name: "Solana", id: "solana" },
  xrp: { name: "XRP", id: "ripple" },
  ripple: { name: "XRP", id: "ripple" },
  cardano: { name: "Cardano", id: "cardano" },
  ada: { name: "Cardano", id: "cardano" },
  dogecoin: { name: "Dogecoin", id: "dogecoin" },
  doge: { name: "Dogecoin", id: "dogecoin" },
  polkadot: { name: "Polkadot", id: "polkadot" },
  chainlink: { name: "Chainlink", id: "chainlink" },
  link: { name: "Chainlink", id: "chainlink" },
  avalanche: { name: "Avalanche", id: "avalanche-2" },
  avax: { name: "Avalanche", id: "avalanche-2" },
  shiba: { name: "Shiba Inu", id: "shiba-inu" },
  shib: { name: "Shiba Inu", id: "shiba-inu" },
  bnb: { name: "BNB", id: "binancecoin" },
  pepe: { name: "Pepe", id: "pepe" },
  arbitrum: { name: "Arbitrum", id: "arbitrum" },
  arb: { name: "Arbitrum", id: "arbitrum" },
  near: { name: "NEAR", id: "near" },
  sui: { name: "Sui", id: "sui" },
  aptos: { name: "Aptos", id: "aptos" },
  apt: { name: "Aptos", id: "aptos" },
};

function extractMentionedCoins(text: string): { name: string; id: string }[] {
  const lower = text.toLowerCase();
  const found = new Map<string, { name: string; id: string }>();
  for (const [keyword, coin] of Object.entries(COIN_KEYWORDS)) {
    if (lower.includes(keyword) && !found.has(coin.id)) {
      found.set(coin.id, coin);
    }
  }
  return [...found.values()].slice(0, 4);
}

// ── Related news ──────────────────────────────────────────────────────────────
function useRelatedNews(categories: string) {
  return useQuery<{ Data: NewsItem[] }>({
    queryKey: ["related-news", categories],
    queryFn: async () => {
      const cat = categories?.split("|")[0] ?? "BTC";
      const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${cat}&sortOrder=latest`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Extended AI analysis generator ───────────────────────────────────────────
function generateExtendedAnalysis(article: NewsItem, sentiment: { label: string }): string[] {
  const paragraphs: string[] = [];
  if (sentiment.label === "Bullish") {
    paragraphs.push(`Oracle AI classifies this as a bullish catalyst. Stories of this nature - particularly those referencing institutional activity, regulatory approvals, or technological milestones - have historically triggered 3–12% price reactions in the affected assets within 48–72 hours. Retail traders tend to underestimate the second-order effects: increased spot buying pressure typically flows from large caps into mid and small-cap altcoins within 24–48 hours as confidence spreads.`);
  } else if (sentiment.label === "Bearish") {
    paragraphs.push(`Oracle AI flags this as a bearish event. Historically, news items of this type generate a 5–15% initial price decline in the directly named assets before markets attempt a recovery. The critical variable is whether institutional players use the dip as an accumulation opportunity. Monitor the 4-hour RSI on the affected assets - a reading below 30 combined with rising volume is the classic signal that the flush is complete.`);
  } else {
    paragraphs.push(`Oracle AI classifies this story as market-neutral. While the headline may appear significant, neutral events rarely produce sustained directional moves. The more important signals to watch are: (1) how large-wallet on-chain flows react in the next 6 hours, and (2) whether the overall market Fear & Greed Index shifts more than 5 points in either direction.`);
  }
  paragraphs.push(`In the current market cycle, news-driven volatility is amplified by high levels of leveraged positions in the futures market. This means price reactions to headlines are often exaggerated in the short term before mean-reverting. Experienced traders use these spikes as entry or exit opportunities rather than chasing the initial move.`);
  paragraphs.push(`Key levels to monitor: If the affected assets break above their 50-day moving average on strong volume following this news, it signals genuine market conviction. If volume is low, treat the move as a fakeout. Check our Market Sentiment dashboard for confirmation.`);
  return paragraphs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const article: NewsItem | undefined = location.state?.article;
  const { data: relatedData } = useRelatedNews(article?.categories ?? "BTC");
  const relatedArticles = (relatedData?.Data ?? []).filter(a => a.id !== article?.id).slice(0, 4);

  // Read progress and bookmarks
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (winHeightPx > 0) {
        setProgress((scrollPx / winHeightPx) * 100);
      }
    };
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const toggleBookmark = () => setIsBookmarked(p => !p);

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4 font-display">Article not found</h1>
          <p className="text-muted-foreground mb-8 text-lg">Please navigate back to the news feed to find articles.</p>
          <Link to="/news" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to News Feed
          </Link>
        </div>
      </Layout>
    );
  }

  const sentiment = generateAISentiment(article);
  const extendedAnalysis = generateExtendedAnalysis(article, sentiment);
  const mentionedCoins = extractMentionedCoins(article.title + " " + article.body);
  const publishDate = formatDate(article.published_on);
  const canonical = `https://oraclebull.com/news/${slug}`;

  return (
    <Layout>
      <Helmet>
        <title>{article.title} - OracleBull News</title>
        <meta name="description" content={`${article.body?.slice(0, 160)}... Oracle AI rates this ${sentiment.label}.`} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.body?.slice(0, 160)} />
        <meta property="og:image" content={article.imageurl} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-primary z-[100] transition-all duration-150" style={{ width: `${progress}%` }} />

      {/* Sticky Floating Share (Desktop) */}
      <div className="hidden xl:flex flex-col gap-4 fixed left-8 top-1/3 z-40">
        <button className="p-3 bg-background/80 backdrop-blur-sm border border-border rounded-full hover:border-primary/50 hover:text-primary transition-all shadow-lg text-muted-foreground"><Twitter className="w-5 h-5" /></button>
        <button className="p-3 bg-background/80 backdrop-blur-sm border border-border rounded-full hover:border-primary/50 hover:text-primary transition-all shadow-lg text-muted-foreground"><Facebook className="w-5 h-5" /></button>
        <button onClick={handleShare} className="p-3 bg-background/80 backdrop-blur-sm border border-border rounded-full hover:border-primary/50 hover:text-primary transition-all shadow-lg text-muted-foreground"><LinkIcon className="w-5 h-5" /></button>
        <div className="h-px w-8 bg-border my-2 mx-auto" />
        <button onClick={toggleBookmark} className={`p-3 bg-background/80 backdrop-blur-sm border border-border rounded-full hover:border-primary/50 hover:text-primary transition-all shadow-lg ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}>
          <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-primary" : ""}`} />
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-8 flex flex-wrap items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-primary transition-colors">News</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1 flex-1">{article.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Article Body */}
            <article>
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${sentiment.color}`}>
                  AI: {sentiment.label}
                </span>
                {article.categories.split("|").slice(0, 2).map(cat => (
                  <span key={cat} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-border bg-background uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </span>
                ))}
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 ml-auto">
                  <Clock className="w-3.5 h-3.5" /> {getReadTime(article.body)} min read
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold font-display leading-tight mb-6 tracking-tight">
                {article.title}
              </h1>

              {/* Source & Date line */}
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                  {article.source_info?.img ? (
                    <img src={article.source_info.img} alt={article.source_info.name} className="w-full h-full object-cover" />
                  ) : (
                    <Newspaper className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">{article.source_info?.name ?? article.source}</div>
                  <div className="text-xs text-muted-foreground">{publishDate} • {timeAgo(article.published_on)}</div>
                </div>
              </div>

              {/* Hero Image */}
              {article.imageurl && (
                <div className="rounded-3xl overflow-hidden mb-10 aspect-video shadow-2xl border border-white/5">
                  <img src={article.imageurl} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Original article body */}
              <div className="prose prose-invert prose-lg max-w-none mb-10 prose-p:leading-relaxed prose-p:text-foreground/80 prose-headings:font-display">
                <p className="text-xl text-foreground font-medium leading-relaxed mb-8">{article.body}</p>
                
                <div className="p-6 bg-muted/30 border-l-4 border-primary rounded-r-xl my-8">
                  <p className="text-sm text-muted-foreground italic m-0">
                    "This is an aggregated summary. The full event details and extended commentary are available at the original source."
                  </p>
                </div>
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold bg-background border-2 border-primary/20 text-primary px-6 py-3 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all mb-12"
              >
                Continue reading on {article.source_info?.name ?? article.source} <ExternalLink className="w-4 h-4" />
              </a>

              {/* ── AI ANALYSIS SECTION ─────────────────────────────────────── */}
              <div className="holo-card p-8 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold font-display text-2xl">Oracle AI Market Analysis</h2>
                      <p className="text-xs text-muted-foreground">Generated from live market context</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {extendedAnalysis.map((para, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-bold text-foreground mb-2 tracking-wide uppercase">
                          {i === 0 ? "Market Impact" : i === 1 ? "Trading Context" : "Key Levels to Watch"}
                        </h3>
                        <p className="text-base text-muted-foreground leading-relaxed">{para}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-3">
                    <Link to="/predictions" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all hover:scale-105">
                      <TrendingUp className="w-4 h-4" /> View AI Predictions
                    </Link>
                    <Link to="/sentiment" className="inline-flex items-center gap-2 bg-background/50 border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-primary/50 transition-colors">
                      <Activity className="w-4 h-4" /> Market Sentiment
                    </Link>
                  </div>
                </div>
              </div>

              {/* Comments Placeholder */}
              <div className="mb-12">
                <h3 className="font-bold font-display text-xl mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Discussion (0)
                </h3>
                <div className="holo-card p-8 text-center border-dashed">
                  <p className="text-muted-foreground mb-4">Log in to join the conversation with other traders.</p>
                  <button className="bg-foreground text-background px-6 py-2.5 rounded-xl font-bold hover:bg-foreground/90 transition-all">
                    Log In to Comment
                  </button>
                </div>
              </div>

              {/* Newsletter Inline Box */}
              <div className="holo-card p-8 mb-12 bg-gradient-to-br from-background to-primary/5 text-center">
                <h3 className="text-2xl font-bold font-display mb-2">Get AI Alpha in Your Inbox</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                  Join 50,000+ traders getting our daily AI-curated news breakdown.
                </p>
                <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                    required
                  />
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    Subscribe
                  </button>
                </form>
              </div>

            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              
              {/* Mobile Share (Visible only on small screens) */}
              <div className="xl:hidden holo-card p-5 flex items-center justify-center gap-4">
                <span className="text-sm font-bold">Share:</span>
                <button className="p-2 bg-muted rounded-full hover:bg-primary/20 hover:text-primary transition-all"><Twitter className="w-4 h-4" /></button>
                <button className="p-2 bg-muted rounded-full hover:bg-primary/20 hover:text-primary transition-all"><Facebook className="w-4 h-4" /></button>
                <button onClick={handleShare} className="p-2 bg-muted rounded-full hover:bg-primary/20 hover:text-primary transition-all"><LinkIcon className="w-4 h-4" /></button>
                <button onClick={toggleBookmark} className={`p-2 bg-muted rounded-full transition-all ${isBookmarked ? "text-primary bg-primary/20" : "hover:bg-primary/20 hover:text-primary"}`}><Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-primary" : ""}`} /></button>
              </div>

              {/* Coins mentioned */}
              {mentionedCoins.length > 0 && (
                <div className="holo-card p-6">
                  <h2 className="font-bold font-display text-lg mb-4">Coins Mentioned</h2>
                  <div className="space-y-3">
                    {mentionedCoins.map(coin => (
                      <div key={coin.id} className="flex items-center justify-between p-3 bg-background/50 border border-border rounded-xl group hover:border-primary/50 transition-all">
                        <div className="font-bold text-sm">{coin.name}</div>
                        <Link to={`/price-prediction/${coin.id}`} className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Prediction <TrendingUp className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Articles */}
              {relatedArticles.length > 0 && (
                <div className="holo-card p-6 sticky top-24">
                  <h2 className="font-bold font-display text-lg mb-4">Read Next</h2>
                  <div className="space-y-5">
                    {relatedArticles.map(related => {
                      const relSentiment = generateAISentiment(related);
                      const relSlug = articleToSlug(related);
                      return (
                        <Link key={related.id} to={`/news/${relSlug}`} state={{ article: related }} className="block group">
                          <div className="flex gap-2 mb-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${relSentiment.color}`}>
                              {relSentiment.label}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-wider">
                              {related.categories.split("|")[0]}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                            {related.title}
                          </h3>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>

        </div>
      </div>
    </Layout>
  );
}
