import { Activity, BarChart3, Brain, Globe, Radio, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Charts",
    description: "Live price charts with AI-projected movement lines displayed in beautiful holographic style.",
    link: "/dashboard",
    linkText: "View Dashboard",
  },
  {
    icon: Brain,
    title: "AI Forecasts",
    description: "Advanced predictions showing trends, strength indicators, and next 24h movements.",
    link: "/chain/ethereum",
    linkText: "See Predictions",
  },
  {
    icon: Radio,
    title: "Sentiment Scanner",
    description: "Track market fear/greed, social sentiment, and whale activity in real-time.",
    link: "/sentiment",
    linkText: "Check Sentiment",
  },
  {
    icon: Globe,
    title: "Token Explorer",
    description: "Search any token for instant price, forecast, volatility, and support/resistance levels.",
    link: "/explorer",
    linkText: "Explore Tokens",
  },
  {
    icon: Activity,
    title: "Wallet Scanner",
    description: "Analyze any wallet address for holdings, risk assessment, and trading recommendations.",
    link: "/portfolio",
    linkText: "Scan Wallet",
  },
  {
    icon: Shield,
    title: "Learn Crypto",
    description: "Educational resources to help you understand blockchain and cryptocurrency.",
    link: "/learn",
    linkText: "Start Learning",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold">
            <span className="text-gradient-cosmic">COSMIC</span> FEATURES
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Everything you need to navigate the crypto universe, beautifully presented.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                to={feature.link}
                className="holo-card p-5 md:p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in group block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  {feature.linkText}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
