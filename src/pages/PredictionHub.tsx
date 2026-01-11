import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, Minus, Clock, Calendar, CalendarDays,
  ChevronRight, Zap, Target, Shield, BarChart3
} from "lucide-react";
import { TOP_50_CRYPTOS, searchCryptos } from "@/lib/extendedCryptos";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { BannerAd, InArticleAd } from "@/components/ads";
import { PredictionHubSEOContent, PredictionsHowItWorks, PredictionsDataMeaning } from "@/components/seo";
import { PredictionFilters } from "@/components/prediction/PredictionFilters";
import { SignalStrengthMeter } from "@/components/prediction/SignalStrengthMeter";
import { PerformanceTracker } from "@/components/prediction/PerformanceTracker";
import { PredictionCard } from "@/components/prediction/PredictionCard";

const timeframes = [
  { id: 'daily', label: 'Today', icon: Clock, description: 'Intraday predictions with support/resistance levels' },
  { id: 'weekly', label: 'This Week', icon: Calendar, description: 'Swing trading forecasts with breakout analysis' },
  { id: 'monthly', label: 'This Month', icon: CalendarDays, description: 'Investment outlook with macro factors' },
];

const features = [
  { icon: Zap, title: 'AI-Powered Analysis', description: 'Advanced machine learning models analyze 50+ technical indicators' },
  { icon: Target, title: 'Trading Zones', description: 'Precise entry, stop-loss, and take-profit levels for every coin' },
  { icon: Shield, title: 'Risk Assessment', description: 'Clear risk ratings and confidence scores for informed decisions' },
  { icon: BarChart3, title: 'Multi-Timeframe', description: 'Daily, weekly, and monthly predictions for all trading styles' },
];

// Generate mock sentiment for demo (would come from API in production)
function getMockSentiment(symbol: string): { bias: 'bullish' | 'bearish' | 'neutral'; confidence: number; signalStrength: number; indicatorAlignment: number } {
  const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const biases: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
  const confidence = 55 + (hash % 35);
  return {
    bias: biases[hash % 3],
    confidence,
    signalStrength: Math.floor(confidence * 0.85 + (hash % 15)),
    indicatorAlignment: Math.floor(25 + (hash % 20))
  };
}

export default function PredictionHub() {
  const { data: pricesData, isLoading, refetch, isFetching } = useCryptoPrices();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | '80' | '60' | '40'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'change' | 'marketCap' | 'name'>('confidence');

  // Get cryptos based on search - top 50 by default, or search results
  const displayCryptos = useMemo(() => {
    const cryptos = searchQuery ? searchCryptos(searchQuery, 100) : TOP_50_CRYPTOS;
    
    return cryptos.map(crypto => {
      const priceData = pricesData?.prices?.find(
        p => p.symbol.toLowerCase() === crypto.symbol.toLowerCase()
      );
      const sentiment = getMockSentiment(crypto.symbol);
      return {
        ...crypto,
        price: priceData?.price || 0,
        change24h: priceData?.change24h || 0,
        marketCap: priceData?.marketCap || 0,
        ...sentiment
      };
    });
  }, [pricesData, searchQuery]);

  // Filter and sort cryptos
  const filteredCryptos = useMemo(() => {
    let result = displayCryptos.filter(crypto => {
      const matchesCategory = selectedCategory === 'all' || crypto.bias === selectedCategory;
      const matchesConfidence = confidenceFilter === 'all' || crypto.confidence >= parseInt(confidenceFilter);
      return matchesCategory && matchesConfidence;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'change':
          return b.change24h - a.change24h;
        case 'marketCap':
          return b.marketCap - a.marketCap;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [displayCryptos, selectedCategory, confidenceFilter, sortBy]);

  // Get high conviction signals for SignalStrengthMeter
  const highConvictionSignals = useMemo(() => {
    return displayCryptos
      .filter(c => c.confidence >= 70)
      .map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        bias: c.bias,
        confidence: c.confidence,
        signalStrength: c.signalStrength,
        price: c.price,
        change24h: c.change24h,
        indicatorAlignment: c.indicatorAlignment
      }))
      .sort((a, b) => b.signalStrength - a.signalStrength)
      .slice(0, 10);
  }, [displayCryptos]);

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO 
        title="Crypto Price Predictions | Daily, Weekly, Monthly Forecasts | Oracle Bull"
        description="Get AI-powered cryptocurrency price predictions for Bitcoin, Ethereum, Solana, and 1000+ coins. Daily, weekly, and monthly forecasts with technical analysis, trading zones, and risk assessment."
        keywords="crypto price prediction, bitcoin prediction today, ethereum forecast, crypto forecast, price prediction, cryptocurrency analysis"
        canonicalPath="/predictions"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Crypto Price Predictions Hub",
            "description": "AI-powered cryptocurrency price predictions for 1000+ coins with daily, weekly, and monthly forecasts",
            "url": "https://oraclebull.com/predictions",
            "publisher": {
              "@type": "Organization",
              "name": "Oracle Bull",
              "url": "https://oraclebull.com"
            }
          })}
        </script>
      </Helmet>

      <header>
        <Navbar />
      </header>

      <main className="flex-1 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Predictions
            </Badge>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              <span className="glow-text">Crypto Price Predictions</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Get accurate AI-powered price predictions for Bitcoin, Ethereum, and 1000+ cryptocurrencies. 
              Daily, weekly, and monthly forecasts with technical analysis and trading zones.
            </p>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {features.map((feature) => (
              <div key={feature.title} className="holo-card p-4 text-center">
                <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="font-display text-sm font-bold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </section>

          {/* Timeframe Quick Links */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold mb-4 text-center">Choose Your Timeframe</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {timeframes.map((tf) => (
                <Link
                  key={tf.id}
                  to={`/price-prediction/bitcoin/${tf.id}`}
                  className="holo-card p-6 hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <tf.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">{tf.label}</h3>
                      <p className="text-xs text-muted-foreground">Predictions</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{tf.description}</p>
                  <div className="mt-3 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
          
          {/* Ad placement after timeframe section */}
          <BannerAd className="mb-8" />

          {/* Performance Tracker & High Conviction Signals */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <PerformanceTracker />
            <SignalStrengthMeter signals={highConvictionSignals} />
          </div>

          {/* Filters */}
          <PredictionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            confidenceFilter={confidenceFilter}
            onConfidenceChange={setConfidenceFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onRefresh={() => refetch()}
            isFetching={isFetching}
            totalResults={filteredCryptos.length}
          />

          {/* Crypto Predictions Grid */}
          <section>
            <h2 className="font-display text-xl font-bold mb-4">
              Top Cryptocurrency Predictions
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredCryptos.length} coins)
              </span>
            </h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="holo-card p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-24 mb-1" />
                        <div className="h-3 bg-muted rounded w-12" />
                      </div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20 mb-2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCryptos.map((crypto) => (
                  <PredictionCard key={crypto.id} crypto={crypto} />
                ))}
              </div>
            )}
          </section>

          {/* In-article ad before SEO content */}
          <InArticleAd className="mt-8 mb-8" />
          
          {/* How Our Predictions Work - SEO Content */}
          <PredictionsHowItWorks />
          <PredictionsDataMeaning />
          <PredictionHubSEOContent />

          {/* SEO Content */}
          <section className="mt-8 holo-card p-8">
            <h2 className="font-display text-2xl font-bold mb-4 text-center">
              About Oracle Bull Crypto Predictions
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p className="mb-4">
                Oracle Bull provides AI-powered cryptocurrency price predictions for over 1,000 digital assets including 
                Bitcoin (BTC), Ethereum (ETH), Solana (SOL), XRP, Cardano (ADA), and many more. Our advanced machine learning 
                models analyze 50+ technical indicators, on-chain data, market sentiment, and historical patterns to generate 
                accurate price forecasts.
              </p>
              <p className="mb-4">
                Our predictions cover three timeframes: <strong>Daily predictions</strong> for day traders seeking intraday 
                support and resistance levels, <strong>Weekly forecasts</strong> for swing traders looking for breakout 
                opportunities, and <strong>Monthly outlooks</strong> for investors considering macro trends and long-term positions.
              </p>
              <p>
                Each prediction includes precise trading zones with entry points, stop-loss levels, and multiple take-profit 
                targets. Our risk assessment system provides clear confidence scores and volatility ratings to help you make 
                informed decisions. All predictions are updated regularly and include detailed technical analysis with RSI, 
                MACD, moving averages, and Bollinger Bands.
              </p>
            </div>
            <p className="mt-6 text-xs text-muted-foreground/60 text-center">
              Disclaimer: Predictions are for informational purposes only. This is not financial advice. 
              Always do your own research before making investment decisions.
            </p>
          </section>

          {/* FAQ Schema */}
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { q: "What will Bitcoin price be today?", a: "Our AI analyzes real-time data to predict Bitcoin's intraday movements. Check our daily prediction page for today's BTC forecast with support/resistance levels." },
                { q: "How accurate are crypto predictions?", a: "Our predictions use multi-layer analysis including technical indicators, market momentum, and historical patterns. We provide confidence scores with each forecast." },
                { q: "What is the best crypto to buy now?", a: "Our AI identifies high-conviction bullish signals across 1000+ coins. Filter by 'Bullish' and sort by confidence to find the strongest buy signals." },
                { q: "How do you calculate signal strength?", a: "Signal strength combines AI confidence, technical indicator alignment, and market momentum into a single score for quick decision-making." },
              ].map((faq, i) => (
                <div key={i} className="holo-card p-4">
                  <h3 className="font-display font-bold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
