import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, TrendingUp, BookOpen, Globe, Radio, Mail, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Activity },
  { path: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { path: "/chain/ethereum", label: "Chains", icon: Layers },
  { path: "/sentiment", label: "Sentiment", icon: Radio },
  { path: "/explorer", label: "Explorer", icon: Globe },
  { path: "/learn", label: "Learn", icon: BookOpen },
  { path: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-base md:text-lg font-bold glow-text">
              ORACLE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path.includes("/chain/") && location.pathname.includes("/chain/"));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg font-display text-xs uppercase tracking-wider transition-all duration-300",
                    isActive
                      ? "bg-primary/20 text-primary glow-text"
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
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-2 animate-fade-in border-t border-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path.includes("/chain/") && location.pathname.includes("/chain/"));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-display text-sm uppercase tracking-wider transition-all duration-300",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
