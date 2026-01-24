import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

interface SentimentSchemaProps {
  fearGreedIndex?: number;
  marketMomentum?: string;
}

export function SentimentSchema({ fearGreedIndex = 50, marketMomentum = 'NEUTRAL' }: SentimentSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Oracle Bull Sentiment Scanner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "url": `${SITE_URL}/sentiment`,
    "description": "Advanced cryptocurrency sentiment analysis with fear & greed index, whale tracking, social sentiment monitoring, and AI-powered market signals.",
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
      "Fear & Greed Index tracking",
      "Whale activity monitoring",
      "Social sentiment analysis",
      "Google Trends integration",
      "GitHub activity tracking",
      "Live market signals"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the current crypto Fear & Greed Index?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The current Fear & Greed Index is ${fearGreedIndex}, indicating ${fearGreedIndex >= 60 ? 'greed' : fearGreedIndex >= 40 ? 'neutral' : 'fear'} in the crypto market. This index combines multiple sentiment indicators to gauge overall market psychology.`
        }
      },
      {
        "@type": "Question",
        "name": "How does Oracle Bull track crypto market sentiment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oracle Bull analyzes multiple data sources including social media sentiment, whale wallet activity, Google Trends, GitHub development activity, and on-chain metrics to provide comprehensive market sentiment analysis."
        }
      },
      {
        "@type": "Question",
        "name": "What are whale alerts in crypto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Whale alerts track large cryptocurrency transactions that may indicate significant market moves. Our whale tracker monitors accumulation and distribution patterns to help identify potential price movements."
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>Crypto Sentiment Analysis | Fear & Greed Index | Oracle Bull</title>
      <meta name="description" content="Track crypto market sentiment with our Fear & Greed Index, whale alerts, social sentiment analysis, and AI-powered market signals. Real-time updates." />
      <meta name="keywords" content="crypto sentiment, fear greed index, whale alerts, crypto social sentiment, market sentiment analysis, bitcoin sentiment" />
      <link rel="canonical" href={`${SITE_URL}/sentiment`} />
      <meta property="og:title" content="Crypto Sentiment Analysis | Oracle Bull" />
      <meta property="og:description" content="Advanced sentiment analysis with fear & greed index, whale tracking, and AI signals." />
      <meta property="og:url" content={`${SITE_URL}/sentiment`} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}

export function SentimentSEOContent() {
  return (
    <section className="holo-card p-6 mb-6">
      <h2 className="font-display text-lg font-bold mb-3">
        AI-Powered Sentiment Intelligence
      </h2>
      <div className="prose prose-invert max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Our Sentiment Scanner aggregates real-time data from across the crypto ecosystem to give you 
          a complete picture of market psychology. Monitor whale movements, track social buzz, and 
          understand what's driving price action before it happens.
        </p>
        <p>
          The Fear & Greed Index combines multiple on-chain and off-chain indicators to quantify 
          market emotion on a scale of 0-100. Combined with our whale tracking and social sentiment 
          analysis, you'll have the edge you need to make informed decisions.
        </p>
      </div>
    </section>
  );
}
