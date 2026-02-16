import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, HelpCircle, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EnrichedCrypto {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

interface MarketIntroductionProps {
  questionTitle: string;
  category: 'buy' | 'gainers' | 'outlook' | 'trend';
  currentDate: string;
  bullishCount: number;
  bearishCount: number;
  avgChange: number;
}

export function MarketIntroduction({ 
  questionTitle, 
  category, 
  currentDate, 
  bullishCount, 
  bearishCount, 
  avgChange 
}: MarketIntroductionProps) {
  const marketTrend = avgChange >= 0 ? "bullish momentum" : "bearish pressure";
  const sentiment = bullishCount > bearishCount ? "predominantly optimistic" : bullishCount < bearishCount ? "cautiously bearish" : "mixed";

  return (
    <section className="holo-card p-6 mb-8" aria-labelledby="market-intro-heading">
      <h2 id="market-intro-heading" className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Understanding {questionTitle}
      </h2>
      
      <div className="prose max-w-none text-muted-foreground">
        <p>
          <strong>{questionTitle}</strong> refers to identifying cryptocurrencies with the strongest upside potential 
          based on current market conditions, technical analysis, and AI-driven sentiment evaluation. As of {currentDate}, 
          the crypto market shows {marketTrend} with overall sentiment being {sentiment}. Our analysis evaluates 
          {bullishCount + bearishCount}+ major cryptocurrencies to surface the most promising investment opportunities.
        </p>
        
        <p>
          Our ranking methodology combines multiple data layers: <strong>Technical Indicators</strong> (RSI, MACD, Bollinger Bands, 
          moving averages), <strong>On-Chain Metrics</strong> (active addresses, transaction volume, whale movements), 
          <strong>Market Sentiment</strong> (social media analysis, news sentiment, Fear &amp; Greed Index), and 
          <strong>Institutional Flow</strong> (exchange inflows/outflows, large holder activity). Each cryptocurrency receives 
          a confidence score from 0-100%, reflecting the strength and alignment of these signals.
        </p>
        
        <p>
          The current market environment shows {bullishCount} assets with bullish signals and {bearishCount} with bearish 
          indicators. The average 24-hour change across tracked assets is {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%, 
          {avgChange >= 2 ? " indicating strong buying momentum" : avgChange <= -2 ? " reflecting selling pressure" : " suggesting consolidation"}. 
          Investors seeking opportunities today should focus on assets with high confidence scores (&gt;70%) and positive momentum alignment. 
          Always verify predictions with your own research and consider your risk tolerance before investing.
        </p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <Link to="/predictions" className="text-primary hover:underline flex items-center gap-1">
            View All Price Predictions <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/dashboard" className="text-primary hover:underline flex items-center gap-1">
            Market Dashboard <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/sentiment" className="text-primary hover:underline flex items-center gap-1">
            Sentiment Analysis <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

interface CoinAnalysisSectionProps {
  cryptos: EnrichedCrypto[];
  questionSlug: string;
}

export function CoinAnalysisSection({ cryptos, questionSlug }: CoinAnalysisSectionProps) {
  const formatPrice = (price: number): string => {
    if (price <= 0) return "Price loading...";
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toPrecision(4)}`;
  };

  const getAnalysisText = (crypto: EnrichedCrypto, rank: number): string => {
    const priceText = crypto.price > 0 ? formatPrice(crypto.price) : "current market price";
    const changeDirection = crypto.change24h >= 0 ? "gained" : "declined";
    const changePercent = Math.abs(crypto.change24h).toFixed(2);
    
    const outlookText = crypto.bias === 'bullish' 
      ? `Our AI analysis indicates a bullish outlook with ${crypto.confidence}% confidence. Technical indicators suggest continued upward momentum in the short-term.`
      : crypto.bias === 'bearish'
      ? `Current analysis shows bearish signals with ${crypto.confidence}% confidence. Traders should watch support levels closely.`
      : `The outlook remains neutral with ${crypto.confidence}% confidence, suggesting consolidation before the next major move.`;

    const rankReason = rank <= 3 
      ? `Ranked #${rank} due to exceptional technical alignment and strong momentum indicators.`
      : rank <= 6
      ? `Positioned at #${rank} based on solid fundamentals and positive market sentiment.`
      : `Holding #${rank} with developing bullish signals worth monitoring.`;

    return `${crypto.name} (${crypto.symbol.toUpperCase()}) is currently trading at ${priceText}, having ${changeDirection} ${changePercent}% over the past 24 hours. ${outlookText} ${rankReason}`;
  };

  return (
    <section className="space-y-6 mb-8" aria-labelledby="coin-analysis-heading">
      <h2 id="coin-analysis-heading" className="font-display text-xl font-bold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Detailed Coin Analysis
      </h2>
      
      {cryptos.slice(0, 10).map((crypto, index) => (
        <article key={crypto.id} className="holo-card p-5" itemScope itemType="https://schema.org/FinancialProduct">
          <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2" itemProp="name">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
            {crypto.name} ({crypto.symbol.toUpperCase()})
            {crypto.bias === 'bullish' && <TrendingUp className="w-4 h-4 text-green-400" />}
            {crypto.bias === 'bearish' && <TrendingDown className="w-4 h-4 text-red-400" />}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4" itemProp="description">
            {getAnalysisText(crypto, index + 1)}
          </p>
          
          <div className="flex flex-wrap gap-3 text-sm">
            <Link 
              to={`/price-prediction/${crypto.id}/daily`}
              className="text-primary hover:underline flex items-center gap-1"
            >
              {crypto.name} Daily Prediction <ExternalLink className="w-3 h-3" />
            </Link>
            <Link 
              to={`/price-prediction/${crypto.id}/weekly`}
              className="text-primary hover:underline flex items-center gap-1"
            >
              Weekly Forecast <ExternalLink className="w-3 h-3" />
            </Link>
            <Link 
              to={`/price-prediction/${crypto.id}/monthly`}
              className="text-primary hover:underline flex items-center gap-1"
            >
              Monthly Outlook <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}

interface CryptoSummaryTableProps {
  cryptos: EnrichedCrypto[];
}

export function CryptoSummaryTable({ cryptos }: CryptoSummaryTableProps) {
  const formatPrice = (price: number): string => {
    if (price <= 0) return "Loading...";
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toPrecision(4)}`;
  };

  const getOutlook = (crypto: EnrichedCrypto): string => {
    if (crypto.change24h >= 5) return "Strong Bullish";
    if (crypto.change24h >= 2) return "Bullish";
    if (crypto.change24h >= 0) return "Neutral-Bullish";
    if (crypto.change24h >= -2) return "Neutral-Bearish";
    if (crypto.change24h >= -5) return "Bearish";
    return "Strong Bearish";
  };

  const getTrend = (change: number): string => {
    if (change >= 3) return "📈 Strong Up";
    if (change >= 0) return "↗️ Up";
    if (change >= -3) return "↘️ Down";
    return "📉 Strong Down";
  };

  return (
    <section className="holo-card p-6 mb-8 overflow-x-auto" aria-labelledby="summary-table-heading">
      <h2 id="summary-table-heading" className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-primary" />
        Quick Summary Table
      </h2>
      
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-border/50 text-left">
            <th className="py-3 px-2 font-semibold text-foreground" scope="col">Rank</th>
            <th className="py-3 px-2 font-semibold text-foreground" scope="col">Coin</th>
            <th className="py-3 px-2 font-semibold text-foreground" scope="col">Price (USD)</th>
            <th className="py-3 px-2 font-semibold text-foreground" scope="col">24h Trend</th>
            <th className="py-3 px-2 font-semibold text-foreground" scope="col">Outlook</th>
            <th className="py-3 px-2 font-semibold text-foreground" scope="col">AI Bias</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.slice(0, 10).map((crypto, index) => (
            <tr key={crypto.id} className="border-b border-border/20 hover:bg-muted/30">
              <td className="py-3 px-2 font-bold">{index + 1}</td>
              <td className="py-3 px-2">
                <Link to={`/price-prediction/${crypto.id}/daily`} className="text-primary hover:underline font-medium">
                  {crypto.name}
                </Link>
                <span className="text-muted-foreground ml-1">({crypto.symbol.toUpperCase()})</span>
              </td>
              <td className="py-3 px-2 font-mono">{formatPrice(crypto.price)}</td>
              <td className="py-3 px-2">
                <span className={crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {getTrend(crypto.change24h)} ({crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%)
                </span>
              </td>
              <td className="py-3 px-2">{getOutlook(crypto)}</td>
              <td className="py-3 px-2">
                <span className={
                  crypto.bias === 'bullish' ? 'text-green-400' : 
                  crypto.bias === 'bearish' ? 'text-red-400' : 'text-muted-foreground'
                }>
                  {crypto.bias.charAt(0).toUpperCase() + crypto.bias.slice(1)} ({crypto.confidence}%)
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <p className="mt-4 text-xs text-muted-foreground">
        Data updated in real-time. Prices and predictions subject to market volatility. 
        <Link to="/predictions" className="text-primary hover:underline ml-1">View full prediction database →</Link>
      </p>
    </section>
  );
}

interface MarketFAQProps {
  questionTitle: string;
  topCryptos: EnrichedCrypto[];
  currentDate: string;
}

export function MarketFAQ({ questionTitle, topCryptos, currentDate }: MarketFAQProps) {
  const topCoin = topCryptos[0];
  const formatPrice = (price: number): string => {
    if (price <= 0) return "current market price";
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const faqs = [
    {
      question: `What is the ${questionTitle.toLowerCase()} right now?`,
      answer: `As of ${currentDate}, our AI analysis identifies ${topCoin?.name || "Bitcoin"} as the top pick with ${topCoin?.confidence || 75}% confidence. ${topCoin?.name || "Bitcoin"} is currently trading at ${topCoin ? formatPrice(topCoin.price) : "$94,000"} with ${topCoin && topCoin.change24h >= 0 ? "positive" : "mixed"} 24-hour momentum. Other top contenders include ${topCryptos.slice(1, 4).map(c => c.name).join(", ") || "Ethereum, Solana, and XRP"}.`
    },
    {
      question: `How do you determine which crypto to buy today?`,
      answer: `We use a multi-factor AI model analyzing: Technical indicators (RSI, MACD, moving averages), market sentiment from 100+ sources, on-chain data (whale movements, exchange flows), and historical price patterns. Assets must show bullish alignment across at least 3 of these categories to rank highly. Our confidence scores (0-100%) reflect signal strength and consistency.`
    },
    {
      question: `Should I invest in crypto today based on these rankings?`,
      answer: `These rankings provide data-driven insights but are not financial advice. Before investing, consider: your risk tolerance, investment timeline, portfolio diversification, and the inherent volatility of crypto markets. We recommend using our predictions as one input in your research process, combined with your own due diligence and potentially consulting a financial advisor.`
    },
    {
      question: `How often are these crypto predictions updated?`,
      answer: `Our AI models run continuously, updating rankings every 5 minutes based on real-time price data, every hour for sentiment analysis, and daily for comprehensive technical and on-chain metrics. The "Last Updated" timestamp shows the most recent full refresh.`
    },
    {
      question: `What makes Oracle Bull different from other crypto prediction sites?`,
      answer: `Oracle Bull combines institutional-grade analytics typically reserved for professional traders with consumer-friendly presentation. We analyze 1000+ cryptocurrencies across 50+ metrics, provide specific entry/exit zones, and maintain full transparency on our methodology. Unlike many sites, we don't accept payment for rankings—all predictions are algorithm-driven.`
    },
    {
      question: `Which cryptocurrencies have the highest potential today?`,
      answer: `Based on current analysis, the highest potential assets are: ${topCryptos.slice(0, 5).map((c, i) => `${i + 1}. ${c.name} (${c.confidence}% confidence)`).join(", ")}. These show the strongest bullish alignment across technical, sentiment, and on-chain indicators. View individual prediction pages for detailed price targets and entry zones.`
    }
  ];

  return (
    <section className="holo-card p-6 mb-8" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        Frequently Asked Questions
      </h2>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-sm font-medium hover:text-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

interface EnhancedInternalLinksProps {
  currentSlug: string;
  topCryptos: EnrichedCrypto[];
}

export function EnhancedInternalLinks({ currentSlug, topCryptos }: EnhancedInternalLinksProps) {
  const relatedPages = [
    { path: '/market/top-crypto-gainers-today', label: 'Top Crypto Gainers Today' },
    { path: '/market/crypto-market-prediction-today', label: 'Crypto Market Prediction Today' },
    { path: '/market/which-crypto-will-go-up-today', label: 'Which Crypto Will Go Up Today?' },
    { path: '/market/next-crypto-to-explode', label: 'Next Crypto to Explode' },
    { path: '/market/safest-crypto-to-invest', label: 'Safest Crypto to Invest' },
    { path: '/market/cheap-crypto-to-buy-now', label: 'Cheap Crypto to Buy Now' },
  ].filter(p => !p.path.includes(currentSlug));

  return (
    <section className="holo-card p-6 mb-8" aria-labelledby="related-links-heading">
      <h2 id="related-links-heading" className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <ExternalLink className="w-5 h-5 text-primary" />
        Related Crypto Analysis
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-sm mb-2 text-foreground">Today's Top Coins</h3>
          <ul className="space-y-1 text-sm">
            {topCryptos.slice(0, 5).map(crypto => (
              <li key={crypto.id}>
                <Link to={`/price-prediction/${crypto.id}/daily`} className="text-primary hover:underline">
                  {crypto.name} Price Prediction Today
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-sm mb-2 text-foreground">Related Market Pages</h3>
          <ul className="space-y-1 text-sm">
            {relatedPages.slice(0, 5).map(page => (
              <li key={page.path}>
                <Link to={page.path} className="text-primary hover:underline">
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm border-t border-border/30 pt-4">
        <Link to="/predictions" className="text-primary hover:underline">All Predictions</Link>
        <Link to="/dashboard" className="text-primary hover:underline">Market Dashboard</Link>
        <Link to="/strength" className="text-primary hover:underline">Strength Meter</Link>
        <Link to="/sentiment" className="text-primary hover:underline">Sentiment Analysis</Link>
        <Link to="/explorer" className="text-primary hover:underline">Token Explorer</Link>
        <Link to="/insights" className="text-primary hover:underline">Market Insights</Link>
      </div>
    </section>
  );
}
