import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

export function PortfolioSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Oracle Bull Wallet Scanner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "url": `${SITE_URL}/portfolio`,
    "description": "AI-powered cryptocurrency wallet scanner and portfolio analyzer. Analyze any wallet address to find high-potential tokens, assess risk, and get actionable investment insights.",
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
      "Multi-chain wallet scanning",
      "AI portfolio analysis",
      "Risk score assessment",
      "Token pump potential detection",
      "Diversification scoring",
      "Actionable investment insights"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which blockchains does the Wallet Scanner support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oracle Bull's Wallet Scanner supports Ethereum, Polygon, Arbitrum, Base, and Solana wallets. Simply enter your wallet address and our AI will analyze your holdings across all supported chains."
        }
      },
      {
        "@type": "Question",
        "name": "What does the AI portfolio analysis include?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI analysis includes total portfolio value, risk score, diversification assessment, pump potential ratings for each token, and personalized recommendations like hold, accumulate, take profit, or exit signals."
        }
      },
      {
        "@type": "Question",
        "name": "Is my wallet data private?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we only analyze publicly available on-chain data. We don't store your wallet address or require any account signup. All analysis is performed in real-time without data retention."
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>Wallet Scanner | AI Portfolio Analysis | Oracle Bull</title>
      <meta name="description" content="AI-powered crypto wallet scanner. Analyze any wallet to find pumping tokens, assess portfolio risk, and get actionable investment insights. Free, no login required." />
      <meta name="keywords" content="wallet scanner, crypto portfolio analyzer, wallet analysis, token scanner, defi portfolio, crypto holdings tracker" />
      <link rel="canonical" href={`${SITE_URL}/portfolio`} />
      <meta property="og:title" content="AI Wallet Scanner | Oracle Bull" />
      <meta property="og:description" content="Analyze any crypto wallet with AI. Get risk scores, pump potential, and investment insights." />
      <meta property="og:url" content={`${SITE_URL}/portfolio`} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}

export function PortfolioSEOContent() {
  return (
    <section className="holo-card p-6 mb-6">
      <h2 className="font-display text-lg font-bold mb-3">
        AI-Powered Wallet Intelligence
      </h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Enter any Ethereum, Polygon, Arbitrum, Base, or Solana wallet address to get instant AI analysis. 
          Our scanner evaluates every token in the wallet, calculating risk scores, pump potential, 
          and providing clear buy/hold/sell recommendations.
        </p>
        <p>
          Unlike basic portfolio trackers, Oracle Bull's Wallet Scanner uses machine learning to identify 
          high-potential tokens and warn about risky positions. Get diversification insights and 
          actionable recommendations without connecting your wallet or creating an account.
        </p>
      </div>
    </section>
  );
}
