import { Link } from "react-router-dom";
import { Search, Layers, Radio, BookOpen, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Wallet, label: "Scan Wallet", path: "/portfolio", color: "text-primary" },
  { icon: Layers, label: "Chain Analysis", path: "/chain/ethereum", color: "text-secondary" },
  { icon: Search, label: "Token Explorer", path: "/explorer", color: "text-success" },
  { icon: Radio, label: "Sentiment", path: "/sentiment", color: "text-warning" },
  { icon: BookOpen, label: "Learn", path: "/learn", color: "text-primary" },
];

export function QuickActions() {
  return (
    <div className="holo-card p-6">
      <h3 className="font-display font-bold text-lg mb-4">QUICK ACTIONS</h3>
      <div className="grid grid-cols-5 gap-2">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Button
              key={action.path}
              asChild
              variant="ghost"
              className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/10"
            >
              <Link to={action.path}>
                <Icon className={`w-6 h-6 ${action.color}`} />
                <span className="text-xs font-display">{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
