import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, BookOpen, Globe, Radio, Layers, Wallet, Home, Zap, Calendar, Target, Sparkles, ChevronDown, BarChart3, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import oracleLogo from "@/assets/oracle-bull-logo.jpg";
import { GlobalSearch } from "@/components/search/GlobalSearch";

// Dropdown menu configurations
const analyticsItems = [
  { path: "/predictions", label: "AI Predictions", description: "Daily crypto forecasts", icon: Target, color: "text-primary" },
  { path: "/sentiment", label: "Market Sentiment", description: "Fear & Greed Index", icon: BarChart3, color: "text-success" },
  { path: "/strength", label: "Strength Meter", description: "Real-time strength analysis", icon: Zap, color: "text-warning" },
];

const toolsItems = [
  { path: "/portfolio", label: "Wallet Scanner", description: "Analyze any address", icon: Wallet, color: "text-warning" },
  { path: "/explorer", label: "Token Explorer", description: "Search 1000+ tokens", icon: Search, color: "text-primary" },
  { path: "/factory", label: "Crypto Factory", description: "Events, news, narratives", icon: Calendar, color: "text-success" },
];

const chainsItems = [
  { path: "/chain/ethereum", label: "Ethereum", description: "ETH gas, TVL, DeFi", icon: "Ξ", color: "text-secondary" },
  { path: "/chain/solana", label: "Solana", description: "SOL blockchain data", icon: "◎", color: "text-success" },
  { path: "/chain/bitcoin", label: "Bitcoin", description: "BTC on-chain metrics", icon: "₿", color: "text-warning" },
  { path: "/chain/arbitrum", label: "Arbitrum", description: "L2 analytics", icon: "A", color: "text-primary" },
];

const mobileNavItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { path: "/predictions", label: "Predictions", icon: Target },
  { path: "/market/best-crypto-to-buy-today", label: "Hot Picks", icon: Sparkles },
  { path: "/strength", label: "Strength", icon: Zap },
  { path: "/factory", label: "Factory", icon: Calendar },
  { path: "/chain/ethereum", label: "Chains", icon: Layers },
  { path: "/sentiment", label: "Sentiment", icon: Radio },
  { path: "/explorer", label: "Explorer", icon: Globe },
  { path: "/insights", label: "Insights", icon: BookOpen },
  { path: "/portfolio", label: "Scanner", icon: Wallet },
];

interface DropdownItem {
  path: string;
  label: string;
  description: string;
  icon: any;
  color?: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  isChain?: boolean;
}

function NavDropdown({ label, items, isChain = false }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center gap-1 px-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
        {label}
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            {items.map((item) => {
              const IconComponent = typeof item.icon === 'string' ? null : item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    isChain ? "bg-primary/10" : "bg-muted"
                  )}>
                    {isChain || typeof item.icon === 'string' ? (
                      <span className={cn("font-bold text-sm", item.color || "text-primary")}>{item.icon}</span>
                    ) : (
                      IconComponent && <IconComponent className={cn("w-4 h-4", item.color)} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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

            {/* Desktop Navigation with Dropdowns */}
            <div className="hidden lg:flex items-center gap-0.5">
              <Link
                to="/"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActivePath("/")
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActivePath("/dashboard")
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Dashboard
              </Link>
              
              <NavDropdown label="Analytics" items={analyticsItems} />
              <NavDropdown label="Tools" items={toolsItems} />
              <NavDropdown label="Chains" items={chainsItems} isChain />
              
              <Link
                to="/market/best-crypto-to-buy-today"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                  isActivePath("/market/")
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="w-3 h-3" />
                Hot Picks
              </Link>
              
              <Link
                to="/insights"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActivePath("/insights")
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Insights
              </Link>
            </div>

            {/* Mobile Menu Button */}
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

      {/* Mobile Navigation Overlay */}
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
