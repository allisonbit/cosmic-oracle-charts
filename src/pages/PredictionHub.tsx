import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, Minus, Clock, Calendar, CalendarDays,
  ChevronRight, Zap, Target, Shield, BarChart3, Globe, Sparkles
} from "lucide-react";
import { TOP_50_CRYPTOS } from "@/lib/extendedCryptos";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useCallback } from "react";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { BannerAd, InArticleAd } from "@/components/ads";
import { PredictionHubSEOContent, PredictionsHowItWorks, PredictionsDataMeaning } from "@/components/seo";
import { PredictionFilters } from "@/components/prediction/PredictionFilters";
import { SignalStrengthMeter } from "@/components/prediction/SignalStrengthMeter";
import { PerformanceTracker } from "@/components/prediction/PerformanceTracker";
import { EnhancedPredictionCard } from "@/components/prediction/EnhancedPredictionCard";
import { GlobalTokenSearch } from "@/components/prediction/GlobalTokenSearch";
import { GlobalToken } from "@/hooks/useGlobalTokenSearch";

const timeframes = [
  { id: 'daily', label: 'Today', icon: Clock, description: 'Intraday predictions with support/resistance levels' },
  { id: 'weekly', label: 'This Week', icon: Calendar, description: 'Swing trading forecasts with breakout analysis' },
  { id: 'monthly', label: 'This Month', icon: CalendarDays, description: 'Investment outlook with macro factors' },
];

const features = [
  { icon: Zap, title: 'AI + 50 Indicators', description: 'SSL Hybrid, KHAN SMC, RSI, MACD, Binocular Trend & more' },
  { icon: Target, title: 'Trading Zones', description: 'Entry, Stop-Loss, TP1/TP2/TP3 with Risk:Reward ratios' },
  { icon: Shield, title: 'Risk Assessment', description: 'Volatility regime, market structure & confidence scores' },
  { icon: Globe, title: 'Global Coverage', description: 'Search ANY token worldwide by name, symbol or contract' },
];

// Generate sentiment based on symbol hash + price data
function generateSentiment(symbol: string, change24h: number): { 
  bias: 'bullish' | 'bearish' | 'neutral'; 
  confidence: number; 
  signalStrength: number; 
  indicatorAlignment: number 
} {
  const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  // Bias based on price change + some randomization
  let bias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (change24h > 3) bias = 'bullish';
  else if (change24h < -3) bias = 'bearish';
  else if (change24h > 0) bias = hash % 2 === 0 ? 'bullish' : 'neutral';
  else if (change24h < 0) bias = hash % 2 === 0 ? 'bearish' : 'neutral';
  
  const confidence = Math.min(90, Math.max(45, 55 + Math.abs(change24h) * 2 + (hash % 20)));
  
  return {
    bias,
    confidence,
    signalStrength: Math.floor(confidence * 0.9 + (hash % 10)),
    indicatorAlignment: Math.floor(25 + (hash % 20))
  };
}

export default function PredictionHub() {
  const navigate = useNavigate();
  const { data: pricesData, isLoading, refetch, isFetching } = useCryptoPrices();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | '80' | '60' | '40'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'change' | 'marketCap' | 'name'>('confidence');
  const [searchedTokens, setSearchedTokens] = useState<GlobalToken[]>([]);
  const [addedTokens, setAddedTokens] = useState<GlobalToken[]>([]);

  // Handle search results
  const handleSearchResults = useCallback((tokens: GlobalToken[]) => {
    setSearchedTokens(tokens);
  }, []);

  // Handle token selection from search - navigate to prediction detail page
  const handleTokenSelect = useCallback((token: GlobalToken) => {
    // Navigate to the prediction detail page for this token
    const tokenSlug = token.id || token.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/price-prediction/${tokenSlug}/daily`);
  }, [navigate]);

  // Get default 10 tokens + added tokens
  const displayCryptos = useMemo(() => {
    // Start with added tokens from search
    const addedWithPrices = addedTokens.map(token => {
      const priceData = pricesData?.prices?.find(
        p => p.symbol.toLowerCase() === token.symbol.toLowerCase()
      );
      const change24h = token.change24h ?? priceData?.change24h ?? 0;
      const sentiment = generateSentiment(token.symbol, change24h);
      return {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        price: token.price || priceData?.price || 0,
        change24h,
        marketCap: token.marketCap || priceData?.marketCap || 0,
        volume24h: token.volume24h,
        address: token.address,
        chain: token.chain,
        ...sentiment
      };
    });

    // Add default top 10 tokens
    const defaultTokens = TOP_50_CRYPTOS.slice(0, 10).map(crypto => {
      const priceData = pricesData?.prices?.find(
        p => p.symbol.toLowerCase() === crypto.symbol.toLowerCase()
      );
      const change24h = priceData?.change24h ?? 0;
      const sentiment = generateSentiment(crypto.symbol, change24h);
      return {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        price: priceData?.price || 0,
        change24h,
        marketCap: priceData?.marketCap || 0,
        volume24h: undefined as number | undefined,
        address: undefined as string | undefined,
        chain: undefined as string | undefined,
        ...sentiment
      };
    });

    // Filter out duplicates (if added token already in default)
    const allTokens = [...addedWithPrices];
    defaultTokens.forEach(dt => {
      if (!allTokens.find(at => at.symbol.toLowerCase() === dt.symbol.toLowerCase())) {
        allTokens.push(dt);
      }
    });

    return allTokens;
  }, [pricesData, addedTokens]);

  // Filter and sort cryptos
  const filteredCryptos = useMemo(() => {
    let result = displayCryptos.filter(crypto => {
      const matchesSearch = !searchQuery || 
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || crypto.bias === selectedCategory;
      const matchesConfidence = confidenceFilter === 'all' || crypto.confidence >= parseInt(confidenceFilter);
      return matchesSearch && matchesCategory && matchesConfidence;
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
  }, [displayCryptos, searchQuery, selectedCategory, confidenceFilter, sortBy]);

  // Get high conviction signals for SignalStrengthMeter
  const highConvictionSignals = useMemo(() => {
    return displayCryptos
      .filter(c => c.confidence >= 65)
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
        title="AI Crypto Predictions | Global Token Analysis | Oracle Bull"
        description="Get AI-powered predictions for ANY cryptocurrency worldwide. Search by name, symbol, or contract address. 50+ indicators including SSL Hybrid, KHAN SMC, RSI, MACD. Daily, weekly, monthly forecasts."
        keywords="crypto prediction, token analysis, bitcoin prediction, any crypto forecast, contract address search, AI trading signals"
        canonicalPath="/predictions"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Global Crypto Predictions Hub",
            "description": "AI-powered predictions for any cryptocurrency worldwide with 50+ technical indicators",
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
          <section className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <Globe className="w-3 h-3 mr-1" />
              Global Token Coverage
            </Badge>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              <span className="glow-text">AI Predictions for Any Token</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-4">
              Search any cryptocurrency in the world by <strong>name</strong>, <strong>symbol</strong>, or <strong>contract address</strong>. 
              Get instant AI analysis with 50+ technical indicators.
            </p>
          </section>

          {/* Global Search - Prominent Position */}
          <section className="mb-8 relative" style={{ zIndex: 100 }}>
            <div className="holo-card p-6 overflow-visible">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Search Any Token Globally</h2>
              </div>
              <GlobalTokenSearch 
                onSelect={handleTokenSelect}
                onSearchResults={handleSearchResults}
                placeholder="Enter token name, symbol (e.g., PEPE), or paste contract address (0x...)..."
              />
              {addedTokens.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Added tokens:</span>
                  {addedTokens.map((t, i) => (
                    <Badge key={`${t.id}-${i}`} variant="secondary" className="text-xs">
                      {t.symbol.toUpperCase()}
                      {t.chain && <span className="ml-1 opacity-60">({t.chain})</span>}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature) => (
              <div key={feature.title} className="holo-card p-4 text-center">
                <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="font-display text-sm font-bold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </section>

          {/* Timeframe Quick Links */}
          <section className="mb-8">
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
              Token Predictions
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredCryptos.length} tokens • Default 10 + your searches)
              </span>
            </h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
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
                {filteredCryptos.map((crypto, idx) => (
                  <EnhancedPredictionCard key={`${crypto.id}-${idx}`} crypto={crypto} />
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
              About Global Crypto Predictions
            </h2>
            <div className="prose max-w-none text-muted-foreground">
              <p className="mb-4">
                Oracle Bull provides AI-powered cryptocurrency predictions for <strong>any token in the world</strong>. 
                Simply search by name, symbol, or paste a contract address to get instant analysis with 50+ technical indicators 
                including SSL Hybrid, KHAN SMC (Smart Money Concepts), RSI, MACD, Binocular Trend, and more.
              </p>
              <p className="mb-4">
                Our analysis covers <strong>daily predictions</strong> for day traders seeking intraday 
                support and resistance levels, <strong>weekly forecasts</strong> for swing traders looking for breakout 
                opportunities, and <strong>monthly outlooks</strong> for investors considering macro trends.
              </p>
              <p>
                Each prediction includes precise <strong>trading zones</strong> with entry points, stop-loss levels, and multiple 
                take-profit targets (TP1, TP2, TP3). Our <strong>market structure analysis</strong> identifies Break of Structure (BoS), 
                Change of Character (CHoCH), and trend strength using professional-grade indicators.
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
                { q: "Can I search any token by contract address?", a: "Yes! Paste any ERC-20, SPL, or other token contract address and we'll analyze it using real-time on-chain data across all major blockchains." },
                { q: "What indicators do you use?", a: "We use 50+ indicators including SSL Hybrid, KHAN SMC (Smart Money Concepts), RSI, MACD, Bollinger Bands, EMA ribbons, volume analysis, and more." },
                { q: "What is Break of Structure (BoS)?", a: "BoS is a Smart Money Concept that identifies when price breaks a previous swing high/low with momentum, signaling potential trend continuation." },
                { q: "How are trading zones calculated?", a: "Trading zones use ATR-based volatility, support/resistance levels, and risk:reward optimization to provide entry, stop-loss, and take-profit targets." },
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
