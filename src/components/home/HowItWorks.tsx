import { ArrowRight, CheckCircle, Search, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search Any Token",
    description: "Find any cryptocurrency across 8 blockchains. Search by name, symbol, or contract address.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Analyze with AI",
    description: "Get AI-powered predictions with confidence scores, technical signals, and risk assessments.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/20",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Make Informed Decisions",
    description: "Use whale tracking, sentiment analysis, and on-chain data to validate your research.",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 md:py-20 border-b border-border/30" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium tracking-wide uppercase mb-4">
            Getting Started
          </span>
          <h2 id="how-it-works-heading" className="text-[clamp(1.25rem,4vw,2.25rem)] font-display font-bold">
            How <span className="text-gradient-cosmic">Oracle Bull</span> Works
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm md:text-base">
            Three simple steps to institutional-grade crypto intelligence — no signup, no payment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-border to-border/30 z-0" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  {/* Step number */}
                  <div className={`w-20 h-20 rounded-2xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  <span className={`text-xs font-display font-bold ${step.color} mb-2`}>STEP {step.number}</span>
                  <h3 className="font-display font-bold text-lg mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/explorer"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            Start exploring now — it's free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
