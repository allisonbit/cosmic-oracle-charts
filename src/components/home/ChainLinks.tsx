import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const chains = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "from-blue-500 to-purple-500" },
  { id: "solana", name: "Solana", symbol: "SOL", color: "from-purple-500 to-pink-500" },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", color: "from-yellow-500 to-orange-500" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", color: "from-blue-400 to-cyan-400" },
  { id: "base", name: "Base", symbol: "BASE", color: "from-blue-600 to-blue-400" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", color: "from-purple-600 to-purple-400" },
];

export function ChainLinks() {
  return (
    <section className="py-12 md:py-16 border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-display font-bold">
            EXPLORE <span className="glow-text">CHAINS</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Deep dive into blockchain-specific analytics
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {chains.map((chain, index) => (
            <Link
              key={chain.id}
              to={`/chain/${chain.id}`}
              className="group holo-card p-4 md:p-6 text-center hover:scale-105 transition-transform animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${chain.color} mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
              >
                <span className="font-display font-bold text-xs md:text-sm text-white">
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
      </div>
    </section>
  );
}
