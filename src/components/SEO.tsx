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
  siteName: "Oracle Bull",
  title: "Oracle Bull | AI-Powered Crypto Forecasts & Blockchain Analytics",
  description: "Free AI-powered crypto forecasting platform. Real-time price charts, market predictions, whale tracking, sentiment analysis, and blockchain analytics for Bitcoin, Ethereum, Solana, and 1000+ tokens.",
  keywords: "crypto forecast, bitcoin prediction, ethereum price, crypto analytics, blockchain data, whale tracking, crypto sentiment, AI trading signals, cryptocurrency market, DeFi analytics, token scanner, real-time crypto prices",
  image: "https://storage.googleapis.com/gpt-engineer-file-uploads/uDg0k7BDXGRxsHZqK6gSbdN9o0l1/social-images/social-1765566965381-WhatsApp Image 2025-12-12 at 10.50.30_d13b6f53.jpg",
  twitterHandle: "@oracle_bulls",
  baseUrl: "https://oraclebull.com"
};

const pageSEO: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: "Oracle Bull | AI-Powered Crypto Forecasts & Real-Time Blockchain Analytics",
    description: "Your cosmic guide to crypto markets. Free AI predictions, real-time price charts, whale tracking, and sentiment analysis for Bitcoin, Ethereum, Solana & 1000+ tokens. No signup required.",
    keywords: "crypto forecast, AI crypto predictions, bitcoin price prediction, ethereum forecast, real-time crypto, blockchain analytics, free crypto tools"
  },
  "/dashboard": {
    title: "Crypto Dashboard | Real-Time Market Data & AI Insights | Oracle Bull",
    description: "Live cryptocurrency dashboard with real-time prices, market momentum, top performers, volume leaders, and AI-powered market insights. Track Bitcoin, Ethereum, and altcoins in one view.",
    keywords: "crypto dashboard, live crypto prices, market momentum, crypto gainers, volume leaders, AI market analysis, cryptocurrency tracker"
  },
  "/strength-meter": {
    title: "Crypto Strength Meter | Real-Time Asset & Chain Strength Rankings | Oracle Bull",
    description: "Measure and rank cryptocurrency strength in real-time. Compare Bitcoin, Ethereum, Solana, and 100+ assets using weighted momentum, volume, sentiment, and trend analysis. Live auto-refresh.",
    keywords: "crypto strength meter, currency strength, bitcoin strength, ethereum momentum, crypto ranking, asset strength, chain comparison, market momentum"
  },
  "/crypto-factory": {
    title: "Crypto Factory | Market Events Calendar & On-Chain Intelligence | Oracle Bull",
    description: "Your centralized crypto intelligence hub. Track token launches, protocol upgrades, whale movements, trending narratives, and market-moving events. Like Forex Factory for cryptocurrency.",
    keywords: "crypto factory, crypto calendar, token launches, protocol upgrades, whale alerts, crypto events, market news, DeFi updates, narrative tracking"
  },
  "/portfolio": {
    title: "Wallet Scanner | AI-Powered Portfolio Analysis | Oracle Bull",
    description: "Scan any EVM or Solana wallet address for AI-powered portfolio analysis. Discover holdings, pump potential, risk levels, and trading opportunities. Free wallet research tool.",
    keywords: "wallet scanner, crypto portfolio analyzer, wallet tracker, token holdings, pump potential, crypto risk analysis, Solana wallet, EVM wallet"
  },
  "/sentiment": {
    title: "Crypto Sentiment Analysis | Social & Whale Tracking | Oracle Bull",
    description: "Real-time crypto sentiment from Twitter, Reddit, and Telegram. Track whale transactions, fear & greed index, trending topics, and social signals for smarter trading decisions.",
    keywords: "crypto sentiment, fear greed index, whale alerts, social sentiment, crypto Twitter, Reddit crypto, telegram signals, market sentiment"
  },
  "/explorer": {
    title: "Token Explorer | Search Any Cryptocurrency | Oracle Bull",
    description: "Search and analyze any cryptocurrency by name, symbol, or contract address. Get detailed token data, price charts, holder analysis, liquidity metrics, and DeFi usage across all major blockchains.",
    keywords: "token explorer, crypto search, token analytics, contract address lookup, token holder analysis, liquidity analysis, DeFi tokens"
  },
  "/learn": {
    title: "Learn Crypto | Free Blockchain Education & Daily Insights | Oracle Bull",
    description: "Free cryptocurrency education with daily AI-generated articles, market insights, and blockchain analysis. Learn about Bitcoin, DeFi, NFTs, technical analysis, and crypto trading strategies.",
    keywords: "learn crypto, crypto education, blockchain course, bitcoin guide, DeFi tutorial, crypto for beginners, trading education, crypto blog"
  },
  "/contact": {
    title: "Contact Oracle Bull | Community & Token Information",
    description: "Connect with the Oracle Bull community on Twitter and Telegram. View Oracle token ($ORACLE) information including price, market cap, and contract address on Ethereum.",
    keywords: "Oracle token, Oracle crypto, contact Oracle, Oracle community, Oracle Telegram, Oracle Twitter"
  }
};

export function SEO({ title, description, keywords, image, type = "website", canonicalPath }: SEOProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get page-specific or default SEO
  const pageMeta = pageSEO[currentPath] || (currentPath.includes("/chain/") ? {
    title: `${currentPath.split("/chain/")[1]?.charAt(0).toUpperCase()}${currentPath.split("/chain/")[1]?.slice(1) || "Blockchain"} Analytics | Real-Time Chain Data | Oracle Bull`,
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
    document.title = finalTitle;

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

    setMeta("description", finalDescription);
    setMeta("keywords", finalKeywords);
    setMeta("author", "Oracle Bull");
    setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    setMeta("og:title", finalTitle, true);
    setMeta("og:description", finalDescription, true);
    setMeta("og:image", finalImage, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", defaultMeta.siteName, true);
    setMeta("og:locale", "en_US", true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", defaultMeta.twitterHandle);
    setMeta("twitter:creator", defaultMeta.twitterHandle);
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDescription);
    setMeta("twitter:image", finalImage);

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

// Enhanced JSON-LD Structured Data Component
export function StructuredData() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  useEffect(() => {
    // Remove existing structured data
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    const schemas: object[] = [];

    // Organization Schema (always present)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": defaultMeta.baseUrl,
      "logo": defaultMeta.image,
      "sameAs": [
        "https://x.com/oracle_bulls",
        "https://t.me/oracle_bulls"
      ],
      "description": defaultMeta.description,
      "foundingDate": "2024",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://t.me/oracle_bulls"
      }
    });

    // WebSite Schema with SearchAction
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Oracle Bull",
      "url": defaultMeta.baseUrl,
      "description": defaultMeta.description,
      "publisher": {
        "@type": "Organization",
        "name": "Oracle Bull"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${defaultMeta.baseUrl}/explorer?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    });

    // SoftwareApplication Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Oracle Bull Crypto Analytics",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free AI-powered cryptocurrency forecasting and blockchain analytics platform",
      "featureList": [
        "Real-time crypto prices",
        "AI price predictions",
        "Whale tracking",
        "Sentiment analysis",
        "Multi-chain analytics",
        "Token explorer",
        "Wallet scanner"
      ],
      "screenshot": defaultMeta.image,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250"
      }
    });

    // Page-specific WebPage schema
    const pageInfo = pageSEO[currentPath];
    if (pageInfo) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pageInfo.title,
        "description": pageInfo.description,
        "url": `${defaultMeta.baseUrl}${currentPath}`,
        "isPartOf": {
          "@type": "WebSite",
          "name": "Oracle Bull",
          "url": defaultMeta.baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "Oracle Bull"
        }
      });
    }

    // Chain-specific FinancialProduct schema
    if (currentPath.includes("/chain/")) {
      const chainName = currentPath.split("/chain/")[1];
      const chainDisplayName = chainName ? chainName.charAt(0).toUpperCase() + chainName.slice(1) : "Blockchain";
      
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": `${chainDisplayName} Analytics`,
        "description": `Real-time ${chainDisplayName} blockchain analytics including price data, whale tracking, token discovery, and DeFi metrics.`,
        "url": `${defaultMeta.baseUrl}${currentPath}`,
        "provider": {
          "@type": "Organization",
          "name": "Oracle Bull"
        },
        "featureList": [
          "Real-time price charts",
          "AI predictions",
          "Whale activity radar",
          "Token heat scanner",
          "Risk analyzer",
          "DeFi metrics"
        ]
      });
    }

    // Learn page - Blog/Article schema
    if (currentPath === "/learn") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Oracle Bull Crypto Education",
        "description": "Daily AI-generated cryptocurrency articles, market insights, and blockchain education.",
        "url": `${defaultMeta.baseUrl}/learn`,
        "publisher": {
          "@type": "Organization",
          "name": "Oracle Bull"
        },
        "blogPost": {
          "@type": "BlogPosting",
          "headline": "Daily Crypto Market Insights",
          "description": "Fresh cryptocurrency analysis and education updated daily"
        }
      });
    }

    // Dashboard - Service schema
    if (currentPath === "/dashboard") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Oracle Bull Dashboard",
        "description": "Live cryptocurrency dashboard with real-time prices, market momentum, and AI insights.",
        "url": `${defaultMeta.baseUrl}/dashboard`,
        "provider": {
          "@type": "Organization",
          "name": "Oracle Bull"
        },
        "serviceType": "Financial Analytics",
        "areaServed": "Worldwide"
      });
    }

    // Explorer - SearchAction enhanced
    if (currentPath === "/explorer") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Oracle Bull Token Explorer",
        "description": "Search and analyze any cryptocurrency by name, symbol, or contract address.",
        "url": `${defaultMeta.baseUrl}/explorer`,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      });
    }

    // BreadcrumbList for navigation
    const breadcrumbItems = [
      { name: "Home", url: defaultMeta.baseUrl }
    ];
    
    if (currentPath !== "/") {
      const pathSegments = currentPath.split("/").filter(Boolean);
      let currentUrl = defaultMeta.baseUrl;
      
      pathSegments.forEach((segment) => {
        currentUrl += `/${segment}`;
        breadcrumbItems.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          url: currentUrl
        });
      });
    }

    if (breadcrumbItems.length > 1) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      });
    }

    // Add all schemas to head
    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
    };
  }, [currentPath]);

  return null;
}
