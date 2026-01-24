import { Helmet } from 'react-helmet-async';

const baseUrl = "https://cosmic-oracle-charts.lovable.app";

interface PredictionSEOProps {
  coinName: string;
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  currentPrice?: number;
  bias?: 'bullish' | 'bearish' | 'neutral';
  confidence?: number;
}

export function PredictionSEO({ coinName, symbol, timeframe, currentPrice, bias, confidence }: PredictionSEOProps) {
  const timeframeText = timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'This Week' : 'This Month';
  const timeframeLower = timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : 'this month';
  
  const title = `${coinName} (${symbol.toUpperCase()}) Price Prediction ${timeframeText} | Oracle Bull`;
  const description = `${coinName} price prediction ${timeframeLower}. Expert ${symbol.toUpperCase()} forecast with technical analysis, support/resistance levels, and AI-powered insights. ${bias ? `Current bias: ${bias} with ${confidence}% confidence.` : ''}`;
  
  const currentDate = new Date();
  const dateStr = currentDate.toISOString().split('T')[0];
  const canonicalUrl = `${baseUrl}/price-prediction/${coinName.toLowerCase().replace(/\s+/g, '-')}/${timeframe}`;
  
  // Enhanced FAQ Schema with more questions for rich snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What will ${coinName} price be ${timeframeLower}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Based on our technical analysis and AI models, ${coinName} shows ${bias || 'mixed'} signals ${timeframeLower}. ${currentPrice ? `Current price: $${currentPrice.toLocaleString()}.` : ''} Check our detailed prediction above for support/resistance levels and price targets.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${coinName} a good investment ${timeframeLower}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our analysis provides data-driven insights to help inform your decision. Consider the technical indicators, market sentiment, and risk levels shown above. Always do your own research and never invest more than you can afford to lose.`
        }
      },
      {
        "@type": "Question",
        "name": `Will ${symbol.toUpperCase()} go up or down ${timeframeLower}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our prediction model shows ${bias || 'neutral'} bias for ${symbol.toUpperCase()} ${timeframeLower}${confidence ? ` with ${confidence}% confidence` : ''}. See the bull and bear scenarios above for detailed price targets and triggers.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the ${coinName} price prediction for ${new Date().getFullYear()}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Our AI-powered platform provides ${coinName} predictions across multiple timeframes. View our daily, weekly, and monthly forecasts for comprehensive market analysis. Each prediction includes entry zones, stop-loss levels, and take-profit targets.`
        }
      },
      {
        "@type": "Question",
        "name": `Should I buy ${coinName} now?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Based on current technical indicators, ${coinName} shows ${bias || 'neutral'} signals. Our analysis includes RSI, MACD, and moving average data to help you make informed decisions. Always consider your risk tolerance and investment goals.`
        }
      }
    ]
  };

  // Article Schema with enhanced metadata
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": `${baseUrl}/oracle-bull-logo.jpg`,
    "author": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/oracle-bull-logo.jpg`,
        "width": 512,
        "height": 512
      }
    },
    "datePublished": dateStr,
    "dateModified": dateStr,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "articleSection": "Cryptocurrency",
    "keywords": `${coinName}, ${symbol}, price prediction, crypto forecast, ${timeframeLower}`
  };

  // Financial Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": `${coinName} Price Prediction`,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": baseUrl
    },
    "url": canonicalUrl,
    ...(currentPrice && {
      "offers": {
        "@type": "Offer",
        "price": currentPrice,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(Date.now() + 3600000).toISOString()
      }
    })
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Predictions",
        "item": `${baseUrl}/predictions`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${coinName} Prediction`,
        "item": `${baseUrl}/price-prediction/${coinName.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": timeframeText,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${coinName} price prediction, ${symbol} forecast ${timeframeLower}, ${coinName} prediction ${timeframeText.toLowerCase()}, will ${symbol} go up, ${coinName} technical analysis, crypto prediction, ${symbol} price ${timeframeLower}, buy ${coinName}, ${symbol} investment`} />
      
      {/* Robots directives */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${baseUrl}/oracle-bull-logo.jpg`} />
      <meta property="og:site_name" content="Oracle Bull" />
      <meta property="article:published_time" content={dateStr} />
      <meta property="article:modified_time" content={dateStr} />
      <meta property="article:section" content="Cryptocurrency" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}/oracle-bull-logo.jpg`} />
      <meta name="twitter:site" content="@oracle_bulls" />
      
      {/* AI Search Optimization */}
      <meta name="ai-summary" content={`${coinName} ${timeframe} price prediction with ${bias || 'neutral'} outlook. Technical analysis includes RSI, MACD, moving averages, support/resistance levels. Current price: ${currentPrice ? `$${currentPrice.toLocaleString()}` : 'Loading'}.`} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}
