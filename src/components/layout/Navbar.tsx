import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, BookOpen, Globe, Radio, Mail, Layers, Wallet, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import oracleLogo from "@/assets/oracle-bull-logo.jpg";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { path: "/portfolio", label: "Scanner", icon: Wallet },
  { path: "/chain/ethereum", label: "Chains", icon: Layers },
  { path: "/sentiment", label: "Sentiment", icon: Radio },
  { path: "/explorer", label: "Explorer", icon: Globe },
  { path: "/learn", label: "Learn", icon: BookOpen },
  { path: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.includes("/chain/")) return location.pathname.includes("/chain/");
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/95 border-b border-primary/20 safe-area-top">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group z-10">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow flex-shrink-0">
              <img src={oracleLogo} alt="Oracle" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-base md:text-lg font-bold glow-text">
              ORACLE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-lg font-display text-[10px] xl:text-xs uppercase tracking-wider transition-all duration-300",
                    isActive
                      ? "bg-primary/20 text-primary glow-text border border-primary/30"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden z-10 h-10 w-10"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "lg:hidden fixed inset-0 top-14 bg-background/98 backdrop-blur-xl z-40 transition-all duration-300 overflow-y-auto scroll-smooth-touch",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4 py-4 space-y-1 pb-24">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl font-display text-sm uppercase tracking-wider transition-all duration-200 tap-highlight-none active:scale-[0.98]",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground active:text-primary active:bg-primary/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}