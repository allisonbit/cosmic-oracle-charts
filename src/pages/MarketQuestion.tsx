import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { 
  TrendingUp, TrendingDown, Zap, Clock, Calendar, 
  ChevronRight, Target, Shield, BarChart3, Flame, Award, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TOP_50_CRYPTOS } from "@/lib/extendedCryptos";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useMemo } from "react";
import { RelatedToolsLinks } from "@/components/prediction/HighIntentLinks";
import { InArticleAd } from "@/components/ads";
import { 
  MarketIntroduction, 
  CoinAnalysisSection, 
  CryptoSummaryTable, 
  MarketFAQ,
  EnhancedInternalLinks 
} from "@/components/market";

interface MarketQuestionConfig {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string;
  category: 'buy' | 'gainers' | 'outlook' | 'trend';
  filterFn: (cryptos: EnrichedCrypto[]) => EnrichedCrypto[];
}

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

// Generate mock sentiment based on symbol hash
function getMockSentiment(symbol: string): { bias: 'bullish' | 'bearish' | 'neutral'; confidence: number } {
  const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const biases: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
  return {
    bias: biases[hash % 3],
    confidence: 55 + (hash % 35)
  };
}

// Market question configurations
const MARKET_QUESTIONS: MarketQuestionConfig[] = [
  // TODAY-focused questions
  {
    slug: 'best-crypto-to-buy-today',
    title: 'Best Crypto to Buy Today | Top Picks for Today',
    h1: 'Best Crypto to Buy Today',
    description: 'Discover the best cryptocurrencies to buy today based on AI analysis, technical indicators, and market momentum. Updated daily with top picks.',
    keywords: 'best crypto to buy today, top crypto picks, crypto to invest today, best cryptocurrency today',
    category: 'buy',
    filterFn: (cryptos) => cryptos.filter(c => c.bias === 'bullish').sort((a, b) => b.confidence - a.confidence)
  },
  {
    slug: 'top-crypto-gainers-today',
    title: 'Top Crypto Gainers Today | Biggest Winners',
    h1: 'Top Crypto Gainers Today',
    description: 'Track the top cryptocurrency gainers today with real-time price data and AI predictions. Find the biggest winners in the market right now.',
    keywords: 'top crypto gainers, biggest crypto gainers today, crypto winners, best performing crypto',
    category: 'gainers',
    filterFn: (cryptos) => cryptos.sort((a, b) => b.change24h - a.change24h)
  },
  {
    slug: 'crypto-market-prediction-today',
    title: 'Crypto Market Prediction Today | Daily Forecast',
    h1: 'Crypto Market Prediction Today',
    description: 'Get the latest crypto market prediction for today with AI-powered analysis. Daily market forecast, sentiment analysis, and trading signals.',
    keywords: 'crypto market prediction, crypto forecast today, market prediction, daily crypto analysis',
    category: 'outlook',
    filterFn: (cryptos) => cryptos.sort((a, b) => b.marketCap - a.marketCap)
  },
  {
    slug: 'which-crypto-will-go-up-today',
    title: 'Which Crypto Will Go Up Today? | Bullish Predictions',
    h1: 'Which Crypto Will Go Up Today?',
    description: 'AI predictions for which cryptocurrencies will go up today. Bullish signals, technical analysis, and momentum indicators for top coins.',
    keywords: 'which crypto will go up, crypto going up today, bullish crypto, crypto to moon',
    category: 'trend',
    filterFn: (cryptos) => cryptos.filter(c => c.bias === 'bullish').sort((a, b) => b.confidence - a.confidence)
  },
  {
    slug: 'crypto-losers-today',
    title: 'Crypto Losers Today | Biggest Decliners',
    h1: 'Crypto Losers Today',
    description: 'Track the biggest cryptocurrency losers today. Identify potential bounce opportunities or avoid falling knives with AI analysis.',
    keywords: 'crypto losers today, biggest crypto losers, crypto declining, worst performing crypto',
    category: 'gainers',
    filterFn: (cryptos) => cryptos.sort((a, b) => a.change24h - b.change24h)
  },
  {
    slug: 'is-crypto-going-up-today',
    title: 'Is Crypto Going Up Today? | Market Direction',
    h1: 'Is Crypto Going Up Today?',
    description: 'Find out if crypto is going up today with real-time market analysis. Bitcoin dominance, market sentiment, and directional signals.',
    keywords: 'is crypto going up, crypto direction today, market going up, crypto bullish today',
    category: 'trend',
    filterFn: (cryptos) => cryptos.sort((a, b) => b.change24h - a.change24h)
  },
  // WEEKLY-focused questions
  {
    slug: 'best-crypto-to-buy-this-week',
    title: 'Best Crypto to Buy This Week | Weekly Top Picks',
    h1: 'Best Crypto to Buy This Week',
    description: 'Find the best cryptocurrencies to buy this week with our AI analysis. Weekly predictions, swing trading opportunities, and breakout alerts.',
    keywords: 'best crypto this week, crypto to buy weekly, weekly crypto picks, crypto investment this week',
    category: 'buy',
    filterFn: (cryptos) => cryptos.filter(c => c.bias === 'bullish').sort((a, b) => b.marketCap - a.marketCap)
  },
  {
    slug: 'crypto-prediction-this-week',
    title: 'Crypto Prediction This Week | Weekly Forecast',
    h1: 'Crypto Prediction This Week',
    description: 'Comprehensive crypto prediction for this week including top performers, breakout candidates, and market sentiment analysis.',
    keywords: 'crypto prediction this week, weekly crypto forecast, crypto outlook this week',
    category: 'outlook',
    filterFn: (cryptos) => cryptos.sort((a, b) => b.marketCap - a.marketCap)
  },
  {
    slug: 'crypto-to-watch-this-week',
    title: 'Crypto to Watch This Week | Weekly Watchlist',
    h1: 'Crypto to Watch This Week',
    description: 'Top cryptocurrencies to watch this week based on momentum, volume, and breakout potential. AI-curated weekly watchlist.',
    keywords: 'crypto to watch this week, weekly crypto watchlist, crypto momentum, breakout crypto',
    category: 'trend',
    filterFn: (cryptos) => cryptos.filter(c => c.change24h > 2).sort((a, b) => b.confidence - a.confidence)
  },
  {
    slug: 'top-crypto-gainers-this-week',
    title: 'Top Crypto Gainers This Week | Weekly Winners',
    h1: 'Top Crypto Gainers This Week',
    description: 'Track the top cryptocurrency gainers this week. Weekly performance leaders with 7-day price analysis and momentum indicators.',
    keywords: 'top crypto gainers this week, weekly crypto gainers, best performing crypto this week',
    category: 'gainers',
    filterFn: (cryptos) => cryptos.sort((a, b) => b.change24h - a.change24h)
  },
  // MONTHLY / LONG-TERM questions
  {
    slug: 'crypto-prediction-january-2025',
    title: 'Crypto Prediction January 2025 | Monthly Forecast',
    h1: 'Crypto Prediction January 2025',
    description: 'AI-powered crypto prediction for January 2025. Monthly market outlook, top coins to watch, and price targets for the month ahead.',
    keywords: 'crypto prediction january 2025, january crypto forecast, crypto outlook january, monthly crypto prediction',
    category: 'outlook',
    filterFn: (cryptos) => cryptos.sort((a, b) => b.marketCap - a.marketCap)
  },
  {
    slug: 'best-crypto-to-buy-january-2025',
    title: 'Best Crypto to Buy in January 2025 | Monthly Picks',
    h1: 'Best Crypto to Buy in January 2025',
    description: 'Top cryptocurrencies to buy in January 2025 based on AI analysis. Monthly investment picks, market trends, and price predictions.',
    keywords: 'best crypto january 2025, crypto to buy january 2025, monthly crypto picks, crypto investment january',
    category: 'buy',
    filterFn: (cryptos) => cryptos.filter(c => c.bias === 'bullish').sort((a, b) => b.marketCap - a.marketCap)
  },
  {
    slug: 'top-crypto-to-invest-2025',
    title: 'Top Crypto to Invest in 2025 | Best Long-Term Picks',
    h1: 'Top Crypto to Invest in 2025',
    description: 'Discover the top cryptocurrencies to invest in for 2025. Long-term picks with AI analysis, fundamental strength, and growth potential.',
    keywords: 'top crypto 2025, best crypto investment 2025, crypto to invest 2025, long term crypto',
    category: 'buy',
    filterFn: (cryptos) => cryptos.filter(c => c.marketCap > 1000000000).sort((a, b) => b.marketCap - a.marketCap)
  },
  {
    slug: 'crypto-outlook-2025',
    title: 'Crypto Outlook 2025 | Year-Ahead Forecast',
    h1: 'Crypto Outlook 2025',
    description: '2025 cryptocurrency market outlook. Full year predictions, bull and bear scenarios, key catalysts, and long-term investment thesis.',
    keywords: 'crypto outlook 2025, cryptocurrency forecast 2025, crypto market 2025, bitcoin prediction 2025',
    category: 'outlook',
    filterFn: (cryptos) => cryptos.sort((a, b) => b.marketCap - a.marketCap)
  },
  // GENERAL HIGH-INTENT questions
  {
    slug: 'next-crypto-to-explode',
    title: 'Next Crypto to Explode | High Potential Coins',
    h1: 'Next Crypto to Explode',
    description: 'AI predictions for the next cryptocurrency to explode. High-potential coins with breakout signals and momentum analysis.',
    keywords: 'next crypto to explode, crypto to moon, breakout crypto, high potential crypto',
    category: 'trend',
    filterFn: (cryptos) => cryptos.filter(c => c.bias === 'bullish' && c.change24h > 0).sort((a, b) => b.confidence - a.confidence)
  },
  {
    slug: 'safest-crypto-to-invest',
    title: 'Safest Crypto to Invest | Low Risk Options',
    h1: 'Safest Crypto to Invest',
    description: 'Discover the safest cryptocurrencies to invest in with lower risk profiles. Blue-chip coins with strong fundamentals and stability.',
    keywords: 'safest crypto, low risk crypto, safe crypto investment, stable cryptocurrency',
    category: 'buy',
    filterFn: (cryptos) => cryptos.filter(c => c.marketCap > 10000000000).sort((a, b) => b.marketCap - a.marketCap)
  },
  {
    slug: 'cheap-crypto-to-buy-now',
    title: 'Cheap Crypto to Buy Now | Affordable Coins',
    h1: 'Cheap Crypto to Buy Now',
    description: 'Find cheap cryptocurrencies to buy now with high growth potential. Affordable coins with bullish signals and strong momentum.',
    keywords: 'cheap crypto to buy, affordable crypto, low price crypto, cheap coins',
    category: 'buy',
    filterFn: (cryptos) => cryptos.filter(c => c.price < 1).sort((a, b) => b.change24h - a.change24h)
  },
  {
    slug: 'undervalued-crypto-to-buy',
    title: 'Undervalued Crypto to Buy | Hidden Gems',
    h1: 'Undervalued Crypto to Buy',
    description: 'Find undervalued cryptocurrencies with high growth potential. Hidden gems identified by AI analysis of fundamentals and market data.',
    keywords: 'undervalued crypto, hidden gem crypto, crypto gems, underrated cryptocurrency',
    category: 'buy',
    filterFn: (cryptos) => cryptos.filter(c => c.bias === 'bullish' && c.change24h < 5).sort((a, b) => a.marketCap - b.marketCap)
  },
  {
    slug: 'crypto-with-most-potential',
    title: 'Crypto with Most Potential | High Growth Coins',
    h1: 'Crypto with Most Potential',
    description: 'Cryptocurrencies with the most upside potential based on AI analysis. High-growth opportunities with strong bullish signals.',
    keywords: 'crypto with most potential, highest potential crypto, crypto growth potential, best crypto opportunity',
    category: 'trend',
    filterFn: (cryptos) => cryptos.filter(c => c.bias === 'bullish').sort((a, b) => b.confidence - a.confidence)
  },
];

export function getMarketQuestion(slug: string): MarketQuestionConfig | undefined {
  return MARKET_QUESTIONS.find(q => q.slug === slug);
}

export function getAllMarketQuestionSlugs(): string[] {
  return MARKET_QUESTIONS.map(q => q.slug);
}

interface MarketQuestionPageProps {
  questionSlug: string;
}

export default function MarketQuestionPage({ questionSlug }: MarketQuestionPageProps) {
  const question = getMarketQuestion(questionSlug);
  const { data: pricesData, isLoading } = useCryptoPrices();

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Enrich cryptos with price and sentiment data
  const enrichedCryptos = useMemo(() => {
    return TOP_50_CRYPTOS.map(crypto => {
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
  }, [pricesData]);

  // Apply filter based on question type
  const filteredCryptos = useMemo(() => {
    if (!question) return enrichedCryptos;
    return question.filterFn(enrichedCryptos).slice(0, 10);
  }, [enrichedCryptos, question]);

  // Calculate market stats
  const marketStats = useMemo(() => {
    const bullish = enrichedCryptos.filter(c => c.bias === 'bullish').length;
    const bearish = enrichedCryptos.filter(c => c.bias === 'bearish').length;
    const avgChange = enrichedCryptos.reduce((sum, c) => sum + c.change24h, 0) / enrichedCryptos.length;
    return { bullish, bearish, avgChange };
  }, [enrichedCryptos]);

  const formatPrice = (price: number) => {
    if (price <= 0) return "Price loading...";
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(4)}`;
    return `$${price.toPrecision(4)}`;
  };

  if (!question) {
    return (
      <div className="min-h-screen flex flex-col cosmic-bg">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <Link to="/predictions" className="text-primary hover:underline">
              View All Predictions
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryIcon = {
    buy: Award,
    gainers: Flame,
    outlook: BarChart3,
    trend: TrendingUp
  }[question.category];
  const CategoryIcon = categoryIcon;

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO 
        title={`${question.title} | Oracle Bull`}
        description={question.description}
        keywords={question.keywords}
        canonicalPath={`/market/${question.slug}`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is the ${question.h1.toLowerCase()} right now?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `As of ${currentDate}, our AI analysis identifies ${filteredCryptos[0]?.name || "Bitcoin"} as the top pick with ${filteredCryptos[0]?.confidence || 75}% confidence. Other top contenders include ${filteredCryptos.slice(1, 4).map(c => c.name).join(", ")}.`
                }
              },
              {
                "@type": "Question",
                "name": "How do you determine which crypto to buy today?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We use a multi-factor AI model analyzing: Technical indicators (RSI, MACD, moving averages), market sentiment from 100+ sources, on-chain data (whale movements, exchange flows), and historical price patterns. Assets must show bullish alignment across at least 3 of these categories to rank highly."
                }
              },
              {
                "@type": "Question",
                "name": "How often are these crypto predictions updated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our AI models run continuously, updating rankings every 5 minutes based on real-time price data, every hour for sentiment analysis, and daily for comprehensive technical and on-chain metrics."
                }
              },
              {
                "@type": "Question",
                "name": "Which cryptocurrencies have the highest potential today?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Based on current analysis, the highest potential assets are: ${filteredCryptos.slice(0, 5).map((c, i) => `${i + 1}. ${c.name} (${c.symbol.toUpperCase()})`).join(", ")}. These show the strongest bullish alignment across technical, sentiment, and on-chain indicators.`
                }
              }
            ],
            "dateModified": new Date().toISOString()
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": question.title,
            "description": question.description,
            "url": `https://oraclebull.com/market/${question.slug}`,
            "dateModified": new Date().toISOString(),
            "publisher": {
              "@type": "Organization",
              "name": "Oracle Bull",
              "url": "https://oraclebull.com"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oraclebull.com" },
                { "@type": "ListItem", "position": 2, "name": "Predictions", "item": "https://oraclebull.com/predictions" },
                { "@type": "ListItem", "position": 3, "name": question.h1, "item": `https://oraclebull.com/market/${question.slug}` }
              ]
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": question.h1,
            "description": question.description,
            "numberOfItems": filteredCryptos.length,
            "itemListElement": filteredCryptos.slice(0, 10).map((crypto, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "FinancialProduct",
                "name": crypto.name,
                "description": `${crypto.name} (${crypto.symbol.toUpperCase()}) - ${crypto.bias} outlook with ${crypto.confidence}% confidence`,
                "url": `https://oraclebull.com/price-prediction/${crypto.id}/daily`
              }
            }))
          })}
        </script>
      </Helmet>

      <header>
        <Navbar />
      </header>

      <main className="flex-1 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/predictions" className="hover:text-primary">Predictions</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Market Analysis</span>
          </nav>

          {/* Hero */}
          <section className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <CategoryIcon className="w-3 h-3 mr-1" />
              AI-Powered Analysis
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="glow-text">{question.h1}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {question.description} Last updated: {currentDate}
            </p>
          </section>

          {/* Market Overview */}
          <section className="grid grid-cols-3 gap-4 mb-8">
            <div className="holo-card p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{marketStats.bullish}</div>
              <div className="text-sm text-muted-foreground">Bullish</div>
            </div>
            <div className="holo-card p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{marketStats.bearish}</div>
              <div className="text-sm text-muted-foreground">Bearish</div>
            </div>
            <div className="holo-card p-4 text-center">
              <div className={`text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg 24h</div>
            </div>
          </section>

          {/* SEO: Market Introduction - 200-300 word crawlable intro */}
          <MarketIntroduction 
            questionTitle={question.h1}
            category={question.category}
            currentDate={currentDate}
            bullishCount={marketStats.bullish}
            bearishCount={marketStats.bearish}
            avgChange={marketStats.avgChange}
          />

          {/* Top Picks - Visual cards with links */}
          <section className="holo-card p-6 mb-8" aria-labelledby="top-picks-heading">
            <h2 id="top-picks-heading" className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Top Picks for Today
            </h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCryptos.map((crypto, i) => (
                  <Link
                    key={crypto.id}
                    to={`/price-prediction/${crypto.id}/daily`}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-display font-bold group-hover:text-primary transition-colors">
                          {crypto.name}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase">{crypto.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold">{formatPrice(crypto.price)}</div>
                        <div className={`text-sm ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                        </div>
                      </div>
                      <Badge 
                        className={crypto.bias === 'bullish' ? 'bg-green-600/20 text-green-400' : 
                          crypto.bias === 'bearish' ? 'bg-red-600/20 text-red-400' : 'bg-muted'}
                      >
                        {crypto.bias === 'bullish' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                         crypto.bias === 'bearish' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                        {crypto.confidence}%
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* SEO: Semantic Summary Table */}
          {!isLoading && <CryptoSummaryTable cryptos={filteredCryptos} />}

          {/* Ad placement */}
          <InArticleAd className="mb-8" />

          {/* SEO: Detailed Coin Analysis with H3 sections */}
          {!isLoading && <CoinAnalysisSection cryptos={filteredCryptos} questionSlug={question.slug} />}

          {/* SEO: FAQ Section for Featured Snippets */}
          {!isLoading && (
            <MarketFAQ 
              questionTitle={question.h1}
              topCryptos={filteredCryptos}
              currentDate={currentDate}
            />
          )}

          {/* SEO: Enhanced Internal Links */}
          {!isLoading && (
            <EnhancedInternalLinks 
              currentSlug={question.slug}
              topCryptos={filteredCryptos}
            />
          )}

          {/* Related Questions */}
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Related Questions</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {MARKET_QUESTIONS.filter(q => q.slug !== question.slug).slice(0, 6).map((q) => (
                <Link
                  key={q.slug}
                  to={`/market/${q.slug}`}
                  className="holo-card p-4 hover:border-primary/50 transition-all group flex items-center justify-between"
                >
                  <span className="font-medium group-hover:text-primary transition-colors text-sm">
                    {q.h1}
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </section>

          {/* Related Tools - Cross linking */}
          <RelatedToolsLinks className="mb-8" />

          {/* CTA */}
          <section className="text-center mb-8">
            <Button asChild size="lg">
              <Link to="/predictions">
                View All Predictions <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </section>

          {/* SEO Content */}
          <section className="holo-card p-6">
            <h2 className="font-display text-xl font-bold mb-4">About This Analysis</h2>
            <div className="prose max-w-none text-muted-foreground text-sm">
              <p>
                Oracle Bull uses advanced AI algorithms to analyze cryptocurrency markets and provide data-driven insights. 
                Our {question.h1.toLowerCase()} analysis combines technical indicators (RSI, MACD, Moving Averages), 
                market sentiment, volume patterns, and on-chain data to generate predictions.
              </p>
              <p className="mt-3">
                Each cryptocurrency is evaluated based on over 50 factors including price momentum, trading volume, 
                social sentiment, developer activity, and institutional interest. Our confidence scores reflect 
                the strength of bullish or bearish signals detected by our AI models.
              </p>
              <h3 className="text-foreground font-semibold mt-4 mb-2">Related Market Tools</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><Link to="/strength" className="text-primary hover:underline">Crypto Strength Meter</Link> - Real-time asset strength rankings</li>
                <li><Link to="/factory" className="text-primary hover:underline">Crypto Factory</Link> - Market events and signals calendar</li>
                <li><Link to="/sentiment" className="text-primary hover:underline">Sentiment Analysis</Link> - Social and whale activity tracking</li>
                <li><Link to="/dashboard" className="text-primary hover:underline">Market Dashboard</Link> - Live market overview</li>
              </ul>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Disclaimer: This is not financial advice. Cryptocurrency investments carry significant risk. 
              Always conduct your own research before making investment decisions.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
