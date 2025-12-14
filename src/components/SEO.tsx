import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonicalPath?: string;
}

const defaultMeta = {
  siteName: "Oracle",
  title: "Oracle | AI-Powered Crypto Forecasts & Blockchain Analytics",
  description: "Free AI-powered crypto forecasting platform. Real-time price charts, market predictions, whale tracking, sentiment analysis, and blockchain analytics for Bitcoin, Ethereum, Solana, and 1000+ tokens.",
  keywords: "crypto forecast, bitcoin prediction, ethereum price, crypto analytics, blockchain data, whale tracking, crypto sentiment, AI trading signals, cryptocurrency market, DeFi analytics, token scanner, real-time crypto prices",
  image: "https://storage.googleapis.com/gpt-engineer-file-uploads/uDg0k7BDXGRxsHZqK6gSbdN9o0l1/social-images/social-1765566965381-WhatsApp Image 2025-12-12 at 10.50.30_d13b6f53.jpg",
  twitterHandle: "@oracle_bulls",
  baseUrl: "https://oraclebull.com"
};

const pageSEO: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: "Oracle | AI-Powered Crypto Forecasts & Real-Time Blockchain Analytics",
    description: "Your cosmic guide to crypto markets. Free AI predictions, real-time price charts, whale tracking, and sentiment analysis for Bitcoin, Ethereum, Solana & 1000+ tokens. No signup required.",
    keywords: "crypto forecast, AI crypto predictions, bitcoin price prediction, ethereum forecast, real-time crypto, blockchain analytics, free crypto tools"
  },
  "/dashboard": {
    title: "Crypto Dashboard | Real-Time Market Data & AI Insights | Oracle",
    description: "Live cryptocurrency dashboard with real-time prices, market momentum, top performers, volume leaders, and AI-powered market insights. Track Bitcoin, Ethereum, and altcoins in one view.",
    keywords: "crypto dashboard, live crypto prices, market momentum, crypto gainers, volume leaders, AI market analysis, cryptocurrency tracker"
  },
  "/portfolio": {
    title: "Wallet Scanner | AI-Powered Portfolio Analysis | Oracle",
    description: "Scan any EVM or Solana wallet address for AI-powered portfolio analysis. Discover holdings, pump potential, risk levels, and trading opportunities. Free wallet research tool.",
    keywords: "wallet scanner, crypto portfolio analyzer, wallet tracker, token holdings, pump potential, crypto risk analysis, Solana wallet, EVM wallet"
  },
  "/sentiment": {
    title: "Crypto Sentiment Analysis | Social & Whale Tracking | Oracle",
    description: "Real-time crypto sentiment from Twitter, Reddit, and Telegram. Track whale transactions, fear & greed index, trending topics, and social signals for smarter trading decisions.",
    keywords: "crypto sentiment, fear greed index, whale alerts, social sentiment, crypto Twitter, Reddit crypto, telegram signals, market sentiment"
  },
  "/explorer": {
    title: "Token Explorer | Search Any Cryptocurrency | Oracle",
    description: "Search and analyze any cryptocurrency by name, symbol, or contract address. Get detailed token data, price charts, holder analysis, liquidity metrics, and DeFi usage across all major blockchains.",
    keywords: "token explorer, crypto search, token analytics, contract address lookup, token holder analysis, liquidity analysis, DeFi tokens"
  },
  "/learn": {
    title: "Learn Crypto | Free Blockchain Education | Oracle",
    description: "Free cryptocurrency education with daily tips, beginner guides, and advanced trading concepts. Learn about Bitcoin, DeFi, NFTs, technical analysis, and blockchain technology.",
    keywords: "learn crypto, crypto education, blockchain course, bitcoin guide, DeFi tutorial, crypto for beginners, trading education"
  },
  "/contact": {
    title: "Contact Oracle | Community & Token Information",
    description: "Connect with the Oracle community on Twitter and Telegram. View Oracle token ($ORACLE) information including price, market cap, and contract address on Ethereum.",
    keywords: "Oracle token, Oracle crypto, contact Oracle, Oracle community, Oracle Telegram, Oracle Twitter"
  }
};

export function SEO({ title, description, keywords, image, type = "website", canonicalPath }: SEOProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get page-specific or default SEO
  const pageMeta = pageSEO[currentPath] || (currentPath.includes("/chain/") ? {
    title: `${currentPath.split("/chain/")[1]?.charAt(0).toUpperCase()}${currentPath.split("/chain/")[1]?.slice(1) || "Blockchain"} Analytics | Real-Time Chain Data | Oracle`,
    description: `Comprehensive ${currentPath.split("/chain/")[1] || "blockchain"} analytics with real-time metrics, AI price predictions, whale tracking, token discovery, and DeFi data. Advanced chain health monitoring and risk analysis.`,
    keywords: `${currentPath.split("/chain/")[1]} analytics, ${currentPath.split("/chain/")[1]} price, ${currentPath.split("/chain/")[1]} tokens, ${currentPath.split("/chain/")[1]} DeFi, blockchain data, chain metrics`
  } : {
    title: defaultMeta.title,
    description: defaultMeta.description,
    keywords: defaultMeta.keywords
  });

  const finalTitle = title || pageMeta.title;
  const finalDescription = description || pageMeta.description;
  const finalKeywords = keywords || pageMeta.keywords;
  const finalImage = image || defaultMeta.image;
  const canonicalUrl = `${defaultMeta.baseUrl}${canonicalPath || currentPath}`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    setMeta("description", finalDescription);
    setMeta("keywords", finalKeywords);
    setMeta("author", "Oracle");
    setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // Open Graph
    setMeta("og:title", finalTitle, true);
    setMeta("og:description", finalDescription, true);
    setMeta("og:image", finalImage, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", defaultMeta.siteName, true);
    setMeta("og:locale", "en_US", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", defaultMeta.twitterHandle);
    setMeta("twitter:creator", defaultMeta.twitterHandle);
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDescription);
    setMeta("twitter:image", finalImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

  }, [finalTitle, finalDescription, finalKeywords, finalImage, canonicalUrl, type]);

  return null;
}

// JSON-LD Structured Data Component
export function StructuredData() {
  const location = useLocation();
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Oracle",
    "url": defaultMeta.baseUrl,
    "logo": defaultMeta.image,
    "sameAs": [
      "https://x.com/oracle_bulls",
      "https://t.me/oracle_bulls"
    ],
    "description": defaultMeta.description
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Oracle",
    "url": defaultMeta.baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${defaultMeta.baseUrl}/explorer?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Oracle Crypto Analytics",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free AI-powered cryptocurrency forecasting and blockchain analytics platform"
  };

  useEffect(() => {
    // Remove existing structured data
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Add organization schema
    const orgScript = document.createElement("script");
    orgScript.type = "application/ld+json";
    orgScript.text = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add website schema
    const webScript = document.createElement("script");
    webScript.type = "application/ld+json";
    webScript.text = JSON.stringify(websiteSchema);
    document.head.appendChild(webScript);

    // Add software schema
    const softScript = document.createElement("script");
    softScript.type = "application/ld+json";
    softScript.text = JSON.stringify(softwareSchema);
    document.head.appendChild(softScript);

    return () => {
      document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
    };
  }, [location.pathname]);

  return null;
}
