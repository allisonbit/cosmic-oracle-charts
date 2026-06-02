import { Link } from "react-router-dom";
import { ArrowRight, Layers, Coins, Cpu, Gamepad2, Shield } from "lucide-react";

const categories = [
  {
    title: "Layer 1 Blockchains",
    icon: Layers,
    links: [
      { name: "Bitcoin (BTC)", url: "/price-prediction/bitcoin/daily" },
      { name: "Ethereum (ETH)", url: "/price-prediction/ethereum/daily" },
      { name: "Solana (SOL)", url: "/price-prediction/solana/daily" },
      { name: "Cardano (ADA)", url: "/price-prediction/cardano/daily" },
      { name: "Avalanche (AVAX)", url: "/price-prediction/avalanche/daily" },
    ]
  },
  {
    title: "DeFi Protocols",
    icon: Coins,
    links: [
      { name: "Uniswap (UNI)", url: "/price-prediction/uniswap/daily" },
      { name: "Aave (AAVE)", url: "/price-prediction/aave/daily" },
      { name: "Maker (MKR)", url: "/price-prediction/maker/daily" },
      { name: "Chainlink (LINK)", url: "/price-prediction/chainlink/daily" },
      { name: "Lido DAO (LDO)", url: "/price-prediction/lido-dao/daily" },
    ]
  },
  {
    title: "AI & Big Data",
    icon: Cpu,
    links: [
      { name: "Render (RNDR)", url: "/price-prediction/render/daily" },
      { name: "Fetch.ai (FET)", url: "/price-prediction/fetch-ai/daily" },
      { name: "SingularityNET (AGIX)", url: "/price-prediction/singularitynet/daily" },
      { name: "The Graph (GRT)", url: "/price-prediction/the-graph/daily" },
      { name: "Ocean Protocol (OCEAN)", url: "/price-prediction/ocean-protocol/daily" },
    ]
  },
  {
    title: "GameFi & Metaverse",
    icon: Gamepad2,
    links: [
      { name: "Axie Infinity (AXS)", url: "/price-prediction/axie-infinity/daily" },
      { name: "The Sandbox (SAND)", url: "/price-prediction/the-sandbox/daily" },
      { name: "Decentraland (MANA)", url: "/price-prediction/decentraland/daily" },
      { name: "Gala (GALA)", url: "/price-prediction/gala/daily" },
      { name: "Immutable (IMX)", url: "/price-prediction/immutable/daily" },
    ]
  }
];

export function MarketCategoriesHub() {
  return (
    <section className="py-16 md:py-24 border-t border-border/50 bg-background/50 relative" aria-labelledby="categories-heading">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 id="categories-heading" className="text-[clamp(1.5rem,3vw,2rem)] font-display font-bold">
            Explore Crypto <span className="text-gradient-cosmic">Categories</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm md:text-base">
            Deep dive into specific market sectors with our AI-powered price predictions and on-chain analytics.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg">{category.title}</h3>
                </div>
                
                <ul className="space-y-3">
                  {category.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        to={link.url}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                      >
                        <ArrowRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to="/explorer" 
                  className="mt-4 text-xs font-semibold text-primary/80 hover:text-primary inline-flex items-center uppercase tracking-wider"
                >
                  View all {category.title} <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
