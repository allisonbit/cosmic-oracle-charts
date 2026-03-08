import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from "@/lib/siteConfig";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonicalPath?: string;
}

const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
const currentYear = new Date().getFullYear();

const defaultMeta = {
  siteName: SITE_NAME,
  title: `Best Free AI Crypto Predictions & Forecasts (${currentMonth} ${currentYear}) – Oracle Bull`,
  description: "Get free AI-powered crypto price predictions for Bitcoin, Ethereum & 1000+ tokens. Real-time charts, whale alerts, sentiment analysis. No signup needed.",
  keywords: "crypto prediction today, AI crypto forecast, bitcoin price prediction, free crypto signals, crypto analysis tool, best crypto prediction site",
  image: "https://storage.googleapis.com/gpt-engineer-file-uploads/uDg0k7BDXGRxsHZqK6gSbdN9o0l1/social-images/social-1765566965381-WhatsApp Image 2025-12-12 at 10.50.30_d13b6f53.jpg",
  twitterHandle: TWITTER_HANDLE,
  baseUrl: SITE_URL
};


const pageSEO: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: `Best Free AI Crypto Predictions & Forecasts (${currentMonth} ${currentYear}) – Oracle Bull`,
    description: `Get free AI-powered crypto price predictions for Bitcoin, Ethereum & 1000+ tokens. Real-time charts, whale alerts, sentiment analysis. Updated ${currentMonth} ${currentYear}. No signup needed.`,
    keywords: "crypto prediction today, AI crypto forecast, bitcoin price prediction, free crypto signals, crypto analysis tool, best crypto prediction site"
  },
  "/dashboard": {
    title: `Crypto Market Dashboard – Live Prices & Signals (${currentMonth} ${currentYear})`,
    description: "Live crypto dashboard: real-time prices, top gainers, market momentum, volume leaders & AI insights. Track BTC, ETH & 1000+ altcoins in one view. Free & updated every 30 seconds.",
    keywords: "crypto dashboard live, real time crypto prices, crypto market today, top crypto gainers today, crypto market cap live"
  },
  "/strength-meter": {
    title: `Crypto Strength Meter – Which Coin Is Strongest Right Now? (${currentMonth} ${currentYear})`,
    description: "See which crypto is the strongest right now. Real-time strength rankings for Bitcoin, Ethereum, Solana & 100+ assets based on momentum, volume & sentiment. Free tool.",
    keywords: "crypto strength meter, strongest cryptocurrency today, bitcoin strength index, crypto momentum ranking, best performing crypto"
  },
  "/strength": {
    title: `Crypto Strength Meter – Which Coin Is Strongest Right Now? (${currentMonth} ${currentYear})`,
    description: "See which crypto is the strongest right now. Real-time strength rankings for Bitcoin, Ethereum, Solana & 100+ assets based on momentum, volume & sentiment. Free tool.",
    keywords: "crypto strength meter, strongest cryptocurrency today, bitcoin strength index, crypto momentum ranking, best performing crypto"
  },
  "/crypto-factory": {
    title: "Crypto Factory – Market Events, Whale Alerts & On-Chain Intel",
    description: "Track every market-moving event: token launches, protocol upgrades, whale movements & trending narratives. Like Forex Factory but for crypto. Updated in real-time.",
    keywords: "crypto events calendar, crypto factory, upcoming token launches, whale alerts crypto, crypto market events, protocol upgrades"
  },
  "/factory": {
    title: "Crypto Factory – Market Events, Whale Alerts & On-Chain Intel",
    description: "Track every market-moving event: token launches, protocol upgrades, whale movements & trending narratives. Like Forex Factory but for crypto. Updated in real-time.",
    keywords: "crypto events calendar, crypto factory, upcoming token launches, whale alerts crypto, crypto market events, protocol upgrades"
  },
  "/sitemap": {
    title: "Sitemap – All Oracle Bull Pages & Tools",
    description: "Complete index of Oracle Bull: crypto analytics, blockchain dashboards, AI predictions, educational guides & trading tools. Find every feature.",
    keywords: "oracle bull sitemap, crypto tools, blockchain analytics"
  },
  "/portfolio": {
    title: "Free Wallet Scanner – Analyze Any Crypto Wallet Instantly",
    description: "Paste any EVM or Solana wallet address for instant AI analysis. See holdings, hidden gems, risk scores & pump potential. 100% free, no signup.",
    keywords: "crypto wallet scanner free, wallet analyzer, portfolio tracker, check crypto wallet, solana wallet checker"
  },
  "/sentiment": {
    title: `Crypto Fear & Greed Index + Whale Tracker (Live ${currentMonth} ${currentYear})`,
    description: "Real-time crypto sentiment: Fear & Greed Index, whale transaction alerts, social buzz from Twitter/Reddit/Telegram & trending topics. Make data-driven trading decisions.",
    keywords: "crypto fear greed index today, whale alerts crypto, crypto sentiment analysis, crypto social signals, bitcoin sentiment"
  },
  "/explorer": {
    title: "Crypto Token Explorer – Search Any Coin by Name or Contract",
    description: "Search 10,000+ tokens by name, symbol, or contract address. Get price charts, holder analysis, liquidity depth & DeFi metrics across 30+ blockchains. Free.",
    keywords: "crypto token explorer, search cryptocurrency, token contract lookup, crypto analysis by address, defi token scanner"
  },
  "/learn": {
    title: `Learn Crypto Free – Daily Articles & Trading Guides (${currentMonth} ${currentYear})`,
    description: "Free daily crypto education: AI-written market insights, Bitcoin guides, DeFi tutorials, technical analysis lessons & trading strategies. 2000+ articles available.",
    keywords: "learn crypto free, crypto education, bitcoin guide for beginners, defi tutorial, crypto trading course free"
  },
  "/insights": {
    title: `Crypto Market Analysis Today – AI-Powered Daily Insights (${currentMonth} ${currentYear})`,
    description: "Daily AI market analysis for Bitcoin, Ethereum, Solana & altcoins. On-chain data, technical indicators & expert research. Updated every day, always free.",
    keywords: "crypto analysis today, daily crypto insights, bitcoin market analysis, ethereum analysis today, crypto research"
  },
  "/contact": {
    title: "Contact Oracle Bull – Get Support & Join Our Community",
    description: "Reach the Oracle Bull team via email, Twitter or Telegram. Join 50,000+ traders using our free AI crypto analytics platform. Quick response guaranteed.",
    keywords: "contact oracle bull, oracle bull support, oracle bull telegram, crypto community"
  },
  "/predictions": {
    title: `AI Crypto Price Predictions – BTC, ETH & Altcoin Forecasts (${currentMonth} ${currentYear})`,
    description: "Browse AI-powered price predictions for Bitcoin, Ethereum, Solana & 100+ tokens. Daily, weekly & monthly forecasts with confidence scores and bull/bear targets.",
    keywords: "crypto price prediction, bitcoin forecast today, ethereum prediction, altcoin predictions, AI crypto forecast"
  },
  "/about": {
    title: "About Oracle Bull – Free AI Crypto Analytics Platform",
    description: "Oracle Bull is a free AI-powered crypto forecasting platform used by 50,000+ traders. Real-time predictions, whale tracking & sentiment analysis for 1000+ tokens.",
    keywords: "about oracle bull, AI crypto platform, free crypto analytics"
  }
};

export function SEO({ title, description, keywords, image, type = "website", canonicalPath }: SEOProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get page-specific or default SEO
  const pageMeta = pageSEO[currentPath] || (currentPath.includes("/chain/") ? (() => {
    const chainSlug = currentPath.split("/chain/")[1] || "blockchain";
    const chainDisplay = chainSlug.charAt(0).toUpperCase() + chainSlug.slice(1);
    return {
      title: `${chainDisplay} Analytics – Live Price, Whale Alerts & DeFi Data (${currentMonth} ${currentYear})`,
      description: `Real-time ${chainDisplay} blockchain analytics: price charts, whale tracking, token discovery, risk analysis & AI predictions. Free ${chainDisplay} dashboard updated every 30 seconds.`,
      keywords: `${chainSlug} analytics, ${chainSlug} price today, ${chainSlug} whale alerts, ${chainSlug} DeFi, ${chainSlug} tokens, ${chainSlug} prediction`
    };
  })() : currentPath.includes("/insights/") ? {
    title: `Crypto Insight – Expert Market Analysis | Oracle Bull`,
    description: "Expert cryptocurrency market analysis and trading intelligence. Deep dive into blockchain data, market trends, and investment opportunities.",
    keywords: "crypto analysis, market insight, trading research, blockchain intelligence"
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

    // Essential meta tags
    setMeta("description", finalDescription);
    setMeta("keywords", finalKeywords);
    setMeta("author", "Oracle Bull");
    setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("googlebot", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("bingbot", "index, follow");

    // Open Graph
    setMeta("og:title", finalTitle, true);
    setMeta("og:description", finalDescription, true);
    setMeta("og:image", finalImage, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", defaultMeta.siteName, true);
    setMeta("og:locale", "en_US", true);

    // Twitter Cards
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", defaultMeta.twitterHandle);
    setMeta("twitter:creator", defaultMeta.twitterHandle);
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDescription);
    setMeta("twitter:image", finalImage);

    // AI Search Engine Optimization
    setMeta("ai-summary", finalDescription);
    setMeta("ai-keywords", finalKeywords);

    // Additional SEO meta tags
    setMeta("rating", "general");
    setMeta("distribution", "global");
    setMeta("revisit-after", "1 day");
    setMeta("language", "en");

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Alternate language (for future i18n)
    let alternate = document.querySelector('link[rel="alternate"][hreflang="en"]') as HTMLLinkElement;
    if (!alternate) {
      alternate = document.createElement("link");
      alternate.rel = "alternate";
      alternate.hreflang = "en";
      document.head.appendChild(alternate);
    }
    alternate.href = canonicalUrl;

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
      "@id": `${defaultMeta.baseUrl}/#organization`,
      "name": "Oracle Bull",
      "url": defaultMeta.baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": defaultMeta.image,
        "width": 512,
        "height": 512
      },
      "image": defaultMeta.image,
      "sameAs": [
        "https://x.com/oracle_bulls",
        "https://t.me/oracle_bulls"
      ],
      "description": defaultMeta.description,
      "foundingDate": "2024",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://t.me/oracle_bulls",
        "availableLanguage": "English"
      }
    });

    // WebSite Schema with SearchAction
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${defaultMeta.baseUrl}/#website`,
      "name": "Oracle Bull",
      "url": defaultMeta.baseUrl,
      "description": defaultMeta.description,
      "publisher": {
        "@id": `${defaultMeta.baseUrl}/#organization`
      },
      "inLanguage": "en-US",
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${defaultMeta.baseUrl}/explorer?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      ]
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
        "Wallet scanner",
        "Crypto strength meter",
        "Market events calendar"
      ],
      "screenshot": defaultMeta.image,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250",
        "bestRating": "5",
        "worstRating": "1"
      }
    });

    // Page-specific WebPage schema
    const pageInfo = pageSEO[currentPath];
    if (pageInfo) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${defaultMeta.baseUrl}${currentPath}`,
        "name": pageInfo.title,
        "description": pageInfo.description,
        "url": `${defaultMeta.baseUrl}${currentPath}`,
        "isPartOf": {
          "@id": `${defaultMeta.baseUrl}/#website`
        },
        "about": {
          "@type": "Thing",
          "name": "Cryptocurrency Analytics"
        },
        "publisher": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "inLanguage": "en-US",
        "dateModified": new Date().toISOString()
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
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "featureList": [
          "Real-time price charts",
          "AI predictions",
          "Whale activity radar",
          "Token heat scanner",
          "Risk analyzer",
          "DeFi metrics",
          "Social sentiment analysis"
        ]
      });
    }

    // Learn page - Blog/Article schema + FAQ
    if (currentPath === "/learn") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${defaultMeta.baseUrl}/learn/#blog`,
        "name": "Oracle Bull Crypto Education",
        "description": "Daily AI-generated cryptocurrency articles, market insights, and blockchain education.",
        "url": `${defaultMeta.baseUrl}/learn`,
        "publisher": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "inLanguage": "en-US"
      });

      // FAQ Schema for Learn page
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Oracle Bull?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oracle Bull is a free AI-powered cryptocurrency forecasting platform providing real-time price charts, market predictions, whale tracking, sentiment analysis, and blockchain analytics for Bitcoin, Ethereum, Solana, and 1000+ tokens."
            }
          },
          {
            "@type": "Question",
            "name": "How does the crypto strength meter work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The crypto strength meter measures and ranks cryptocurrency strength in real-time using a composite weighted model including price momentum, volume inflow/outflow, volatility, market dominance changes, relative performance vs BTC/ETH, sentiment scores, and trend consistency."
            }
          },
          {
            "@type": "Question",
            "name": "What blockchains does Oracle Bull support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oracle Bull supports multiple blockchains including Ethereum, Solana, Base, Arbitrum, Polygon, Optimism, Avalanche, and BNB Chain with real-time analytics, token discovery, and whale tracking for each."
            }
          },
          {
            "@type": "Question",
            "name": "Is Oracle Bull free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Oracle Bull is completely free to use with no signup required. Access real-time crypto data, AI predictions, whale tracking, sentiment analysis, and blockchain analytics at no cost."
            }
          },
          {
            "@type": "Question",
            "name": "How does the wallet scanner work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The wallet scanner allows you to input any EVM or Solana wallet address to receive AI-powered analysis of holdings, including token breakdown, pump potential predictions, risk classifications, and actionable trading recommendations."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Fear and Greed Index?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Fear and Greed Index is a market sentiment indicator that measures emotions driving the crypto market on a scale from 0 (Extreme Fear) to 100 (Extreme Greed), helping traders understand market psychology and potential turning points."
            }
          },
          {
            "@type": "Question",
            "name": "How often is the data updated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oracle Bull provides real-time data with automatic updates every 10-30 seconds depending on the metric. Price data, whale alerts, and market sentiment refresh continuously without requiring page reloads."
            }
          }
        ]
      });
    }

    // Insights page - Blog schema
    if (currentPath === "/insights") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${defaultMeta.baseUrl}/insights/#blog`,
        "name": "Oracle Bull Crypto Insights",
        "description": "Expert cryptocurrency market analysis, on-chain data insights, and trading intelligence updated daily.",
        "url": `${defaultMeta.baseUrl}/insights`,
        "publisher": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "inLanguage": "en-US"
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
          "@id": `${defaultMeta.baseUrl}/#organization`
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

    // Strength Meter - Service schema
    if (currentPath === "/strength" || currentPath === "/strength-meter") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Crypto Strength Meter",
        "description": "Real-time cryptocurrency strength rankings using momentum, volume, and sentiment analysis.",
        "url": `${defaultMeta.baseUrl}/strength`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Financial Analytics",
        "areaServed": "Worldwide"
      });
    }

    // Factory - Service schema
    if (currentPath === "/factory") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Crypto Factory",
        "description": "Market events calendar and on-chain intelligence hub for cryptocurrency traders.",
        "url": `${defaultMeta.baseUrl}/factory`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Financial News & Events",
        "areaServed": "Worldwide"
      });
    }

    // Sentiment - Service schema
    if (currentPath === "/sentiment") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Crypto Sentiment Analysis",
        "description": "Real-time crypto sentiment from social media, whale tracking, and fear & greed index.",
        "url": `${defaultMeta.baseUrl}/sentiment`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Market Analysis",
        "areaServed": "Worldwide"
      });
    }

    // Portfolio/Wallet Scanner - Service schema
    if (currentPath === "/portfolio") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Wallet Scanner",
        "description": "AI-powered portfolio analysis for EVM and Solana wallets.",
        "url": `${defaultMeta.baseUrl}/portfolio`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Portfolio Analysis",
        "areaServed": "Worldwide"
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
