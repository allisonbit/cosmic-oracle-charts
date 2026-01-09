import { useState } from "react";
import { 
  Home, LayoutDashboard, Search, TrendingUp, Layers, Wallet, 
  Zap, Calendar, BookOpen, Mail, MoreHorizontal, X 
} from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: TrendingUp, label: "Predict", path: "/predictions" },
  { icon: Zap, label: "Strength", path: "/strength" },
];

const moreNavItems = [
  { icon: Calendar, label: "Factory", path: "/factory" },
  { icon: Layers, label: "Chains", path: "/chain/ethereum" },
  { icon: Search, label: "Explorer", path: "/explorer" },
  { icon: Wallet, label: "Scanner", path: "/portfolio" },
  { icon: BookOpen, label: "Learn", path: "/learn" },
  { icon: Mail, label: "Contact", path: "/contact" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.includes("/chain/")) return location.pathname.includes("/chain/");
    return location.pathname === path;
  };

  const isMoreActive = moreNavItems.some(item => isActivePath(item.path));

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div 
            className="absolute bottom-20 left-2 right-2 bg-card border border-primary/20 rounded-2xl p-3 shadow-2xl shadow-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-sm font-display text-foreground">More Features</span>
              <button 
                onClick={() => setShowMore(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <RouterNavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-all",
                      "tap-highlight-none touch-manipulation",
                      "active:scale-95",
                      isActive 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:bg-muted active:bg-muted"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                    <span className="text-[10px] font-display font-medium">{item.label}</span>
                  </RouterNavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden no-print gpu-accelerated safe-area-bottom" 
        role="navigation" 
        aria-label="Mobile navigation"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/98 to-transparent pointer-events-none h-20 -top-6" />
        
        <div className="relative bg-background/95 backdrop-blur-xl border-t border-primary/20">
          <div className="flex items-center justify-around py-1.5 px-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <RouterNavLink
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-150",
                    "min-w-[48px] min-h-[48px] px-2 py-1",
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

            {/* More Button */}
            <button
              onClick={() => setShowMore(!showMore)}
              aria-expanded={showMore}
              aria-label="More navigation options"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-150",
                "min-w-[48px] min-h-[48px] px-2 py-1",
                "tap-highlight-none touch-manipulation select-none",
                "active:scale-95 active:opacity-80",
                (showMore || isMoreActive)
                  ? "text-primary" 
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <div className="relative flex items-center justify-center w-6 h-6">
                <MoreHorizontal className={cn(
                  "w-5 h-5 transition-all duration-150",
                  (showMore || isMoreActive) && "scale-110 text-primary"
                )} />
                {isMoreActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                )}
                {(showMore || isMoreActive) && (
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md -z-10 scale-150" />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-display font-medium leading-none tracking-wide",
                (showMore || isMoreActive) && "text-primary"
              )}>
                More
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
