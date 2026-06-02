import { ArrowRight, Search, BarChart3, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search Any Token",
    description: "Find any cryptocurrency across 8 blockchains in seconds. Search by name, symbol, or paste a contract address directly.",
    color: "text-primary",
    glow: "shadow-[0_0_30px_-10px_hsl(var(--primary))]",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    link: "/explorer",
    cta: "Open Explorer",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Get AI Analysis",
    description: "Our neural network scores 50+ on-chain signals and delivers a prediction with a confidence score in milliseconds.",
    color: "text-secondary",
    glow: "shadow-[0_0_30px_-10px_hsl(var(--secondary))]",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/30",
    link: "/predictions",
    cta: "See Predictions",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Make Better Trades",
    description: "Combine AI forecasts with whale tracking, sentiment data, and on-chain flows to trade with institutional precision.",
    color: "text-success",
    glow: "shadow-[0_0_30px_-10px_hsl(var(--success))]",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    link: "/sentiment",
    cta: "Check Sentiment",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" aria-labelledby="how-it-works-heading">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/5 via-transparent to-muted/5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3" /> How It Works
          </span>
          <h2 id="how-it-works-heading" className="text-[clamp(1.75rem,4.5vw,3rem)] font-display font-extrabold leading-tight">
            From Zero to <span className="text-gradient-cosmic">Alpha</span> in 3 Steps
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            No signup. No payment. Just powerful crypto intelligence at your fingertips.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connector track behind the cards (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-primary/20 via-secondary/30 to-success/20 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="group flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step icon orb */}
                  <div className={`relative w-28 h-28 rounded-3xl ${step.bgColor} border-2 ${step.borderColor} flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 ${step.glow} group-hover:${step.glow}`}>
                    <Icon className={`w-10 h-10 ${step.color}`} />
                    {/* Step number badge */}
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border-2 ${step.borderColor} flex items-center justify-center`}>
                      <span className={`text-xs font-black ${step.color}`}>{step.number}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
                    {step.description}
                  </p>
                  <Link
                    to={step.link}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${step.color} hover:gap-2.5 transition-all`}
                  >
                    {step.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Free badge */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-muted/30 border border-border/50 text-sm">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">All tools are <strong className="text-foreground">100% free</strong> — no account required to get started</span>
          </div>
        </div>
      </div>
    </section>
  );
}
