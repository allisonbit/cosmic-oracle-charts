import { 
  Home, LayoutDashboard, TrendingUp, Brain, Zap, Calendar, Layers, Search, Wallet, BookOpen
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: TrendingUp, label: "Predict", path: "/predictions" },
  { icon: Brain, label: "Sentiment", path: "/sentiment" },
  { icon: Zap, label: "Strength", path: "/strength" },
  { icon: Search, label: "Explorer", path: "/explorer" },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.includes("/chain/")) return location.pathname.includes("/chain/");
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden no-print gpu-accelerated safe-area-bottom" 
      role="navigation" 
      aria-label="Mobile navigation"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/98 to-transparent pointer-events-none h-20 -top-6" />
      
      <div className="relative bg-background/95 backdrop-blur-xl border-t border-primary/20">
        <div className="flex items-center justify-around py-1.5 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-150",
                  "min-w-[44px] min-h-[48px] px-1.5 py-1",
                  "tap-highlight-none touch-manipulation select-none",
                  "active:scale-95 active:opacity-80",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <div className="relative flex items-center justify-center w-6 h-6">
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-150",
                    isActive && "scale-110 text-primary"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md -z-10 scale-150" />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-display font-medium leading-none tracking-wide",
                  isActive && "text-primary"
                )}>
                  {item.label}
                </span>
              </RouterNavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
