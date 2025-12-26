import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, ExternalLink } from "lucide-react";

interface DisclaimerProps {
  coinName: string;
}

export function Disclaimer({ coinName }: DisclaimerProps) {
  return (
    <Card className="bg-yellow-500/5 border-yellow-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-yellow-500">
          <AlertTriangle className="h-5 w-5" />
          Important Disclaimer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-3">
        <p>
          <strong>Not Financial Advice:</strong> The {coinName} price predictions and analysis provided on this page 
          are for informational and educational purposes only. They do not constitute financial advice, 
          investment recommendations, or trading signals.
        </p>
        <p>
          <strong>Risk Warning:</strong> Cryptocurrency investments carry significant risk. Prices are highly 
          volatile and can result in substantial losses. Past performance does not guarantee future results.
        </p>
        <p>
          <strong>Do Your Own Research:</strong> Always conduct your own research and consider consulting with 
          a qualified financial advisor before making any investment decisions.
        </p>
        <p className="text-xs">
          Oracle Bull uses AI and technical analysis models to generate predictions. While we strive for accuracy, 
          no prediction method can guarantee results. Trade responsibly.
        </p>
      </CardContent>
    </Card>
  );
}

interface FAQSectionProps {
  coinName: string;
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
}

export function FAQSection({ coinName, symbol, timeframe }: FAQSectionProps) {
  const timeframeText = timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : 'this month';
  
  const faqs = [
    {
      question: `What will ${coinName} price be ${timeframeText}?`,
      answer: `Our AI-powered prediction model analyzes multiple factors including technical indicators (RSI, MACD, Moving Averages), market sentiment, volume patterns, and historical data to forecast ${coinName} price movements. Check the prediction summary above for our current outlook with confidence levels and price targets.`
    },
    {
      question: `Is ${coinName} a good investment ${timeframeText}?`,
      answer: `Whether ${coinName} is a good investment depends on your risk tolerance, investment goals, and market conditions. Our analysis provides data-driven insights including risk levels, support/resistance levels, and probability assessments. Always diversify your portfolio and never invest more than you can afford to lose.`
    },
    {
      question: `Will ${symbol.toUpperCase()} go up or down ${timeframeText}?`,
      answer: `Our prediction model calculates bullish and bearish probabilities based on comprehensive technical analysis. View the Bull and Bear scenarios above for specific price targets and the triggers that could lead to each outcome. Remember that crypto markets are highly volatile and predictions carry uncertainty.`
    },
    {
      question: `How accurate are ${coinName} predictions?`,
      answer: `Our predictions combine AI analysis, technical indicators, and market data to provide informed forecasts. While we continuously improve our models, no prediction system is 100% accurate. We provide confidence levels and multiple scenarios to help you make informed decisions. Historical accuracy varies by market conditions.`
    },
    {
      question: `What technical indicators are used for ${coinName} analysis?`,
      answer: `We analyze RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), Moving Averages (20, 50, 200-day), Bollinger Bands, Volume Analysis, Support/Resistance levels, and market sentiment. Each indicator provides different insights into price momentum and potential reversals.`
    }
  ];
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-2">
            <h3 className="font-semibold text-foreground">{faq.question}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface MethodologyProps {
  coinName: string;
}

export function Methodology({ coinName }: MethodologyProps) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Our Prediction Methodology</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Technical Analysis</h3>
          <p>We analyze key technical indicators including RSI, MACD, Moving Averages, and Bollinger Bands to identify trend direction, momentum, and potential reversal points.</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-foreground mb-2">Support & Resistance</h3>
          <p>Our algorithms calculate dynamic support and resistance levels using pivot points, Fibonacci retracements, and historical price action to identify key price zones.</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-foreground mb-2">AI-Powered Analysis</h3>
          <p>Advanced machine learning models process market data, sentiment signals, and historical patterns to generate probability-weighted predictions with confidence scores.</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-foreground mb-2">Risk Assessment</h3>
          <p>Each prediction includes a comprehensive risk assessment considering volatility, market conditions, and potential downside scenarios to help you manage your exposure.</p>
        </div>
        
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs">
            Our predictions are updated automatically based on real-time market data. Daily predictions refresh every 5 minutes, 
            weekly predictions every 30 minutes, and monthly predictions hourly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
