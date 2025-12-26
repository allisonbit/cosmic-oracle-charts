import { Helmet } from 'react-helmet-async';

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
  
  // FAQ Schema
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
      }
    ]
  };

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": "Oracle Bull"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "logo": {
        "@type": "ImageObject",
        "url": "https://oraclebull.com/oracle-logo.jpg"
      }
    },
    "datePublished": dateStr,
    "dateModified": dateStr,
    "mainEntityOfPage": {
      "@type": "WebPage"
    }
  };

  // Financial Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": `${coinName} Price Prediction`,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": "Oracle Bull"
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${coinName} price prediction, ${symbol} forecast ${timeframeLower}, ${coinName} prediction ${timeframeText.toLowerCase()}, will ${symbol} go up, ${coinName} technical analysis, crypto prediction, ${symbol} price ${timeframeLower}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* AI Search Optimization */}
      <meta name="ai-summary" content={`${coinName} ${timeframe} price prediction with ${bias || 'neutral'} outlook. Technical analysis includes RSI, MACD, moving averages, support/resistance levels.`} />
      
      {/* Canonical */}
      <link rel="canonical" href={`https://oraclebull.com/price-prediction/${coinName.toLowerCase().replace(/\s+/g, '-')}/${timeframe}`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
    </Helmet>
  );
}
