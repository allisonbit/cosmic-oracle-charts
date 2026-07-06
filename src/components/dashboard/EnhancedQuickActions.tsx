import { Link } from "react-router-dom";
import {
  Search, Layers, Radio, BookOpen, Wallet,
  ExternalLink, Zap, Globe, BarChart3,
  Activity, Brain, Flame, Eye, Target, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

const primaryActions = [
  { icon: Wallet,   label: "Wallet Scanner", shortLabel: "Scanner",  path: "/scanner",         color: "text-primary",   description: "AI-powered wallet analysis for EVM & Solana",  features: ["Token holdings analysis", "Pump potential predictions", "Risk classification", "Trading recommendations"] },
  { icon: Layers,   label: "Chain Analysis", shortLabel: "Chains",   path: "/chain/ethereum",  color: "text-secondary", description: "Deep blockchain analytics & metrics",           features: ["Real-time health metrics", "Whale activity radar", "Token heat scanner", "Multi-chain comparison"] },
  { icon: Search,   label: "Token Explorer", shortLabel: "Explorer", path: "/explorer",        color: "text-success",   description: "Search any token across all chains",           features: ["Contract verification", "Holder analysis", "Liquidity metrics", "DEX/CEX volume breakdown"] },
  { icon: Radio,    label: "Sentiment Hub",  shortLabel: "Sentiment",path: "/sentiment",       color: "text-warning",   description: "Multi-platform social intelligence",           features: ["Twitter/Reddit/Telegram analysis", "Fear & Greed tracking", "Whale transaction alerts", "Trending topics"] },
  { icon: BookOpen, label: "Learn Crypto",   shortLabel: "Learn",    path: "/learn",           color: "text-primary",   description: "Daily updated educational content",           features: ["Rotating daily tips", "Difficulty-based lessons", "Interactive modules", "Market strategy guides"] },
];

const quickLinks = [
  { label: "CoinGecko", url: "https://www.coingecko.com", icon: Globe },
  { label: "Trade",     url: "/dashboard",               icon: BarChart3 },
  { label: "Etherscan", url: "https://etherscan.io", icon: Search },
  { label: "DefiLlama", url: "https://defillama.com", icon: Activity },
];

const secondaryLinks = [
  { icon: Flame,  label: "Trending",   path: "/explorer",        color: "text-warning" },
  { icon: Shield, label: "Risk Check", path: "/chain/ethereum",  color: "text-danger" },
  { icon: Brain,  label: "AI Analysis",path: "/sentiment",       color: "text-primary" },
  { icon: Target, label: "Alerts",     path: "/dashboard",       color: "text-success" },
];

export function EnhancedQuickActions() {
  const [selectedAction, setSelectedAction] = useState<typeof primaryActions[0] | null>(null);
  const [showQuickLinks, setShowQuickLinks] = useState(false);

  return (
    <>
      <div className="border-t border-border/30 pt-5 pb-5">
        <div className="section-header mb-4">
          <span className="section-label flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary" />
            Quick Actions
          </span>
          <button
            onClick={() => setShowQuickLinks(true)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Links</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {primaryActions.map(action => {
            const Icon = action.icon;
            return (
              <div key={action.path} className="relative group">
                <Button
                  asChild
                  variant="ghost"
                  className="flex flex-col h-auto py-3 gap-1.5 hover:bg-primary/10 w-full touch-target"
                >
                  <Link to={action.path}>
                    <Icon className={cn("w-5 h-5", action.color)} />
                    <span className="text-[9px] sm:text-[10px] font-display text-center leading-tight">
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">{action.shortLabel}</span>
                    </span>
                  </Link>
                </Button>
                <button
                  onClick={(e) => { e.preventDefault(); setSelectedAction(action); }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Secondary links — simple editorial row strip */}
        <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-6">
          {secondaryLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <item.icon className={cn("w-3.5 h-3.5", item.color)} />
              <span className="text-xs group-hover:text-primary transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Action detail dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="max-w-sm">
          {selectedAction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-display">
                  <selectedAction.icon className={cn("w-5 h-5", selectedAction.color)} />
                  {selectedAction.label}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mb-3">{selectedAction.description}</p>
              <ul className="space-y-2 mb-4">
                {selectedAction.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full">
                <Link to={selectedAction.path} onClick={() => setSelectedAction(null)}>
                  Open {selectedAction.label}
                </Link>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* External links dialog */}
      <Dialog open={showQuickLinks} onOpenChange={setShowQuickLinks}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">External Tools</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {quickLinks.map(link => (
              link.url.startsWith('http') ? (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="editorial-row items-center gap-3"
                >
                  <link.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                </a>
              ) : (
                <Link key={link.label} to={link.url} onClick={() => setShowQuickLinks(false)} className="editorial-row items-center gap-3">
                  <link.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              )
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
