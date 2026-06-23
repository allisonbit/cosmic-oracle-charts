import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, TrendingUp, ShieldCheck, Zap, Star } from "lucide-react";
import { COIN_META } from "./HowToBuyCoin";

// Search-volume + difficulty hints for the most popular coins. Anything not
// listed here falls back to a sensible default. The GRID itself is sourced from
// COIN_META (the single source of truth for which /how-to-buy/:coin pages exist)
// so the hub can never link to a guide that has no page — and never omits one.
const GUIDE_HINTS: Record<string, { difficulty: string; readTime: string; searches: string }> = {
  bitcoin: { difficulty: "Beginner", readTime: "5 min", searches: "2.4M/mo" },
  ethereum: { difficulty: "Beginner", readTime: "5 min", searches: "1.8M/mo" },
  solana: { difficulty: "Beginner", readTime: "4 min", searches: "980K/mo" },
  ripple: { difficulty: "Beginner", readTime: "4 min", searches: "850K/mo" },
  dogecoin: { difficulty: "Beginner", readTime: "4 min", searches: "720K/mo" },
  cardano: { difficulty: "Beginner", readTime: "5 min", searches: "560K/mo" },
  "shiba-inu": { difficulty: "Beginner", readTime: "4 min", searches: "490K/mo" },
  binancecoin: { difficulty: "Intermediate", readTime: "5 min", searches: "430K/mo" },
  polkadot: { difficulty: "Intermediate", readTime: "5 min", searches: "380K/mo" },
  chainlink: { difficulty: "Intermediate", readTime: "5 min", searches: "310K/mo" },
  "avalanche-2": { difficulty: "Intermediate", readTime: "5 min", searches: "290K/mo" },
  pepe: { difficulty: "Beginner", readTime: "3 min", searches: "270K/mo" },
  arbitrum: { difficulty: "Intermediate", readTime: "6 min", searches: "220K/mo" },
  near: { difficulty: "Intermediate", readTime: "5 min", searches: "180K/mo" },
  aptos: { difficulty: "Intermediate", readTime: "5 min", searches: "170K/mo" },
  sui: { difficulty: "Intermediate", readTime: "5 min", searches: "165K/mo" },
  "render-token": { difficulty: "Advanced", readTime: "6 min", searches: "150K/mo" },
  bittensor: { difficulty: "Advanced", readTime: "6 min", searches: "140K/mo" },
  "injective-protocol": { difficulty: "Advanced", readTime: "6 min", searches: "130K/mo" },
};

// Every guide that actually has a page, ordered by search volume (known coins
// first, then the rest alphabetically by name).
const GUIDES = Object.entries(COIN_META)
  .map(([id, meta]) => ({
    id,
    name: meta.name,
    ticker: meta.ticker,
    ...(GUIDE_HINTS[id] ?? { difficulty: "Beginner", readTime: "5 min", searches: "" }),
  }))
  .sort((a, b) => {
    const av = parseSearches(a.searches);
    const bv = parseSearches(b.searches);
    if (av !== bv) return bv - av;
    return a.name.localeCompare(b.name);
  });

function parseSearches(s: string): number {
  if (!s) return 0;
  const n = parseFloat(s);
  if (s.includes("M")) return n * 1_000_000;
  if (s.includes("K")) return n * 1_000;
  return n;
}

const difficultyColor: Record<string, string> = {
  Beginner: "text-success border-success/30 bg-success/10",
  Intermediate: "text-warning border-warning/30 bg-warning/10",
  Advanced: "text-danger border-danger/30 bg-danger/10",
};

export default function HowToBuyHub() {
  return (
    <Layout>
      <Helmet>
        <title>How to Buy Cryptocurrency – Beginner Guides | Oracle Bull</title>
        <meta name="description" content="Learn how to buy Bitcoin, Ethereum, Solana and 30+ cryptocurrencies safely. Step-by-step beginner guides with AI-powered tips on timing your purchase." />
        <link rel="canonical" href="https://oraclebull.com/how-to-buy" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "How to Buy Crypto Guides | Oracle Bull",
          "description": "Step-by-step guides on how to buy 80+ cryptocurrencies safely with AI purchase timing tips.",
          "url": "https://oraclebull.com/how-to-buy",
          "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" }
        })}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <BookOpen className="w-4 h-4" />
              <span>STEP-BY-STEP BUYING GUIDES</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 glow-text">
              How to Buy Crypto
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Simple, accurate, up-to-date guides for buying any cryptocurrency safely - with AI-powered tips on <em>when</em> to buy, not just <em>how</em>.
            </p>
            <div className="inline-block px-4 py-2 bg-background/50 border border-border rounded-lg text-xs text-muted-foreground/80 max-w-2xl mx-auto">
              <strong>Advertiser Disclosure:</strong> Oracle Bull is an independent platform. We may receive compensation from the cryptocurrency exchanges or brokers recommended in these guides at no additional cost to you. This compensation does not impact our AI-driven market analysis or ratings.
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { icon: ShieldCheck, label: "Safe Exchanges Only", desc: "We only recommend regulated, insured platforms" },
              { icon: Zap, label: "AI Buy Timing", desc: "Each guide links to live AI signals for entry points" },
              { icon: TrendingUp, label: "Always Updated", desc: "Guides are refreshed with current fee and rate data" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="holo-card p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-bold text-sm mb-1">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>

          {/* Guides Grid */}
          <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            All Buying Guides
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GUIDES.map(guide => (
              <Link
                key={guide.id}
                to={`/how-to-buy/${guide.id}`}
                className="holo-card p-5 group hover:border-primary/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold font-display text-lg group-hover:text-primary transition-colors">
                      {guide.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{guide.ticker}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColor[guide.difficulty]}`}>
                    {guide.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{guide.readTime} read{guide.searches ? ` - ${guide.searches} searches` : ""}</div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}
