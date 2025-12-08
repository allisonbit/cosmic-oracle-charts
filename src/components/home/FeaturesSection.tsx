import { Activity, BarChart3, Brain, Globe, Radio, Shield } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Charts",
    description: "Live price charts with AI-projected movement lines displayed in beautiful holographic style.",
  },
  {
    icon: Brain,
    title: "AI Forecasts",
    description: "Advanced predictions showing trends, strength indicators, and next 24h movements.",
  },
  {
    icon: Radio,
    title: "Sentiment Scanner",
    description: "Track market fear/greed, social sentiment, and whale activity in real-time.",
  },
  {
    icon: Globe,
    title: "Token Explorer",
    description: "Search any token for instant price, forecast, volatility, and support/resistance levels.",
  },
  {
    icon: Activity,
    title: "Live Market Pulse",
    description: "Real-time updates on price changes, buy/sell pressure, and breakout alerts.",
  },
  {
    icon: Shield,
    title: "Free & Open",
    description: "No fees, no login required. Beautiful crypto data accessible to everyone.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            <span className="text-gradient-cosmic">COSMIC</span> FEATURES
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to navigate the crypto universe, beautifully presented.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="holo-card p-6 hover:scale-105 transition-transform duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
