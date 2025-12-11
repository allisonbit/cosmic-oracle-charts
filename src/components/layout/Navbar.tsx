import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, BookOpen, Globe, Radio, Mail, Layers, Wallet, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import oracleLogo from "@/assets/oracle-logo.jpg";

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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/95 border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group z-10">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <img src={oracleLogo} alt="Oracle" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-base md:text-lg font-bold glow-text">
              ORACLE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg font-display text-xs uppercase tracking-wider transition-all duration-300",
                    isActive
                      ? "bg-primary/20 text-primary glow-text border border-primary/30"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden z-10"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "lg:hidden fixed inset-0 top-14 bg-background/98 backdrop-blur-xl z-40 transition-all duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-lg font-display text-base uppercase tracking-wider transition-all duration-300",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}