import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, BookOpen, Globe, Radio, Layers, Wallet, Home, Zap, Calendar, Target, Sparkles, BarChart3, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import oracleLogo from "@/assets/oracle-bull-logo.jpg";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { UserMenu } from "@/components/auth/UserMenu";

const desktopNavItems = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/predictions", label: "Predictions" },
  { path: "/sentiment", label: "Sentiment" },
  { path: "/strength", label: "Strength" },
  { path: "/explorer", label: "Explorer" },
  { path: "/scanner", label: "Scanner" },
  { path: "/factory", label: "Factory" },
  { path: "/chain/ethereum", label: "Chains" },
  { path: "/insights", label: "Insights" },
];

const mobileNavItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { path: "/predictions", label: "Predictions", icon: Target },
  
  { path: "/strength", label: "Strength", icon: Zap },
  { path: "/factory", label: "Factory", icon: Calendar },
  { path: "/chain/ethereum", label: "Chains", icon: Layers },
  { path: "/sentiment", label: "Sentiment", icon: Radio },
  { path: "/explorer", label: "Explorer", icon: Globe },
  { path: "/scanner", label: "Scanner", icon: Search },
  { path: "/insights", label: "Insights", icon: BookOpen },
  
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
    if (path === "/predictions") return location.pathname.includes("/prediction") || location.pathname.includes("/q/");
    if (path.includes("/market/")) return location.pathname.includes("/market/");
    return location.pathname === path;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/95 border-b border-primary/20 safe-area-top">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 md:h-16 gap-2 md:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group relative z-[60] flex-shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow flex-shrink-0">
                <img src={oracleLogo} alt="Oracle - AI Crypto Forecasting" className="w-full h-full object-cover" />
              </div>
              <span className="text-base md:text-lg font-bold glow-text hidden sm:block">
                Oracle Bull
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <GlobalSearch />
            </div>

            {/* Desktop Navigation - Flat Links */}
            <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
              {desktopNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-2.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    isActivePath(item.path)
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <UserMenu className="ml-2" />
            </div>

            {/* Mobile: User Menu + Hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <UserMenu />
            <button
              type="button"
              className="lg:hidden relative z-[60] h-10 w-10 flex items-center justify-center rounded-lg bg-background/80 border border-primary/20 active:bg-primary/20 touch-manipulation"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Full Page Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[55] bg-background/98 backdrop-blur-xl overflow-y-auto"
          style={{ paddingTop: '56px' }}
        >
          {/* Mobile Search */}
          <div className="container mx-auto px-4 py-4">
            <GlobalSearch />
          </div>
          
          <nav className="container mx-auto px-4 pb-6 space-y-2" aria-label="Mobile navigation">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
