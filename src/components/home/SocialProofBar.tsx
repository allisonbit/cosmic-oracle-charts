import { Shield, Globe, Zap, Clock, TrendingUp, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

const metrics = [
  {
    icon: Users,
    label: "Monthly Traders",
    target: 100000,
    suffix: "+",
    color: "text-primary",
    glow: "bg-primary/10 border-primary/20",
    format: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`,
  },
  {
    icon: Shield,
    label: "Predictions Generated",
    target: 2400000,
    suffix: "+",
    color: "text-success",
    glow: "bg-success/10 border-success/20",
    format: (n: number) => `${(n / 1000000).toFixed(1)}M`,
  },
  {
    icon: Zap,
    label: "Data Points / Day",
    target: 50,
    suffix: "M+",
    color: "text-warning",
    glow: "bg-warning/10 border-warning/20",
    format: (n: number) => `${n}`,
  },
  {
    icon: Globe,
    label: "Countries Served",
    target: 195,
    suffix: "+",
    color: "text-secondary",
    glow: "bg-secondary/10 border-secondary/20",
    format: (n: number) => `${n}`,
  },
  {
    icon: TrendingUp,
    label: "Tokens Tracked",
    target: 18000,
    suffix: "+",
    color: "text-chart-4",
    glow: "bg-chart-4/10 border-chart-4/20",
    format: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`,
  },
  {
    icon: Clock,
    label: "Uptime",
    target: 999,
    suffix: "",
    color: "text-foreground",
    glow: "bg-muted/30 border-border/40",
    format: (n: number) => `${(n / 10).toFixed(1)}%`,
  },
];

function MetricCard({ metric }: { metric: typeof metrics[0] }) {
  const Icon = metric.icon;
  const { count, ref } = useCountUp(metric.target, 2500);

  return (
    <div
      ref={ref}
      className={cn(
        "group flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.03] hover:shadow-lg",
        metric.glow
      )}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 border", metric.glow)}>
        <Icon className={cn("w-6 h-6", metric.color)} />
      </div>
      <div className={cn("text-2xl md:text-3xl font-display font-black tabular-nums mb-1", metric.color)}>
        {metric.format(count ?? 0)}{metric.suffix}
      </div>
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</div>
    </div>
  );
}

export function SocialProofBar() {
  return (
    <section className="py-16 md:py-20 relative" aria-label="Platform metrics">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Platform by the Numbers</p>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-display font-bold mt-2">
            Trusted by Traders <span className="text-gradient-cosmic">Worldwide</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
