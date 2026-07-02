import { ArrowRight, Search, BarChart3, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search Any Token",
    description: "Find any cryptocurrency across 8 blockchains in seconds. Search by name, symbol, or paste a contract address directly.",
    color: "text-primary",
    link: "/explorer",
    cta: "Open Explorer",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Get AI Analysis",
    description: "Our neural network scores 50+ on-chain signals and delivers a prediction with a confidence score in milliseconds.",
    color: "text-secondary",
    link: "/predictions",
    cta: "See Predictions",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Make Better Trades",
    description: "Combine AI forecasts with whale tracking, sentiment data, and on-chain flows to trade with institutional precision.",
    color: "text-success",
    link: "/sentiment",
    cta: "Check Sentiment",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 border-t border-border/30" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-4">
        <div className="section-header mb-2">
          <span className="section-label flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-secondary" />
            How It Works
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <h2 id="how-it-works-heading" className="text-[clamp(1.75rem,4.5vw,3rem)] font-display font-extrabold leading-tight max-w-lg">
            From Zero to <span className="text-gradient-cosmic">Alpha</span> in 3 Steps
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm">
            No signup. No payment. Just powerful crypto intelligence at your fingertips.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-0 md:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="group border-t border-border/30 pt-8 pb-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[4.5rem] font-black text-muted-foreground/10 leading-none font-display select-none">
                    {step.number}
                  </span>
                  <Icon className={`w-6 h-6 ${step.color} flex-shrink-0`} />
                </div>
                <h3 className="font-display font-bold text-xl md:text-2xl mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
                  {step.description}
                </p>
                <Link
                  to={step.link}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${step.color} group-hover:gap-2.5 transition-all`}
                >
                  {step.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-6 border-t border-border/30">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
            All tools are <strong className="text-foreground">100% free</strong> — no account required
          </p>
        </div>
      </div>
    </section>
  );
}
