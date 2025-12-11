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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none h-24 -top-8" />
      
      {/* Nav container */}
      <div className="relative bg-background/90 backdrop-blur-xl border-t border-primary/20 px-1 pb-safe">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 min-w-[56px] touch-target tap-highlight-none active:scale-95",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground active:text-foreground active:bg-muted/50"
                )}
              >
                <div className={cn(
                  "relative p-1.5",
                  isActive && "animate-pulse"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110"
                  )} />
                  {isActive && (
                    <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md -z-10" />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-display font-medium leading-none",
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
