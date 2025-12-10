import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Brain, Zap } from "lucide-react";

export function CTASection() {
  const actions = [
    {
      icon: Wallet,
      title: "Track Portfolio",
      description: "Add your holdings and watch your portfolio value update in real-time",
      link: "/portfolio",
      buttonText: "Start Tracking",
      color: "primary",
    },
    {
      icon: TrendingUp,
      title: "Live Dashboard",
      description: "Real-time charts, price alerts, and market trends at a glance",
      link: "/dashboard",
      buttonText: "Open Dashboard",
      color: "success",
    },
    {
      icon: Brain,
      title: "AI Predictions",
      description: "Get AI-powered forecasts and market sentiment analysis",
      link: "/chain/ethereum",
      buttonText: "View Predictions",
      color: "secondary",
    },
    {
      icon: Zap,
      title: "Token Explorer",
      description: "Search any token for live prices, charts, and detailed analytics",
      link: "/explorer",
      buttonText: "Explore Tokens",
      color: "warning",
    },
  ];

  return (
    <section className="py-16 md:py-24 cosmic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold">
            START <span className="glow-text">EXPLORING</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Free, open-access tools to navigate the crypto universe
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className="holo-card p-6 flex flex-col animate-fade-in hover:scale-[1.02] transition-transform"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-${action.color}/20 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${action.color}`} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{action.title}</h3>
                <p className="text-muted-foreground text-sm flex-1 mb-4">
                  {action.description}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={action.link}>{action.buttonText}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
