import { useState } from "react";
import { AirdropCard } from "./AirdropCard";

export interface AirdropProject {
  id: string;
  name: string;
  ticker: string;
  description: string;
  category: string;
  logo: string;
  aiScore: number;
  aiConfidence: string;
  estValue: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Confirmed" | "Rumored" | "Snapshot Taken";
  funding: string;
  chains: string[];
  tasks: string[];
  aiAnalysis: string;
}

const AIRDROPS_DATA: AirdropProject[] = [
  {
    id: "linea",
    name: "Linea",
    ticker: "LINEA",
    description: "A developer-ready zkEVM rollup for scaling Ethereum dApps, backed by Consensys.",
    category: "L2 Rollup",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png", // fallback or specific logo
    aiScore: 92,
    aiConfidence: "High",
    estValue: "$1,500 - $5,000",
    difficulty: "Medium",
    status: "Confirmed",
    funding: "$726M (Consensys)",
    chains: ["Ethereum", "Linea"],
    tasks: ["Bridge ETH", "Interact with DEXs", "Complete Linea Park/Surge quests", "Provide Liquidity"],
    aiAnalysis: "Massive backing by Consensys almost guarantees a tier-1 airdrop. AI models show peak on-chain volume aligning with Q4 token generation events (TGE). High saturation means you need to be in the top 20% of wallets to get a meaningful allocation."
  },
  {
    id: "scroll",
    name: "Scroll",
    ticker: "SCR",
    description: "Native zkEVM Layer 2 scaling solution for Ethereum.",
    category: "L2 Rollup",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    aiScore: 88,
    aiConfidence: "Very High",
    estValue: "$500 - $2,500",
    difficulty: "Medium",
    status: "Confirmed",
    funding: "$80M",
    chains: ["Ethereum", "Scroll"],
    tasks: ["Bridge via Official Bridge", "Deploy Smart Contract", "Mint Canvas Badges", "Volume > $10k"],
    aiAnalysis: "Scroll Marks session is live. AI sentiment indicates TGE is imminent. The protocol values consistency (active months) and actual contract deployment over pure volume farming."
  },
  {
    id: "berachain",
    name: "Berachain",
    ticker: "BERA",
    description: "DeFi-focused EVM-compatible L1 built on the Cosmos SDK, powered by Proof of Liquidity.",
    category: "Layer 1",
    logo: "https://cryptologos.cc/logos/cosmos-atom-logo.png",
    aiScore: 95,
    aiConfidence: "High",
    estValue: "$2,000 - $10,000+",
    difficulty: "Hard",
    status: "Rumored",
    funding: "$142M",
    chains: ["Berachain"],
    tasks: ["Interact with BEX", "Mint HONEY", "Borrow on BEND", "Trade on BERPS", "Run Validator/Node"],
    aiAnalysis: "Cult-like community and massive VC backing. AI analysis of testnet (Artio/bArtio) shows unprecedented wallet generation. Sybil filtering will be extreme. Focus on holding ecosystem NFTs (Honeycombs, BongBears) or providing deep liquidity."
  },
  {
    id: "monad",
    name: "Monad",
    ticker: "MONAD",
    description: "Ultra-high performance EVM Layer 1 with up to 10,000 TPS.",
    category: "Layer 1",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
    aiScore: 91,
    aiConfidence: "Medium",
    estValue: "$1,000 - $4,000",
    difficulty: "Easy",
    status: "Rumored",
    funding: "$244M",
    chains: ["Monad"],
    tasks: ["Join Discord/Roles", "Testnet Transactions (Upcoming)", "Social Engagement"],
    aiAnalysis: "One of the most anticipated L1s of this cycle. Currently pre-mainnet. AI social scraping indicates strong emphasis on community engagement (Nads). Securing Discord roles early will likely act as a strong multiplier."
  },
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    ticker: "HL",
    description: "Decentralized perpetual exchange with an order book running on its own L1.",
    category: "Perp DEX",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    aiScore: 85,
    aiConfidence: "Very High",
    estValue: "$300 - $3,000",
    difficulty: "Medium",
    status: "Confirmed",
    funding: "Self-funded",
    chains: ["Arbitrum"],
    tasks: ["Trade Perps", "Provide HLP Liquidity", "Stake Purr"],
    aiAnalysis: "Points program is transparent. AI models predict TGE soon as perp narrative heats up. Volume is king here. Wash trading is penalized, so organic trading behavior is required."
  }
];

export function AirdropList() {
  const [filter, setFilter] = useState("All");

  const filteredData = filter === "All" 
    ? AIRDROPS_DATA 
    : AIRDROPS_DATA.filter(a => a.status === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {["All", "Confirmed", "Rumored", "Snapshot Taken"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status 
                ? "bg-primary text-primary-foreground" 
                : "bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {filteredData.map((project) => (
          <AirdropCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
