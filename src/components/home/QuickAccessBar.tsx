import { Link } from "react-router-dom";
import { TrendingUp, Wallet, Target, Zap } from "lucide-react";

const quickLinks = [
  {
    label: "Bitcoin",
    href: "/price-prediction/bitcoin/daily",
    icon: "₿",
    bgColor: "bg-warning/20",
    textColor: "text-warning",
  },
  {
    label: "Ethereum",
    href: "/price-prediction/ethereum/daily",
    icon: "Ξ",
    bgColor: "bg-secondary/20",
    textColor: "text-secondary",
  },
  {
    label: "Solana",
    href: "/price-prediction/solana/daily",
    icon: "◎",
    bgColor: "bg-success/20",
    textColor: "text-success",
  },
  {
    label: "AI Predictions",
    href: "/predictions",
    icon: <Target className="w-3.5 h-3.5" />,
    bgColor: "bg-primary/20",
    textColor: "text-primary",
  },
  {
    label: "Strength",
    href: "/strength",
    icon: <Zap className="w-3.5 h-3.5" />,
    bgColor: "bg-warning/20",
    textColor: "text-warning",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: <Wallet className="w-3.5 h-3.5" />,
    bgColor: "bg-success/20",
    textColor: "text-success",
  },
];

export function QuickAccessBar() {
  return (
    <div className="bg-card/50 border-b border-border py-2 px-3 sm:px-4 overflow-x-auto scrollbar-hide scroll-smooth-touch tap-highlight-none">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4 min-w-max">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-muted-foreground hidden sm:block">Quick Access:</span>
            <div className="flex items-center gap-2 sm:gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 ${link.bgColor} rounded flex items-center justify-center`}>
                    <span className={`${link.textColor} text-xs`}>
                      {typeof link.icon === 'string' ? link.icon : link.icon}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm group-hover:text-primary transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Live updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
