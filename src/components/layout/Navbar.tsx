import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, BookOpen, Globe, Radio, Layers, Wallet, Home, Zap, Calendar, Target, Sparkles, BarChart3, Search, Gift, Calculator, ArrowRightLeft, Compass, Newspaper, ChevronDown, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import oracleLogo from "@/assets/oracle-bull-logo.jpg";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { UserMenu } from "@/components/auth/UserMenu";

// Primary nav — the 6 most important destinations
const PRIMARY_NAV = [
  { path: "/",           label: "Home" },
  { path: "/dashboard",  label: "Dashboard" },
  { path: "/predictions",label: "Predictions" },
  { path: "/trade",      label: "Trade" },
  { path: "/news",       label: "News" },
  { path: "/tools",      label: "Tools" },
];

// Secondary nav — grouped under "More"
const MORE_GROUPS = [
  {
    label: "Markets",
    items: [
      { path: "/explorer",       label: "Explorer" },
      { path: "/scanner",        label: "Scanner" },
      { path: "/strength",       label: "Strength" },
      { path: "/compare",        label: "Compare" },
    ],
  },
  {
    label: "Crypto",
    items: [
      { path: "/chain/ethereum", label: "Chains" },
      { path: "/factory",        label: "Factory" },
      { path: "/airdrops",       label: "Airdrops" },
      { path: "/sentiment",      label: "Sentiment" },
    ],
  },
  {
    label: "Learn",
    items: [
      { path: "/how-to-buy",     label: "Guides" },
      { path: "/insights",       label: "Insights" },
    ],
  },
];

// Mobile hamburger shows all pages in groups
const MOBILE_GROUPS = [
  { label: "Main",    items: [
    { path: "/",            label: "Home",        icon: Home },
    { path: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    { path: "/predictions", label: "Predictions", icon: Target },
    { path: "/trade",       label: "Trade",       icon: Wallet },
    { path: "/news",        label: "News",        icon: Newspaper },
    { path: "/tools",       label: "Tools",       icon: Calculator },
  ]},
  { label: "Markets", items: [
    { path: "/explorer",       label: "Explorer",  icon: Globe },
    { path: "/scanner",        label: "Scanner",   icon: Search },
    { path: "/strength",       label: "Strength",  icon: Zap },
    { path: "/compare",        label: "Compare",   icon: ArrowRightLeft },
  ]},
  { label: "Crypto",  items: [
    { path: "/chain/ethereum", label: "Chains",    icon: Layers },
    { path: "/factory",        label: "Factory",   icon: Calendar },
    { path: "/airdrops",       label: "Airdrops",  icon: Gift },
    { path: "/sentiment",      label: "Sentiment", icon: Radio },
  ]},
  { label: "Learn",   items: [
    { path: "/how-to-buy",     label: "Guides",    icon: Compass },
    { path: "/insights",       label: "Insights",  icon: BookOpen },
  ]},
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
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
                <img src={oracleLogo} alt="Oracle - AI Crypto Forecasting" className="w-full h-full object-cover" width={40} height={40} loading="eager" decoding="async" />
              </div>
              <span className="text-base md:text-lg font-bold glow-text hidden sm:block">
                Oracle Bull
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <GlobalSearch />
            </div>

            {/* Desktop Navigation — 6 primary + More dropdown */}
            <div className="hidden lg:flex items-center gap-0.5">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    isActivePath(item.path)
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* More dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreOpen(o => !o)}
                  onBlur={() => setTimeout(() => setIsMoreOpen(false), 150)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    isMoreOpen ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  More
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isMoreOpen && "rotate-180")} />
                </button>

                {isMoreOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-background/98 backdrop-blur-xl border border-border rounded-xl shadow-xl z-50 p-2">
                    {MORE_GROUPS.map((group) => (
                      <div key={group.label} className="mb-2 last:mb-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 tracking-widest">{group.label}</p>
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMoreOpen(false)}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm font-medium transition-all",
                              isActivePath(item.path)
                                ? "bg-primary/20 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <UserMenu className="ml-2" />
            </div>

            {/* Mobile: User Menu + Hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <UserMenu />
              <button
                type="button"
                className="relative z-[60] h-10 w-10 flex items-center justify-center rounded-lg bg-background/80 border border-primary/20 active:bg-primary/20 touch-manipulation"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-foreground" />}
              </button>
            </div>
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
          
          <nav className="container mx-auto px-4 pb-6" aria-label="Mobile navigation">
            {MOBILE_GROUPS.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-2 tracking-widest border-b border-border/40 mb-1">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation",
                          isActive
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20"
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
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
