import { useState, useMemo } from "react";
import { AirdropCard } from "./AirdropCard";
import { ArrowUpDown, Flame, Clock, CheckCircle2, AlertTriangle, Radio, TrendingUp } from "lucide-react";

export interface AirdropProject {
  id: string;
  name: string;
  ticker: string;
  description: string;
  category: string;
  logo: string;
  // AI Scoring
  aiScore: number;
  legitimacyScore: number;
  effortScore: number;        // 1 (easy) - 5 (very hard)
  rewardRatio: number;        // e.g. 4.2 = 4.2x return per effort unit
  aiConfidence: "Low" | "Medium" | "High" | "Very High";
  aiAnalysis: string;
  // Value
  estValue: string;
  funding: string;
  // Status
  liveStatus: "Live" | "Upcoming" | "Ended";
  isVerified: boolean;
  riskLevel: "Low" | "Medium" | "High";
  isFeatured?: boolean;
  // Timing
  snapshotDate?: string;
  endDate?: string;
  // Details
  chains: string[];
  tasks: string[];
  // Legacy compat
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Confirmed" | "Rumored" | "Snapshot Taken";
}

export const AIRDROPS_DATA: AirdropProject[] = [
  {
    id: "linea",
    name: "Linea",
    ticker: "LINEA",
    description: "A developer-ready zkEVM rollup for scaling Ethereum dApps, backed by Consensys with $726M in funding.",
    category: "L2 Rollup",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    aiScore: 92, legitimacyScore: 96, effortScore: 3, rewardRatio: 4.8,
    aiConfidence: "High",
    estValue: "$1,500 - $5,000", funding: "$726M (Consensys)",
    liveStatus: "Live", isVerified: true, riskLevel: "Low", isFeatured: true,
    snapshotDate: "2025-09-15T00:00:00Z",
    chains: ["Ethereum", "Linea"],
    tasks: ["Bridge ETH", "Interact with DEXs", "Complete Linea Park/Surge quests", "Provide Liquidity"],
    difficulty: "Medium", status: "Confirmed",
    aiAnalysis: "Massive backing by Consensys almost guarantees a tier-1 airdrop. AI models show peak on-chain volume aligning with Q4 TGE. High saturation means you need to be in the top 20% of wallets to get meaningful allocation. Focus on consistency over volume.",
  },
  {
    id: "monad",
    name: "Monad",
    ticker: "MON",
    description: "Ultra-high performance EVM Layer 1 with up to 10,000 TPS. The most anticipated L1 of the current cycle.",
    category: "Layer 1",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
    aiScore: 91, legitimacyScore: 88, effortScore: 2, rewardRatio: 6.2,
    aiConfidence: "Medium",
    estValue: "$1,000 - $4,000", funding: "$244M",
    liveStatus: "Upcoming", isVerified: true, riskLevel: "Low",
    snapshotDate: "2025-11-01T00:00:00Z",
    chains: ["Monad"],
    tasks: ["Join Discord/Roles", "Testnet Transactions", "Social Engagement", "Community NFT"],
    difficulty: "Easy", status: "Rumored",
    aiAnalysis: "One of the most anticipated L1s of this cycle. Currently pre-mainnet. AI social scraping indicates strong emphasis on community engagement (Nads). Securing Discord roles early will likely act as a strong multiplier. Best effort:reward ratio on this list.",
  },
  {
    id: "berachain",
    name: "Berachain",
    ticker: "BERA",
    description: "DeFi-focused EVM-compatible L1 built on the Cosmos SDK, powered by Proof of Liquidity consensus.",
    category: "Layer 1",
    logo: "https://cryptologos.cc/logos/cosmos-atom-logo.png",
    aiScore: 89, legitimacyScore: 91, effortScore: 5, rewardRatio: 3.5,
    aiConfidence: "High",
    estValue: "$2,000 - $10,000+", funding: "$142M",
    liveStatus: "Live", isVerified: true, riskLevel: "Low",
    snapshotDate: "2025-08-30T00:00:00Z",
    chains: ["Berachain"],
    tasks: ["Interact with BEX", "Mint HONEY", "Borrow on BEND", "Trade on BERPS", "Run Validator/Node"],
    difficulty: "Hard", status: "Confirmed",
    aiAnalysis: "Cult-like community and massive VC backing. AI analysis of testnet shows unprecedented wallet generation. Sybil filtering will be extreme. Focus on holding ecosystem NFTs (Honeycombs, BongBears) or providing deep liquidity for maximum allocation.",
  },
  {
    id: "scroll",
    name: "Scroll",
    ticker: "SCR",
    description: "Native zkEVM Layer 2 scaling solution for Ethereum with a focus on EVM compatibility.",
    category: "L2 Rollup",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    aiScore: 88, legitimacyScore: 94, effortScore: 3, rewardRatio: 4.1,
    aiConfidence: "Very High",
    estValue: "$500 - $2,500", funding: "$80M",
    liveStatus: "Live", isVerified: true, riskLevel: "Low",
    snapshotDate: "2025-07-20T00:00:00Z",
    chains: ["Ethereum", "Scroll"],
    tasks: ["Bridge via Official Bridge", "Deploy Smart Contract", "Mint Canvas Badges", "Volume >$10k"],
    difficulty: "Medium", status: "Confirmed",
    aiAnalysis: "Scroll Marks session is live. AI sentiment indicates TGE is imminent. The protocol values consistency (active months) and actual contract deployment over pure volume farming. Canvas badge minting is one of the strongest eligibility signals.",
  },
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    ticker: "HYPE",
    description: "Decentralized perpetual exchange with a full order book running on its own purpose-built L1.",
    category: "Perp DEX",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    aiScore: 85, legitimacyScore: 87, effortScore: 3, rewardRatio: 3.8,
    aiConfidence: "Very High",
    estValue: "$300 - $3,000", funding: "Self-funded",
    liveStatus: "Live", isVerified: true, riskLevel: "Medium",
    snapshotDate: "2025-08-01T00:00:00Z",
    chains: ["Arbitrum", "Hyperliquid L1"],
    tasks: ["Trade Perps (organic)", "Provide HLP Liquidity", "Stake Purr"],
    difficulty: "Medium", status: "Confirmed",
    aiAnalysis: "Points program is transparent. AI models predict TGE soon as perp narrative heats up. Volume is king here — but wash trading is detected and penalized. Organic trading behavior is required. HLP liquidity providers get a 2x multiplier.",
  },
  {
    id: "zksync",
    name: "zkSync Era",
    ticker: "ZK",
    description: "Zero-knowledge rollup by Matter Labs scaling Ethereum with native account abstraction.",
    category: "L2 Rollup",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    aiScore: 78, legitimacyScore: 89, effortScore: 2, rewardRatio: 3.2,
    aiConfidence: "High",
    estValue: "$200 - $1,200", funding: "$458M",
    liveStatus: "Live", isVerified: true, riskLevel: "Low",
    chains: ["Ethereum", "zkSync Era"],
    tasks: ["Bridge ETH", "Swap on SyncSwap/Mute", "Mint NFTs", "Use native AA wallets"],
    difficulty: "Easy", status: "Confirmed",
    aiAnalysis: "Already airdropped once. Second airdrop campaign is likely based on ongoing protocol development. Easier farming but lower ceiling than Linea. Good for passive participation strategy.",
  },
  {
    id: "sophon",
    name: "Sophon",
    ticker: "SOPH",
    description: "Consumer-focused zkSync hyperchain building the entertainment layer of Web3.",
    category: "Gaming/Social",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    aiScore: 74, legitimacyScore: 79, effortScore: 1, rewardRatio: 5.1,
    aiConfidence: "Medium",
    estValue: "$150 - $800", funding: "$65M",
    liveStatus: "Upcoming", isVerified: false, riskLevel: "Medium",
    snapshotDate: "2025-12-01T00:00:00Z",
    chains: ["zkSync", "Sophon"],
    tasks: ["Farm Points via Games", "Refer friends", "Social engagement"],
    difficulty: "Easy", status: "Rumored",
    aiAnalysis: "Very low effort requirement with decent upside. Gaming and social sectors are emerging narratives. Not yet verified — treat as speculative. Best suited for idle farming strategies without active capital deployment.",
  },
  {
    id: "fuel",
    name: "Fuel Network",
    ticker: "FUEL",
    description: "Modular execution layer built on Ethereum with a custom VM (FuelVM) for parallel transaction processing.",
    category: "Modular L2",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    aiScore: 70, legitimacyScore: 82, effortScore: 4, rewardRatio: 2.6,
    aiConfidence: "Low",
    estValue: "$100 - $600", funding: "$81.5M",
    liveStatus: "Upcoming", isVerified: false, riskLevel: "High",
    snapshotDate: "2026-01-15T00:00:00Z",
    chains: ["Ethereum", "Fuel"],
    tasks: ["Deploy contracts on Fuel", "Testnet interactions", "Developer activities"],
    difficulty: "Hard", status: "Rumored",
    aiAnalysis: "High effort, low confidence. Fuel is technically impressive but lacks retail narrative. AI models flag this as developer-focused — retail airdrop is possible but not primary strategy. Only pursue if you have Solidity/Sway development skills.",
  },
];

const FILTER_TABS = [
  { id: "All", label: "All Airdrops", icon: <Radio className="w-3.5 h-3.5" /> },
  { id: "Live", label: "Live Now", icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "Upcoming", label: "Upcoming", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "Verified", label: "Verified Only", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: "High Risk", label: "High Risk", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
];

type SortKey = "aiScore" | "rewardRatio" | "estValue";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "aiScore", label: "AI Score" },
  { key: "rewardRatio", label: "Effort:Reward" },
  { key: "estValue", label: "Est. Value" },
];

export function AirdropList() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<SortKey>("aiScore");

  const filtered = useMemo(() => {
    let list = [...AIRDROPS_DATA];
    if (filter === "Live") list = list.filter(a => a.liveStatus === "Live");
    else if (filter === "Upcoming") list = list.filter(a => a.liveStatus === "Upcoming");
    else if (filter === "Ended") list = list.filter(a => a.liveStatus === "Ended");
    else if (filter === "Verified") list = list.filter(a => a.isVerified);
    else if (filter === "High Risk") list = list.filter(a => a.riskLevel === "High");

    list.sort((a, b) => {
      if (sort === "aiScore") return b.aiScore - a.aiScore;
      if (sort === "rewardRatio") return b.rewardRatio - a.rewardRatio;
      if (sort === "estValue") {
        const getMin = (s: string) => parseInt(s.replace(/[^0-9]/g, "").slice(0, 5) || "0");
        return getMin(b.estValue) - getMin(a.estValue);
      }
      return 0;
    });
    return list;
  }, [filter, sort]);

  return (
    <div>
      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                filter === tab.id
                  ? tab.id === "High Risk"
                    ? "bg-danger/10 text-danger border-danger/30"
                    : tab.id === "Verified"
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.icon} {tab.label}
              <span className="ml-1 opacity-60 text-[10px]">
                {tab.id === "All" ? AIRDROPS_DATA.length
                  : tab.id === "Live" ? AIRDROPS_DATA.filter(a => a.liveStatus === "Live").length
                  : tab.id === "Upcoming" ? AIRDROPS_DATA.filter(a => a.liveStatus === "Upcoming").length
                  : tab.id === "Verified" ? AIRDROPS_DATA.filter(a => a.isVerified).length
                  : AIRDROPS_DATA.filter(a => a.riskLevel === "High").length}
              </span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Sort:</span>
          <div className="flex gap-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  sort === opt.key
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">{filtered.length} opportunities</span>
        <span className="text-xs text-muted-foreground">· ranked by {sort === "aiScore" ? "Oracle AI Score" : sort === "rewardRatio" ? "Effort:Reward ratio" : "estimated value"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No airdrops match this filter right now.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {filtered.map((project, idx) => (
            <AirdropCard key={project.id} project={project} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
