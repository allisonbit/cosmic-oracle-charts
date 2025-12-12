import { ChainConfig } from "@/lib/chainConfig";
import { Cpu, Layers, Coins, Hash, Shield, Zap, Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChainInfoCardProps {
  chain: ChainConfig;
}

export function ChainInfoCard({ chain }: ChainInfoCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "layer1": return "text-primary border-primary/30 bg-primary/10";
      case "layer2": return "text-success border-success/30 bg-success/10";
      case "sidechain": return "text-warning border-warning/30 bg-warning/10";
      default: return "text-muted-foreground border-border bg-muted/10";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "layer1": return "Layer 1";
      case "layer2": return "Layer 2";
      case "sidechain": return "Sidechain";
      default: return category;
    }
  };

  const stats = [
    { label: "TPS", value: chain.tps?.toLocaleString() || "N/A", icon: Zap },
    { label: "Consensus", value: chain.consensus || "N/A", icon: Shield },
    { label: "Decimals", value: chain.nativeDecimals?.toString() || "18", icon: Hash },
    { label: "Category", value: getCategoryLabel(chain.category), icon: Layers },
  ];

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{
              background: `linear-gradient(135deg, hsl(${chain.color} / 0.3), hsl(${chain.color} / 0.1))`,
              boxShadow: `0 0 20px hsl(${chain.color} / 0.3)`,
            }}
          >
            {chain.icon}
          </div>
          <div>
            <h3 className="text-lg font-display text-foreground">{chain.name} Network Info</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getCategoryColor(chain.category)}>
                {getCategoryLabel(chain.category)}
              </Badge>
              <span className="text-xs text-muted-foreground">{chain.symbol}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="p-3 rounded-lg bg-muted/20 border border-border/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Native tokens */}
      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">Top Ecosystem Tokens</p>
        <div className="flex flex-wrap gap-1.5">
          {chain.tokens.slice(0, 10).map((token) => (
            <a
              key={token}
              href={`${chain.explorerUrl}/token/${token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded text-xs bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all border border-border/20"
            >
              {token}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
