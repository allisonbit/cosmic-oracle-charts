import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { TrendingUp, TrendingDown, Calendar, Target, Shield, Zap, AlertTriangle, ChevronRight, BarChart3, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCryptoBySlug, TOP_CRYPTOS } from "@/hooks/usePricePrediction";

const VALID_YEARS = ["2026", "2027", "2028", "2030"];

// Projection multipliers by year — based on historical crypto cycle analysis
const YEAR_PROJECTIONS: Record<string, {
  bear: number; base: number; bull: number;
  bearLabel: string; baseLabel: string; bullLabel: string;
  context: string; keyEvents: string[];
}> = {
  "2026": {
    bear: 0.65, base: 1.7, bull: 3.2,
    bearLabel: "Regulatory crackdown or macro recession slows adoption",
    baseLabel: "Post-halving cycle continues, sustained ETF inflows",
    bullLabel: "Institutional treasury buying + halving supply shock — parabolic move",
    context: "2026 is a critical year shaped by Bitcoin's April 2024 halving. Historically, the 18–24 months following a halving see the strongest price appreciation as new supply is cut in half while demand from ETFs and institutions keeps growing.",
    keyEvents: [
      "Bitcoin post-halving supply squeeze (2024 halving effects peak)",
      "US Bitcoin and Ethereum spot ETF continued inflows",
      "Federal Reserve rate environment (potential easing boosts liquidity)",
      "MicroStrategy and corporate treasury adoption expanding",
      "DeFi and Layer-2 ecosystem reaching consumer scale",
    ],
  },
  "2027": {
    bear: 0.50, base: 2.2, bull: 5.5,
    bearLabel: "Post-bull bear market correction, macro downturn",
    baseLabel: "Crypto infrastructure matures, RWA tokenization reaches scale",
    bullLabel: "Hyper-adoption — DeFi, AI tokens, and nation-state adoption",
    context: "2027 may see a transition year — either a post-2026-bull correction or a continued wave driven by real-world asset (RWA) tokenization and AI-crypto convergence. Growing institutional infrastructure could set higher price floors than previous cycles.",
    keyEvents: [
      "Potential post-2026 cycle correction and accumulation phase",
      "Real-world asset (RWA) tokenization reaching $1T+ on-chain",
      "AI agents using crypto rails for autonomous payments",
      "DeFi regulatory clarity in US and European Union",
      "Pre-2028 halving early accumulation beginning",
    ],
  },
  "2028": {
    bear: 0.7, base: 3.5, bull: 9.0,
    bearLabel: "Delayed adoption cycle, extended bear market",
    baseLabel: "2028 halving drives next major bull cycle — supply shock",
    bullLabel: "Bitcoin as global reserve asset narrative goes mainstream",
    context: "2028 is a Bitcoin halving year — the fourth halving in history. Each previous halving has been followed by a major bull cycle. With institutional infrastructure far more mature than prior cycles, the 2028 halving could be the most significant supply-demand event in crypto history.",
    keyEvents: [
      "Bitcoin 2028 halving (block reward drops to 1.5625 BTC)",
      "Nation-state Bitcoin reserve adoption spreading globally",
      "Ethereum potentially fully deflationary under high demand",
      "Global stablecoin settlement volume surpassing SWIFT",
      "Crypto-native financial products reaching billions of users",
    ],
  },
  "2030": {
    bear: 1.3, base: 6.0, bull: 22.0,
    bearLabel: "Crypto fails mainstream adoption, regulatory suppression",
    baseLabel: "Crypto becomes core global financial infrastructure",
    bullLabel: "Bitcoin global reserve asset, crypto market cap exceeds $20 trillion",
    context: "By 2030, two more Bitcoin halvings will have occurred (2024 and 2028), reducing annual new supply to under 100,000 BTC. With mainstream institutional adoption, potential sovereign reserves, and global DeFi infrastructure, the total crypto market cap could far exceed current all-time highs.",
    keyEvents: [
      "Two Bitcoin halvings completed (2024 + 2028) — cumulative supply impact",
      "Bitcoin as sovereign reserve asset for 10+ nations",
      "Global DeFi market processing trillions in daily volume",
      "Layer-2 solutions enabling billions of daily active users",
      "Cross-border payments dominated by crypto/stablecoin rails",
    ],
  },
};

const formatPrice = (price: number) => {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toPrecision(4)}`;
};

const formatMarketCap = (mc: number) => {
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(1)}B`;
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(1)}M`;
  return `$${mc.toLocaleString()}`;
};

export default function YearPrediction() {
  const { coinId = "bitcoin", year = "2025" } = useParams<{ coinId: string; year: string }>();

  const isInvalidYear = !VALID_YEARS.includes(year);
  const safeYear = isInvalidYear ? "2026" : year;

  const crypto = getCryptoBySlug(coinId) || TOP_CRYPTOS[0];
  const proj = YEAR_PROJECTIONS[safeYear];

  // Fetch live price from CoinGecko
  const { data: marketData } = useQuery({
    queryKey: ["coingecko-simple", crypto.id],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${crypto.id}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true&include_24hr_vol=true&include_ath=true`
      );
      if (!res.ok) throw new Error("CoinGecko fetch failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isInvalidYear) {
    return <Navigate to={`/price-prediction/${coinId}/daily`} replace />;
  }

  const currentPrice: number = marketData?.[crypto.id]?.usd ?? 0;
  const change24h: number = marketData?.[crypto.id]?.usd_24h_change ?? 0;
  const marketCap: number = marketData?.[crypto.id]?.usd_market_cap ?? 0;

  const bearTarget = currentPrice > 0 ? currentPrice * proj.bear : 0;
  const baseTarget = currentPrice > 0 ? currentPrice * proj.base : 0;
  const bullTarget = currentPrice > 0 ? currentPrice * proj.bull : 0;

  const coinName = crypto.name;
  const coinSymbol = crypto.symbol.toUpperCase();

  const title = `${coinName} Price Prediction ${year} — ${coinSymbol} Forecast & Analysis`;
  const description = `${coinName} (${coinSymbol}) price prediction for ${year}. Bear case: ${bearTarget > 0 ? formatPrice(bearTarget) : "calculating..."}, Base case: ${baseTarget > 0 ? formatPrice(baseTarget) : "calculating..."}, Bull case: ${bullTarget > 0 ? formatPrice(bullTarget) : "calculating..."}. Expert analysis, key catalysts, and long-term ${coinSymbol} forecast for ${year}.`;

  const faqItems = [
    {
      q: `What will ${coinName} be worth in ${year}?`,
      a: `Based on our analysis, ${coinName} (${coinSymbol}) could range from ${bearTarget > 0 ? formatPrice(bearTarget) : "TBD"} (bear case) to ${bullTarget > 0 ? formatPrice(bullTarget) : "TBD"} (bull case) by ${year}, with a base-case target of ${baseTarget > 0 ? formatPrice(baseTarget) : "TBD"}. This projection accounts for ${proj.keyEvents[0].toLowerCase()} and other macro factors.`,
    },
    {
      q: `Is ${coinName} a good investment for ${year}?`,
      a: `${coinName} has historically shown strong performance in post-halving cycles and during periods of institutional adoption. For ${year}, key factors include ${proj.keyEvents.slice(0, 2).map(e => e.toLowerCase()).join(" and ")}. As always, cryptocurrency carries significant risk — never invest more than you can afford to lose, and consider consulting a financial advisor.`,
    },
    {
      q: `What is the ${coinName} price prediction for ${year} in the bull case?`,
      a: `In a bull scenario for ${year}, ${coinName} could reach ${bullTarget > 0 ? formatPrice(bullTarget) : "TBD"} — a ${((proj.bull - 1) * 100).toFixed(0)}% increase from current prices. This scenario assumes ${proj.bullLabel.toLowerCase()}.`,
    },
    {
      q: `What could cause ${coinName} to drop in ${year}?`,
      a: `Downside risks for ${coinName} in ${year} include: ${proj.bearLabel}. In a bear scenario, ${coinSymbol} could fall to ${bearTarget > 0 ? formatPrice(bearTarget) : "TBD"}, representing a ${((1 - proj.bear) * 100).toFixed(0)}% decline from current levels.`,
    },
    {
      q: `How high can ${coinName} go in ${year}?`,
      a: `Our bullish price target for ${coinName} in ${year} is ${bullTarget > 0 ? formatPrice(bullTarget) : "TBD"} based on ${proj.context.split(".")[0].toLowerCase()}. However, predictions carry uncertainty — past performance does not guarantee future results.`,
    },
  ];

  const otherYears = VALID_YEARS.filter(y => y !== year);
  const relatedCoins = TOP_CRYPTOS.filter(c => c.id !== crypto.id).slice(0, 6);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  };

  return (
    <Layout>
      <SEO title={title} description={description} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/price-prediction" className="hover:text-primary">Price Predictions</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/price-prediction/${coinId}`} className="hover:text-primary">{coinName}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{year} Forecast</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="text-primary border-primary/30">{year} Forecast</Badge>
            <Badge variant="outline">Long-Term Analysis</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
            {coinName} Price Prediction {year}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Comprehensive {coinSymbol} price forecast for {year} — bull, base, and bear scenarios based on market cycles, halving analysis, and institutional adoption trends.
          </p>
        </header>

        {/* Live Price Bar */}
        {currentPrice > 0 && (
          <div className="holo-card p-4 mb-6 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Current {coinSymbol} Price</p>
              <p className="text-2xl font-display font-bold">{formatPrice(currentPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">24h Change</p>
              <p className={`text-lg font-bold flex items-center gap-1 ${change24h >= 0 ? "text-success" : "text-danger"}`}>
                {change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
              </p>
            </div>
            {marketCap > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Market Cap</p>
                <p className="text-lg font-bold">{formatMarketCap(marketCap)}</p>
              </div>
            )}
          </div>
        )}

        {/* Price Targets Grid */}
        <section className="mb-8" aria-label={`${coinName} ${year} price scenarios`}>
          <h2 className="text-xl font-display font-bold mb-4">{coinName} {year} Price Targets</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Bear */}
            <div className="holo-card p-5 border-danger/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-danger" />
                <span className="font-bold text-danger">Bear Case</span>
              </div>
              <p className="text-2xl font-display font-bold mb-2">
                {bearTarget > 0 ? formatPrice(bearTarget) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {((proj.bear - 1) * 100).toFixed(0)}% from current
              </p>
              <p className="text-sm text-muted-foreground">{proj.bearLabel}</p>
            </div>
            {/* Base */}
            <div className="holo-card p-5 border-primary/30 ring-1 ring-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">Base Case</span>
                <Badge className="text-xs ml-auto">Most Likely</Badge>
              </div>
              <p className="text-2xl font-display font-bold mb-2">
                {baseTarget > 0 ? formatPrice(baseTarget) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                +{((proj.base - 1) * 100).toFixed(0)}% from current
              </p>
              <p className="text-sm text-muted-foreground">{proj.baseLabel}</p>
            </div>
            {/* Bull */}
            <div className="holo-card p-5 border-success/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="font-bold text-success">Bull Case</span>
              </div>
              <p className="text-2xl font-display font-bold mb-2">
                {bullTarget > 0 ? formatPrice(bullTarget) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                +{((proj.bull - 1) * 100).toFixed(0)}% from current
              </p>
              <p className="text-sm text-muted-foreground">{proj.bullLabel}</p>
            </div>
          </div>
        </section>

        {/* Market Context */}
        <section className="holo-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold">{year} Market Context</h2>
          </div>
          <p className="text-muted-foreground mb-6">{proj.context}</p>
          <h3 className="font-bold mb-3">Key Catalysts for {coinName} in {year}</h3>
          <ul className="space-y-2">
            {proj.keyEvents.map((event, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{event}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Year Comparison Table */}
        <section className="mb-8">
          <h2 className="text-xl font-display font-bold mb-4">{coinName} Long-Term Price Prediction Table</h2>
          <div className="holo-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-bold">Year</th>
                  <th className="text-right p-4 font-bold text-danger">Bear Case</th>
                  <th className="text-right p-4 font-bold text-primary">Base Case</th>
                  <th className="text-right p-4 font-bold text-success">Bull Case</th>
                </tr>
              </thead>
              <tbody>
                {VALID_YEARS.map((y) => {
                  const p = YEAR_PROJECTIONS[y];
                  const b = currentPrice > 0 ? currentPrice * p.bear : 0;
                  const m = currentPrice > 0 ? currentPrice * p.base : 0;
                  const u = currentPrice > 0 ? currentPrice * p.bull : 0;
                  return (
                    <tr key={y} className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${y === year ? "bg-primary/5" : ""}`}>
                      <td className="p-4">
                        <Link to={`/price-prediction/${coinId}/${y}`} className="font-bold text-primary hover:underline">
                          {coinName} {y}
                        </Link>
                        {y === year && <Badge className="ml-2 text-xs">Viewing</Badge>}
                      </td>
                      <td className="p-4 text-right text-danger font-mono">
                        {b > 0 ? formatPrice(b) : "—"}
                      </td>
                      <td className="p-4 text-right text-primary font-mono font-bold">
                        {m > 0 ? formatPrice(m) : "—"}
                      </td>
                      <td className="p-4 text-right text-success font-mono">
                        {u > 0 ? formatPrice(u) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-xl font-display font-bold mb-4">{coinName} {year} FAQ</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="holo-card p-5">
                <h3 className="font-bold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Short-term predictions crosslink */}
        <section className="holo-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold">Short-Term {coinName} Predictions</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["daily", "weekly", "monthly"].map(tf => (
              <Link key={tf} to={`/price-prediction/${coinId}/${tf}`}
                className="holo-card p-4 text-center hover:border-primary/50 transition-colors group">
                <p className="font-bold capitalize group-hover:text-primary transition-colors">{tf}</p>
                <p className="text-xs text-muted-foreground mt-1">{coinSymbol} forecast</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related coins */}
        <section className="mb-8">
          <h2 className="text-xl font-display font-bold mb-4">Other {year} Crypto Predictions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {relatedCoins.map(coin => (
              <Link key={coin.id} to={`/price-prediction/${coin.id}/${year}`}
                className="holo-card p-4 hover:border-primary/50 transition-colors group flex items-center justify-between">
                <div>
                  <p className="font-bold group-hover:text-primary transition-colors">{coin.symbol.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{coin.name} {year}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-warning">Risk Disclaimer:</strong> This {coinName} {year} price prediction is for informational and educational purposes only. Cryptocurrency markets are highly volatile and unpredictable. All price projections are speculative and based on algorithmic analysis of historical patterns — they do not constitute financial advice. Past performance does not guarantee future results. Never invest more than you can afford to lose. Please consult a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
