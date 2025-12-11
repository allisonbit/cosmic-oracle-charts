import { Link } from "react-router-dom";
import { Search, Layers, Radio, BookOpen, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Wallet, label: "Scan Wallet", shortLabel: "Scanner", path: "/portfolio", color: "text-primary" },
  { icon: Layers, label: "Chain Analysis", shortLabel: "Chains", path: "/chain/ethereum", color: "text-secondary" },
  { icon: Search, label: "Token Explorer", shortLabel: "Explorer", path: "/explorer", color: "text-success" },
  { icon: Radio, label: "Sentiment", shortLabel: "Sentiment", path: "/sentiment", color: "text-warning" },
  { icon: BookOpen, label: "Learn", shortLabel: "Learn", path: "/learn", color: "text-primary" },
];

export function QuickActions() {
  return (
    <div className="holo-card p-3 sm:p-4 md:p-6">
      <h3 className="font-display font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">QUICK ACTIONS</h3>
      <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Button
              key={action.path}
              asChild
              variant="ghost"
              className="flex flex-col h-auto py-2 sm:py-3 md:py-4 gap-1 sm:gap-2 hover:bg-primary/10 touch-target tap-highlight-none active:scale-95 transition-transform"
            >
              <Link to={action.path}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.color}`} />
                <span className="text-[9px] sm:text-[10px] md:text-xs font-display text-center leading-tight">
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden">{action.shortLabel}</span>
                </span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
