import { useState, useMemo } from "react";
import { AirdropCard } from "./AirdropCard";
import { AirdropDetailModal } from "./AirdropDetailModal";
import { ArrowUpDown, Flame, Clock, CheckCircle2, AlertTriangle, Radio, TrendingUp } from "lucide-react";

export interface FullGuide {
  overview: string;
  whyItMatters: string;
  stepByStep: string[];
  tokenomics: string;
  vcBackers: string[];
  timeline: { date: string; event: string }[];
  riskAnalysis: string;
  proTips: string[];
  communityLinks: { name: string; url: string }[];
}

export interface AirdropProject {
  id: string;
  name: string;
  ticker: string;
  description: string;
  category: string;
  logo: string;
  aiScore: number;
  legitimacyScore: number;
  effortScore: number;
  rewardRatio: number;
  aiConfidence: "Low" | "Medium" | "High" | "Very High";
  aiAnalysis: string;
  estValue: string;
  funding: string;
  liveStatus: "Live" | "Upcoming" | "Ended";
  isVerified: boolean;
  riskLevel: "Low" | "Medium" | "High";
  isFeatured?: boolean;
  snapshotDate?: string;
  endDate?: string;
  chains: string[];
  tasks: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Confirmed" | "Rumored" | "Snapshot Taken";
  fullGuide?: FullGuide;
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
    fullGuide: {
      overview: `Linea is a Type 2 zkEVM rollup developed by Consensys, the blockchain technology company founded by Ethereum co-founder Joseph Lubin. Unlike many competing zkEVM solutions, Linea is designed to be fully EVM-equivalent, meaning any existing Ethereum smart contract can be deployed on Linea without modification. This is a critical differentiator in a crowded L2 market.

The network launched its mainnet in July 2023 and has since accumulated over 350 million transactions, 6.5 million unique wallets, and $500M+ in total value locked (TVL). Consensys has committed to making Linea the canonical zkEVM rollup for the Ethereum ecosystem, leveraging its existing products — MetaMask, Infura, and Truffle — to drive adoption at scale.

Linea's technical architecture uses a zkProver called "Corset" and a custom proof system designed in-house by Consensys. It achieves full EVM compatibility through a circuit-level implementation of the EVM's opcodes, which means Linea can process the same smart contracts as Ethereum while compressing transaction data into zero-knowledge proofs.

The LINEA token was announced in Q1 2024 as part of a broader move toward decentralization. While the exact tokenomics have not been fully published, industry analysts expect a total supply of 10 billion tokens, with approximately 8–12% allocated to early users, farmers, and community participants. At a projected FDV of $3–5 billion (based on comparable L2 launches like ARB and OP), early user allocations could be worth between $1,500 and $5,000 per qualifying wallet.

Linea Park and Linea Surge were the two flagship campaign programs designed to reward on-chain activity. Linea Park offered NFT-based "voyage" rewards for completing partner tasks, while Linea Surge introduced a liquidity incentive program with LXP-L (Linea XP for Liquidity) tokens that serve as airdrop multipliers. Both programs ended in Q3 2024, meaning the snapshot period has now closed for the primary campaigns. However, secondary campaigns and protocol-specific allocation tracks may still be active.`,
      whyItMatters: `Linea represents one of the highest-conviction airdrop opportunities of the current bull cycle for three reasons:

First, institutional backing: Consensys raised $726 million across multiple funding rounds and manages MetaMask, which has 30 million monthly active users. This gives Linea an unparalleled distribution advantage — any MetaMask user can be onboarded to Linea with a single click. This is the kind of moat that makes a $3–5B FDV not just plausible, but conservative.

Second, TGE timing: Oracle Bull's AI models, trained on historical L2 launch patterns (ARB, OP, MATIC), indicate that L2 airdrops tend to happen 12–18 months after mainnet launch. Linea launched its mainnet in July 2023, placing the TGE window squarely in Q3–Q4 2025. Multiple on-chain signals — including reduced LXP emission rates and a slowdown in new campaign deployments — suggest the team is entering the pre-TGE phase.

Third, cross-chain composability: Linea is deeply integrated with the broader Consensys ecosystem. MetaMask users already have Linea as a default network, Infura serves as the primary RPC provider, and major DeFi protocols including Uniswap, Curve, SyncSwap, and Nile Exchange have deployed on Linea. This creates organic, non-sybil activity that is hard to replicate.`,
      stepByStep: [
        "Bridge ETH to Linea: Go to bridge.linea.build and bridge a minimum of 0.05 ETH to Linea mainnet. The official bridge is the primary signal Linea uses for wallet qualification. Do not use third-party bridges as your primary bridge transaction — always ensure your first bridge comes from the official URL.",
        "Complete Linea Park quests (if still active): Navigate to linea.build/en/use-linea/linea-park and complete partner quests. Each quest awards LXP points. The more LXP you accumulate, the higher your allocation tier. Quests range from swapping tokens on partner DEXs to minting NFTs on Linea-native protocols.",
        "Provide liquidity on Nile Exchange or Lynex: These are Linea's native liquidity protocols. Providing liquidity (even small amounts of $100–$500) for 30+ consecutive days signals a non-sybil wallet. Linea Surge rewarded liquidity providers with LXP-L tokens that multiply your base airdrop allocation.",
        "Use the DeFi ecosystem: Swap on SyncSwap or EchoDEX, supply collateral on Layerbank, and try a perpetual DEX like Dolomite. The goal is to generate diverse transaction types — Linea's sybil detection looks for wallets that interact only with a narrow set of protocols as potential bots.",
        "Deploy a smart contract: This is the single most powerful signal for getting a developer allocation. Deploy even a simple ERC-20 token or NFT contract on Linea. Tools like Foundry, Hardhat, or Remix make this accessible even for non-developers. A deployed contract puts you in the top 5% of wallets by activity.",
        "Hold your wallet active monthly: Linea scores wallets on monthly activity consistency. A wallet that has been active for 6+ consecutive months receives a higher base multiplier than a wallet that completed all tasks in a single week.",
        "Bridge back to Ethereum: A round-trip bridge — ETH from Ethereum to Linea and then back — demonstrates genuine usage rather than airdrop farming. Many L2 airdrops use this as a quality signal.",
        "Check your LXP balance: Visit explorer.linea.build and connect your wallet to see your current LXP and LXP-L balances. These are strong indicators of your relative allocation standing.",
      ],
      tokenomics: `While Linea has not published official tokenomics at time of writing, Oracle Bull's AI models have synthesized available signals to project the following allocation structure:

Total Supply: 10,000,000,000 LINEA (10 billion)
Community & Airdrop Allocation: ~10% (1 billion tokens)
Ecosystem Fund: ~25%
Investors: ~18% with 1–4 year vesting
Team & Advisors: ~20% with 4-year vesting + cliff
Protocol Treasury: ~27%

At a launch price of $0.30–$0.50 per LINEA (implied FDV of $3–5B, comparable to ARB at launch), the community allocation pool is worth $300M–$500M. With an estimated 2–5 million unique qualifying wallets, average allocations are projected at $100–$250 per wallet for basic activity, and $1,500–$5,000 for top-tier wallets with high LXP balances, liquidity provision, and contract deployments.

The key driver of your allocation will be your LXP score relative to other wallets — this is a pro-rata distribution, not a flat reward. Top 1% wallets with 50,000+ LXP may receive allocations worth $10,000 or more.`,
      vcBackers: ["Consensys (726M)", "SoftBank Vision Fund", "JPMorgan Chase", "ParaFi Capital", "Temasek", "Marshall Wace"],
      timeline: [
        { date: "July 2023", event: "Linea mainnet alpha launch" },
        { date: "October 2023", event: "Linea Park campaign begins — LXP points program goes live" },
        { date: "February 2024", event: "Linea Surge liquidity campaign launches — LXP-L tokens introduced" },
        { date: "June 2024", event: "Linea crosses 5 million unique wallets" },
        { date: "September 2024", event: "Linea Park quests end — final snapshot window approaches" },
        { date: "Q4 2025 (Projected)", event: "LINEA token generation event (TGE) and airdrop distribution" },
      ],
      riskAnalysis: `Linea carries the lowest risk profile of any airdrop on this list for the following reasons:

Sybil Risk: LOW-MEDIUM. Consensys has sophisticated sybil detection in place. The LXP scoring system, Linea Voyage NFTs, and on-chain activity diversity analysis make it difficult for large-scale sybil farms to dominate the distribution. Wallets with fewer than 10 transactions or a single-protocol interaction pattern are likely to receive minimal or no allocation.

Rug Risk: VERY LOW. With $726M in institutional backing and a Consensys parent company with 1,000+ employees and regulatory compliance obligations, a rug pull scenario is effectively impossible. This is not a fly-by-night project.

Regulatory Risk: LOW-MEDIUM. Linea operates within the Consensys legal framework, which includes active engagement with US and EU regulators. However, any adverse ruling against Consensys could delay or modify the TGE.

Competition Risk: MEDIUM. zkSync Era, Scroll, Polygon zkEVM, and Starknet are all competing for the same L2 market share. If Linea fails to gain developer and user adoption at the expected rate, its FDV at launch could be lower than projected.

Capital Risk: Gas fees for completing all Linea farming tasks typically run $30–$100 depending on Ethereum L1 fees. This capital is at risk if no airdrop materializes or if your wallet is flagged as sybil.`,
      proTips: [
        "LXP is the primary determinant of allocation — focus all your effort on maximizing LXP score above all else. Check linea.build/en/use-linea/linea-park regularly for new quests.",
        "Never use the same wallet for multiple chains simultaneously in a coordinated pattern — Linea's sybil detection looks for correlated wallet behavior across chains.",
        "Providing ETH/USDC liquidity on Nile Exchange for 60+ days with a minimum of $1,000 TVL puts you in the LXP-L top tier. Even a $500 position held consistently beats a $10,000 position held for 7 days.",
        "If you have developer skills, deploying a contract that others interact with (like a simple token or NFT collection) gives you both a deployer allocation AND organic interaction signals from your users.",
        "The Linea team has stated they will use on-chain behavior from partner protocols (Uniswap, Curve, LayerBank) as additional data signals. Being an active user of these protocols on Linea specifically — not just on Ethereum — matters.",
        "Linea announced a 'Linea Association' governance structure, suggesting a legal entity for the token. This is a very bullish signal for a legitimate TGE timeline.",
      ],
      communityLinks: [
        { name: "Official Website", url: "https://linea.build" },
        { name: "Bridge", url: "https://bridge.linea.build" },
        { name: "Linea Park", url: "https://linea.build/en/use-linea/linea-park" },
        { name: "Discord", url: "https://discord.gg/linea" },
        { name: "Twitter/X", url: "https://twitter.com/LineaBuild" },
        { name: "Explorer", url: "https://explorer.linea.build" },
      ],
    },
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
    fullGuide: {
      overview: `Monad is a highly parallelized, EVM-compatible Layer 1 blockchain that promises to deliver 10,000 transactions per second (TPS) with 1-second block times and single-slot finality. Founded in 2023 by ex-Jump Trading engineers Keone Hon and James Hunsaker, Monad represents a fundamental rethinking of blockchain execution rather than an incremental improvement.

The core innovation behind Monad is its pipelined execution model. Traditional EVM chains process transactions sequentially — one after another — creating a natural throughput ceiling. Monad breaks this ceiling by parallelizing execution across multiple threads while maintaining full EVM compatibility. This means developers can deploy existing Solidity contracts to Monad without any changes, while users benefit from speeds previously only available on purpose-built non-EVM chains like Solana.

Monad raised $225 million in a Series A round led by Paradigm in April 2024 — one of the largest single-round raises in crypto history for a pre-mainnet project. This round was followed by a $19M seed round, bringing total funding to $244M. The investor roster reads like a who's-who of top-tier crypto VCs, signaling massive institutional confidence in the project.

The testnet (Monad Testnet) launched in early 2025 and has become one of the most active testnets in crypto history, attracting millions of wallet addresses within weeks of launch. The mainnet is projected for late 2025, with a token generation event likely to follow shortly after or simultaneously.

The community — known as "Nads" — has become one of the most recognizable and passionate communities in the space, driven by Monad's vibrant purple branding, meme culture, and regular community events. This community engagement is not just surface-level — Monad has explicitly stated that community participation will be a factor in token distribution.`,
      whyItMatters: `Monad is the best effort-to-reward opportunity on this entire list. Here's why:

The entry barrier is exceptionally low. Unlike L2 farming which requires capital (bridging ETH, paying gas), Monad testnet is free. Gas on the testnet is paid in testnet MON tokens, which are freely distributed via faucets. This means your only cost is time — making the potential ROI essentially infinite if the airdrop materializes as expected.

The upside is enormous. Based on Paradigm's $225M Series A and typical valuation multiples for high-performance L1s, Monad's FDV at launch is estimated at $2–8B. With a typical community allocation of 8–15%, that's $160M–$1.2B available for early users. Divided across an estimated 500K–2M qualifying wallets, allocations could range from $500 to $5,000+ per wallet.

The competitive moat is real. Monad is technically superior to existing EVM chains in raw throughput, and its EVM compatibility makes developer migration trivial. Unlike Solana (non-EVM) or Aptos/Sui (new VMs), Monad doesn't require developers to learn new languages or rewrite contracts. This is the strongest value proposition in the L1 space right now.`,
      stepByStep: [
        "Join the Monad Discord: Navigate to discord.gg/monad and join the server. Complete the verification steps and introduce yourself in the #introductions channel. The Monad team actively watches for community members who engage authentically.",
        "Earn Discord roles: Participate in discussions, join AMAs, and engage with community events to earn roles like 'Nad', 'Purple Nad', and 'OG'. These roles are visible on-chain via linked wallet addresses and may directly influence airdrop allocation.",
        "Get testnet MON tokens: Request tokens from the Monad testnet faucet (testnet.monad.xyz/faucet). You'll need a small amount of testnet ETH or a Twitter/Discord account to verify your request. These tokens have no real-world value but are needed for testnet transactions.",
        "Perform testnet transactions: Swap tokens, provide liquidity, mint NFTs, and interact with testnet DeFi protocols. Aim for at least 50–100 transactions across a variety of protocol types. The key is diversity — don't just do the same swap repeatedly.",
        "Deploy a test smart contract: Even a simple ERC-20 token deployed on testnet signals developer interest. Use Remix IDE (remix.ethereum.org) to deploy a basic contract in under 10 minutes. Monad values developers because they drive ecosystem growth.",
        "Mint community NFTs: Monad regularly releases free community NFTs for active participants. These NFTs often serve as on-chain proof of early participation and may be factored into the airdrop snapshot.",
        "Follow @monad_xyz on Twitter and engage: Like, retweet, and reply to official posts. Monad has an active social scoring component — accounts with genuine engagement (not just likes) and linked wallets may receive bonus allocations.",
        "Participate in community events: Monad hosts regular Twitter Spaces, Discord events, and testnet competitions. Participating in these events often yields special NFTs or wallet tags that signal OG status.",
      ],
      tokenomics: `Monad has not published official tokenomics. Based on comparable L1 launches and information from seed investors, Oracle Bull projects the following:

Total Supply: 10,000,000,000 MON (speculative)
Community/Airdrop Allocation: 8–15% (800M–1.5B tokens)
Investors: 20–25% with 1–4 year vesting
Team & Advisors: 15–20% with 4-year cliff
Ecosystem Development: 25–30%
Protocol Treasury: 10–15%

At a launch FDV of $3B (conservative, given $244M raised at implied higher valuation), MON would be priced at $0.30. Community allocation at 10% = 1B tokens = $300M pool. Divided across 1 million qualifying wallets = $300 per average wallet. Top-tier wallets with developer activity, OG roles, and consistent testnet participation could receive 5–20x the average allocation.

Note: These figures are Oracle Bull AI projections based on comparable launches and should not be treated as official figures.`,
      vcBackers: ["Paradigm ($225M lead)", "Electric Capital", "Coinbase Ventures", "Dragonfly Capital", "Greenfield Capital", "Figment Capital"],
      timeline: [
        { date: "Q1 2024", event: "$225M Series A led by Paradigm announced" },
        { date: "Q3 2024", event: "Monad DevNet launches for internal testing" },
        { date: "Q1 2025", event: "Public testnet launches — millions join within weeks" },
        { date: "Q3 2025", event: "Testnet Phase 2 with incentivized campaigns" },
        { date: "Q4 2025 (Projected)", event: "Mainnet launch with simultaneous or near-term TGE" },
      ],
      riskAnalysis: `Monad's primary risks are execution and timeline related rather than legitimacy-related.

Timeline Risk: MEDIUM-HIGH. Monad has been in development for 2+ years and the mainnet launch has been delayed multiple times. The complexity of building a parallelized EVM from scratch is enormous, and further delays are possible. If mainnet doesn't launch until 2026, the airdrop timeline extends accordingly.

Sybil Risk: MEDIUM. Monad's community is enormous, meaning there will be extreme competition for allocation. Monad is likely to implement strict sybil filtering — wallets with identical transaction patterns, shared IP addresses, or coordinated activity will likely be excluded. Focus on authentic participation rather than running 100 identical wallets.

Competition Risk: MEDIUM. MegaETH, Eclipse, and Pharos are all competing in the high-performance EVM L1 space. If any of these launch first with a strong ecosystem, Monad's market positioning could weaken.

Airdrop Confirmation Risk: HIGH (for specific airdrop details). Monad has NOT confirmed an airdrop — this is a community expectation based on VC funding and comparable L1 launches. There is a non-zero possibility that Monad adopts a different distribution model (sale, mining, etc.) that excludes testnet users from meaningful allocation.`,
      proTips: [
        "Discord role quality matters more than quantity. Being an active, genuine contributor to the Monad community is worth more than having 10 sybil accounts with basic roles.",
        "The OG 'Nad' community was formed before the Series A announcement. If you can demonstrate you were in the Discord before April 2024, you likely qualify for an early supporter bonus.",
        "Don't just do testnet transactions — create content. Write a thread about Monad's tech, create a video tutorial, or build a small dApp on testnet. Content creators are explicitly valued by the Monad team.",
        "Linked Twitter/X accounts with significant follower counts (1,000+) that post about Monad have been noticed by the team and tagged for potential KOL allocations.",
        "Monad's architecture enables new DeFi primitives impossible on sequential EVMs. Building or using protocols that specifically leverage parallelism (like high-frequency DEXs) will signal sophisticated technical understanding.",
      ],
      communityLinks: [
        { name: "Official Website", url: "https://monad.xyz" },
        { name: "Testnet", url: "https://testnet.monad.xyz" },
        { name: "Discord", url: "https://discord.gg/monad" },
        { name: "Twitter/X", url: "https://twitter.com/monad_xyz" },
        { name: "Documentation", url: "https://docs.monad.xyz" },
      ],
    },
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
    fullGuide: {
      overview: `Berachain is a high-performance EVM-compatible Layer 1 blockchain that introduces a novel consensus mechanism called Proof of Liquidity (PoL). Unlike Proof of Stake — where validators lock up tokens to secure the network — Proof of Liquidity requires validators to provide liquidity to the chain's native DeFi protocols. This creates a flywheel effect: security and liquidity growth are intrinsically linked, eliminating the common DeFi problem of fragmented incentives.

Built on the Cosmos SDK using a forked version of CometBFT (formerly Tendermint), Berachain achieves EVM compatibility at the execution layer while leveraging Cosmos's battle-tested consensus for security. The chain uses a tri-token model:

1. BERA: The gas and staking token, used to pay transaction fees and stake validator nodes.
2. BGT (Berachain Governance Token): A non-transferable governance token earned by providing liquidity to PoL-whitelisted pools. BGT holders direct block rewards and can "burn" BGT for BERA at a 1:1 ratio.
3. HONEY: The native overcollateralized stablecoin, minted by depositing BERA, ETH, or other approved collateral.

Berachain launched its mainnet in February 2025 after an extended testnet period (Artio and bArtio testnets) that attracted over 1.7 million unique wallet addresses — one of the largest testnets in blockchain history. The mainnet launch was accompanied by a significant airdrop for early testnet participants, NFT holders, and ecosystem contributors.

However, Berachain's airdrop story doesn't end at mainnet launch. The PoL system creates a continuous incentive loop — validators must attract BGT delegation to earn block rewards, creating ongoing yield opportunities for liquidity providers. Multiple protocols launching on Berachain are expected to run their own airdrop campaigns targeting BERA ecosystem participants.`,
      whyItMatters: `Berachain matters for three reasons that no other L1 currently offers simultaneously:

The NFT moat: Berachain grew out of the "Bong Bears" NFT collection — a bear-themed NFT launched in 2021 that was rebranded as the genesis of the Berachain ecosystem. Holders of Bong Bears, Honey Jars, Baby Bears, Band Bears, and other collection derivatives received early mainnet access and significant airdrop allocations. This NFT-to-chain trajectory is unique in crypto and creates a community loyalty that is extraordinarily resistant to mercenary farming.

The DeFi primitive: Proof of Liquidity is not a marketing gimmick — it fundamentally changes how DeFi protocols and validators interact. By requiring validators to direct BGT emissions to liquidity pools, Berachain creates a game-theoretic environment where protocols compete for liquidity through validator bribery, similar to Curve Wars but at the consensus layer. This creates sustainable yield opportunities not present on other chains.

The institutional validation: Dragonfly Capital ($69M lead), Polychain Capital, OKX Ventures, Hack VC, and others invested $142M into Berachain at a valuation suggesting the team believes in a $1–2B FDV at launch. Post-mainnet, BERA has traded at various price points implying a $800M–$3B market cap.`,
      stepByStep: [
        "Set up a Berachain wallet: Add Berachain mainnet to MetaMask. Chain ID: 80094, RPC: https://rpc.berachain.com, Symbol: BERA. Alternatively, use the official Berachain wallet setup guide at docs.berachain.com.",
        "Bridge assets to Berachain: Use the official Berachain bridge at bridge.berachain.com to bridge ETH, USDC, or other assets from Ethereum. Alternatively, use Stargate or Layerzero bridges. A minimum of $100–$500 is recommended for meaningful DeFi interaction.",
        "Mint HONEY stablecoin on Honey (honey.berachain.com): Deposit USDC as collateral to mint HONEY. This is the most fundamental Berachain-native action and signals genuine protocol participation. Maintaining a HONEY position for 30+ days is a strong quality signal.",
        "Provide liquidity on BEX (Berachain Exchange): The native DEX (bex.berachain.com) is where BGT emissions are concentrated. Adding liquidity to high-emission pools (BERA/ETH, BERA/HONEY) earns BGT, which is the primary governance and yield token. Even a small $200–$500 position earns meaningful BGT over time.",
        "Borrow on BEND (bend.berachain.com): BEND is the native lending protocol. Depositing collateral and borrowing HONEY demonstrates sophisticated DeFi usage and interacts with a second Berachain-native protocol.",
        "Trade on BERPS (berps.berachain.com): The native perpetual DEX rewards traders with BGT. Even small perpetual trades ($50–$100 notional) add trading activity to your wallet profile.",
        "Stake BGT or delegate to validators: Once you've earned BGT from liquidity provision, either delegate it to your preferred validators or use it to boost your own LP positions. Staked BGT signals long-term alignment with the network.",
        "Hold or acquire Berachain ecosystem NFTs: Bong Bears and Honey Jar NFTs have historically received the most generous airdrop allocations. If budget allows, acquiring even a low-tier ecosystem NFT significantly increases your allocation probability.",
      ],
      tokenomics: `BERA mainnet launched with the following tokenomics:

Total Supply: 500,000,000 BERA (500 million)
Initial Circulating Supply: ~10-15%
Airdrop to Testnet Users: ~5%
NFT Holder Allocations: ~3%
Team & Advisors: 16.67% with 4-year vesting (1-year cliff)
Investors: 16.67% with 4-year vesting (1-year cliff)
Block Rewards (PoL): 60% emitted over time to liquidity providers and validators

The BGT token (Berachain Governance Token) operates separately and is non-transferable. BGT is earned through PoL participation and can be burned for BERA at a 1:1 rate, creating a deflationary pressure on BERA supply as DeFi activity grows.

For ongoing ecosystem airdrops: Protocols building on Berachain (like Kodiak Finance, Infrared Finance, Beradrome) regularly airdrop their own tokens to BERA holders, BGT holders, and liquidity providers. Being active on Berachain now positions you for 5–10 additional ecosystem airdrops in addition to the base BERA position.`,
      vcBackers: ["Dragonfly Capital ($69M)", "Polychain Capital", "OKX Ventures", "Hack VC", "Robot Ventures", "Tribe Capital"],
      timeline: [
        { date: "November 2021", event: "Bong Bears NFT collection launches — the genesis of Berachain" },
        { date: "Q3 2023", event: "Artio testnet launches with Proof of Liquidity mechanics" },
        { date: "April 2024", event: "$142M funding round announced" },
        { date: "Q4 2024", event: "bArtio testnet — 1.7M+ wallets participate" },
        { date: "February 2025", event: "Berachain mainnet launches with simultaneous BERA airdrop" },
        { date: "Q2 2025 (Ongoing)", event: "Ecosystem protocols launch with ongoing yield and airdrop opportunities" },
      ],
      riskAnalysis: `Berachain has already launched its mainnet, so the primary airdrop risk has passed. However, ongoing risks include:

Sybil Risk (Past): The Artio/bArtio testnet had extreme sybil activity — over 1.7M wallets but estimated 60–80% may have been sybil. Berachain used wallet behavior analysis, NFT holdings, and cross-chain activity scoring to filter these. Most sybil wallets received zero or minimal allocation.

Ongoing Yield Risk: MEDIUM. The PoL system requires validators to maintain liquidity in specific pools to earn BGT emissions. If your preferred protocol loses its BGT whitelist status, your yield stream can drop to zero suddenly.

Competition for BGT: HIGH. BGT emissions are finite per block, and demand from protocols competing for liquidity is intense. The "Berachain Wars" (similar to Curve Wars) are already playing out, with protocols offering BERA/native token incentives to attract BGT delegation.

Smart Contract Risk: MEDIUM. Berachain's native protocols (BEX, BEND, BERPS, HONEY) are relatively new and have not been battle-tested at scale. Smart contract vulnerabilities are possible.

Price Volatility: HIGH. BERA has experienced extreme price volatility post-launch, ranging from $3 to $15+ in its first months. Long-term holders benefit from PoL yield, but short-term price action is unpredictable.`,
      proTips: [
        "BGT delegation strategy is crucial. Don't just stake BGT anywhere — research which protocols are offering the highest bribe rates for BGT delegation. Sites like BGT.station aggregate this information in real time.",
        "Ecosystem NFTs are your highest-conviction play. If you missed the testnet airdrop, buying a Honey Jar NFT gives you access to ongoing NFT holder airdrops from ecosystem protocols. These have historically been worth 10–50x the NFT purchase price for OG holders.",
        "Infrared Finance (infrared.finance) is the 'liquid staking' protocol for BGT — it converts your non-transferable BGT into iBGT which CAN be transferred and used in DeFi. This is one of the highest-leverage activities on Berachain right now.",
        "Beradrome is a Berachain-native ve(3,3) DEX similar to Velodrome on Optimism. Locking their BERO token for veBERO gives you weekly protocol fee sharing and the ability to vote on BGT emissions — this is the most sophisticated Berachain farming strategy available.",
        "The HONEY/USDC pool on BEX consistently has the highest BGT emission rate because HONEY stability is core to Berachain's design. This is the safest and most reliable yield pool on the network.",
      ],
      communityLinks: [
        { name: "Official Website", url: "https://berachain.com" },
        { name: "BEX (DEX)", url: "https://bex.berachain.com" },
        { name: "HONEY (Stablecoin)", url: "https://honey.berachain.com" },
        { name: "BEND (Lending)", url: "https://bend.berachain.com" },
        { name: "Discord", url: "https://discord.gg/berachain" },
        { name: "Twitter/X", url: "https://twitter.com/berachain" },
      ],
    },
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
    aiAnalysis: "Scroll Marks session is live. AI sentiment indicates TGE is imminent. The protocol values consistency and actual contract deployment over pure volume farming. Canvas badge minting is one of the strongest eligibility signals.",
    fullGuide: {
      overview: `Scroll is a zkEVM Layer 2 built natively from the EVM specification, meaning it achieves the deepest level of EVM compatibility among all zkEVM rollups. While competitors like Polygon zkEVM and zkSync Era made compromises for performance, Scroll prioritized byte-for-byte EVM equivalence — every Ethereum opcode behaves identically on Scroll, making it the most compatible home for existing Ethereum dApps.

Founded by three former Google engineers — Sandy Peng, Ye Zhang, and Haichen Shen — Scroll has taken a research-first approach, collaborating with the Ethereum Foundation's Privacy and Scaling Explorations (PSE) team on core ZK proof systems. This academic rigor has resulted in slower development but a more fundamentally sound architecture.

Scroll raised $80M across two funding rounds and launched its mainnet in October 2023. Since then, it has attracted over 750,000 unique addresses, with significant adoption from DeFi protocols including Aave, Compound, Uniswap, and Ambient Finance. The SCR token launched in October 2024 with an initial airdrop to early users, but the team has confirmed ongoing community allocation campaigns.

Canvas — Scroll's identity and achievement system — is the primary ongoing engagement mechanism. Users mint "badges" by completing on-chain actions, which serve as verifiable credentials of Scroll activity. These badges will play a central role in any future airdrop distributions.`,
      whyItMatters: `Scroll's "Very High" AI confidence rating is the highest on this list and stems from one key factor: the SCR token already exists and is trading. This eliminates the airdrop confirmation risk that plagues other projects. The question is not whether there will be additional SCR distributions — it's how to maximize your allocation in the next campaign.

The Canvas badge system is the most transparent airdrop mechanism in the L2 space. Each badge has clear eligibility criteria, and your badge count is publicly visible on Scroll's explorer. This removes guesswork and allows precise optimization of farming strategies.

Scroll's EVM equivalence (Type 1 zkEVM) is the strongest technical moat in the zkEVM market. As Ethereum continues to scale and more dApps migrate to L2s, the rollup with the best compatibility will capture the most developer and user migration. Scroll's head start in this positioning creates long-term value.`,
      stepByStep: [
        "Bridge ETH to Scroll: Use scroll.io/bridge to bridge ETH from Ethereum mainnet to Scroll. Bridge at least 0.05 ETH. Using the official bridge is critical — Scroll tracks which bridge contract you use.",
        "Set up your Canvas profile: Navigate to scroll.io/canvas and create your Scroll identity. Canvas is your on-chain portfolio of Scroll activity — think of it as a LinkedIn profile for your on-chain achievements.",
        "Mint Genesis Badge: The Genesis Badge is a fundamental Canvas achievement awarded for your first on-chain Scroll action. This is the most widely held badge and should be your first action.",
        "Deploy a smart contract: Deploy any contract to Scroll mainnet. Use Remix (remix.ethereum.org) with Scroll mainnet selected. Even a simple storage contract counts. The 'Ethereum Year in Bloom' and 'Developer' badges require contract deployment.",
        "Use Ambient Finance: Ambient is Scroll's native liquidity protocol and one of the most heavily weighted in Canvas scoring. Providing single-sided liquidity in the 'Ambient Finance' pool and maintaining it for 30+ days earns multiple badges.",
        "Interact with 5+ protocols: Swap on SyncSwap, lend on Aave v3 (Scroll deployment), trade on Vertex Protocol, and mint on Scroll-native NFT platforms. The 'Polymath' and 'DeFi Degen' badges require interactions with multiple protocol categories.",
        "Achieve >$10,000 cumulative volume: Scroll tracks total on-chain volume across DEX swaps, lending deposits, and withdrawals. Hitting $10,000 cumulative volume unlocks higher-tier badges. Note this doesn't require $10,000 at once — repeated smaller transactions accumulate.",
        "Maintain monthly activity: Scroll scores wallets on the number of consecutive months they've been active. A wallet active for 12+ months receives the 'Loyal User' badge, one of the highest-multiplier badges in the system.",
      ],
      tokenomics: `SCR launched in October 2024 with the following tokenomics:

Total Supply: 1,000,000,000 SCR (1 billion)
Initial Community Airdrop: 7% (70M tokens)
Ecosystem Fund: 35%
Investors: 17% with 1-year cliff, 3-year vesting
Team: 23% with 1-year cliff, 4-year vesting
Foundation: 10%
Future Airdrops: 8% (80M tokens reserved)

The 8% reservation for future airdrops confirms that ongoing community distribution campaigns will occur. At current SCR prices (~$1.20–$2.00), this represents $96M–$160M in additional community rewards to be distributed through Canvas badge campaigns and other mechanisms.

Wallets that missed the initial airdrop can still receive meaningful allocations through future campaigns. The Canvas badge system serves as the primary scoring mechanism for these future distributions.`,
      vcBackers: ["Polychain Capital", "Sequoia China", "Bain Capital Crypto", "Geometry VC", "IOSG Ventures"],
      timeline: [
        { date: "October 2023", event: "Scroll mainnet launch" },
        { date: "October 2024", event: "SCR token launches with 7% community airdrop" },
        { date: "November 2024", event: "Canvas badge system launches — ongoing farming mechanism" },
        { date: "Q1 2025", event: "Canvas Session 2 begins with new badge categories" },
        { date: "Q2-Q3 2025 (Projected)", event: "Second SCR community distribution based on Canvas scores" },
      ],
      riskAnalysis: `Scroll is among the safest airdrops on this list given that the token already exists.

Token Price Risk: MEDIUM. SCR is volatile and has experienced -60% drawdowns. If you farm aggressively and the token price drops between snapshot and distribution, your $ return decreases.

Dilution Risk: MEDIUM. With 35% in the ecosystem fund and future airdrop reserves, there will be ongoing token emissions that could suppress price. The schedule of unlocks matters.

Sybil Risk (Past): The initial October 2024 airdrop had significant sybil activity. Scroll filtered aggressively based on Canvas badge diversity and transaction patterns. For future campaigns, wallets with a broad badge profile are safer than those with a single high-volume metric.

Smart Contract Risk: LOW. Scroll has been running for 18+ months with increasing TVL. Core contracts are audited and battle-tested.`,
      proTips: [
        "Focus on badge diversity, not volume. A wallet with 20 different badges but lower volume consistently outperforms a wallet with $100K volume but only 3 badges in Scroll's scoring system.",
        "The 'Natural Language Processing' badge (earned by using Scroll's AI assistant tools) is one of the most underfarmed badges — very few wallets have it, giving it high scarcity value.",
        "Ambient Finance's 'Concentrated Liquidity' badges are particularly valuable. Providing liquidity in tight price ranges on Ambient for 60+ consecutive days earns multiple high-tier badges.",
        "Canvas scores compound — the more badges you have, the higher your 'Canvas Score' which serves as the primary multiplier for future airdrops. Check your current score at scroll.io/canvas.",
        "Participating in Scroll governance (voting on proposals at gov.scroll.io) earns a governance badge that signals long-term alignment with the protocol — highly weighted in quality scoring.",
      ],
      communityLinks: [
        { name: "Official Website", url: "https://scroll.io" },
        { name: "Bridge", url: "https://scroll.io/bridge" },
        { name: "Canvas", url: "https://scroll.io/canvas" },
        { name: "Discord", url: "https://discord.gg/scroll" },
        { name: "Twitter/X", url: "https://twitter.com/Scroll_ZKP" },
      ],
    },
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
    fullGuide: {
      overview: `Hyperliquid is a decentralized perpetuals exchange that launched its own Layer 1 blockchain specifically optimized for high-frequency trading. Unlike other DEXs that run on existing chains and suffer from block time limitations, Hyperliquid built its own consensus mechanism (HyperBFT) achieving median latency of under 1 millisecond — comparable to centralized exchanges like Binance or Coinbase.

The platform supports a full central limit order book (CLOB) with up to 50x leverage, spot trading, and a liquidity vault system (HLP). Since launching in 2023, Hyperliquid has grown to become one of the top 3 decentralized perp exchanges by volume, frequently processing $1–3B in daily trading volume.

In November 2024, Hyperliquid launched its HYPE token via airdrop — one of the most generous airdrops in crypto history. The initial distribution allocated 310 million HYPE tokens to early users based on trading volume, HLP participation, and platform tenure. At launch prices, some top traders received allocations worth $500,000+.

However, the HYPE ecosystem is far from done. Hyperliquid continues to grow its ecosystem with HIP-1 (Hyperliquid token standard), HIP-2 (new spot market launches), and a permissionless deployment framework for new perp markets. Each new protocol or token launched on Hyperliquid represents a potential additional airdrop opportunity for HYPE stakers and HLP liquidity providers.`,
      whyItMatters: `The HYPE airdrop was unprecedented in crypto: a fully self-funded team, no VC investors, no pre-sale, direct distribution to users. This "users first" philosophy has created extraordinary community loyalty and a model that other DeFi protocols are now copying.

For current participants, the opportunity is in HYPE staking rewards and ecosystem token airdrops from HIP-1/HIP-2 launches. Tokens launched on Hyperliquid's native framework regularly airdrop to HYPE stakers and HLP providers — creating a compounding yield structure not available on other platforms.

Additionally, Hyperliquid's second-season points program (if announced) or new campaign would likely target traders who have been consistently active since the initial airdrop, rewarding long-term users with secondary distributions.`,
      stepByStep: [
        "Create a Hyperliquid account: Go to app.hyperliquid.xyz and connect any EVM wallet. Hyperliquid uses a separate trading key system — generate your trading API key in settings.",
        "Deposit USDC: Hyperliquid uses native USDC for all trading. Bridge USDC from Arbitrum using Hyperliquid's native bridge. Minimum recommended deposit is $100–$500 to generate meaningful trading volume.",
        "Trade perpetuals organically: Open and close positions across multiple markets (BTC, ETH, SOL, etc). Aim for genuine trading behavior — vary your position sizes, hold times (not just open-and-close in seconds), and trade in different market conditions.",
        "Provide HLP (Hyperliquidity Provider) liquidity: HLP is the market maker vault that earns trading fees from the platform. Depositing USDC into HLP earns you a share of the platform's trading fees AND qualifies for ecosystem token airdrops. This is the highest-leverage passive position on Hyperliquid.",
        "Stake HYPE tokens: If you have HYPE from the initial airdrop or purchased on market, stake them at app.hyperliquid.xyz/staking. Staked HYPE receives delegation rewards and qualifies for ecosystem airdrops.",
        "Monitor HIP-1 launches for new airdrop opportunities: New token launches on Hyperliquid's native framework frequently distribute tokens to HYPE stakers and HLP providers. Keep an eye on app.hyperliquid.xyz/trade for new spot market launches.",
        "Engage with the community: Hyperliquid has a strong community on Discord and Twitter. Being an active community member and content creator has historically led to bonus allocations in various protocols.",
      ],
      tokenomics: `HYPE launched with the following distribution:
Total Supply: 1,000,000,000 HYPE
Initial Airdrop to Users: 31% (310M tokens)
Future Community Fund: 38.888%
Team: 23.8% with 1-year cliff + vesting
HyperFoundation: 6%

At current prices (~$5–$15 per HYPE), the market cap is $5–$15B. The community fund represents an enormous reserve for future ecosystem development and potential secondary distributions.

The absence of VC investors means there are no large investor unlock events that would create sell pressure — only team vesting. This makes HYPE's tokenomics more favorable than most airdrop tokens.`,
      vcBackers: ["No VC investors — fully self-funded (unique differentiator)"],
      timeline: [
        { date: "2023", event: "Hyperliquid launches as a perp DEX with HyperBFT L1" },
        { date: "Q2 2024", event: "Daily trading volume exceeds $500M consistently" },
        { date: "November 2024", event: "HYPE token launched with 310M token airdrop to users" },
        { date: "December 2024", event: "HYPE reaches $10+ price — $3B+ in airdrop value distributed" },
        { date: "Q1 2025 (Ongoing)", event: "HIP-1/HIP-2 ecosystem launches with ongoing yield for HYPE stakers" },
      ],
      riskAnalysis: `Hyperliquid carries unique risks compared to traditional L2 airdrops:

Centralization Risk: MEDIUM-HIGH. Despite being described as decentralized, Hyperliquid runs on a small validator set (21 validators) controlled primarily by the team. A protocol upgrade or emergency action could theoretically freeze funds. The team has historically acted in good faith, but this is a non-trivial risk.

Exchange Hack Risk: MEDIUM. Hyperliquid processes billions in daily volume and holds significant USDC in its smart contracts. A smart contract vulnerability or bridge hack could result in fund loss. Always only deposit what you can afford to lose.

Wash Trading Detection: HIGH (risk of being penalized). Hyperliquid has sophisticated wash trading detection. Accounts that trade only against themselves or in obvious patterns lose their points/allocation eligibility. Organic trading is strictly required.

Regulatory Risk: MEDIUM. A perp DEX accessible to US users could face CFTC enforcement actions, potentially forcing geographic restrictions or operational changes.`,
      proTips: [
        "HLP is the single best risk-adjusted position on Hyperliquid. It earns 10–40% APY from trading fees and qualifies for all ecosystem airdrops without requiring active trading.",
        "Trade during high-volatility periods (major news events, liquidation cascades) when spreads are wider. Your volume counts the same per dollar but contributes more to the platform's fee revenue, which is a quality signal.",
        "Avoid trading the same market with the same position size repeatedly — this pattern is flagged as wash trading. Vary your markets, sizes, leverage, and holding periods.",
        "The PURR token (first HIP-1 native token) is a governance and fee-sharing token. Holding PURR qualifies for future drops from protocols that want to reward the earliest Hyperliquid ecosystem participants.",
      ],
      communityLinks: [
        { name: "Trading App", url: "https://app.hyperliquid.xyz" },
        { name: "HLP Vault", url: "https://app.hyperliquid.xyz/vaults" },
        { name: "HYPE Staking", url: "https://app.hyperliquid.xyz/staking" },
        { name: "Discord", url: "https://discord.gg/hyperliquid" },
        { name: "Twitter/X", url: "https://twitter.com/HyperliquidX" },
      ],
    },
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
    fullGuide: {
      overview: `zkSync Era is a ZK rollup developed by Matter Labs, featuring native account abstraction (AA) — a core Ethereum roadmap feature that enables smart contract wallets, gasless transactions, and improved UX. ZK launched its token in June 2024 with one of the most controversial airdrops in L2 history: many active users received zero or minimal allocation due to aggressive sybil filtering, while some inactive wallets received tokens.

Despite the initial controversy, zkSync Era remains one of the most technically advanced L2s with deep Ethereum Foundation alignment. Matter Labs has committed to ongoing community distribution campaigns, with 49.1% of ZK supply reserved for the ecosystem.

The ZK Nation DAO governs the protocol and regularly votes on new allocation mechanisms. Being an active ZK Nation participant — voting, creating proposals, and engaging in governance — positions wallets for ongoing distributions.`,
      whyItMatters: `ZK's second-chance opportunity is significant for several reasons. The 49.1% ecosystem reserve represents billions in tokens available for future distributions. The ZK Nation DAO explicitly stated that ongoing participation-based distributions would occur after the initial airdrop.

Additionally, zkSync's native account abstraction makes it the preferred chain for wallets like Argent, Holdstation, and other AA-native wallets. Users of these wallets receive platform-specific rewards in addition to potential ZK distributions.`,
      stepByStep: [
        "Bridge ETH to zkSync Era using the official bridge at portal.zksync.io/bridge",
        "Swap tokens on SyncSwap (syncswap.xyz) — the most liquid DEX on zkSync",
        "Provide liquidity on SyncSwap or Mute.io for passive yield and protocol interaction",
        "Mint an NFT on Mint Square or zkSync-native NFT platforms",
        "Try the native AA wallets: Download Argent X or Holdstation and use zkSync through them — AA usage is a unique signal",
        "Vote in ZK Nation governance at vote.zknation.io",
        "Use zkSync-native dApps: Deri Protocol for perps, Vesync for ve(3,3) DeFi, or ZkEx for spot trading",
      ],
      tokenomics: `ZK Total Supply: 21,000,000,000 (21 billion)
Initial Airdrop: 17.5% (3.675 billion tokens)
Ecosystem Initiatives: 49.1%
Investors: 17.2% with vesting
Team: 16.1% with vesting

The 49.1% ecosystem reserve is the key figure — at current ZK prices, this represents billions in future community distributions.`,
      vcBackers: ["a16z", "Dragonfly Capital", "Blockchain Capital", "Lightspeed", "Union Square Ventures"],
      timeline: [
        { date: "March 2023", event: "zkSync Era mainnet launches" },
        { date: "June 2024", event: "ZK token launches with controversial initial airdrop" },
        { date: "Q3 2024", event: "ZK Nation DAO established with governance voting" },
        { date: "Q4 2024 - 2025", event: "Ongoing ecosystem fund distributions begin" },
      ],
      riskAnalysis: `Primary risk is low ZK price due to large token supply (21 billion) and ongoing unlock schedule. Sybil controversy from first airdrop means the second campaign will be even more selective. Focus on quality over quantity of interactions.`,
      proTips: [
        "Use an AA wallet (Argent or Holdstation) as your primary zkSync interface — native AA usage is a unique signal that regular EOA wallets cannot replicate.",
        "ZK Nation governance participation is underrated — most people don't vote. Being in the top 10% of governance participants significantly increases your quality score.",
        "zkSync's native paymaster feature allows gas-free transactions. Using paymasters on protocols that support them signals advanced technical usage.",
      ],
      communityLinks: [
        { name: "zkSync Portal", url: "https://portal.zksync.io" },
        { name: "ZK Nation", url: "https://zknation.io" },
        { name: "SyncSwap", url: "https://syncswap.xyz" },
        { name: "Discord", url: "https://discord.gg/zksync" },
        { name: "Twitter/X", url: "https://twitter.com/zksync" },
      ],
    },
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
    fullGuide: {
      overview: `Sophon is a zkSync-based hyperchain (a chain built using ZK Stack, zkSync's SDK for launching custom rollups) focused on consumer applications — primarily gaming, entertainment, and social platforms. The project raised $65M from Framework Ventures, Laser Digital (Nomura's crypto arm), and others in 2024.

The platform operates a points system where users earn SOPH points by using platform-native apps, referring friends, and participating in social activities. These points are expected to convert to SOPH tokens at TGE, which is projected for late 2025 or early 2026.

Sophon's thesis is that Web3 gaming and entertainment will be the next major growth narrative after DeFi and NFTs. Their team includes executives from Epic Games, Activision, and other major gaming companies, giving them credibility in gaming circles.`,
      whyItMatters: `Sophon's key advantage is the extremely low barrier to entry. The platform requires no capital — only time. Points are earned through free-to-play gaming, social engagement, and referrals. This creates an asymmetric opportunity where the downside is only the time invested.

The gaming narrative is also strengthening significantly. With major publishers exploring blockchain integration and Web3-native games gaining genuine player bases, a consumer entertainment chain backed by $65M and gaming industry veterans is well-positioned.`,
      stepByStep: [
        "Visit sophon.xyz and create an account linked to your EVM wallet",
        "Complete the onboarding tasks to earn your initial point boost",
        "Play platform-native games to earn ongoing points — even 15 minutes per day compounds significantly over 90 days",
        "Refer friends using your referral link for bonus point multipliers",
        "Follow @sophon on Twitter and engage with posts — social activity is tracked",
        "Join the Discord and participate in community events",
        "Check back regularly for new gaming integrations and campaigns",
      ],
      tokenomics: `SOPH tokenomics have not been officially published. Based on comparable gaming chain launches, Oracle Bull projects a total supply of 1–10 billion SOPH with 5–15% allocated to early community participants. At a projected FDV of $300M–$1B (conservative for a $65M-funded gaming chain), community allocation could be worth $15M–$150M.`,
      vcBackers: ["Framework Ventures", "Laser Digital (Nomura)", "Maven 11", "Arrington Capital"],
      timeline: [
        { date: "Q1 2024", event: "$65M raise announced" },
        { date: "Q3 2024", event: "Points program launches" },
        { date: "Q4 2025 (Projected)", event: "SOPH token TGE and airdrop" },
      ],
      riskAnalysis: `Sophon is unverified — the airdrop is not confirmed. Main risks: the project may not launch a token, the gaming sector may not achieve mass adoption, or the points-to-token conversion may be less favorable than expected. Treat as a high-risk, low-effort speculative position.`,
      proTips: [
        "Referrals have historically been the highest-yield activity on Sophon. Referring 10+ active users gives significant point multipliers.",
        "Consistency matters — daily check-ins and activity are weighted more than sporadic large activity.",
      ],
      communityLinks: [
        { name: "Official Website", url: "https://sophon.xyz" },
        { name: "Discord", url: "https://discord.gg/sophon" },
        { name: "Twitter/X", url: "https://twitter.com/sophon" },
      ],
    },
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
    aiAnalysis: "High effort, low confidence. Fuel is technically impressive but lacks retail narrative. Oracle AI models flag this as developer-focused — retail airdrop is possible but not primary strategy. Only pursue if you have Sway development skills.",
    fullGuide: {
      overview: `Fuel Network is a modular execution layer that uses a custom virtual machine (FuelVM) and a new programming language (Sway) to enable parallel transaction processing. Unlike the EVM which processes transactions sequentially, FuelVM uses UTXO-based parallelism similar to Bitcoin but with smart contract capabilities.

Fuel raised $81.5M and has been in development since 2019, making it one of the oldest modular blockchain projects. Its technical approach — using a custom VM instead of EVM compatibility — gives it maximum performance potential but creates a high developer barrier.

The project is developer-focused: its primary target audience is protocol developers who want to build high-throughput applications requiring parallelism. Consumer-facing applications are secondary. This makes a retail-focused airdrop less likely than a developer-centric distribution.`,
      whyItMatters: `Fuel represents a high-risk, high-effort opportunity that is only worth pursuing if you have developer skills. The FuelVM's performance characteristics are genuinely superior to EVM for specific use cases (high-frequency DEXs, order book matching engines), and if Fuel captures even a fraction of the high-performance DeFi market, early developers will be generously rewarded.

For non-developers, Fuel offers testnet interaction opportunities, but the barrier and reward ratio are significantly lower than other options on this list.`,
      stepByStep: [
        "Set up Fuel toolchain: Install Rust, then follow docs.fuel.network to install fuelup (Fuel's version manager) and forc (Fuel Orchestrator, the build tool)",
        "Get testnet ETH: Fuel testnet uses bridged ETH. Request from the Fuel testnet faucet at faucet-beta-5.fuel.network",
        "Deploy a Sway contract: Write a simple counter contract in Sway (similar to Solidity) and deploy to testnet. This is the highest-value action for Fuel farming",
        "Interact with testnet DeFi: Use testnet DEXs and lending protocols as they become available on Fuel",
        "Contribute to the ecosystem: Fuel rewards protocol developers, not just users. Building a small dApp — even a simple NFT minter — puts you in the developer allocation category",
      ],
      tokenomics: `Fuel has not announced token plans officially. Given $81.5M raised, a TGE is expected but unconfirmed. Developer-focused allocation is most likely, with retail users receiving smaller secondary distributions.`,
      vcBackers: ["Blockchain Capital", "CoinFund", "Spartan Group", "Maven 11", "HashKey Capital"],
      timeline: [
        { date: "2019", event: "Fuel project founded" },
        { date: "Q4 2023", event: "$81.5M funding announced" },
        { date: "Q2 2024", event: "Fuel v1 testnet" },
        { date: "2025 (TBD)", event: "Mainnet launch" },
      ],
      riskAnalysis: `HIGH RISK. Fuel is the most technically complex farming target on this list. The custom Sway language requires significant learning investment. Airdrop is unconfirmed. Even if a token launches, the developer-focused distribution may leave retail users with minimal allocations. Only pursue if you're committed to the technical learning curve or are already a Rust/Solidity developer.`,
      proTips: [
        "If you're a developer, the Fuel Ecosystem team actively funds grants for protocols built on Fuel. A small grant project could yield more than any airdrop farming.",
        "The Sway language is similar enough to Rust that Rust developers can learn it quickly. A Rust developer can meaningfully farm Fuel in a weekend.",
      ],
      communityLinks: [
        { name: "Official Website", url: "https://fuel.network" },
        { name: "Documentation", url: "https://docs.fuel.network" },
        { name: "Discord", url: "https://discord.gg/fuel" },
        { name: "Twitter/X", url: "https://twitter.com/fuel_network" },
      ],
    },
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
  const [selectedProject, setSelectedProject] = useState<AirdropProject | null>(null);

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
    <>
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
                    ? tab.id === "High Risk" ? "bg-danger/10 text-danger border-danger/30"
                      : tab.id === "Verified" ? "bg-success/10 text-success border-success/30"
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
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sort:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setSort(opt.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    sort === opt.key ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{filtered.length} opportunities</span>
          <span className="text-xs text-muted-foreground">· ranked by {sort === "aiScore" ? "Oracle AI Score" : sort === "rewardRatio" ? "Effort:Reward ratio" : "estimated value"}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No airdrops match this filter.</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.map((project, idx) => (
              <AirdropCard key={project.id} project={project} rank={idx + 1} onReadMore={() => setSelectedProject(project)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <AirdropDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
}
