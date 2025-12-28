import { useParams, Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { 
  TrendingUp, TrendingDown, Minus, Clock, Calendar, CalendarDays,
  ChevronRight, AlertTriangle, Target, Shield, BarChart3, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePricePrediction, getQuestionIntent, getCryptoBySlug, TOP_CRYPTOS, QUESTION_INTENTS } from "@/hooks/usePricePrediction";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionIntent() {
  const { slug } = useParams<{ slug: string }>();
  const questionData = slug ? getQuestionIntent(slug) : null;
  
  if (!questionData) {
    return <Navigate to="/predictions" replace />;
  }
  
  const cryptoData = getCryptoBySlug(questionData.coin);
  const { data: prediction, isLoading, error } = usePricePrediction(
    questionData.coin,
    cryptoData?.symbol || '',
    questionData.timeframe as 'daily' | 'weekly' | 'monthly',
    !!cryptoData
  );

  const timeframeIcon = questionData.timeframe === 'daily' ? Clock : 
    questionData.timeframe === 'weekly' ? Calendar : CalendarDays;
  const TimeIcon = timeframeIcon;

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Related questions for internal linking
  const relatedQuestions = QUESTION_INTENTS
    .filter(q => q.slug !== slug && (q.coin === questionData.coin || q.timeframe === questionData.timeframe))
    .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO 
        title={`${questionData.title} | ${currentDate} | Oracle Bull`}
        description={`${questionData.question} Get AI-powered ${cryptoData?.name || ''} price prediction for ${questionData.timeframe} with technical analysis, trading zones, and risk assessment. Updated ${currentDate}.`}
        keywords={`${cryptoData?.name} prediction, ${cryptoData?.symbol} price today, ${cryptoData?.name} forecast, will ${cryptoData?.symbol} go up, ${cryptoData?.name} ${questionData.timeframe} prediction`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": questionData.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": prediction ? 
                  `Based on our AI analysis, ${cryptoData?.name} shows a ${prediction.bias} bias with ${prediction.confidence}% confidence. Current price: ${formatPrice(prediction.currentPrice)}. ${prediction.summary}` :
                  `Our AI is analyzing ${cryptoData?.name} price data. Check back for the latest ${questionData.timeframe} prediction.`
              }
            }],
            "dateModified": new Date().toISOString()
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
            <Link to={`/price-prediction/${questionData.coin}`} className="hover:text-primary capitalize">
              {cryptoData?.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{questionData.timeframe}</span>
          </nav>

          {/* Hero Section */}
          <section className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <TimeIcon className="w-3 h-3 mr-1" />
              {questionData.timeframe.charAt(0).toUpperCase() + questionData.timeframe.slice(1)} Prediction
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="glow-text">{questionData.question}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered {cryptoData?.name} ({cryptoData?.symbol?.toUpperCase()}) price prediction with technical analysis, 
              trading zones, and risk assessment. Last updated: {currentDate}
            </p>
          </section>

          {/* Main Prediction Card */}
          <section className="holo-card p-6 md:p-8 mb-8">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-muted-foreground">Unable to load prediction. Please try again later.</p>
              </div>
            ) : prediction ? (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-1">
                      {cryptoData?.name} ({prediction.symbol})
                    </h2>
                    <p className="text-muted-foreground">
                      {questionData.timeframe === 'daily' ? 'Today\'s' : 
                       questionData.timeframe === 'weekly' ? 'This Week\'s' : 'This Month\'s'} Outlook
                    </p>
                  </div>
                  <Badge 
                    variant={prediction.bias === 'bullish' ? 'default' : prediction.bias === 'bearish' ? 'destructive' : 'secondary'}
                    className={`text-lg px-4 py-2 ${
                      prediction.bias === 'bullish' ? 'bg-green-600/20 text-green-400 border-green-600/30' : 
                      prediction.bias === 'bearish' ? 'bg-red-600/20 text-red-400 border-red-600/30' : ''
                    }`}
                  >
                    {prediction.bias === 'bullish' ? <TrendingUp className="w-4 h-4 mr-2" /> : 
                     prediction.bias === 'bearish' ? <TrendingDown className="w-4 h-4 mr-2" /> : 
                     <Minus className="w-4 h-4 mr-2" />}
                    {prediction.confidence}% {prediction.bias.charAt(0).toUpperCase() + prediction.bias.slice(1)}
                  </Badge>
                </div>

                <div className="text-4xl font-bold font-mono mb-4">
                  {formatPrice(prediction.currentPrice)}
                </div>

                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  {prediction.summary}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Bull Target</div>
                    <div className="font-mono font-bold text-green-400">
                      {formatPrice(prediction.bullScenario.target)}
                    </div>
                    <div className="text-xs text-muted-foreground">{prediction.bullScenario.probability}% probability</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Bear Target</div>
                    <div className="font-mono font-bold text-red-400">
                      {formatPrice(prediction.bearScenario.target)}
                    </div>
                    <div className="text-xs text-muted-foreground">{prediction.bearScenario.probability}% probability</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Support</div>
                    <div className="font-mono font-bold">{formatPrice(prediction.supportLevels[0])}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Resistance</div>
                    <div className="font-mono font-bold">{formatPrice(prediction.resistanceLevels[0])}</div>
                  </div>
                </div>

                {/* Key Factors */}
                <div className="mb-6">
                  <h3 className="font-display font-bold mb-3">Key Factors</h3>
                  <ul className="space-y-2">
                    {prediction.keyFactors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trading Zones */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">Entry Zone</span>
                    </div>
                    <div className="font-mono text-sm">
                      {formatPrice(prediction.tradingZones.entryZone.min)} - {formatPrice(prediction.tradingZones.entryZone.max)}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="font-medium">Stop Loss</span>
                    </div>
                    <div className="font-mono text-sm text-red-400">
                      {formatPrice(prediction.tradingZones.stopLoss)}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      <span className="font-medium">Take Profit</span>
                    </div>
                    <div className="font-mono text-sm text-green-400">
                      {formatPrice(prediction.tradingZones.takeProfit1)}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to={`/price-prediction/${questionData.coin}/${questionData.timeframe}`}>
                      View Full Analysis <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/price-prediction/${questionData.coin}`}>
                      All {cryptoData?.name} Predictions
                    </Link>
                  </Button>
                </div>
              </>
            ) : null}
          </section>

          {/* Related Questions */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold mb-4">Related Questions</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {relatedQuestions.map((q) => (
                <Link
                  key={q.slug}
                  to={`/q/${q.slug}`}
                  className="holo-card p-4 hover:border-primary/50 transition-all group flex items-center justify-between"
                >
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {q.question}
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </section>

          {/* Other Top Coins */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold mb-4">More Predictions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TOP_CRYPTOS.slice(0, 10).filter(c => c.id !== questionData.coin).map((crypto) => (
                <Link
                  key={crypto.id}
                  to={`/price-prediction/${crypto.id}/${questionData.timeframe}`}
                  className="holo-card p-3 text-center hover:border-primary/50 transition-all group"
                >
                  <div className="font-display font-bold text-sm group-hover:text-primary transition-colors">
                    {crypto.symbol.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">{crypto.name}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section className="holo-card p-6">
            <h2 className="font-display text-xl font-bold mb-4">
              About {cryptoData?.name} {questionData.timeframe.charAt(0).toUpperCase() + questionData.timeframe.slice(1)} Predictions
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground text-sm">
              <p>
                Oracle Bull provides AI-powered {cryptoData?.name} ({cryptoData?.symbol?.toUpperCase()}) price predictions 
                using advanced machine learning algorithms. Our {questionData.timeframe} forecasts analyze 50+ technical 
                indicators including RSI, MACD, moving averages, Bollinger Bands, and volume patterns to generate 
                accurate price predictions.
              </p>
              <p className="mt-3">
                Each prediction includes precise trading zones with entry points, stop-loss levels, and take-profit 
                targets designed for traders of all experience levels. Our risk assessment system provides clear 
                confidence scores to help you make informed decisions.
              </p>
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
