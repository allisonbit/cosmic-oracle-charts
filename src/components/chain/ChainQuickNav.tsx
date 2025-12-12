import { Link, useParams } from "react-router-dom";
import { CHAINS, ChainConfig } from "@/lib/chainConfig";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ChainQuickNav() {
  const { chainId } = useParams<{ chainId: string }>();
  const currentIndex = CHAINS.findIndex(c => c.id === chainId);
  const prevChain = currentIndex > 0 ? CHAINS[currentIndex - 1] : null;
  const nextChain = currentIndex < CHAINS.length - 1 ? CHAINS[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Chain selector pills */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {CHAINS.map((chain) => (
          <Link
            key={chain.id}
            to={`/chain/${chain.id}`}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
              chain.id === chainId
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="text-sm">{chain.icon}</span>
            <span className="hidden sm:inline">{chain.name}</span>
            <span className="sm:hidden">{chain.symbol}</span>
          </Link>
        ))}
      </div>

      {/* Prev/Next navigation */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {prevChain ? (
          <Link
            to={`/chain/${prevChain.id}`}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all text-xs"
            title={`Previous: ${prevChain.name}`}
          >
            <ChevronLeft className="h-3 w-3" />
            <span className="hidden md:inline">{prevChain.symbol}</span>
          </Link>
        ) : (
          <div className="w-8" />
        )}
        {nextChain ? (
          <Link
            to={`/chain/${nextChain.id}`}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all text-xs"
            title={`Next: ${nextChain.name}`}
          >
            <span className="hidden md:inline">{nextChain.symbol}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>
  );
}
