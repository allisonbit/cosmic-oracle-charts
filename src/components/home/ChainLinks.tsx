import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// The 8 blockchains with dedicated analytics dashboards. Navigation only — we do
// NOT show hardcoded per-chain TPS/gas/TVL numbers here (those were stale
// placeholders presented as if live). Real metrics live on each /chain/* page.
const chains = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "bg-[#627EEA]", textColor: "text-white", tagline: "Smart contracts & DeFi" },
  { id: "solana", name: "Solana", symbol: "SOL", color: "bg-gradient-to-br from-[#9945FF] to-[#14F195]", textColor: "text-white", tagline: "High-speed, low-fee" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", color: "bg-[#F7931A]", textColor: "text-white", tagline: "The original chain" },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", color: "bg-[#F0B90B]", textColor: "text-black", tagline: "Low-cost EVM" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", color: "bg-[#28A0F0]", textColor: "text-white", tagline: "Ethereum L2 rollup" },
  { id: "base", name: "Base", symbol: "BASE", color: "bg-[#0052FF]", textColor: "text-white", tagline: "Coinbase L2" },
  { id: "polygon", name: "Polygon", symbol: "POL", color: "bg-[#8247E5]", textColor: "text-white", tagline: "Scalable EVM" },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX", color: "bg-[#E84142]", textColor: "text-white", tagline: "Subnets & speed" },
];

export function ChainLinks() {
  return (
    <section className="py-10 md:py-16 border-b border-border/30" aria-labelledby="chains-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-display text-xs mb-4">
            <Sparkles className="w-3 h-3" />
            AI-Powered Chain Analysis
          </div>
          <h2 id="chains-heading" className="text-[clamp(1.25rem,4vw,2.25rem)] font-display font-bold">
            EXPLORE <span className="glow-text">CHAINS</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-lg mx-auto">
            Deep dive into blockchain-specific analytics — live prices, gas, TVL, whale activity and AI
            predictions for each supported network.
          </p>
        </div>

        {/* Chain navigation cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {chains.map((chain, index) => (
            <Link
              key={chain.id}
              to={`/chain/${chain.id}`}
              className="group holo-card p-4 md:p-5 hover:scale-[1.03] transition-all duration-300 animate-fade-in flex flex-col items-center text-center"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={`w-11 h-11 md:w-14 md:h-14 rounded-full ${chain.color} mb-3 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}
              >
                <span className={`font-display font-bold text-xs md:text-sm ${chain.textColor}`}>
                  {chain.symbol}
                </span>
              </div>
              <h3 className="font-display font-bold text-sm md:text-base mb-1">{chain.name}</h3>
              <p className="text-[11px] text-muted-foreground">{chain.tagline}</p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Analyze <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

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
