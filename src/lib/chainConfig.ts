// Chain configuration for blockchain dashboards
export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  tokens: string[];
  coingeckoId: string;
  explorerUrl: string;
}

export const CHAINS: ChainConfig[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    icon: "⟠",
    color: "190 100% 50%",
    tokens: ["ETH", "LINK", "UNI", "AAVE", "LDO", "MKR", "CRV", "COMP"],
    coingeckoId: "ethereum",
    explorerUrl: "https://etherscan.io",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    icon: "◎",
    color: "270 80% 60%",
    tokens: ["SOL", "RAY", "SRM", "ORCA", "MNGO", "STEP", "COPE"],
    coingeckoId: "solana",
    explorerUrl: "https://solscan.io",
  },
  {
    id: "bnb",
    name: "BNB Chain",
    symbol: "BNB",
    icon: "◆",
    color: "38 100% 50%",
    tokens: ["BNB", "CAKE", "XVS", "BAKE", "BURGER", "TWT"],
    coingeckoId: "binancecoin",
    explorerUrl: "https://bscscan.com",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    icon: "▲",
    color: "0 84% 60%",
    tokens: ["AVAX", "JOE", "PNG", "QI", "TIME", "SPELL"],
    coingeckoId: "avalanche-2",
    explorerUrl: "https://snowtrace.io",
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    icon: "⬡",
    color: "280 80% 55%",
    tokens: ["MATIC", "QUICK", "GHST", "SUSHI", "AAVE"],
    coingeckoId: "matic-network",
    explorerUrl: "https://polygonscan.com",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    icon: "⬢",
    color: "210 90% 55%",
    tokens: ["ARB", "GMX", "MAGIC", "RDNT", "GNS"],
    coingeckoId: "arbitrum",
    explorerUrl: "https://arbiscan.io",
  },
  {
    id: "base",
    name: "Base",
    symbol: "BASE",
    icon: "◉",
    color: "220 90% 55%",
    tokens: ["ETH", "AERO", "BRETT", "DEGEN"],
    coingeckoId: "base",
    explorerUrl: "https://basescan.org",
  },
];

export const getChainById = (id: string): ChainConfig | undefined => {
  return CHAINS.find((chain) => chain.id === id);
};
