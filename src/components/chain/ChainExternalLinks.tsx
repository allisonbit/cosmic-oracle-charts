import { ChainConfig } from "@/lib/chainConfig";
import { ExternalLink, Globe, Twitter, MessageCircle, Github, BookOpen, BarChart3, Search, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChainExternalLinksProps {
  chain: ChainConfig;
}

export function ChainExternalLinks({ chain }: ChainExternalLinksProps) {
  const links = [
    { label: "Explorer", url: chain.explorerUrl, icon: Search },
    { label: "Website", url: chain.website, icon: Globe },
    { label: "Twitter", url: chain.twitter, icon: Twitter },
    { label: "Discord", url: chain.discord, icon: MessageCircle },
    { label: "GitHub", url: chain.github, icon: Github },
    { label: "Docs", url: chain.docs, icon: BookOpen },
    { label: "DeFi Llama", url: chain.defiLlamaId ? `https://defillama.com/chain/${chain.defiLlamaId}` : null, icon: BarChart3 },
    { label: "Trade", url: "/trade", icon: Coins },
  ].filter(l => l.url);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url!}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
            "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            "border border-border/30 hover:border-border/50"
          )}
        >
          <link.icon className="h-3.5 w-3.5" />
          <span>{link.label}</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-50" />
        </a>
      ))}
    </div>
  );
}
