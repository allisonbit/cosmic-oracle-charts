import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

/** Static meta tags only — the page itself renders honest "unavailable"
 * states when the live index is unreachable, so no props are needed. */
export function SentimentSchema() {
  return (
    <Helmet>
      <title>Crypto Sentiment Analysis | Fear & Greed Index | Oracle Bull</title>
      <meta name="description" content="Track crypto market sentiment with the live Fear & Greed Index, market breadth, volatility and momentum analytics — computed from real market data." />
    </Helmet>
  );
}

export function SentimentSEOContent() {
  return (
    <section className="holo-card p-6 mb-6">
      <h2 className="font-display text-lg font-bold mb-3">
        Live Sentiment Intelligence
      </h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Our Sentiment Scanner reads the real market — the live Fear & Greed Index, breadth of the
          top coins' 24-hour moves, realized volatility, volume turnover, and each token's position
          inside its 24-hour range — to give you a complete picture of market psychology from data
          you can verify.
        </p>
        <p>
          The Fear &amp; Greed Index quantifies market emotion on a scale of 0–100 from volatility,
          volume, dominance and trend data. Combined with our multi-dimensional dashboard, you get
          sentiment grounded in evidence rather than speculation.
        </p>
      </div>
    </section>
  );
}
