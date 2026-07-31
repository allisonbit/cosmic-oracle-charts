import { SEO, StructuredData } from '@/components/MainSEO';
import { SITE_URL } from "@/lib/siteConfig";

const baseUrl = SITE_URL;

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
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const dateTag = timeframe === 'monthly' ? `${currentMonth} ${currentYear}` : `${currentMonth} ${new Date().getDate()}, ${currentYear}`;
  
  const title = `${coinName} (${symbol.toUpperCase()}) Price Prediction ${timeframeText} ${dateTag}`;
  const description = `Will ${symbol.toUpperCase()} go up ${timeframeLower}? ${coinName} AI prediction with ${bias || 'neutral'} bias${confidence ? ` (${confidence}% confidence)` : ''}. ${currentPrice ? `Current price: $${(currentPrice ?? 0).toLocaleString()}.` : ''} Free technical analysis, targets & risk levels.`;
  
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
          "text": `Based on our technical analysis and AI models, ${coinName} shows ${bias || 'mixed'} signals ${timeframeLower}. ${currentPrice ? `Current price: $${(currentPrice ?? 0).toLocaleString()}.` : ''} Check our detailed prediction above for support/resistance levels and price targets.`
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

  // NOTE: no BreadcrumbList here — BreadcrumbNav (rendered by Layout) already
  // emits the page's BreadcrumbList; duplicating it would confuse rich results.

  return (
    <>
      {/* Title/description/OG/canonical via the shared imperative SEO head
          manager — keeps head tags updated in place across SPA navigation. */}
      <SEO
        title={title}
        description={description}
        type="article"
        canonicalPath={`/price-prediction/${coinName.toLowerCase().replace(/\s+/g, '-')}/${timeframe}`}
      />
      <StructuredData schema={[faqSchema, articleSchema, productSchema]} />
    </>
  );
}
