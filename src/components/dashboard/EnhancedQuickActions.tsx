import { Link } from "react-router-dom";
import { 
  Search, Layers, Radio, BookOpen, Wallet, TrendingUp, 
  ExternalLink, ArrowRight, Zap, Globe, BarChart3, Shield,
  Activity, Brain, Flame, Eye, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

const primaryActions = [
  { 
    icon: Wallet, 
    label: "Wallet Scanner", 
    shortLabel: "Scanner", 
    path: "/portfolio", 
    color: "text-primary",
    description: "AI-powered wallet analysis for EVM & Solana",
    features: ["Token holdings analysis", "Pump potential predictions", "Risk classification", "Trading recommendations"]
  },
  { 
    icon: Layers, 
    label: "Chain Analysis", 
    shortLabel: "Chains", 
    path: "/chain/ethereum", 
    color: "text-secondary",
    description: "Deep blockchain analytics & metrics",
    features: ["Real-time health metrics", "Whale activity radar", "Token heat scanner", "Multi-chain comparison"]
  },
  { 
    icon: Search, 
    label: "Token Explorer", 
    shortLabel: "Explorer", 
    path: "/explorer", 
    color: "text-success",
    description: "Search any token across all chains",
    features: ["Contract verification", "Holder analysis", "Liquidity metrics", "DEX/CEX volume breakdown"]
  },
  { 
    icon: Radio, 
    label: "Sentiment Hub", 
    shortLabel: "Sentiment", 
    path: "/sentiment", 
    color: "text-warning",
    description: "Multi-platform social intelligence",
    features: ["Twitter/Reddit/Telegram analysis", "Fear & Greed tracking", "Whale transaction alerts", "Trending topics"]
  },
  { 
    icon: BookOpen, 
    label: "Learn Crypto", 
    shortLabel: "Learn", 
    path: "/learn", 
    color: "text-primary",
    description: "Daily updated educational content",
    features: ["Rotating daily tips", "Difficulty-based lessons", "Interactive modules", "Market strategy guides"]
  },
];

const quickLinks = [
  { label: "CoinGecko", url: "https://www.coingecko.com", icon: Globe },
  { label: "DexScreener", url: "https://dexscreener.com", icon: BarChart3 },
  { label: "Etherscan", url: "https://etherscan.io", icon: Search },
  { label: "DefiLlama", url: "https://defillama.com", icon: Activity },
];

export function EnhancedQuickActions() {
  const [selectedAction, setSelectedAction] = useState<typeof primaryActions[0] | null>(null);
  const [showQuickLinks, setShowQuickLinks] = useState(false);

  return (
    <>
      <div className="holo-card p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            QUICK ACTIONS
          </h3>
          <button
            onClick={() => setShowQuickLinks(true)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-display"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">External Links</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3">
          {primaryActions.map(action => {
            const Icon = action.icon;
            return (
              <div key={action.path} className="relative group">
                <Button
                  asChild
                  variant="ghost"
                  className="flex flex-col h-auto py-2 sm:py-3 md:py-4 gap-1 sm:gap-2 hover:bg-primary/10 touch-target tap-highlight-none active:scale-95 transition-transform w-full"
                >
                  <Link to={action.path}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.color}`} />
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-display text-center leading-tight">
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">{action.shortLabel}</span>
                    </span>
                  </Link>
                </Button>
                {/* Info button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedAction(action);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Secondary Quick Stats */}
        <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-4 gap-2">
          {[
            { icon: Flame, label: "Trending", path: "/explorer", color: "text-warning" },
            { icon: Shield, label: "Risk Check", path: "/chain/ethereum", color: "text-danger" },
            { icon: Brain, label: "AI Analysis", path: "/sentiment", color: "text-primary" },
            { icon: Target, label: "Alerts", path: "/dashboard", color: "text-success" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <item.icon className={cn("w-4 h-4", item.color)} />
              <span className="text-[9px] text-muted-foreground group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </>
  );
}
