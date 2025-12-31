import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface EnhancedFAQProps {
  coinName: string;
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  currentPrice?: number;
  bias?: 'bullish' | 'bearish' | 'neutral';
  confidence?: number;
}

export function EnhancedFAQ({ coinName, symbol, timeframe, currentPrice, bias, confidence }: EnhancedFAQProps) {
  const timeframeText = timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : 'this month';
  const priceText = currentPrice ? `$${currentPrice.toLocaleString()}` : 'current levels';
  
  // High-intent money-focused FAQs
  const faqs = [
    {
      question: `Should I buy ${coinName} ${timeframeText}?`,
      answer: `Our AI analysis shows ${coinName} (${symbol.toUpperCase()}) has a ${bias || 'neutral'} outlook with ${confidence || 50}% confidence. ${
        bias === 'bullish' 
          ? `This suggests potential buying opportunity at ${priceText}. However, always consider your risk tolerance and investment goals before making any decisions.`
          : bias === 'bearish'
          ? `Current indicators suggest caution. Consider waiting for better entry points or reducing exposure. Always do your own research.`
          : `Market conditions are mixed. Consider a wait-and-see approach or dollar-cost averaging strategy.`
      }`
    },
    {
      question: `What will ${coinName} price be ${timeframeText}?`,
      answer: `Our AI-powered prediction model analyzes 50+ technical indicators, market sentiment, volume patterns, and historical data to forecast ${coinName} price movements. Check the price targets above for specific support and resistance levels, bull/bear scenarios, and probability assessments for ${timeframeText}'s trading session.`
    },
    {
      question: `Is ${coinName} a good investment in 2025?`,
      answer: `${coinName} (${symbol.toUpperCase()}) investment potential depends on multiple factors including market conditions, your risk tolerance, and investment horizon. Our ${timeframe} analysis provides data-driven insights with risk levels, technical indicators, and AI confidence scores. For long-term investment decisions, consider reviewing both our daily and monthly predictions alongside fundamental analysis.`
    },
    {
      question: `Will ${symbol.toUpperCase()} go up or down ${timeframeText}?`,
      answer: `Based on our ${timeframe} technical analysis, ${coinName} shows ${bias === 'bullish' ? 'bullish momentum with potential for upward movement' : bias === 'bearish' ? 'bearish signals suggesting possible downward pressure' : 'neutral conditions with sideways movement expected'}. Review the Bull and Bear scenarios above for specific price targets and the triggers that could lead to each outcome.`
    },
    {
      question: `Is now a good time to invest in ${coinName}?`,
      answer: `${
        bias === 'bullish' && confidence && confidence >= 70
          ? `Our AI shows strong bullish signals (${confidence}% confidence) for ${coinName}, which may indicate a favorable entry point.`
          : bias === 'bearish' && confidence && confidence >= 70
          ? `Current bearish signals (${confidence}% confidence) suggest waiting for better entry levels before investing in ${coinName}.`
          : `Market conditions for ${coinName} are currently mixed. Consider dollar-cost averaging or waiting for clearer signals.`
      } Always diversify your portfolio and never invest more than you can afford to lose.`
    },
    {
      question: `What is the ${coinName} price prediction for ${timeframe === 'daily' ? 'the next 24 hours' : timeframe === 'weekly' ? 'next 7 days' : 'next 30 days'}?`,
      answer: `Our AI model predicts ${coinName} will ${
        bias === 'bullish' 
          ? 'trend upward with potential to test resistance levels shown in the analysis above'
          : bias === 'bearish'
          ? 'face downward pressure with support levels being tested as shown in our analysis'
          : 'trade within a range with key levels outlined in our analysis'
      }. Check the price targets section for specific entry zones, stop-loss levels, and take-profit targets for ${timeframe} trading.`
    }
  ];

  // Generate FAQ schema for structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {coinName} Investment Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {faqs.map((faq, index) => (
            <article key={index} className="space-y-2">
              <h3 className="font-semibold text-foreground text-base">{faq.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
