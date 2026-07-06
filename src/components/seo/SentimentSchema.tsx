import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

interface SentimentSchemaProps {
  fearGreedIndex?: number;
  marketMomentum?: string;
}

export function SentimentSchema({ fearGreedIndex = 50, marketMomentum = 'NEUTRAL' }: SentimentSchemaProps) {
  return (
    <Helmet>
      <title>Crypto Sentiment Analysis | Fear & Greed Index | Oracle Bull</title>
      <meta name="description" content="Track crypto market sentiment with our Fear & Greed Index, whale alerts, social sentiment analysis, and AI-powered market signals. Real-time updates." />
    </Helmet>
  );
}

export function SentimentSEOContent() {
  return (
    <section className="holo-card p-6 mb-6">
      <h2 className="font-display text-lg font-bold mb-3">
        AI-Powered Sentiment Intelligence
      </h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
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
