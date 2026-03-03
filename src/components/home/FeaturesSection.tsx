import { 
  Activity, BarChart3, Brain, Globe, Radio, Shield, ArrowRight,
  TrendingUp, Zap, Eye, Target, BookOpen, Waves
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    accentIcon: Target,
    title: "AI-Powered Predictions",
    description: "Our machine learning models analyze 50+ technical indicators, on-chain metrics, and sentiment data to forecast price movements with confidence scores across daily, weekly, and monthly timeframes.",
    link: "/predictions",
    linkText: "Try AI Predictions",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconBg: "bg-primary/15 group-hover:bg-primary/25",
    stat: "18,000+ cryptos analyzed",
  },
  {
    icon: Waves,
    accentIcon: BarChart3,
    title: "Real-Time Market Dashboard",
    description: "Live price charts, market momentum indicators, volume leaders, dominance tracking, and correlation matrices — all updating in real-time with institutional-grade data feeds.",
    link: "/dashboard",
    linkText: "Open Dashboard",
    gradient: "from-secondary/20 via-secondary/10 to-transparent",
    iconBg: "bg-secondary/15 group-hover:bg-secondary/25",
    stat: "Live data, zero delay",
  },
  {
    icon: Radio,
    accentIcon: Eye,
    title: "Sentiment & Whale Tracking",
    description: "Monitor Fear & Greed Index, social buzz scores, Google Trends, and large wallet movements. Spot smart money flows before they impact prices.",
    link: "/sentiment",
    linkText: "Check Sentiment",
    gradient: "from-success/20 via-success/10 to-transparent",
    iconBg: "bg-success/15 group-hover:bg-success/25",
    stat: "Multi-source analysis",
  },
  {
    icon: Globe,
    accentIcon: Zap,
    title: "Multi-Chain Token Explorer",
    description: "Search any token across Ethereum, Solana, Base, Arbitrum, and more. Instantly view price, liquidity depth, holder concentration, and AI-generated risk scores.",
    link: "/explorer",
    linkText: "Explore Tokens",
    gradient: "from-warning/20 via-warning/10 to-transparent",
    iconBg: "bg-warning/15 group-hover:bg-warning/25",
    stat: "8 blockchains covered",
  },
  {
    icon: Activity,
    accentIcon: TrendingUp,
    title: "Wallet Intelligence Scanner",
    description: "Paste any wallet address to reveal holdings distribution, portfolio performance, risk assessment, and AI-driven trading recommendations based on on-chain activity.",
    link: "/portfolio",
    linkText: "Scan a Wallet",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconBg: "bg-primary/15 group-hover:bg-primary/25",
    stat: "Instant analysis",
  },
  {
    icon: BookOpen,
    accentIcon: Shield,
    title: "Educational Resources",
    description: "Master crypto markets with our comprehensive learning hub — from beginner guides on blockchain basics to advanced technical analysis strategies and risk management frameworks.",
    link: "/learn",
    linkText: "Start Learning",
    gradient: "from-secondary/20 via-secondary/10 to-transparent",
    iconBg: "bg-secondary/15 group-hover:bg-secondary/25",
    stat: "20+ in-depth articles",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase">
            Platform Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold">
            Why Choose <span className="text-gradient-cosmic">Oracle Bull</span>?
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Institutional-grade analytics tools, completely free and with no signup required. 
            Here's what makes our platform stand out.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const AccentIcon = feature.accentIcon;
            return (
              <Link
                key={feature.title}
                to={feature.link}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-7 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in block"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Gradient background accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.gradient} rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity`} />
                
                {/* Icon container with accent */}
                <div className="relative mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center transition-colors`}>
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-muted/80 border border-border/50 flex items-center justify-center">
                    <AccentIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display text-lg md:text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Stat badge */}
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/30">
                    <Zap className="w-3 h-3 text-primary" />
                    {feature.stat}
                  </span>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                    {feature.linkText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 md:mt-14">
          <p className="text-muted-foreground text-sm mb-4">
            Ready to explore? All tools are free — no account needed.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="cosmic" size="lg">
              <Link to="/dashboard">
                Open Live Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/predictions">
                Try AI Predictions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
