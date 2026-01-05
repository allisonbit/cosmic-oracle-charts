import { Helmet } from "react-helmet-async";

interface DashboardSchemaProps {
  marketCap?: string;
  fearGreedIndex?: number;
  lastUpdate?: string;
}

export function DashboardSchema({ marketCap, fearGreedIndex, lastUpdate }: DashboardSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Oracle Bull Dashboard",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "url": "https://oraclebull.com/dashboard",
    "description": "Real-time cryptocurrency market dashboard with AI-powered insights, fear & greed index, market momentum analysis, and live price tracking for top cryptocurrencies.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": "https://oraclebull.com"
    },
    "featureList": [
      "Real-time cryptocurrency price tracking",
      "Fear & Greed Index monitoring",
      "AI-powered market insights",
      "Market momentum analysis",
      "Volume leaders tracking",
      "Market dominance charts"
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://oraclebull.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Dashboard",
        "item": "https://oraclebull.com/dashboard"
      }
    ]
  };

  return (
    <Helmet>
      <title>Crypto Market Dashboard | Live Prices & AI Insights | Oracle Bull</title>
      <meta name="description" content="Real-time cryptocurrency dashboard with live prices, fear & greed index, AI market insights, and momentum analysis. Track BTC, ETH, and 100+ coins." />
      <meta name="keywords" content="crypto dashboard, bitcoin price, cryptocurrency market, fear greed index, crypto live prices, market analysis, btc eth prices" />
      <link rel="canonical" href="https://oraclebull.com/dashboard" />
      <meta property="og:title" content="Crypto Market Dashboard | Oracle Bull" />
      <meta property="og:description" content="Real-time cryptocurrency dashboard with live prices, AI insights, and market momentum analysis." />
      <meta property="og:url" content="https://oraclebull.com/dashboard" />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}

export function DashboardSEOContent() {
  return (
    <section className="holo-card p-6 mb-6">
      <h2 className="font-display text-lg font-bold mb-3">
        Real-Time Crypto Market Intelligence
      </h2>
      <div className="prose prose-invert max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Oracle Bull's AI-powered dashboard delivers institutional-grade market intelligence in real-time. 
          Track cryptocurrency prices, analyze market sentiment through our Fear & Greed Index, and 
          identify momentum shifts before they happen with our proprietary algorithms.
        </p>
        <p>
          Our dashboard synthesizes data from multiple sources including on-chain metrics, social sentiment, 
          and technical indicators to provide actionable insights for traders and investors. Updated 
          continuously 24/7 with sub-minute latency.
        </p>
      </div>
    </section>
  );
}
