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
import { Home, TrendingUp, Brain, HelpCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
  { title: "Sentiment", url: "/sentiment", icon: Brain },
  { title: "Learn", url: "/learn", icon: HelpCircle },
];

export function ChainSidebar() {
  const { state, setOpen, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

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
      className="fixed bottom-4 left-4 z-50 md:hidden w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
      style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" }}
    >
      {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

        <SidebarContent className="px-2 py-4">
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

          {/* Blockchain Chains */}
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className={cn("text-muted-foreground text-xs", collapsed && "sr-only")}>
              Blockchains
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {CHAINS.map((chain) => (
                  <SidebarMenuItem key={chain.id}>
                    <SidebarMenuButton
                      onClick={() => handleNavigate(`/chain/${chain.id}`)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                        isChainActive(chain.id)
                          ? "bg-primary/20 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                      style={{
                        color: isChainActive(chain.id) ? `hsl(${chain.color})` : undefined,
                      }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all",
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
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-sm font-medium",
                            isChainActive(chain.id) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {chain.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{chain.symbol}</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
