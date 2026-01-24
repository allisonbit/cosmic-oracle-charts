import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

interface ExplorerSchemaProps {
  chainCount?: number;
}

export function ExplorerSchema({ chainCount = 30 }: ExplorerSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Oracle Bull Token Explorer",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "url": `${SITE_URL}/explorer`,
    "description": `Universal cryptocurrency token explorer supporting ${chainCount}+ blockchains. Search any token by contract address, name, or symbol with AI-powered analysis.`,
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
      "Multi-chain token search",
      "Contract address lookup",
      "Token price tracking",
      "AI-powered token analysis",
      "Trending token discovery",
      "Real-time market data"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How many blockchains does Oracle Bull Explorer support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Oracle Bull's Universal Token Explorer supports ${chainCount}+ blockchains including Ethereum, Solana, Arbitrum, Base, Polygon, and many more. Search any token across all major chains.`
        }
      },
      {
        "@type": "Question",
        "name": "Can I search tokens by contract address?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can search for any token by entering its contract address. Our explorer automatically detects the blockchain and provides comprehensive token data including price, liquidity, and market information."
        }
      },
      {
        "@type": "Question",
        "name": "What token data does the Explorer provide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Token Explorer provides real-time price data, 24h price change, market cap, trading volume, liquidity information, token holders, and AI-powered price predictions for each token."
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>Universal Token Explorer | Multi-Chain Search | Oracle Bull</title>
      <meta name="description" content={`Search any cryptocurrency token across ${chainCount}+ blockchains. Find tokens by contract address, name, or symbol with real-time price data and AI analysis.`} />
      <meta name="keywords" content="token explorer, contract address lookup, token search, multi-chain explorer, defi token finder, crypto token info" />
      <link rel="canonical" href={`${SITE_URL}/explorer`} />
      <meta property="og:title" content="Universal Token Explorer | Oracle Bull" />
      <meta property="og:description" content={`Search any token across ${chainCount}+ blockchains with AI-powered analysis.`} />
      <meta property="og:url" content={`${SITE_URL}/explorer`} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}

export function ExplorerSEOContent() {
  return (
    <section className="holo-card p-6 mt-8">
      <h2 className="font-display text-lg font-bold mb-3">
        Universal Multi-Chain Token Discovery
      </h2>
      <div className="prose prose-invert max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Oracle Bull's Token Explorer provides DexScreener-like functionality with AI enhancements. 
          Search any token across 30+ blockchains using contract addresses, token names, or symbols. 
          Our system automatically detects the correct chain and provides comprehensive market data.
        </p>
        <p>
          Each token search returns real-time price data, liquidity information, holder counts, and 
          AI-powered predictions to help you evaluate opportunities. Perfect for researching new tokens, 
          tracking existing holdings, or discovering trending opportunities across the DeFi ecosystem.
        </p>
      </div>
    </section>
  );
}
