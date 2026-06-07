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
  defiLlamaId?: string;
  dexScreenerId?: string;
  tps?: number;
  consensus?: string;
  nativeDecimals?: number;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  docs?: string;
  category: "layer1" | "layer2" | "sidechain";
}

export const CHAINS: ChainConfig[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    icon: "⟠",
    color: "190 100% 50%",
    tokens: ["ETH", "LINK", "UNI", "AAVE", "LDO", "MKR", "CRV", "COMP", "ENS", "SNX", "RPL", "DYDX"],
    coingeckoId: "ethereum",
    explorerUrl: "https://etherscan.io",
    defiLlamaId: "ethereum",
    dexScreenerId: "ethereum",
    tps: 15,
    consensus: "Proof of Stake",
    nativeDecimals: 18,
    website: "https://ethereum.org",
    twitter: "https://twitter.com/ethereum",
    discord: "https://discord.gg/ethereum-org",
    github: "https://github.com/ethereum",
    docs: "https://ethereum.org/developers",
    category: "layer1",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    icon: "◎",
    color: "270 80% 60%",
    tokens: ["SOL", "RAY", "ORCA", "JTO", "PYTH", "JUP", "BONK", "WIF", "RENDER", "HNT"],
    coingeckoId: "solana",
    explorerUrl: "https://solscan.io",
    defiLlamaId: "solana",
    dexScreenerId: "solana",
    tps: 4000,
    consensus: "Proof of History + PoS",
    nativeDecimals: 9,
    website: "https://solana.com",
    twitter: "https://twitter.com/solana",
    discord: "https://discord.gg/solana",
    github: "https://github.com/solana-labs",
    docs: "https://docs.solana.com",
    category: "layer1",
  },
  {
    id: "bnb",
    name: "BNB Chain",
    symbol: "BNB",
    icon: "◆",
    color: "38 100% 50%",
    tokens: ["BNB", "CAKE", "XVS", "BAKE", "TWT", "ALPACA", "DODO", "VENUS"],
    coingeckoId: "binancecoin",
    explorerUrl: "https://bscscan.com",
    defiLlamaId: "bsc",
    dexScreenerId: "bsc",
    tps: 160,
    consensus: "Proof of Staked Authority",
    nativeDecimals: 18,
    website: "https://bnbchain.org",
    twitter: "https://twitter.com/BNBChain",
    github: "https://github.com/bnb-chain",
    docs: "https://docs.bnbchain.org",
    category: "layer1",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    icon: "▲",
    color: "0 84% 60%",
    tokens: ["AVAX", "JOE", "PNG", "QI", "SPELL", "BENQI", "YAK", "GMX"],
    coingeckoId: "avalanche-2",
    explorerUrl: "https://snowtrace.io",
    defiLlamaId: "avax",
    dexScreenerId: "avalanche",
    tps: 4500,
    consensus: "Avalanche Consensus",
    nativeDecimals: 18,
    website: "https://avax.network",
    twitter: "https://twitter.com/avaboratory",
    discord: "https://discord.gg/avalanche",
    github: "https://github.com/ava-labs",
    docs: "https://docs.avax.network",
    category: "layer1",
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "POL",
    icon: "⬡",
    color: "280 80% 55%",
    tokens: ["POL", "QUICK", "GHST", "SUSHI", "AAVE", "DFYN", "QI"],
    coingeckoId: "matic-network",
    explorerUrl: "https://polygonscan.com",
    defiLlamaId: "polygon",
    dexScreenerId: "polygon",
    tps: 7000,
    consensus: "Proof of Stake",
    nativeDecimals: 18,
    website: "https://polygon.technology",
    twitter: "https://twitter.com/0xPolygon",
    discord: "https://discord.gg/polygon",
    github: "https://github.com/maticnetwork",
    docs: "https://docs.polygon.technology",
    category: "sidechain",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    icon: "⬢",
    color: "210 90% 55%",
    tokens: ["ARB", "GMX", "MAGIC", "RDNT", "GNS", "PENDLE", "JONES", "DPX"],
    coingeckoId: "arbitrum",
    explorerUrl: "https://arbiscan.io",
    defiLlamaId: "arbitrum",
    dexScreenerId: "arbitrum",
    tps: 100,
    consensus: "Optimistic Rollup",
    nativeDecimals: 18,
    website: "https://arbitrum.io",
    twitter: "https://twitter.com/arbitrum",
    discord: "https://discord.gg/arbitrum",
    github: "https://github.com/OffchainLabs",
    docs: "https://docs.arbitrum.io",
    category: "layer2",
  },
  {
    id: "base",
    name: "Base",
    symbol: "ETH",
    icon: "◉",
    color: "220 90% 55%",
    tokens: ["ETH", "AERO", "BRETT", "DEGEN", "TOSHI", "HIGHER", "VIRTUAL"],
    coingeckoId: "ethereum",
    explorerUrl: "https://basescan.org",
    defiLlamaId: "base",
    dexScreenerId: "base",
    tps: 100,
    consensus: "Optimistic Rollup",
    nativeDecimals: 18,
    website: "https://base.org",
    twitter: "https://twitter.com/base",
    github: "https://github.com/base-org",
    docs: "https://docs.base.org",
    category: "layer2",
  },
  {
    id: "optimism",
    name: "Optimism",
    symbol: "OP",
    icon: "⨀",
    color: "0 100% 60%",
    tokens: ["OP", "VELO", "SNX", "PERP", "LYRA", "THALES"],
    coingeckoId: "optimism",
    explorerUrl: "https://optimistic.etherscan.io",
    defiLlamaId: "optimism",
    dexScreenerId: "optimism",
    tps: 100,
    consensus: "Optimistic Rollup",
    nativeDecimals: 18,
    website: "https://optimism.io",
    twitter: "https://twitter.com/Optimism",
    discord: "https://discord.gg/optimism",
    github: "https://github.com/ethereum-optimism",
    docs: "https://docs.optimism.io",
    category: "layer2",
  },
  {
    id: "sui",
    name: "Sui",
    symbol: "SUI",
    icon: "◈",
    color: "200 100% 55%",
    tokens: ["SUI", "CETUS", "TURBOS", "NAVI", "SCALLOP"],
    coingeckoId: "sui",
    explorerUrl: "https://suiscan.xyz",
    defiLlamaId: "sui",
    dexScreenerId: "sui",
    tps: 10000,
    consensus: "Delegated PoS",
    nativeDecimals: 9,
    website: "https://sui.io",
    twitter: "https://twitter.com/SuiNetwork",
    discord: "https://discord.gg/sui",
    github: "https://github.com/MystenLabs",
    docs: "https://docs.sui.io",
    category: "layer1",
  },
  {
    id: "ton",
    name: "TON",
    symbol: "TON",
    icon: "◇",
    color: "200 80% 50%",
    tokens: ["TON", "NOT", "DOGS", "HMSTR", "CATI"],
    coingeckoId: "the-open-network",
    explorerUrl: "https://tonscan.org",
    defiLlamaId: "ton",
    dexScreenerId: "ton",
    tps: 100000,
    consensus: "Proof of Stake",
    nativeDecimals: 9,
    website: "https://ton.org",
    twitter: "https://twitter.com/ton_blockchain",
    github: "https://github.com/ton-blockchain",
    docs: "https://docs.ton.org",
    category: "layer1",
  },
];

export const getChainById = (id: string): ChainConfig | undefined => {
  return CHAINS.find((chain) => chain.id === id);
};

export const getChainsByCategory = () => {
  return {
    layer1: CHAINS.filter(c => c.category === "layer1"),
    layer2: CHAINS.filter(c => c.category === "layer2"),
    sidechain: CHAINS.filter(c => c.category === "sidechain"),
  };
};

// ── Per-chain editorial / SEO metadata ────────────────────────────────────────
// Powers the on-page "About" content, meta descriptions and FAQ. Kept factual
// and concise so every chain page ships unique, indexable copy.
export interface ChainSEO {
  tagline: string;
  description: string;       // 2–3 sentence overview
  highlights: string[];      // 3 quick selling points
  useCases: string[];        // what the chain is used for
  launchYear: number;
  ecosystem: string;         // one-line ecosystem summary
}

export const CHAIN_SEO: Record<string, ChainSEO> = {
  ethereum: {
    tagline: "The world's programmable blockchain",
    description:
      "Ethereum is the largest smart-contract platform and the home of DeFi, NFTs and most of crypto's developer activity. Since The Merge it secures the network with proof-of-stake, and its roadmap scales through a thriving ecosystem of Layer-2 rollups.",
    highlights: ["Largest DeFi & developer ecosystem", "Proof-of-stake since The Merge", "Settlement layer for most L2s"],
    useCases: ["DeFi & lending", "NFTs & digital collectibles", "Stablecoins & payments", "DAOs & governance"],
    launchYear: 2015,
    ecosystem: "Home to Uniswap, Aave, Lido and thousands of dApps.",
  },
  solana: {
    tagline: "High-speed Layer-1 for mainstream apps",
    description:
      "Solana is a high-throughput Layer-1 built for speed and ultra-low fees, combining Proof of History with proof-of-stake to process thousands of transactions per second. It hosts one of crypto's fastest-growing DeFi, NFT and memecoin ecosystems.",
    highlights: ["Thousands of TPS, sub-cent fees", "Proof of History innovation", "Booming consumer & memecoin scene"],
    useCases: ["High-frequency DeFi", "Memecoins & trading", "NFTs & gaming", "Payments & DePIN"],
    launchYear: 2020,
    ecosystem: "Powers Jupiter, Raydium, Jito and major memecoin launches.",
  },
  bnb: {
    tagline: "Low-fee chain of the Binance ecosystem",
    description:
      "BNB Chain is the BNB-powered smart-contract network connected to the Binance ecosystem, known for low fees and high throughput. Running Proof of Staked Authority, it hosts one of the largest DeFi and retail user bases in crypto.",
    highlights: ["Very low transaction fees", "Huge retail user base", "Deep DeFi & launchpad activity"],
    useCases: ["DeFi & yield farming", "Token launches", "GameFi", "Retail payments"],
    launchYear: 2020,
    ecosystem: "Anchored by PancakeSwap, Venus and the Binance ecosystem.",
  },
  avalanche: {
    tagline: "Fast finality and custom subnets",
    description:
      "Avalanche is a fast Layer-1 using its novel Avalanche consensus and a multi-chain 'subnet' architecture, enabling sub-second finality and custom app-chains. It targets DeFi, gaming and institutional use cases that need dedicated throughput.",
    highlights: ["Sub-second finality", "Custom subnets / app-chains", "Institutional & gaming focus"],
    useCases: ["DeFi", "Institutional app-chains", "Gaming subnets", "RWA tokenization"],
    launchYear: 2020,
    ecosystem: "Home to Trader Joe, GMX and a growing subnet network.",
  },
  polygon: {
    tagline: "Ethereum scaling for the masses",
    description:
      "Polygon is a leading Ethereum scaling ecosystem offering low-cost, high-speed transactions. Widely adopted by enterprises and consumer apps, it is expanding into zk-powered Layer-2s under the Polygon 2.0 and POL roadmap.",
    highlights: ["Low fees, high speed", "Major enterprise adoption", "zk-rollup roadmap (Polygon 2.0)"],
    useCases: ["Consumer & enterprise dApps", "DeFi", "NFTs & gaming", "Payments"],
    launchYear: 2017,
    ecosystem: "Used by global brands plus QuickSwap, Aave and more.",
  },
  arbitrum: {
    tagline: "The leading Ethereum Layer-2 by TVL",
    description:
      "Arbitrum is the leading Ethereum Layer-2 by total value locked, using optimistic rollups to deliver Ethereum-grade security with far lower fees. It hosts a deep DeFi and derivatives ecosystem governed by the ARB token.",
    highlights: ["#1 L2 by TVL", "Ethereum security, lower fees", "Deep DeFi & perps ecosystem"],
    useCases: ["DeFi & derivatives", "Perpetuals trading", "Yield strategies", "On-chain governance"],
    launchYear: 2021,
    ecosystem: "Home to GMX, Pendle, Radiant and Camelot.",
  },
  base: {
    tagline: "Coinbase's L2 for the next billion users",
    description:
      "Base is Coinbase's Ethereum Layer-2 built on the OP Stack, offering cheap, fast transactions with seamless fiat on-ramps. It has rapidly become a hub for consumer apps, onchain social and memecoins.",
    highlights: ["Backed by Coinbase", "Built on the OP Stack", "Fast-growing consumer & social scene"],
    useCases: ["Onchain social", "Memecoins", "Consumer apps", "Payments"],
    launchYear: 2023,
    ecosystem: "Powers Aerodrome, friend.tech-style apps and Base memecoins.",
  },
  optimism: {
    tagline: "The Superchain optimistic rollup",
    description:
      "Optimism is an Ethereum Layer-2 optimistic rollup and the foundation of the OP Stack 'Superchain' vision shared by chains like Base. The OP token powers retroactive public-goods funding and ecosystem governance.",
    highlights: ["OP Stack & the Superchain", "Retroactive public goods funding", "Low-fee Ethereum scaling"],
    useCases: ["DeFi", "Public-goods funding", "Superchain app-chains", "Governance"],
    launchYear: 2021,
    ecosystem: "Home to Velodrome, Synthetix and the OP Superchain.",
  },
  sui: {
    tagline: "Object-centric Layer-1 for parallel speed",
    description:
      "Sui is a high-performance Layer-1 from Mysten Labs using the Move language and an object-centric data model for parallel execution. It targets very high throughput and low-latency consumer applications.",
    highlights: ["Parallel transaction execution", "Move smart-contract language", "Low-latency consumer focus"],
    useCases: ["DeFi", "Gaming", "NFTs", "Consumer apps"],
    launchYear: 2023,
    ecosystem: "Built around Cetus, NAVI and Scallop.",
  },
  ton: {
    tagline: "The blockchain inside Telegram",
    description:
      "TON (The Open Network) is a high-throughput Layer-1 closely integrated with Telegram, putting crypto in front of hundreds of millions of messaging users. It is known for mini-apps, in-chat payments and viral memecoins.",
    highlights: ["Native Telegram integration", "Massive built-in user reach", "Mini-apps & tap-to-earn games"],
    useCases: ["Telegram mini-apps", "Payments", "Memecoins & tap-to-earn", "Social"],
    launchYear: 2021,
    ecosystem: "Home to Notcoin, Hamster Kombat and TON DeFi.",
  },
};

export const getChainSEO = (id: string): ChainSEO | undefined => CHAIN_SEO[id];
