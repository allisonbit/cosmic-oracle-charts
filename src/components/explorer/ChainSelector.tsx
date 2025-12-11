import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  ALL_CHAINS, 
  EVM_CHAINS, 
  NON_EVM_CHAINS, 
  L2_CHAINS, 
  APP_CHAINS,
  ExplorerChain 
} from "@/lib/explorerChains";

interface ChainSelectorProps {
  selectedChain: string;
  onChainSelect: (chainId: string) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Chains', chains: ALL_CHAINS },
  { id: 'evm', name: 'EVM', chains: EVM_CHAINS },
  { id: 'non-evm', name: 'Non-EVM', chains: NON_EVM_CHAINS },
  { id: 'layer2', name: 'Layer 2', chains: L2_CHAINS },
  { id: 'appchain', name: 'App Chains', chains: APP_CHAINS },
];

export function ChainSelector({ selectedChain, onChainSelect }: ChainSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const selectedChainData = ALL_CHAINS.find(c => c.id === selectedChain);
  
  const filteredChains = CATEGORIES.find(c => c.id === activeCategory)?.chains.filter(chain =>
    chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chain.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedChainData?.icon || '🔗'}</span>
            <span>{selectedChainData?.name || 'Select Chain'}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "ghost"}
              size="sm"
              className="text-xs whitespace-nowrap h-7"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-1">
            {filteredChains.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No chains found
              </div>
            ) : (
              filteredChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    onChainSelect(chain.id);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                    selectedChain === chain.id 
                      ? "bg-primary/20 border border-primary/50" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <span className="text-xl w-8 text-center">{chain.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{chain.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{chain.symbol}</span>
                      <span>•</span>
                      <span className="capitalize">{chain.category}</span>
                    </div>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {chain.tokenStandard}
                  </span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
