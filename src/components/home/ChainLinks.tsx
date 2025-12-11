import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const chains = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "bg-[#627EEA]", textColor: "text-white" },
  { id: "solana", name: "Solana", symbol: "SOL", color: "bg-gradient-to-br from-[#9945FF] to-[#14F195]", textColor: "text-white" },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", color: "bg-[#F0B90B]", textColor: "text-black" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", color: "bg-[#28A0F0]", textColor: "text-white" },
  { id: "base", name: "Base", symbol: "BASE", color: "bg-[#0052FF]", textColor: "text-white" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", color: "bg-[#8247E5]", textColor: "text-white" },
];

export function ChainLinks() {
  return (
    <section className="py-10 md:py-16 border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-display text-xs mb-4">
            <Sparkles className="w-3 h-3" />
            AI-Powered Chain Analysis
          </div>
          <h2 className="text-2xl md:text-4xl font-display font-bold">
            EXPLORE <span className="glow-text">CHAINS</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Deep dive into blockchain-specific analytics & AI predictions
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {chains.map((chain, index) => (
            <Link
              key={chain.id}
              to={`/chain/${chain.id}`}
              className="group holo-card p-4 md:p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${chain.color} mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}
              >
                <span className={`font-display font-bold text-xs md:text-sm ${chain.textColor}`}>
                  {chain.symbol}
                </span>
              </div>
              <h3 className="font-display font-bold text-sm md:text-base mb-1">
                {chain.name}
              </h3>
              <div className="flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick link to all chains */}
        <div className="text-center mt-6 md:mt-8">
          <Link 
            to="/chain/ethereum"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-display text-sm transition-colors"
          >
            View all chain analytics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
