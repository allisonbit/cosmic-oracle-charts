import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const chains = [
  { id: "ethereum",  name: "Ethereum",  symbol: "ETH",  color: "bg-[#627EEA]",                                   textColor: "text-white", tagline: "Smart contracts & DeFi" },
  { id: "solana",    name: "Solana",    symbol: "SOL",  color: "bg-gradient-to-br from-[#9945FF] to-[#14F195]", textColor: "text-white", tagline: "High-speed, low-fee" },
  { id: "bitcoin",   name: "Bitcoin",   symbol: "BTC",  color: "bg-[#F7931A]",                                   textColor: "text-white", tagline: "The original chain" },
  { id: "bnb",       name: "BNB Chain", symbol: "BNB",  color: "bg-[#F0B90B]",                                   textColor: "text-black", tagline: "Low-cost EVM" },
  { id: "arbitrum",  name: "Arbitrum",  symbol: "ARB",  color: "bg-[#28A0F0]",                                   textColor: "text-white", tagline: "Ethereum L2 rollup" },
  { id: "base",      name: "Base",      symbol: "BASE", color: "bg-[#0052FF]",                                   textColor: "text-white", tagline: "Coinbase L2" },
  { id: "polygon",   name: "Polygon",   symbol: "POL",  color: "bg-[#8247E5]",                                   textColor: "text-white", tagline: "Scalable EVM" },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX", color: "bg-[#E84142]",                                   textColor: "text-white", tagline: "Subnets & speed" },
];

export function ChainLinks() {
  return (
    <section className="py-10 md:py-16 border-b border-border/30" aria-labelledby="chains-heading">
      <div className="container mx-auto px-4">
        <div className="section-header mb-2">
          <span className="section-label flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            AI-Powered Chain Analysis
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h2 id="chains-heading" className="text-[clamp(1.5rem,4vw,2.5rem)] font-display font-extrabold leading-tight">
            EXPLORE <span className="glow-text">CHAINS</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm">
            Deep dive into blockchain-specific analytics — live prices, gas, TVL, whale activity and AI
            predictions for each supported network.
          </p>
        </div>

        {/* Chain editorial rows — 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
          {chains.map((chain) => (
            <Link
              key={chain.id}
              to={`/chain/${chain.id}`}
              className="group editorial-row items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full ${chain.color} flex items-center justify-center flex-shrink-0`}>
                <span className={`font-display font-bold text-[10px] ${chain.textColor}`}>
                  {chain.symbol.slice(0, 4)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm group-hover:text-primary transition-colors">{chain.name}</div>
                <div className="text-[11px] text-muted-foreground">{chain.tagline}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border/30">
          <Button asChild variant="outline" size="sm">
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
