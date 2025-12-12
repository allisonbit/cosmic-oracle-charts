import { useLocation, useNavigate } from "react-router-dom";
import { CHAINS } from "@/lib/chainConfig";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, TrendingUp, Brain, HelpCircle, Menu, X, ChevronDown, ChevronRight, Layers, Zap, Globe, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
  { title: "Sentiment", url: "/sentiment", icon: Brain },
  { title: "Learn", url: "/learn", icon: HelpCircle },
];

// Categorize chains
const categorizeChains = () => {
  const layer1 = CHAINS.filter(c => ["ethereum", "solana", "bnb", "avalanche", "sui", "ton"].includes(c.id));
  const layer2 = CHAINS.filter(c => ["arbitrum", "base", "optimism", "polygon"].includes(c.id));
  const others = CHAINS.filter(c => !layer1.includes(c) && !layer2.includes(c));
  
  return { layer1, layer2, others };
};

export function ChainSidebar() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [l1Open, setL1Open] = useState(true);
  const [l2Open, setL2Open] = useState(true);
  const [othersOpen, setOthersOpen] = useState(false);

  const { layer1, layer2, others } = categorizeChains();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  // Auto-expand category containing active chain
  useEffect(() => {
    const chainId = currentPath.replace('/chain/', '');
    if (layer1.some(c => c.id === chainId)) setL1Open(true);
    if (layer2.some(c => c.id === chainId)) setL2Open(true);
    if (others.some(c => c.id === chainId)) setOthersOpen(true);
  }, [currentPath, layer1, layer2, others]);

  const isChainActive = (chainId: string) => currentPath === `/chain/${chainId}`;
  const isNavActive = (url: string) => currentPath === url;

  const handleNavigate = (url: string) => {
    navigate(url);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Mobile floating trigger button
  const MobileTrigger = () => (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="fixed bottom-20 left-4 z-50 md:hidden w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-all tap-highlight-none touch-target-lg"
      style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" }}
      aria-label={mobileOpen ? "Close chain menu" : "Open chain menu"}
    >
      {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );

  // Mobile overlay
  const MobileOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
        mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setMobileOpen(false)}
    />
  );

  const ChainItem = ({ chain }: { chain: typeof CHAINS[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => handleNavigate(`/chain/${chain.id}`)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group touch-target tap-highlight-none active:scale-[0.98]",
          isChainActive(chain.id)
            ? "bg-primary/20 border border-primary/30"
            : "hover:bg-muted/50 active:bg-muted/70"
        )}
        style={{
          color: isChainActive(chain.id) ? `hsl(${chain.color})` : undefined,
        }}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all flex-shrink-0",
            isChainActive(chain.id)
              ? "bg-primary/20"
              : "bg-muted/50 group-hover:bg-muted"
          )}
          style={{
            borderColor: `hsl(${chain.color} / 0.3)`,
            boxShadow: isChainActive(chain.id) ? `0 0 12px hsl(${chain.color} / 0.4)` : undefined,
          }}
        >
          {chain.icon}
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className={cn(
              "text-sm font-medium truncate",
              isChainActive(chain.id) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {chain.name}
            </span>
            <span className="text-xs text-muted-foreground">{chain.symbol}</span>
          </div>
        )}
        {!collapsed && isChainActive(chain.id) && (
          <div className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const ChainCategory = ({ 
    title, 
    icon: Icon, 
    chains, 
    open, 
    onOpenChange,
    color 
  }: { 
    title: string; 
    icon: React.ElementType; 
    chains: typeof CHAINS; 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    color: string;
  }) => {
    if (chains.length === 0) return null;

    return (
      <Collapsible open={open} onOpenChange={onOpenChange} className="mt-2">
        <CollapsibleTrigger className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
          collapsed && "justify-center"
        )}>
          <Icon className={cn("h-4 w-4 flex-shrink-0", color)} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{title}</span>
              <span className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">{chains.length}</span>
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          <SidebarMenu>
            {chains.map((chain) => (
              <ChainItem key={chain.id} chain={chain} />
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>
      <MobileTrigger />
      <MobileOverlay />
      
      <Sidebar
        className={cn(
          "border-r border-border/50 bg-sidebar transition-all duration-300 z-50",
          collapsed ? "w-16" : "w-64",
          // Mobile styles
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-64",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
        collapsible="icon"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-lg">✧</span>
              </div>
              <span className="font-display text-sm text-primary glow-text">CHAINS</span>
            </div>
          )}
          <SidebarTrigger className="text-muted-foreground hover:text-foreground hidden md:flex" />
        </div>

        <SidebarContent className="px-2 py-4 overflow-y-auto scrollbar-hide">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className={cn("text-muted-foreground text-xs", collapsed && "sr-only")}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigate(item.url)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                        isNavActive(item.url)
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Categorized Blockchains */}
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className={cn("text-muted-foreground text-xs mb-2", collapsed && "sr-only")}>
              Blockchains
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ChainCategory
                title="Layer 1"
                icon={Globe}
                chains={layer1}
                open={l1Open}
                onOpenChange={setL1Open}
                color="text-primary"
              />
              <ChainCategory
                title="Layer 2 / Rollups"
                icon={Layers}
                chains={layer2}
                open={l2Open}
                onOpenChange={setL2Open}
                color="text-secondary"
              />
              {others.length > 0 && (
                <ChainCategory
                  title="Other Networks"
                  icon={Coins}
                  chains={others}
                  open={othersOpen}
                  onOpenChange={setOthersOpen}
                  color="text-warning"
                />
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Quick Stats */}
          {!collapsed && (
            <div className="mt-6 mx-2 p-3 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-xs font-medium text-foreground">Network Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">L1 Chains</p>
                  <p className="text-foreground font-medium">{layer1.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">L2 Chains</p>
                  <p className="text-foreground font-medium">{layer2.length}</p>
                </div>
              </div>
            </div>
          )}
        </SidebarContent>
      </Sidebar>
    </>
  );
}
