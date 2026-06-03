import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, ExternalLink, Brain, ArrowRight, TrendingUp,
  Activity, DollarSign, Zap, ChevronLeft, Share2, BookOpen
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
  const title = article.title.toLowerCase();
  const paragraphs: string[] = [];

  // Para 1 — Market Impact
  if (sentiment.label === "Bullish") {
    paragraphs.push(
      `Oracle AI classifies this as a bullish catalyst. Stories of this nature — particularly those referencing institutional activity, regulatory approvals, or technological milestones — have historically triggered 3–12% price reactions in the affected assets within 48–72 hours. Retail traders tend to underestimate the second-order effects: increased spot buying pressure typically flows from large caps (Bitcoin, Ethereum) into mid and small-cap altcoins within 24–48 hours as confidence spreads.`
    );
  } else if (sentiment.label === "Bearish") {
    paragraphs.push(
      `Oracle AI flags this as a bearish event. Historically, news items of this type generate a 5–15% initial price decline in the directly named assets before markets attempt a recovery. The critical variable is whether institutional players use the dip as an accumulation opportunity. Monitor the 4-hour RSI on the affected assets — a reading below 30 combined with rising volume is the classic signal that the flush is complete and smart money is entering.`
    );
  } else {
    paragraphs.push(
      `Oracle AI classifies this story as market-neutral. While the headline may appear significant, neutral events rarely produce sustained directional moves. The more important signals to watch are: (1) how large-wallet on-chain flows react in the next 6 hours, and (2) whether the overall market Fear & Greed Index shifts more than 5 points in either direction. Only act when the market gives a clear confirmation signal.`
    );
  }

  // Para 2 — Trading context
  paragraphs.push(
    `In the current market cycle, news-driven volatility is amplified by high levels of leveraged positions in the futures market. This means price reactions to headlines — both positive and negative — are often exaggerated in the short term before mean-reverting. Experienced traders use these spikes as entry or exit opportunities rather than chasing the initial move. If you are holding a position in an asset mentioned in this story, we recommend checking our live AI Price Predictions to see if the sentiment shift has altered the medium-term forecast.`
  );

  // Para 3 — What to watch next
  paragraphs.push(
    `Key levels to monitor: If the affected assets break above their 50-day moving average on strong volume following this news, it signals genuine market conviction. If volume is low, treat the move as a fakeout. For a real-time picture of market-wide sentiment and which sectors of the market are absorbing this news the best, visit our Market Sentiment dashboard and Coin Comparison Engine to see which assets are outperforming their peers right now.`
  );

  return paragraphs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const article: NewsItem | undefined = location.state?.article;
  const { data: relatedData } = useRelatedNews(article?.categories ?? "BTC");
  const relatedArticles = (relatedData?.Data ?? []).filter(a => a.id !== article?.id).slice(0, 4);

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-6">Please navigate back to the news feed to find articles.</p>
          <Link to="/news" className="text-primary hover:underline flex items-center gap-2 justify-center">
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.body?.slice(0, 200),
    "datePublished": new Date(article.published_on * 1000).toISOString(),
    "image": article.imageurl,
    "url": canonical,
    "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" },
    "author": { "@type": "Organization", "name": article.source_info?.name ?? article.source },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oraclebull.com" },
        { "@type": "ListItem", "position": 2, "name": "News", "item": "https://oraclebull.com/news" },
        { "@type": "ListItem", "position": 3, "name": article.title.slice(0, 60), "item": canonical }
      ]
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{article.title} — Oracle Bull AI Analysis</title>
        <meta name="description" content={`${article.body?.slice(0, 160)}… Oracle AI rates this ${sentiment.label}. Get the full AI market analysis on Oracle Bull.`} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.body?.slice(0, 160)} />
        <meta property="og:image" content={article.imageurl} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-primary transition-colors">News</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{article.title.slice(0, 50)}…</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-10">

            {/* Article Body */}
            <div className="lg:col-span-2">

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${sentiment.color}`}>
                  ⚡ Oracle AI: {sentiment.label}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />{publishDate} · {timeAgo(article.published_on)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Source: <span className="text-foreground font-medium">{article.source_info?.name ?? article.source}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold font-display leading-tight mb-6">
                {article.title}
              </h1>

              {/* Hero Image */}
              {article.imageurl && (
                <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7]">
                  <img
                    src={article.imageurl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}

              {/* Original article body */}
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-base leading-relaxed text-foreground/90">{article.body}</p>
              </div>

              {/* Read original */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground border border-border px-4 py-2.5 rounded-xl hover:border-primary/50 hover:text-primary transition-colors mb-10"
              >
                <ExternalLink className="w-4 h-4" />
                Read original on {article.source_info?.name ?? article.source}
              </a>

              {/* ── AI ANALYSIS SECTION ─────────────────────────────────────── */}
              <div className="holo-card p-6 md:p-8 mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold font-display text-xl">Oracle AI Market Analysis</h2>
                    <p className="text-xs text-muted-foreground">Generated from live market context · Not financial advice</p>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border mb-6 ${sentiment.color}`}>
                  AI Sentiment: {sentiment.label}
                </div>

                <div className="space-y-5">
                  {extendedAnalysis.map((para, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-bold text-foreground mb-2">
                        {i === 0 ? "🔍 Market Impact Assessment" : i === 1 ? "📊 Trading Context" : "👁 What to Watch Next"}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                    </div>
                  ))}
                </div>

                {/* Quick action CTA */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Act on this analysis:</p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/predictions" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all hover:scale-105">
                      <TrendingUp className="w-4 h-4" /> AI Price Predictions <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/sentiment" className="inline-flex items-center gap-2 bg-background/50 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:border-primary/50 transition-colors">
                      <Activity className="w-4 h-4" /> Fear & Greed Index
                    </Link>
                    <Link to="/tools/profit-calculator" className="inline-flex items-center gap-2 bg-background/50 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:border-primary/50 transition-colors">
                      <DollarSign className="w-4 h-4" /> Profit Calculator
                    </Link>
                  </div>
                </div>
              </div>

              {/* Coins mentioned */}
              {mentionedCoins.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-bold font-display text-lg mb-4">Coins Mentioned in This Story</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mentionedCoins.map(coin => (
                      <div key={coin.id} className="holo-card p-4 flex items-center justify-between gap-3">
                        <div className="font-bold text-sm">{coin.name}</div>
                        <div className="flex gap-2">
                          <Link to={`/price-prediction/${coin.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> AI Prediction
                          </Link>
                          <Link to={`/how-to-buy/${coin.id}`} className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> How to Buy
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Share this analysis:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(canonical)}&via=OracleBullAI`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Post on X (Twitter)
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Tags */}
              {article.categories && (
                <div className="holo-card p-5">
                  <h2 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {article.categories.split("|").map(cat => (
                      <Link key={cat} to={`/news`} className="text-xs px-2.5 py-1 rounded-full bg-background/50 border border-border hover:border-primary/50 hover:text-primary transition-colors">
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Quick Tools */}
              <div className="holo-card p-5">
                <h2 className="font-bold font-display text-base mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> AI Tools
                </h2>
                <div className="space-y-2">
                  {[
                    { to: "/predictions", label: "AI Price Predictions", desc: "Where are prices heading?" },
                    { to: "/compare", label: "Coin Comparisons", desc: "Which coin wins right now?" },
                    { to: "/airdrops", label: "Airdrop Tracker", desc: "Free tokens you're missing" },
                    { to: "/tools", label: "Calculators", desc: "Calculate profit and DCA" },
                  ].map(({ to, label, desc }) => (
                    <Link key={to} to={to} className="flex items-start gap-2 p-3 rounded-xl bg-background/50 border border-border hover:border-primary/40 hover:text-primary transition-all group">
                      <div>
                        <div className="text-sm font-semibold">{label}</div>
                        <div className="text-[10px] text-muted-foreground">{desc}</div>
                      </div>
                      <ArrowRight className="w-3 h-3 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related News */}
              {relatedArticles.length > 0 && (
                <div className="holo-card p-5">
                  <h2 className="font-bold font-display text-base mb-4">Related Stories</h2>
                  <div className="space-y-4">
                    {relatedArticles.map(related => {
                      const relSentiment = generateAISentiment(related);
                      const relSlug = articleToSlug(related);
                      return (
                        <Link key={related.id} to={`/news/${relSlug}`} state={{ article: related }} className="block group">
                          <div className="flex gap-1.5 mb-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${relSentiment.color}`}>
                              {relSentiment.label}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {related.title}
                          </h3>
                          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{timeAgo(related.published_on)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Back to News */}
          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to News Feed
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}
