import { Home, LayoutDashboard, Search, TrendingUp, MessageCircle } from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Search, label: "Explorer", path: "/explorer" },
  { icon: TrendingUp, label: "Sentiment", path: "/sentiment" },
  { icon: MessageCircle, label: "Contact", path: "/contact" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none h-20 -top-6" />
      
      {/* Nav container */}
      <div className="relative bg-background/80 backdrop-blur-xl border-t border-primary/20 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "relative",
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
                  "text-[10px] font-display font-medium",
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
