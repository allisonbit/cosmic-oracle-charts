import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

// Strength Meter Schema
export function StrengthMeterSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Crypto Strength Meter",
    "applicationCategory": "FinanceApplication",
    "url": `${SITE_URL}/strength-meter`,
    "description": "Real-time cryptocurrency strength analysis tool. Compare relative strength of crypto assets and blockchains using our composite weighted model.",
    "provider": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": SITE_URL
    },
    "featureList": [
      "Real-time strength scoring",
      "Asset vs chain comparison",
      "Multiple timeframe analysis",
      "Momentum indicators",
      "Trend consistency tracking"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How is the crypto strength score calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The strength score uses a composite weighted model including price momentum (25%), relative performance vs BTC/ETH (20%), volume flow (15%), sentiment (10%), volatility (10%), dominance changes (10%), and trend consistency (10%)."
        }
      },
      {
        "@type": "Question",
        "name": "What timeframes are available for strength analysis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Strength Meter supports 1-hour, 4-hour, 24-hour, and 7-day timeframes for comprehensive short-term and medium-term strength analysis."
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>Crypto Strength Meter | Relative Strength Analysis | Oracle Bull</title>
      <meta name="description" content="Compare crypto strength in real-time. Analyze relative performance of cryptocurrencies and blockchains with our AI-powered strength scoring system." />
      <meta name="keywords" content="crypto strength, relative strength, momentum analysis, crypto comparison, strength indicator, market momentum" />
      <link rel="canonical" href={`${SITE_URL}/strength-meter`} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}

// Crypto Factory Schema
export function CryptoFactorySchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Crypto Factory",
    "applicationCategory": "FinanceApplication",
    "url": `${SITE_URL}/factory`,
    "description": "Centralized crypto intelligence hub tracking market events, on-chain activity, narratives, and news. Your command center for market-moving information.",
    "provider": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": SITE_URL
    },
    "featureList": [
      "Market events calendar",
      "On-chain activity tracking",
      "Narrative momentum analysis",
      "Curated crypto news",
      "Multi-chain filtering",
      "Impact assessment"
    ]
  };

  return (
    <Helmet>
      <title>Crypto Factory | Market Events & News Hub | Oracle Bull</title>
      <meta name="description" content="Your centralized crypto intelligence hub. Track market events, on-chain activity, emerging narratives, and curated news all in one place." />
      <meta name="keywords" content="crypto events, blockchain calendar, crypto news, market events, on-chain data, crypto narratives" />
      <link rel="canonical" href={`${SITE_URL}/factory`} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Contact/Token Page Schema
export function TokenSchema({ symbol, name, price }: { symbol: string; name: string; price: number }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": `${name} (${symbol})`,
    "description": `${name} (${symbol}) cryptocurrency token with real-time price data, charts, and market information.`,
    "url": `${SITE_URL}/contact`,
    "provider": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": SITE_URL
    }
  };

  return (
    <Helmet>
      <title>{symbol} Token | Price & Market Data | Oracle Bull</title>
      <meta name="description" content={`${name} (${symbol}) live price, market data, and community information. Track ${symbol} performance and join the community.`} />
      <link rel="canonical" href={`${SITE_URL}/contact`} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
