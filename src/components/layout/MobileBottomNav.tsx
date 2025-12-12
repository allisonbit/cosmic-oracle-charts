import { Home, LayoutDashboard, Search, TrendingUp, MessageCircle, Layers, BookOpen } from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Layers, label: "Chains", path: "/chain/ethereum" },
  { icon: Search, label: "Explorer", path: "/explorer" },
  { icon: TrendingUp, label: "Sentiment", path: "/sentiment" },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.includes("/chain/")) return location.pathname.includes("/chain/");
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden no-print gpu-accelerated" role="navigation" aria-label="Mobile navigation">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none h-24 -top-8" />
      
      {/* Nav container */}
      <div className="relative bg-background/95 backdrop-blur-xl border-t border-primary/20 px-1 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150",
                  "min-w-[52px] min-h-[52px] px-2 py-1.5",
                  "tap-highlight-none touch-manipulation select-none",
                  "active:scale-95 active:opacity-80",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground active:text-foreground active:bg-muted/50"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-6 h-6",
                  isActive && "animate-pulse"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-150",
                    isActive && "scale-110"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md -z-10 scale-150" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-display font-medium leading-none tracking-wide",
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
