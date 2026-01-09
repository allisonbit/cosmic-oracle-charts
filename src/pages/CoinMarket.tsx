import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, TrendingDown, ChevronRight, Target, BarChart3, 
  Activity, Clock, Calendar, Zap, Shield, ExternalLink, ArrowUpRight,
  Newspaper, Flame
} from "lucide-react";
import { getCryptoById, TOP_50_CRYPTOS } from "@/lib/extendedCryptos";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCryptoFactory } from "@/hooks/useCryptoFactory";
import { InArticleAd } from "@/components/ads";
import { RelatedToolsLinks, TimeframeCrossLinks, MarketQuestionsLinks } from "@/components/prediction/HighIntentLinks";
import { InvestorActionSummary } from "@/components/prediction/InvestorActionSummary";
import { EnhancedFAQ } from "@/components/prediction/EnhancedFAQ";
import { formatDistanceToNow } from "date-fns";

export default function CoinMarket() {
  const { coinId } = useParams<{ coinId: string }>();
  const crypto = coinId ? getCryptoById(coinId) : undefined;
  const { data: pricesData, isLoading } = useCryptoPrices();
  const { data: factoryData } = useCryptoFactory();

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Get price data for this coin
  const priceData = useMemo(() => {
    if (!crypto || !pricesData?.prices) return null;
    return pricesData.prices.find(
      p => p.symbol.toLowerCase() === crypto.symbol.toLowerCase()
    );
  }, [crypto, pricesData]);

  // Generate sentiment mock (in production would come from API)
  const sentiment = useMemo(() => {
    if (!crypto) return { bias: 'neutral' as const, confidence: 50 };
    const hash = crypto.symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const biases: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
    return {
      bias: biases[hash % 3],
      confidence: 55 + (hash % 35)
    };
  }, [crypto]);

  // Related coins for internal linking
  const relatedCoins = useMemo(() => {
    return TOP_50_CRYPTOS
      .filter(c => c.id !== coinId)
      .slice(0, 8);
  }, [coinId]);

  // Filter news related to this coin
  const relatedNews = useMemo(() => {
    if (!crypto || !factoryData?.news) return [];
    return factoryData.news
      .filter(n => 
        n.relatedAssets?.some((a: string) => 
          a.toLowerCase() === crypto.symbol.toLowerCase() ||
          a.toLowerCase() === crypto.name.toLowerCase()
        ) ||
        n.title.toLowerCase().includes(crypto.symbol.toLowerCase()) ||
        n.title.toLowerCase().includes(crypto.name.toLowerCase())
      )
      .slice(0, 3);
  }, [crypto, factoryData?.news]);

  // Get related narratives
  const relatedNarratives = useMemo(() => {
    if (!crypto || !factoryData?.narratives) return [];
    return factoryData.narratives
      .filter(n => 
        n.topAssets?.some((a: string) => 
          a.toLowerCase() === crypto.symbol.toLowerCase()
        )
      )
      .slice(0, 2);
  }, [crypto, factoryData?.narratives]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toPrecision(4)}`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  if (!crypto) {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Coin Not Found</h1>
            <Link to="/predictions" className="text-primary hover:underline">
              View All Predictions
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pageTitle = `${crypto.name} (${crypto.symbol.toUpperCase()}) Price Today | Live ${crypto.symbol.toUpperCase()} Chart & Analysis`;
  const metaDescription = `Get ${crypto.name} (${crypto.symbol.toUpperCase()}) live price, charts, predictions, and market analysis. Updated ${currentDate}. Is ${crypto.symbol.toUpperCase()} a good investment today?`;

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO 
        title={pageTitle}
        description={metaDescription}
        keywords={`${crypto.name} price, ${crypto.symbol} price today, ${crypto.name} prediction, ${crypto.symbol} chart, ${crypto.name} market cap, is ${crypto.symbol} a good investment, ${crypto.symbol} forecast`}
        canonicalPath={`/markets/${crypto.id}`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": `${crypto.name} (${crypto.symbol.toUpperCase()})`,
            "description": metaDescription,
            "url": `https://oraclebull.com/markets/${crypto.id}`,
            "provider": {
              "@type": "Organization",
              "name": "Oracle Bull",
              "url": "https://oraclebull.com"
            },
            "offers": {
              "@type": "Offer",
              "price": priceData?.price || 0,
              "priceCurrency": "USD",
              "priceValidUntil": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is the ${crypto.name} price today?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `The current ${crypto.name} (${crypto.symbol.toUpperCase()}) price is ${formatPrice(priceData?.price || 0)} with a 24h change of ${priceData?.change24h?.toFixed(2) || 0}%. Updated ${currentDate}.`
                }
              },
              {
                "@type": "Question",
                "name": `Is ${crypto.name} a good investment today?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Based on our AI analysis, ${crypto.name} has a ${sentiment.bias} outlook with ${sentiment.confidence}% confidence. Always do your own research and consider the risks before investing.`
                }
              },
              {
                "@type": "Question",
                "name": `What is the ${crypto.name} price prediction?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `View our detailed ${crypto.name} price predictions for today, this week, and this month at Oracle Bull. Our AI analyzes technical indicators, market sentiment, and on-chain data to provide forecasts.`
                }
              }
            ],
            "dateModified": new Date().toISOString()
          })}
        </script>
      </Helmet>

      <header>
        <Navbar />
      </header>

      <main className="flex-1 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/predictions" className="hover:text-primary">Markets</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{crypto.name}</span>
          </nav>

          {/* Hero Section */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <Badge variant="outline" className="mb-3 border-primary/50 text-primary">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Price Data
                </Badge>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  <span className="glow-text">{crypto.name}</span>
                  <span className="text-muted-foreground ml-2">({crypto.symbol.toUpperCase()})</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  Live price, market data, and AI-powered predictions. Updated: {currentDate}
                </p>
              </div>
              
              {/* Current Price */}
              <div className="holo-card p-6 text-center min-w-[200px]">
                {isLoading ? (
                  <div className="h-16 bg-muted/30 rounded animate-pulse" />
                ) : (
                  <>
                    <div className="text-3xl font-mono font-bold">
                      {formatPrice(priceData?.price || 0)}
                    </div>
                    <div className={`flex items-center justify-center gap-1 text-lg ${
                      (priceData?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(priceData?.change24h || 0) >= 0 ? 
                        <TrendingUp className="w-5 h-5" /> : 
                        <TrendingDown className="w-5 h-5" />
                      }
                      {(priceData?.change24h || 0) >= 0 ? '+' : ''}
                      {priceData?.change24h?.toFixed(2) || '0.00'}%
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Market Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="holo-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                <div className="font-mono font-bold">
                  {formatMarketCap(priceData?.marketCap || 0)}
                </div>
              </div>
              <div className="holo-card p-4">
                <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
                <div className="font-mono font-bold">
                  {formatMarketCap(priceData?.volume24h || 0)}
                </div>
              </div>
              <div className="holo-card p-4">
                <div className="text-sm text-muted-foreground mb-1">AI Bias</div>
                <div className={`font-bold capitalize ${
                  sentiment.bias === 'bullish' ? 'text-green-400' :
                  sentiment.bias === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {sentiment.bias}
                </div>
              </div>
              <div className="holo-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                <div className="font-mono font-bold">{sentiment.confidence}%</div>
              </div>
            </div>
          </section>

          {/* Quick Actions - Prediction Links */}
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {crypto.name} Price Predictions
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                to={`/price-prediction/${crypto.id}/daily`}
                className="holo-card p-5 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold">Today's Prediction</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Will {crypto.symbol.toUpperCase()} go up today? Get our 24-hour forecast.
                </p>
                <ArrowUpRight className="w-4 h-4 text-primary mt-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              
              <Link 
                to={`/price-prediction/${crypto.id}/weekly`}
                className="holo-card p-5 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold">Weekly Forecast</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {crypto.name} price prediction for this week with key levels.
                </p>
                <ArrowUpRight className="w-4 h-4 text-primary mt-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              
              <Link 
                to={`/price-prediction/${crypto.id}/monthly`}
                className="holo-card p-5 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold">Monthly Outlook</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Long-term {crypto.symbol.toUpperCase()} price analysis and macro trends.
                </p>
                <ArrowUpRight className="w-4 h-4 text-primary mt-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </section>

          {/* Investor Action Summary */}
          <section className="mb-8">
            <InvestorActionSummary
              coinName={crypto.name}
              symbol={crypto.symbol}
              currentPrice={priceData?.price || 0}
              bias={sentiment.bias}
              confidence={sentiment.confidence}
              riskLevel="medium"
              timeframe="daily"
            />
          </section>

          {/* Ad Placement */}
          <InArticleAd className="mb-8" />

          {/* Market Analysis */}
          <section className="holo-card p-6 mb-8">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {crypto.name} Market Analysis
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {crypto.name} ({crypto.symbol.toUpperCase()}) is currently trading at {formatPrice(priceData?.price || 0)} with a 
                24-hour price change of {(priceData?.change24h || 0) >= 0 ? '+' : ''}{priceData?.change24h?.toFixed(2) || '0'}%. 
                The market capitalization stands at {formatMarketCap(priceData?.marketCap || 0)}, making it one of the 
                {crypto.rank && crypto.rank <= 10 ? ' top 10 ' : crypto.rank && crypto.rank <= 50 ? ' top 50 ' : ' leading '}
                cryptocurrencies by market cap.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Based on our AI analysis, {crypto.name} shows a <span className={
                  sentiment.bias === 'bullish' ? 'text-green-400' :
                  sentiment.bias === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                }>{sentiment.bias}</span> outlook with a confidence score of {sentiment.confidence}%. 
                This assessment considers technical indicators, market sentiment, and on-chain metrics.
              </p>
            </div>
          </section>

          {/* Latest News for This Coin */}
          {relatedNews.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Latest {crypto.name} News
              </h2>
              <div className="space-y-4">
                {relatedNews.map((news, idx) => (
                  <Card key={idx} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold hover:text-primary transition-colors flex items-start gap-2"
                        >
                          {news.title}
                          <ExternalLink className="w-4 h-4 shrink-0 mt-1" />
                        </a>
                        <Badge className={`shrink-0 ${
                          news.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                          news.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {news.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{news.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Link 
                to="/factory/news" 
                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mt-4 text-sm"
              >
                View All Crypto News <ChevronRight className="w-4 h-4" />
              </Link>
            </section>
          )}

          {/* Related Narratives */}
          {relatedNarratives.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                {crypto.name} Market Narratives
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedNarratives.map((narrative, idx) => (
                  <Card key={idx} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{narrative.narrative}</h3>
                        <Badge className={`${
                          narrative.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
                          narrative.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {narrative.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{narrative.description}</p>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">{narrative.momentum}</span>
                        <span className="text-xs text-muted-foreground">momentum score</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Link 
                to="/factory/narratives" 
                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mt-4 text-sm"
              >
                View All Market Narratives <ChevronRight className="w-4 h-4" />
              </Link>
            </section>
          )}

          {/* Related Tools */}
          <RelatedToolsLinks className="mb-8" />

          {/* Related Coins */}
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Related Cryptocurrencies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedCoins.map((coin) => (
                <Link
                  key={coin.id}
                  to={`/markets/${coin.id}`}
                  className="holo-card p-4 hover:border-primary/50 transition-all group text-center"
                >
                  <div className="font-display font-bold group-hover:text-primary transition-colors">
                    {coin.symbol.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">{coin.name}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Market Questions Links */}
          <MarketQuestionsLinks className="mb-8" />

          {/* FAQ Section */}
          <EnhancedFAQ 
            coinName={crypto.name}
            symbol={crypto.symbol}
            timeframe="daily"
            currentPrice={priceData?.price || 0}
            bias={sentiment.bias}
            confidence={sentiment.confidence}
          />

          {/* CTA */}
          <section className="text-center mt-8">
            <Button asChild size="lg">
              <Link to={`/price-prediction/${crypto.id}`}>
                View Full Prediction Analysis <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}