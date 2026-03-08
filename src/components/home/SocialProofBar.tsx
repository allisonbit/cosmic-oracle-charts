import { Shield, Globe, Zap, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
  { icon: Globe, label: "Countries Served", target: 195, suffix: "+", color: "text-primary" },
  { icon: Shield, label: "Predictions Generated", target: 2400000, suffix: "+", color: "text-success", format: true },
  { icon: Zap, label: "Data Points / Day", target: 50, suffix: "M+", color: "text-warning" },
  { icon: Clock, label: "Uptime", target: 99, suffix: ".9%", color: "text-secondary" },
];

export function SocialProofBar() {
  return (
    <section className="py-6 md:py-8 border-b border-border/30 bg-muted/20" aria-label="Platform metrics">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const { count, ref } = useCountUp(metric.target, 2500);
            const displayValue = metric.format
              ? `${(count / 1000000).toFixed(1)}M`
              : count.toLocaleString();

            return (
              <div
                key={metric.label}
                ref={ref}
                className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <div className="text-lg md:text-xl font-bold text-foreground tabular-nums">
                    {displayValue}{metric.suffix}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">{metric.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
