import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Activity, Fuel, Lock, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

const chains = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    color: "bg-[#627EEA]",
    textColor: "text-white",
    stats: { txns: "1.2M", tps: "15", gas: "$2.40", tvl: "$48B" },
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    color: "bg-gradient-to-br from-[#9945FF] to-[#14F195]",
    textColor: "text-white",
    stats: { txns: "42M", tps: "4,000", gas: "$0.001", tvl: "$8B" },
  },
  {
    id: "bnb",
    name: "BNB Chain",
    symbol: "BNB",
    color: "bg-[#F0B90B]",
    textColor: "text-black",
    stats: { txns: "3.8M", tps: "160", gas: "$0.08", tvl: "$5B" },
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    color: "bg-[#28A0F0]",
    textColor: "text-white",
    stats: { txns: "1.8M", tps: "250", gas: "$0.15", tvl: "$3B" },
  },
  {
    id: "base",
    name: "Base",
    symbol: "BASE",
    color: "bg-[#0052FF]",
    textColor: "text-white",
    stats: { txns: "5.2M", tps: "200", gas: "$0.01", tvl: "$2.8B" },
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    color: "bg-[#8247E5]",
    textColor: "text-white",
    stats: { txns: "2.9M", tps: "500", gas: "$0.02", tvl: "$1.2B" },
  },
];

// Mini stat row icons
const statIcons = {
  txns: Activity,
  tps: Zap,
  gas: Fuel,
  tvl: Lock,
};

// Animated number hook
function useCountUp(target: number, active: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(start);
      }
    }, 16);
    return () => clearInterval(id);
  }, [active, target, duration]);
  return val;
}

// Live preview widget
function ChainPreviewWidget() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const totalChains = useCountUp(8, visible);
  const totalTvl = useCountUp(68, visible);
  const avgTps = useCountUp(5125, visible);

  return (
    <div ref={ref} className="holo-card p-5 md:p-6 mt-8 md:mt-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">Live Network Overview</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl md:text-3xl font-display font-bold glow-text">{totalChains}</p>
          <p className="text-xs text-muted-foreground mt-1">Chains Tracked</p>
        </div>
        <div>
          <p className="text-2xl md:text-3xl font-display font-bold text-success">${totalTvl}B</p>
          <p className="text-xs text-muted-foreground mt-1">Combined TVL</p>
        </div>
        <div>
          <p className="text-2xl md:text-3xl font-display font-bold text-warning">{avgTps.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Avg TPS</p>
        </div>
      </div>
      {/* Mini gas bar chart */}
      <div className="mt-5 space-y-2">
        <p className="text-[10px] uppercase text-muted-foreground font-display tracking-wider">24h Gas Comparison</p>
        {chains.slice(0, 4).map(c => (
          <div key={c.id} className="flex items-center gap-2">
            <span className="text-[10px] font-display w-10 text-right text-muted-foreground">{c.symbol}</span>
            <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${c.color} transition-all duration-1000`}
                style={{ width: visible ? `${Math.max(5, Math.min(100, parseFloat(c.stats.gas.replace('$', '')) * 40))}%` : '0%' }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-12">{c.stats.gas}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChainLinks() {
  return (
    <section className="py-10 md:py-16 border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-display text-xs mb-4">
            <Sparkles className="w-3 h-3" />
            AI-Powered Chain Analysis
          </div>
          <h2 className="text-[clamp(1.25rem,4vw,2.25rem)] font-display font-bold">
            EXPLORE <span className="glow-text">CHAINS</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-lg mx-auto">
            Deep dive into blockchain-specific analytics, gas prices, TVL, and AI predictions for every supported network.
          </p>
        </div>

        {/* Chain cards with live stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {chains.map((chain, index) => (
            <Link
              key={chain.id}
              to={`/chain/${chain.id}`}
              className="group holo-card p-4 md:p-5 hover:scale-[1.03] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 md:w-14 md:h-14 rounded-full ${chain.color} mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}
              >
                <span className={`font-display font-bold text-xs md:text-sm ${chain.textColor}`}>
                  {chain.symbol}
                </span>
              </div>
              <h3 className="font-display font-bold text-sm md:text-base mb-2 text-center">
                {chain.name}
              </h3>

              {/* Mini stats */}
              <div className="space-y-1.5">
                {(Object.entries(chain.stats) as [keyof typeof statIcons, string][]).map(([key, value]) => {
                  const Icon = statIcons[key];
                  const labels: Record<string, string> = { txns: "24h Txns", tps: "TPS", gas: "Gas", tvl: "TVL" };
                  return (
                    <div key={key} className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Icon className="w-2.5 h-2.5" />
                        {labels[key]}
                      </span>
                      <span className="font-mono font-medium text-foreground">{value}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Analyze <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Live preview widget */}
        <ChainPreviewWidget />

        {/* View all chains CTA */}
        <div className="text-center mt-6 md:mt-8">
          <Button asChild variant="outline" size="lg">
            <Link to="/chain/ethereum" className="inline-flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              View All Chain Analytics
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
