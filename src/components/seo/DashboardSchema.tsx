import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { TrendingUp, BarChart3, Activity, Brain, Target, Shield, Zap, ArrowRight } from "lucide-react";

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

// Main SEO content block with server-rendered text
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
      
      {/* Internal links for SEO crawlability */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/sentiment" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Brain className="w-4 h-4" />
          <span>Sentiment Analysis</span>
        </Link>
        <Link to="/explorer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Activity className="w-4 h-4" />
          <span>Token Explorer</span>
        </Link>
        <Link to="/strength-meter" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Zap className="w-4 h-4" />
          <span>Strength Meter</span>
        </Link>
        <Link to="/predictions" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Target className="w-4 h-4" />
          <span>Price Predictions</span>
        </Link>
      </div>
    </section>
  );
}

// Section explanation components for each dashboard module
export function MarketCapExplanation() {
  return (
    <div className="text-xs text-muted-foreground mt-2">
      <p>Total Market Capitalization represents the combined value of all cryptocurrencies. Changes in market cap indicate overall market health and investor sentiment.</p>
    </div>
  );
}

export function FearGreedExplanation() {
  return (
    <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted/10 rounded-lg">
      <h4 className="font-medium text-foreground mb-1">Understanding the Fear & Greed Index</h4>
      <p>The Fear & Greed Index measures market sentiment on a scale of 0-100. Extreme fear (0-25) often signals buying opportunities, while extreme greed (75-100) may indicate market tops. We analyze social media, volatility, volume, and Bitcoin dominance to calculate this score.</p>
      <Link to="/sentiment" className="flex items-center gap-1 text-primary mt-2 hover:underline">
        View detailed sentiment analysis <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

export function MomentumExplanation() {
  return (
    <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted/10 rounded-lg">
      <h4 className="font-medium text-foreground mb-1">Market Momentum Indicator</h4>
      <p>Market momentum shows the directional strength of price movements. Bullish momentum indicates more buying pressure, while bearish momentum signals selling pressure. This helps identify trend reversals and continuation patterns.</p>
    </div>
  );
}

export function VolumeExplanation() {
  return (
    <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted/10 rounded-lg">
      <h4 className="font-medium text-foreground mb-1">24-Hour Trading Volume</h4>
      <p>Volume leaders show cryptocurrencies with the highest trading activity in the last 24 hours. High volume confirms price movements and indicates strong market interest.</p>
    </div>
  );
}

export function DominanceExplanation() {
  return (
    <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted/10 rounded-lg">
      <h4 className="font-medium text-foreground mb-1">Market Dominance Chart</h4>
      <p>Market dominance shows the percentage of total market cap held by each cryptocurrency. Bitcoin dominance above 50% typically indicates a risk-off environment, while decreasing BTC dominance often signals an altseason.</p>
    </div>
  );
}

// How to read the dashboard section
export function HowToReadDashboard() {
  return (
    <section className="holo-card p-6 mb-6">
      <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        How to Read This Dashboard
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Green Indicators
          </h3>
          <p className="text-muted-foreground">Green numbers and indicators show positive price movements, bullish sentiment, or favorable market conditions. These suggest potential buying opportunities.</p>
        </div>
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-danger" />
            Red Indicators
          </h3>
          <p className="text-muted-foreground">Red numbers indicate negative price movements, bearish sentiment, or cautionary signals. Consider risk management strategies when seeing red indicators.</p>
        </div>
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-warning" />
            Yellow/Neutral
          </h3>
          <p className="text-muted-foreground">Yellow or neutral indicators show consolidation or uncertainty. These periods often precede significant price movements in either direction.</p>
        </div>
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            AI Insights
          </h3>
          <p className="text-muted-foreground">AI-generated insights combine multiple data sources to provide actionable recommendations. Click any coin card for detailed analysis.</p>
        </div>
      </div>
    </section>
  );
}

// What makes Oracle Bull different section
export function WhatMakesUsDifferent() {
  return (
    <section className="holo-card p-6 mb-6">
      <h2 className="font-display text-lg font-bold mb-4">What Makes Oracle Bull Different</h2>
      <div className="prose prose-invert max-w-none text-sm text-muted-foreground">
        <ul className="space-y-2">
          <li><strong className="text-foreground">Real-Time Data:</strong> Sub-minute updates from multiple exchanges and on-chain sources ensure you never miss a market move.</li>
          <li><strong className="text-foreground">AI-Powered Analysis:</strong> Our machine learning models analyze 50+ indicators to generate actionable insights, not just raw data.</li>
          <li><strong className="text-foreground">Multi-Chain Coverage:</strong> Track assets across Ethereum, Solana, Bitcoin, Arbitrum, Base, and 25+ blockchains in one dashboard.</li>
          <li><strong className="text-foreground">Institutional Grade:</strong> The same data and tools used by professional traders, made accessible for everyone.</li>
        </ul>
      </div>
    </section>
  );
}

// Related market insights section with internal links
export function RelatedMarketInsights() {
  return (
    <section className="holo-card p-6">
      <h2 className="font-display text-lg font-bold mb-4">Related Market Insights</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/price-prediction/bitcoin/daily" className="p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors group">
          <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">Bitcoin Price Prediction Today</h3>
          <p className="text-xs text-muted-foreground">Get our AI forecast for Bitcoin's price movement in the next 24 hours.</p>
        </Link>
        <Link to="/price-prediction/ethereum/weekly" className="p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors group">
          <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">Ethereum Weekly Forecast</h3>
          <p className="text-xs text-muted-foreground">See our swing trading predictions for Ethereum this week.</p>
        </Link>
        <Link to="/chain/solana" className="p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors group">
          <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">Solana Network Analysis</h3>
          <p className="text-xs text-muted-foreground">Deep dive into Solana's on-chain metrics and ecosystem health.</p>
        </Link>
        <Link to="/market/best-crypto-to-buy-today" className="p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors group">
          <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">Best Crypto to Buy Today</h3>
          <p className="text-xs text-muted-foreground">Our AI-curated list of top investment opportunities right now.</p>
        </Link>
        <Link to="/insights" className="p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors group">
          <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">Latest Market Insights</h3>
          <p className="text-xs text-muted-foreground">Read our daily AI-generated market analysis articles.</p>
        </Link>
        <Link to="/factory" className="p-4 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors group">
          <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">Crypto Events Calendar</h3>
          <p className="text-xs text-muted-foreground">Track upcoming token unlocks, upgrades, and market-moving events.</p>
        </Link>
      </div>
    </section>
  );
}
