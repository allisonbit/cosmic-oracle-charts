import { Layout } from "@/components/layout/Layout";
import { BookOpen, TrendingUp, BarChart3, Zap, Target, Shield } from "lucide-react";

const topics = [
  {
    icon: BarChart3,
    title: "How to Read Charts",
    description: "Understanding candlesticks, trends, and price movements",
    content: [
      "Candlestick charts show open, high, low, and close prices",
      "Green candles mean the price went up during that period",
      "Red candles mean the price went down",
      "The wick (thin lines) show the highest and lowest prices",
      "Volume bars at the bottom show how much was traded",
    ],
  },
  {
    icon: TrendingUp,
    title: "Understanding Trends",
    description: "Learn to identify bullish, bearish, and sideways markets",
    content: [
      "Bullish: Prices are generally going up over time",
      "Bearish: Prices are generally going down over time",
      "Sideways: Prices are moving within a range",
      "Look for higher highs and higher lows in uptrends",
      "Look for lower highs and lower lows in downtrends",
    ],
  },
  {
    icon: Zap,
    title: "What Causes Pumps",
    description: "Factors that drive sudden price increases",
    content: [
      "Positive news announcements or partnerships",
      "Exchange listings on major platforms",
      "Whale accumulation (large buyers entering)",
      "Social media hype and influencer mentions",
      "Technical breakouts above resistance levels",
    ],
  },
  {
    icon: Target,
    title: "Support & Resistance",
    description: "Key price levels every trader should know",
    content: [
      "Support: A price level where buying pressure is strong",
      "Resistance: A price level where selling pressure is strong",
      "When support breaks, it often becomes resistance",
      "When resistance breaks, it often becomes support",
      "These levels help identify entry and exit points",
    ],
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Protecting your investments in volatile markets",
    content: [
      "Never invest more than you can afford to lose",
      "Diversify across multiple assets",
      "Use stop-losses to limit potential losses",
      "Take profits when targets are reached",
      "Don't let emotions drive your decisions",
    ],
  },
  {
    icon: BookOpen,
    title: "Market Patterns",
    description: "Recognizing common chart formations",
    content: [
      "Head and Shoulders: Often signals trend reversal",
      "Double Top/Bottom: Indicates strong resistance/support",
      "Cup and Handle: Bullish continuation pattern",
      "Triangles: Show consolidation before breakout",
      "Flags: Short-term continuation patterns",
    ],
  },
];

const LearnPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold">
            THE ORACLE'S <span className="text-gradient-cosmic">KNOWLEDGE BASE</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master the fundamentals of crypto forecasting with simple, clear explanations
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.title}
                className="holo-card p-6 hover:scale-[1.02] transition-transform duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {topic.content.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 holo-card p-6 text-center max-w-3xl mx-auto">
          <h3 className="font-display font-bold text-warning mb-2">⚠️ IMPORTANT DISCLAIMER</h3>
          <p className="text-muted-foreground">
            The information provided on this platform is for educational and informational purposes only. 
            It should not be considered financial advice. Cryptocurrency investments carry significant risk, 
            and you could lose some or all of your investment. Always do your own research and consider 
            consulting a financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LearnPage;
