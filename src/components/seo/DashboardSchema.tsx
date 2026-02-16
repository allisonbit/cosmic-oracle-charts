import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { TrendingUp, BarChart3, Activity, Brain, Target, Shield, Zap, ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";

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
    "url": `${SITE_URL}/dashboard`,
    "description": "Real-time cryptocurrency market dashboard with AI-powered insights, fear & greed index, market momentum analysis, and live price tracking for top cryptocurrencies.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": SITE_URL
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
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Dashboard", "item": `${SITE_URL}/dashboard` }
    ]
  };

  return (
    <Helmet>
      <title>Crypto Market Dashboard | Live Prices & AI Insights | Oracle Bull</title>
      <meta name="description" content="Real-time cryptocurrency dashboard with live prices, fear & greed index, AI market insights, and momentum analysis. Track BTC, ETH, and 100+ coins." />
      <meta name="keywords" content="crypto dashboard, bitcoin price, cryptocurrency market, fear greed index, crypto live prices, market analysis, btc eth prices" />
      <link rel="canonical" href={`${SITE_URL}/dashboard`} />
      <meta property="og:title" content="Crypto Market Dashboard | Oracle Bull" />
      <meta property="og:description" content="Real-time cryptocurrency dashboard with live prices, AI insights, and market momentum analysis." />
      <meta property="og:url" content={`${SITE_URL}/dashboard`} />
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
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Oracle Bull's Market Dashboard provides institutional-grade cryptocurrency analytics updated in real-time. 
          Track live prices for Bitcoin, Ethereum, and 100+ top cryptocurrencies with our AI-powered market intelligence.
        </p>
        <p>
          Monitor the Fear & Greed Index to understand market psychology, analyze momentum indicators to spot trends, 
          and identify volume leaders for potential opportunities. Our dashboard combines on-chain data, technical analysis, 
          and social sentiment into actionable insights.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/predictions" className="text-xs text-primary hover:underline">AI Predictions →</Link>
        <Link to="/sentiment" className="text-xs text-primary hover:underline">Sentiment Analysis →</Link>
        <Link to="/strength-meter" className="text-xs text-primary hover:underline">Strength Meter →</Link>
      </div>
    </section>
  );
}

// Exported explanation components
export { HowToReadDashboard, WhatMakesUsDifferent, RelatedMarketInsights, MarketCapExplanation, FearGreedExplanation, MomentumExplanation, VolumeExplanation, DominanceExplanation };

function HowToReadDashboard() {
  return (
    <section className="holo-card p-4 mb-4">
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> How to Read This Dashboard</h3>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li><span className="text-success">● Green indicators</span> = Bullish signals, upward momentum</li>
        <li><span className="text-danger">● Red indicators</span> = Bearish signals, downward pressure</li>
        <li><span className="text-warning">● Yellow/Orange</span> = Neutral or transitioning market conditions</li>
        <li><span className="text-primary">● AI Insights</span> = Machine learning-powered analysis updated every 5 minutes</li>
      </ul>
    </section>
  );
}

function WhatMakesUsDifferent() {
  return (
    <section className="holo-card p-4 mb-4">
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Why Oracle Bull?</h3>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-start gap-1"><Target className="w-3 h-3 text-success mt-0.5" /><span>AI-powered predictions</span></div>
        <div className="flex items-start gap-1"><Activity className="w-3 h-3 text-success mt-0.5" /><span>Real-time updates 24/7</span></div>
        <div className="flex items-start gap-1"><Shield className="w-3 h-3 text-success mt-0.5" /><span>No signup required</span></div>
        <div className="flex items-start gap-1"><BarChart3 className="w-3 h-3 text-success mt-0.5" /><span>Multi-chain analytics</span></div>
      </div>
    </section>
  );
}

function RelatedMarketInsights() {
  const links = [
    { to: "/price-prediction/bitcoin/daily", label: "Bitcoin Prediction Today" },
    { to: "/price-prediction/ethereum/daily", label: "Ethereum Prediction Today" },
    { to: "/market/best-crypto-to-buy-today", label: "Best Crypto to Buy Today" },
    { to: "/predictions", label: "All AI Predictions" },
  ];
  return (
    <section className="holo-card p-4">
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Related Market Insights</h3>
      <div className="grid grid-cols-2 gap-2">
        {links.map(link => (
          <Link key={link.to} to={link.to} className="text-xs text-primary hover:underline flex items-center gap-1">
            <ArrowRight className="w-3 h-3" /> {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function MarketCapExplanation() {
  return <p className="text-xs text-muted-foreground">Total Market Cap represents the combined value of all cryptocurrencies. A rising market cap typically indicates growing investor confidence.</p>;
}

function FearGreedExplanation() {
  return <p className="text-xs text-muted-foreground">The Fear & Greed Index measures market sentiment from 0 (Extreme Fear) to 100 (Extreme Greed). Values below 25 may indicate buying opportunities, while values above 75 suggest caution.</p>;
}

function MomentumExplanation() {
  return <p className="text-xs text-muted-foreground">Market Momentum shows whether buying or selling pressure dominates. Strong bullish momentum with rising volume often precedes continued upward movement.</p>;
}

function VolumeExplanation() {
  return <p className="text-xs text-muted-foreground">Volume Leaders show which cryptocurrencies have the highest trading activity. High volume confirms price movements and indicates strong market interest.</p>;
}

function DominanceExplanation() {
  return <p className="text-xs text-muted-foreground">Bitcoin Dominance measures BTC's share of total market cap. Rising dominance often signals risk-off sentiment, while falling dominance may indicate altcoin season.</p>;
}
