import { useParams, Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";
import { 
  TrendingUp, TrendingDown, Minus, Clock, Calendar, CalendarDays,
  ChevronRight, AlertTriangle, Target, Shield, BarChart3, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePricePrediction, getQuestionIntent, TOP_CRYPTOS, QUESTION_INTENTS } from "@/hooks/usePricePrediction";
import { useCanonicalSetup } from "@/hooks/useCanonicalSetup";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionIntent() {
  const { slug } = useParams<{ slug: string }>();
  const questionData = slug ? getQuestionIntent(slug) : null;
  
  const cryptoId = questionData?.crypto.id || 'bitcoin';
  const cryptoSymbol = questionData?.crypto.symbol || 'btc';
  const timeframe = questionData?.timeframe || 'daily';
  const { data: prediction, isLoading, error } = usePricePrediction(
    cryptoId,
    cryptoSymbol,
    timeframe as any,
    true
  );
  // The frozen, monitored setup — identical levels to the full prediction page.
  const setup = useCanonicalSetup(cryptoId, cryptoSymbol, timeframe as any);

  if (!questionData) {
    return <Navigate to="/predictions" replace />;
  }

  const { crypto, question } = questionData;

  // Determine question type from slug for context-aware content
  const questionType: 'will-go-up' | 'should-buy' | 'price-prediction' | 'investment' | 'general' = (() => {
    if (!slug) return 'general';
    if (slug.includes('will-') && (slug.includes('-go-up') || slug.includes('-going-up'))) return 'will-go-up';
    if (slug.includes('bullish') || slug.includes('-up-or-down')) return 'will-go-up';
    if (slug.includes('should-i-buy') || slug.includes('-a-buy') || slug.includes('buy-or-sell') || slug.includes('worth-buying')) return 'should-buy';
    if (slug.includes('good-investment')) return 'investment';
    if (slug.includes('prediction') || slug.includes('forecast') || slug.includes('price-') || slug.includes('analysis') || slug.includes('technical')) return 'price-prediction';
    return 'general';
  })();

  const timeframeLabel = timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : 'this month';

  const timeframeIcon = timeframe === 'daily' ? Clock : 
    timeframe === 'weekly' ? Calendar : CalendarDays;
  const TimeIcon = timeframeIcon;

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${(price ?? 0).toFixed(2)}`;
    return `$${(price ?? 0).toPrecision(4)}`;
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Related questions for internal linking - generate them dynamically
  const generateRelatedQuestions = () => {
    const related: { pattern: string; question: string; timeframe: string }[] = [];
    
    // Same coin, different timeframes
    QUESTION_INTENTS.forEach(intent => {
      if (intent.timeframe !== timeframe) {
        const pattern = intent.pattern.replace('{coin}', crypto.id);
        related.push({
          pattern,
          question: intent.template.replace('{name}', crypto.name),
          timeframe: intent.timeframe
        });
      }
    });
    
    // Different coins, same timeframe
    TOP_CRYPTOS.slice(0, 5).forEach(c => {
      if (c.id !== crypto.id) {
        const matchingIntent = QUESTION_INTENTS.find(i => i.timeframe === timeframe);
        if (matchingIntent) {
          const pattern = matchingIntent.pattern.replace('{coin}', c.id);
          related.push({
            pattern,
            question: matchingIntent.template.replace('{name}', c.name),
            timeframe: matchingIntent.timeframe
          });
        }
      }
    });
    
    return related.slice(0, 6);
  };

  const relatedQuestions = generateRelatedQuestions();

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <SEO 
        title={`${question} | ${currentDate} | Oracle Bull`}
        description={`${question} Get AI-powered ${crypto.name} price prediction for ${timeframe} with technical analysis, trading zones, and risk assessment. Updated ${currentDate}.`}
        keywords={`${crypto.name} prediction, ${crypto.symbol} price today, ${crypto.name} forecast, will ${crypto.symbol} go up, ${crypto.name} ${timeframe} prediction`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `Is ${crypto.name} a good investment ${timeframeLabel}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Our AI model currently rates ${crypto.name} as ${prediction?.bias || 'neutral'} with ${prediction?.confidence || 'N/A'}% confidence for the ${timeframe} timeframe. Explore all timeframes on the ${crypto.name} prediction hub at oraclebull.com.`
              }
            },
            {
              "@type": "Question",
              "name": `What factors affect ${crypto.name}'s price?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${crypto.name}'s price is influenced by overall crypto market sentiment, Bitcoin's direction, on-chain metrics, trading volume, regulatory developments, and macroeconomic conditions such as interest rate decisions and inflation data.`
              }
            },
            {
              "@type": "Question",
              "name": "How accurate are AI crypto predictions?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No prediction model is 100% accurate. Oracle Bull's AI synthesizes 50+ technical indicators and market data to identify statistically favorable setups, with each prediction carrying a transparent confidence score. Track historical performance on the accuracy dashboard."
              }
            },
            {
              "@type": "Question",
              "name": `Where can I buy ${crypto.name}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `${crypto.name} (${crypto.symbol.toUpperCase()}) is available on most major cryptocurrency exchanges including Coinbase, Binance, and Kraken. Visit our How to Buy ${crypto.name} guide for a step-by-step walkthrough.`
              }
            }
          ]
        })}</script>
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
            <Link to={`/price-prediction/${crypto.id}`} className="hover:text-primary capitalize">
              {crypto.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{timeframe}</span>
          </nav>

          {/* Hero Section */}
          <section className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              <TimeIcon className="w-3 h-3 mr-1" />
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Prediction
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="glow-text">{question}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered {crypto.name} ({crypto.symbol.toUpperCase()}) price prediction with technical analysis, 
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
                      {crypto.name} ({prediction.symbol.toUpperCase()})
                    </h2>
                    <p className="text-muted-foreground">
                      {timeframe === 'daily' ? 'Today\'s' : 
                       timeframe === 'weekly' ? 'This Week\'s' : 'This Month\'s'} Outlook
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
                      {formatPrice(setup.entryLow)} - {formatPrice(setup.entryHigh)}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="font-medium">Stop Loss</span>
                    </div>
                    <div className="font-mono text-sm text-red-400">
                      {formatPrice(setup.stopLoss)}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-green-400" />
                      <span className="font-medium">Take Profit</span>
                    </div>
                    <div className="font-mono text-sm text-green-400">
                      {formatPrice(setup.tp1)}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to={`/price-prediction/${crypto.id}/${timeframe}`}>
                      View Full Analysis <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/price-prediction/${crypto.id}`}>
                      All {crypto.name} Predictions
                    </Link>
                  </Button>
                </div>
              </>
            ) : null}
          </section>

          {/* Narrative Answer Section */}
          {prediction && (
            <section className="holo-card p-6 md:p-8 mb-8">
              <h2 className="text-lg font-display font-bold mb-3">
                Our Analysis: {question}
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
                <p>
                  Based on our AI analysis of {crypto.name}'s current market data, technical indicators, and sentiment signals,
                  the outlook is{' '}
                  <strong className={prediction.bias === 'bullish' ? 'text-green-400' : prediction.bias === 'bearish' ? 'text-red-400' : 'text-muted-foreground'}>
                    {prediction.bias}
                  </strong>{' '}
                  with {prediction.confidence}% confidence for the {timeframe} timeframe.
                  {prediction.currentPrice > 0 && (
                    <> {crypto.name} is currently trading at {formatPrice(prediction.currentPrice)}, with
                    support near {formatPrice(prediction.supportLevels[0])} and
                    resistance at {formatPrice(prediction.resistanceLevels[0])}.</>
                  )}
                </p>

                {questionType === 'will-go-up' && (
                  <p>
                    {prediction.bias === 'bullish'
                      ? `Our model indicates that ${crypto.name} has a ${prediction.bullScenario.probability}% probability of reaching ${formatPrice(prediction.bullScenario.target)} ${timeframeLabel}. Bullish momentum is supported by favorable technical signals and positive market sentiment. Check the full `
                      : prediction.bias === 'bearish'
                      ? `Current indicators suggest ${crypto.name} may face downward pressure ${timeframeLabel}, with a ${prediction.bearScenario.probability}% probability of testing ${formatPrice(prediction.bearScenario.target)}. Bearish signals are present across momentum and trend indicators. Review the complete `
                      : `${crypto.name} is showing mixed signals ${timeframeLabel}, indicating potential consolidation between ${formatPrice(prediction.supportLevels[0])} and ${formatPrice(prediction.resistanceLevels[0])}. Direction will likely depend on broader market sentiment. Explore the full `}
                    <Link to={`/sentiment`} className="text-primary hover:underline">market sentiment dashboard</Link>
                    {' '}and the{' '}
                    <Link to={`/crypto-strength-meter`} className="text-primary hover:underline">{crypto.name} strength analysis</Link>
                    {' '}for additional confirmation signals.
                  </p>
                )}

                {questionType === 'should-buy' && (
                  <p>
                    {prediction.bias === 'bullish'
                      ? `With a ${prediction.confidence}% bullish confidence score, ${crypto.name} shows favorable entry conditions ${timeframeLabel}. Our AI identifies an optimal entry zone between ${formatPrice(prediction.tradingZones.entryZone.min)} and ${formatPrice(prediction.tradingZones.entryZone.max)}, with a stop-loss at ${formatPrice(prediction.tradingZones.stopLoss)} and first take-profit target at ${formatPrice(prediction.tradingZones.takeProfit1)}.`
                      : prediction.bias === 'bearish'
                      ? `Caution is warranted — our AI rates ${crypto.name} as bearish with ${prediction.confidence}% confidence ${timeframeLabel}. Bearish conditions suggest waiting for a more favorable entry. If you must trade, use tight risk management with a stop-loss at ${formatPrice(prediction.tradingZones.stopLoss)}.`
                      : `${crypto.name} sits in a neutral zone ${timeframeLabel}, making it a hold rather than a strong buy. Patient traders may want to wait for a confirmed breakout above ${formatPrice(prediction.resistanceLevels[0])} before entering.`}
                    {' '}Always review our{' '}
                    <Link to={`/accuracy`} className="text-primary hover:underline">prediction accuracy track record</Link>
                    {' '}before acting on any signal.
                  </p>
                )}

                {questionType === 'investment' && (
                  <p>
                    {prediction.bias === 'bullish'
                      ? `${crypto.name} currently shows positive investment signals with ${prediction.confidence}% bullish confidence. The bull-case target is ${formatPrice(prediction.bullScenario.target)} (${prediction.bullScenario.probability}% probability), while downside risk is limited to the ${formatPrice(prediction.bearScenario.target)} level.`
                      : prediction.bias === 'bearish'
                      ? `${crypto.name} faces headwinds that may affect short-to-medium-term investment returns. Our model assigns a ${prediction.bearScenario.probability}% probability of ${crypto.symbol.toUpperCase()} reaching ${formatPrice(prediction.bearScenario.target)} ${timeframeLabel}. Dollar-cost averaging may be more prudent than lump-sum entry.`
                      : `${crypto.name} presents a neutral investment outlook ${timeframeLabel}. Risk-reward is roughly balanced between the bull target of ${formatPrice(prediction.bullScenario.target)} and bear target of ${formatPrice(prediction.bearScenario.target)}. Consider allocating conservatively.`}
                    {' '}Monitor the{' '}
                    <Link to={`/sentiment`} className="text-primary hover:underline">overall market sentiment</Link>
                    {' '}for macro shifts that could affect your investment thesis.
                  </p>
                )}

                {questionType === 'price-prediction' && (
                  <p>
                    Our {timeframe} model projects {crypto.name} in a range
                    of {formatPrice(prediction.priceTargets.conservative.low)} to {formatPrice(prediction.priceTargets.aggressive.high)},
                    with the most likely scenario between {formatPrice(prediction.priceTargets.moderate.low)} and {formatPrice(prediction.priceTargets.moderate.high)}.
                    The RSI is reading {prediction.technicalIndicators.rsi.toFixed(1)} ({prediction.technicalIndicators.rsiSignal}),
                    and the MACD trend is {prediction.technicalIndicators.macd.trend}. See the{' '}
                    <Link to={`/crypto-strength-meter`} className="text-primary hover:underline">crypto strength meter</Link>
                    {' '}for a broader comparative view.
                  </p>
                )}

                {questionType === 'general' && (
                  <p>
                    {prediction.bias === 'bullish'
                      ? `Positive momentum and supportive technical indicators favor ${crypto.name} ${timeframeLabel}. Our AI model sees bullish potential with a ${prediction.bullScenario.probability}% probability of reaching ${formatPrice(prediction.bullScenario.target)}.`
                      : prediction.bias === 'bearish'
                      ? `${crypto.name} faces bearish pressure ${timeframeLabel}. Traders should exercise caution with a ${prediction.bearScenario.probability}% probability of testing ${formatPrice(prediction.bearScenario.target)}.`
                      : `${crypto.name} is range-bound ${timeframeLabel}, awaiting a catalyst. Watch for breaks above ${formatPrice(prediction.resistanceLevels[0])} or below ${formatPrice(prediction.supportLevels[0])} for directional cues.`}
                    {' '}View the{' '}
                    <Link to={`/sentiment`} className="text-primary hover:underline">market sentiment dashboard</Link>
                    {' '}for broader context.
                  </p>
                )}

                {prediction.keyFactors && prediction.keyFactors.length > 0 && (
                  <p>
                    The primary factors driving this analysis include: {prediction.keyFactors.slice(0, 3).join(', ').toLowerCase()}.
                    For a complete breakdown of support levels, resistance zones, and trading setups, visit the{' '}
                    <Link to={`/price-prediction/${crypto.id}/${timeframe}`} className="text-primary hover:underline">
                      full {crypto.name} {timeframe} prediction page
                    </Link>.
                    You can also track our{' '}
                    <Link to={`/accuracy`} className="text-primary hover:underline">
                      prediction accuracy over time
                    </Link>.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Related Questions */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-bold mb-4">Related Questions</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {relatedQuestions.map((q, i) => (
                <Link
                  key={i}
                  to={`/q/${q.pattern}`}
                  className="holo-card p-4 transition-all group flex items-center justify-between"
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
              {TOP_CRYPTOS.slice(0, 10).filter(c => c.id !== crypto.id).map((c) => (
                <Link
                  key={c.id}
                  to={`/price-prediction/${c.id}/${timeframe}`}
                  className="holo-card p-3 text-center transition-all group"
                >
                  <div className="font-display font-bold text-sm group-hover:text-primary transition-colors">
                    {c.symbol.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">{c.name}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section className="holo-card p-6 mb-8">
            <h2 className="font-display text-xl font-bold mb-4">
              {questionType === 'will-go-up'
                ? `Will ${crypto.name} Go Up? Understanding ${crypto.symbol.toUpperCase()} Price Direction`
                : questionType === 'should-buy'
                ? `Should You Buy ${crypto.name}? What to Consider Before Investing in ${crypto.symbol.toUpperCase()}`
                : questionType === 'investment'
                ? `Is ${crypto.name} a Good Investment? Evaluating ${crypto.symbol.toUpperCase()} for Your Portfolio`
                : questionType === 'price-prediction'
                ? `${crypto.name} ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Price Prediction: Methods and Indicators`
                : `About ${crypto.name} ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Predictions`}
            </h2>
            <div className="prose max-w-none text-muted-foreground text-sm space-y-3">
              {questionType === 'will-go-up' && (
                <>
                  <p>
                    Whether {crypto.name} ({crypto.symbol.toUpperCase()}) goes up {timeframeLabel} depends on a complex interplay
                    of technical indicators, market sentiment, macroeconomic conditions, and on-chain activity. No model can predict
                    price direction with certainty, but AI-powered analysis can identify statistically favorable setups by weighing
                    dozens of factors simultaneously.
                  </p>
                  <p>
                    Oracle Bull's {timeframe} forecast for {crypto.symbol.toUpperCase()} evaluates 50+ technical indicators including
                    RSI, MACD, Bollinger Bands, volume profile, and moving average crossovers. It also incorporates{' '}
                    <Link to="/sentiment" className="text-primary hover:underline">real-time market sentiment</Link>{' '}
                    and comparative{' '}
                    <Link to="/crypto-strength-meter" className="text-primary hover:underline">crypto strength rankings</Link>{' '}
                    to contextualize {crypto.name}'s relative momentum against the broader market.
                  </p>
                </>
              )}
              {questionType === 'should-buy' && (
                <>
                  <p>
                    Deciding whether to buy {crypto.name} requires evaluating current price levels against key support and resistance
                    zones, assessing trend strength, and aligning the trade with your risk tolerance and time horizon. A disciplined
                    approach uses defined entry zones, stop-losses, and take-profit targets rather than emotional decision-making.
                  </p>
                  <p>
                    Oracle Bull provides AI-generated trading setups for {crypto.symbol.toUpperCase()} that include precise entry zones,
                    stop-loss placement, and multiple take-profit levels. Each setup comes with a confidence score and risk assessment.
                    For a deeper look at how these setups perform, review our{' '}
                    <Link to="/accuracy" className="text-primary hover:underline">prediction accuracy dashboard</Link>.
                    You can also compare {crypto.name}'s strength against other assets on the{' '}
                    <Link to="/crypto-strength-meter" className="text-primary hover:underline">crypto strength meter</Link>.
                  </p>
                </>
              )}
              {questionType === 'investment' && (
                <>
                  <p>
                    Evaluating {crypto.name} as an investment involves both fundamental analysis — project utility, developer activity,
                    adoption metrics — and technical analysis of price trends and momentum. Long-term investment decisions should also
                    consider portfolio diversification and your overall risk budget.
                  </p>
                  <p>
                    Oracle Bull's AI model provides {timeframe} outlook scores for {crypto.symbol.toUpperCase()} that combine
                    trend analysis with market sentiment. While no prediction tool replaces due diligence, our models help identify
                    favorable risk-reward windows. Monitor the{' '}
                    <Link to="/sentiment" className="text-primary hover:underline">market sentiment dashboard</Link>
                    {' '}for macro shifts, and explore{' '}
                    <Link to={`/price-prediction/${crypto.id}`} className="text-primary hover:underline">
                      all {crypto.name} prediction timeframes
                    </Link>{' '}to align entry timing with your investment horizon.
                  </p>
                </>
              )}
              {questionType === 'price-prediction' && (
                <>
                  <p>
                    {crypto.name} ({crypto.symbol.toUpperCase()}) price predictions combine multiple analytical layers:
                    trend-following indicators (moving averages, MACD), mean-reversion signals (RSI, Bollinger Bands),
                    volume analysis, and volatility metrics (ATR, Bollinger width). Our AI model synthesizes these into
                    a single directional bias with confidence score and probabilistic price targets.
                  </p>
                  <p>
                    Unlike simple indicator dashboards, Oracle Bull's predictions generate actionable trading setups with
                    defined entry, stop-loss, and take-profit levels. View the{' '}
                    <Link to={`/price-prediction/${crypto.id}/${timeframe}`} className="text-primary hover:underline">
                      full {crypto.name} {timeframe} prediction
                    </Link>{' '}for complete technical details, or check our{' '}
                    <Link to="/accuracy" className="text-primary hover:underline">historical accuracy metrics</Link>
                    {' '}to see how past predictions performed.
                  </p>
                </>
              )}
              {questionType === 'general' && (
                <>
                  <p>
                    Oracle Bull provides AI-powered {crypto.name} ({crypto.symbol.toUpperCase()}) price predictions
                    using advanced machine learning algorithms. Our {timeframe} forecasts analyze 50+ technical
                    indicators including RSI, MACD, moving averages, Bollinger Bands, and volume patterns to generate
                    accurate price predictions.
                  </p>
                  <p>
                    Each prediction includes precise trading zones with entry points, stop-loss levels, and take-profit
                    targets designed for traders of all experience levels. Our risk assessment system provides clear
                    confidence scores to help you make informed decisions. Track performance on the{' '}
                    <Link to="/accuracy" className="text-primary hover:underline">accuracy dashboard</Link>{' '}
                    and compare assets on the{' '}
                    <Link to="/crypto-strength-meter" className="text-primary hover:underline">crypto strength meter</Link>.
                  </p>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Disclaimer: This is not financial advice. Cryptocurrency investments carry significant risk.
              Always conduct your own research before making investment decisions.
            </p>
          </section>

          {/* Structured FAQ Section */}
          <section className="holo-card p-6 mb-8">
            <h2 className="font-display text-xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              <details className="group border border-border/30 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-sm hover:text-primary transition-colors">
                  Is {crypto.name} a good investment {timeframeLabel}?
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    Our AI model currently rates {crypto.name} as{' '}
                    <strong>{prediction?.bias || 'neutral'}</strong> with{' '}
                    {prediction?.confidence || 'N/A'}% confidence for the {timeframe} timeframe.
                    {prediction?.bias === 'bullish'
                      ? ` Favorable technical signals suggest potential upside, though all investments carry risk.`
                      : prediction?.bias === 'bearish'
                      ? ` Current conditions suggest caution — consider waiting for improved market conditions.`
                      : ` Mixed signals indicate a wait-and-see approach may be prudent.`}
                    {' '}Explore all timeframes on the{' '}
                    <Link to={`/price-prediction/${crypto.id}`} className="text-primary hover:underline">
                      {crypto.name} prediction hub
                    </Link>.
                  </p>
                </div>
              </details>

              <details className="group border border-border/30 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-sm hover:text-primary transition-colors">
                  What factors affect {crypto.name}'s price?
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    {crypto.name}'s price is influenced by overall crypto market sentiment, Bitcoin's direction,
                    on-chain metrics, trading volume, regulatory developments, and macroeconomic conditions such as
                    interest rate decisions and inflation data.
                    View the{' '}
                    <Link to="/sentiment" className="text-primary hover:underline">market sentiment dashboard</Link>
                    {' '}for a real-time read on market mood and the{' '}
                    <Link to="/crypto-strength-meter" className="text-primary hover:underline">crypto strength meter</Link>
                    {' '}to see how {crypto.symbol.toUpperCase()} ranks against other major assets.
                  </p>
                </div>
              </details>

              <details className="group border border-border/30 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-sm hover:text-primary transition-colors">
                  How accurate are AI crypto predictions?
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    No prediction model is 100% accurate — crypto markets are inherently volatile and influenced by
                    unpredictable events. Oracle Bull's AI model synthesizes 50+ technical indicators and market data
                    to identify statistically favorable setups, with each prediction carrying a transparent confidence score.
                    Track our historical performance on the{' '}
                    <Link to="/accuracy" className="text-primary hover:underline">accuracy dashboard</Link>.
                  </p>
                </div>
              </details>

              <details className="group border border-border/30 rounded-lg">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-sm hover:text-primary transition-colors">
                  Where can I buy {crypto.name}?
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    {crypto.name} ({crypto.symbol.toUpperCase()}) is available on most major cryptocurrency exchanges
                    including Coinbase, Binance, and Kraken. For a step-by-step walkthrough, visit our{' '}
                    <Link to={`/how-to-buy/${crypto.id}`} className="text-primary hover:underline">
                      How to Buy {crypto.name} guide
                    </Link>.
                    Once you own {crypto.symbol.toUpperCase()}, track its performance with our{' '}
                    <Link to={`/price-prediction/${crypto.id}/${timeframe}`} className="text-primary hover:underline">
                      {timeframe} prediction updates
                    </Link>.
                  </p>
                </div>
              </details>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
