// ──────────────────────────────────────────────────────────────────────────────
// Evergreen, factual per-coin reference data for the SEO prerenderer.
//
// WHY: the prediction/how-to-buy/compare/q pages were name-swapped boilerplate
// (~58% 5-gram similarity between coins) — the classic thin-programmatic-content
// fingerprint that Google's Helpful Content system demotes across a whole site.
// This dataset lets each page carry genuinely unique, accurate, evergreen prose
// (what the asset is, its sector, consensus, launch era, use case) woven into the
// intro + FAQ. No live data — all facts are stable and baked at build time.
//
// ACCURACY NOTE: these are widely-documented, stable facts (category, consensus,
// launch year, core use case). They deliberately avoid volatile claims (price,
// rank, "best"). Keep factual and neutral — this is a finance site.
//
// FIELDS:
//   sector  — taxonomy key (drives peer grouping + comparison context)
//   cat     — human-readable category shown in copy
//   year    — launch / mainnet year (number)
//   consensus — consensus or settlement model (short phrase) | null if N/A (token)
//   blurb   — 1 factual sentence: what it is + what it does
// Peers are derived automatically from `sector` in the prerenderer, so adding a
// coin here automatically enriches related-coin linking with zero extra upkeep.
// ──────────────────────────────────────────────────────────────────────────────

export const SECTOR_LABELS = {
  l1: 'Layer-1 blockchain',
  l2: 'Ethereum Layer-2 scaling network',
  smartcontract: 'Layer-1 smart-contract platform',
  defi: 'DeFi protocol token',
  dex: 'decentralized-exchange token',
  meme: 'meme coin',
  ai: 'AI & compute crypto',
  depin: 'DePIN (decentralized physical infrastructure) token',
  gaming: 'gaming & metaverse token',
  nft: 'NFT-ecosystem token',
  privacy: 'privacy coin',
  rwa: 'real-world-asset (RWA) token',
  oracle: 'oracle network token',
  interop: 'interoperability / cross-chain token',
  storage: 'decentralized-storage token',
  exchange: 'exchange utility token',
  payments: 'payments-focused cryptocurrency',
  store: 'store-of-value cryptocurrency',
  staking: 'liquid-staking token',
  governance: 'DAO governance token',
};

// slug -> facts. slug matches the prerenderer's COINS friendly slug.
export const COIN_FACTS = {
  // ── Majors / store-of-value ──
  bitcoin: { sector: 'store', cat: 'original store-of-value cryptocurrency', year: 2009, consensus: 'proof-of-work', blurb: 'Bitcoin is the first and largest cryptocurrency, created by the pseudonymous Satoshi Nakamoto as a fixed-supply (21 million) peer-to-peer digital money secured by proof-of-work mining.' },
  litecoin: { sector: 'payments', cat: 'peer-to-peer payments cryptocurrency', year: 2011, consensus: 'proof-of-work (Scrypt)', blurb: 'Litecoin is one of the oldest altcoins, launched by Charlie Lee as a faster, lower-fee fork of Bitcoin using the Scrypt mining algorithm.' },
  'bitcoin-cash': { sector: 'payments', cat: 'peer-to-peer payments cryptocurrency', year: 2017, consensus: 'proof-of-work', blurb: 'Bitcoin Cash is a 2017 fork of Bitcoin that raised the block size to prioritise low-fee, on-chain payments over store-of-value use.' },
  monero: { sector: 'privacy', cat: 'privacy coin', year: 2014, consensus: 'proof-of-work (RandomX)', blurb: 'Monero is the leading privacy coin, using ring signatures, stealth addresses and confidential transactions to make balances and transfers untraceable by default.' },
  zcash: { sector: 'privacy', cat: 'privacy coin', year: 2016, consensus: 'proof-of-work', blurb: 'Zcash is a privacy coin that uses zero-knowledge proofs (zk-SNARKs) to let users send shielded transactions that hide sender, receiver and amount.' },
  dash: { sector: 'privacy', cat: 'payments & privacy cryptocurrency', year: 2014, consensus: 'proof-of-work (X11)', blurb: 'Dash is a payments-focused cryptocurrency with optional privacy (PrivateSend) and instant settlement (InstantSend) powered by a masternode network.' },

  // ── Layer-1 smart-contract platforms ──
  ethereum: { sector: 'smartcontract', cat: 'leading smart-contract platform', year: 2015, consensus: 'proof-of-stake', blurb: 'Ethereum is the largest smart-contract platform and the settlement layer for most of DeFi, NFTs and stablecoins, secured by proof-of-stake since The Merge in 2022.' },
  solana: { sector: 'smartcontract', cat: 'high-throughput Layer-1', year: 2020, consensus: 'proof-of-stake (Proof of History)', blurb: 'Solana is a high-throughput Layer-1 that combines proof-of-stake with Proof of History to deliver fast, low-fee transactions for DeFi, NFTs and consumer apps.' },
  cardano: { sector: 'smartcontract', cat: 'research-driven Layer-1', year: 2017, consensus: 'proof-of-stake (Ouroboros)', blurb: 'Cardano is a peer-reviewed, research-first Layer-1 founded by Ethereum co-founder Charles Hoskinson, using the Ouroboros proof-of-stake protocol.' },
  avalanche: { sector: 'smartcontract', cat: 'Layer-1 with subnets', year: 2020, consensus: 'proof-of-stake', blurb: 'Avalanche is a fast-finality Layer-1 whose subnet architecture lets projects launch custom, app-specific blockchains that interoperate with its primary network.' },
  bnb: { sector: 'smartcontract', cat: 'exchange-backed Layer-1', year: 2017, consensus: 'proof-of-staked-authority', blurb: 'BNB is the native token of BNB Chain, the Binance-linked smart-contract network, and is used for gas, fee discounts and ecosystem applications.' },
  tron: { sector: 'smartcontract', cat: 'Layer-1 for stablecoins & content', year: 2018, consensus: 'delegated proof-of-stake', blurb: 'TRON is a high-throughput Layer-1 founded by Justin Sun that has become a major rail for USDT stablecoin transfers and content applications.' },
  sui: { sector: 'smartcontract', cat: 'Move-based Layer-1', year: 2023, consensus: 'proof-of-stake', blurb: 'Sui is a Layer-1 built by ex-Meta engineers using the Move language and an object-centric model designed for parallel transaction execution.' },
  aptos: { sector: 'smartcontract', cat: 'Move-based Layer-1', year: 2022, consensus: 'proof-of-stake (AptosBFT)', blurb: 'Aptos is a Layer-1 from former Meta Diem engineers that uses the Move language and parallel execution (Block-STM) for high throughput.' },
  near: { sector: 'smartcontract', cat: 'sharded Layer-1', year: 2020, consensus: 'proof-of-stake (Nightshade sharding)', blurb: 'NEAR Protocol is a developer-friendly, sharded Layer-1 that scales via its Nightshade design and emphasises simple onboarding and account abstraction.' },
  cosmos: { sector: 'interop', cat: 'interoperability Layer-1 ("Internet of Blockchains")', year: 2019, consensus: 'proof-of-stake (Tendermint BFT)', blurb: 'Cosmos (ATOM) anchors an ecosystem of sovereign, interconnected chains linked by the IBC protocol, with the Cosmos SDK as its app-chain toolkit.' },
  polkadot: { sector: 'interop', cat: 'multi-chain interoperability network', year: 2020, consensus: 'nominated proof-of-stake', blurb: 'Polkadot, founded by Ethereum co-founder Gavin Wood, connects specialised parachains to a shared relay chain that provides pooled security and cross-chain messaging.' },
  tezos: { sector: 'smartcontract', cat: 'self-amending Layer-1', year: 2018, consensus: 'liquid proof-of-stake', blurb: 'Tezos is a self-amending Layer-1 with on-chain governance that lets the protocol upgrade itself without contentious hard forks.' },
  algorand: { sector: 'smartcontract', cat: 'pure-proof-of-stake Layer-1', year: 2019, consensus: 'pure proof-of-stake', blurb: 'Algorand is a Layer-1 founded by Turing Award winner Silvio Micali, using a pure-proof-of-stake design for fast finality and low fees.' },
  hedera: { sector: 'smartcontract', cat: 'enterprise DAG network', year: 2019, consensus: 'hashgraph (aBFT)', blurb: 'Hedera (HBAR) is an enterprise-grade public network built on the hashgraph consensus algorithm and governed by a council of large global organisations.' },
  'internet-computer': { sector: 'smartcontract', cat: 'on-chain compute Layer-1', year: 2021, consensus: 'chain-key cryptography', blurb: 'Internet Computer (ICP), built by the DFINITY Foundation, aims to host full web applications fully on-chain via its canister smart-contract model.' },
  fantom: { sector: 'smartcontract', cat: 'DAG-based Layer-1', year: 2019, consensus: 'proof-of-stake (Lachesis aBFT)', blurb: 'Fantom is a fast-finality Layer-1 using the Lachesis aBFT consensus, known for low fees and a DeFi-heavy ecosystem.' },
  kaspa: { sector: 'l1', cat: 'proof-of-work blockDAG', year: 2021, consensus: 'proof-of-work (GHOSTDAG)', blurb: 'Kaspa is a proof-of-work cryptocurrency built on a blockDAG (GHOSTDAG) that allows many blocks to coexist for very fast confirmation times.' },
  'ethereum-classic': { sector: 'smartcontract', cat: 'proof-of-work smart-contract chain', year: 2016, consensus: 'proof-of-work', blurb: 'Ethereum Classic is the original Ethereum chain that retained proof-of-work after the 2016 DAO-fork split, preserving immutability as its core principle.' },
  vechain: { sector: 'l1', cat: 'supply-chain Layer-1', year: 2018, consensus: 'proof-of-authority', blurb: 'VeChain is an enterprise Layer-1 focused on supply-chain tracking and sustainability, using a dual-token model (VET and VTHO).' },
  flow: { sector: 'smartcontract', cat: 'consumer & NFT Layer-1', year: 2020, consensus: 'proof-of-stake', blurb: 'Flow is a Layer-1 from Dapper Labs (CryptoKitties, NBA Top Shot) designed for mainstream NFT and gaming applications via a multi-role node architecture.' },
  eos: { sector: 'smartcontract', cat: 'delegated-PoS Layer-1', year: 2018, consensus: 'delegated proof-of-stake', blurb: 'EOS is a smart-contract Layer-1 launched after one of the largest ICOs, designed for high throughput and feeless transactions via delegated proof-of-stake.' },
  iota: { sector: 'l1', cat: 'feeless DAG network', year: 2017, consensus: 'directed acyclic graph (Tangle)', blurb: 'IOTA uses a feeless directed-acyclic-graph ledger (the Tangle) rather than a blockchain, targeting machine-to-machine and IoT payments.' },
  neo: { sector: 'smartcontract', cat: 'smart-economy Layer-1', year: 2016, consensus: 'delegated BFT', blurb: 'NEO is a smart-contract Layer-1, often called "Ethereum of China," using a dual-token model (NEO and GAS) and delegated BFT consensus.' },
  'mina-protocol': { sector: 'l1', cat: 'succinct (zk) Layer-1', year: 2021, consensus: 'proof-of-stake (Ouroboros Samasika)', blurb: 'Mina is the "succinct blockchain," using recursive zero-knowledge proofs to keep the entire chain a constant ~22 KB regardless of usage.' },
  'conflux-token': { sector: 'smartcontract', cat: 'Tree-Graph Layer-1', year: 2020, consensus: 'proof-of-work + proof-of-stake (Tree-Graph)', blurb: 'Conflux is a high-throughput Layer-1 using a Tree-Graph structure, notable as a regulatory-compliant public chain operating from China.' },
  'nervos-network': { sector: 'l1', cat: 'proof-of-work Layer-1 (UTXO)', year: 2019, consensus: 'proof-of-work (NC-MAX)', blurb: 'Nervos (CKB) is a proof-of-work Layer-1 with a flexible UTXO-based "Cell" model designed as a store-of-value and interoperability base layer.' },
  'theta-token': { sector: 'depin', cat: 'decentralized video-delivery network', year: 2019, consensus: 'proof-of-stake', blurb: 'Theta powers a decentralized video-streaming and content-delivery network where users share bandwidth and compute in exchange for rewards.' },

  // ── Ethereum Layer-2s & scaling ──
  arbitrum: { sector: 'l2', cat: 'Ethereum Layer-2 (optimistic rollup)', year: 2021, consensus: 'optimistic rollup (settles to Ethereum)', blurb: 'Arbitrum is a leading Ethereum Layer-2 optimistic rollup from Offchain Labs that scales Ethereum with lower fees while inheriting its security.' },
  optimism: { sector: 'l2', cat: 'Ethereum Layer-2 (optimistic rollup)', year: 2021, consensus: 'optimistic rollup (settles to Ethereum)', blurb: 'Optimism is an Ethereum Layer-2 optimistic rollup whose OP Stack powers a "Superchain" of interoperable L2s including Base.' },
  polygon: { sector: 'l2', cat: 'Ethereum scaling network', year: 2020, consensus: 'proof-of-stake', blurb: 'Polygon (POL, formerly MATIC) is a suite of Ethereum scaling solutions, including a PoS chain and zkEVM rollups, aimed at low-cost transactions.' },
  starknet: { sector: 'l2', cat: 'Ethereum Layer-2 (zk-rollup)', year: 2022, consensus: 'validity (zk) rollup (settles to Ethereum)', blurb: 'Starknet is an Ethereum Layer-2 ZK-rollup from StarkWare that uses STARK proofs and the Cairo language for scalable, low-cost computation.' },
  zksync: { sector: 'l2', cat: 'Ethereum Layer-2 (zk-rollup)', year: 2023, consensus: 'validity (zk) rollup (settles to Ethereum)', blurb: 'zkSync Era is an Ethereum Layer-2 ZK-rollup from Matter Labs that uses zero-knowledge proofs and an EVM-compatible zkEVM to deliver low-fee, secure transactions.' },
  immutable: { sector: 'l2', cat: 'gaming-focused Ethereum Layer-2', year: 2021, consensus: 'zk-rollup (settles to Ethereum)', blurb: 'Immutable (IMX) is an Ethereum Layer-2 purpose-built for Web3 gaming, offering gas-free NFT minting and trading via zk-rollup technology.' },
  'immutable-x': { sector: 'l2', cat: 'gaming-focused Ethereum Layer-2', year: 2021, consensus: 'zk-rollup (settles to Ethereum)', blurb: 'Immutable X is an Ethereum Layer-2 purpose-built for Web3 gaming, offering gas-free NFT minting and trading via zk-rollup technology.' },
  mantle: { sector: 'l2', cat: 'Ethereum Layer-2 (modular)', year: 2023, consensus: 'optimistic rollup with modular data availability', blurb: 'Mantle is a modular Ethereum Layer-2, incubated by the BitDAO/Mantle treasury, that separates execution from data availability to lower costs.' },

  // ── DeFi / DEX / lending ──
  uniswap: { sector: 'dex', cat: 'decentralized exchange (DEX) token', year: 2020, consensus: null, blurb: 'Uniswap is the largest decentralized exchange, pioneering the automated-market-maker model; UNI is its governance token.' },
  aave: { sector: 'defi', cat: 'decentralized lending protocol token', year: 2020, consensus: null, blurb: 'Aave is a leading decentralized lending and borrowing protocol; AAVE is its governance token and backstop for the safety module.' },
  maker: { sector: 'defi', cat: 'DeFi lending & stablecoin governance token', year: 2017, consensus: null, blurb: 'Maker (MKR) governs the MakerDAO protocol behind the DAI stablecoin, one of DeFi’s oldest and most important credit systems.' },
  'curve-dao-token': { sector: 'dex', cat: 'stablecoin-focused DEX token', year: 2020, consensus: null, blurb: 'Curve is a decentralized exchange optimised for low-slippage stablecoin and pegged-asset swaps; CRV is its governance and incentive token.' },
  synthetix: { sector: 'defi', cat: 'derivatives liquidity protocol token', year: 2018, consensus: null, blurb: 'Synthetix is a DeFi protocol for on-chain derivatives and synthetic assets, providing deep liquidity for perpetual-futures front-ends.' },
  '1inch': { sector: 'dex', cat: 'DEX aggregator token', year: 2020, consensus: null, blurb: '1inch is a DEX aggregator that routes trades across many liquidity sources to find the best price; 1INCH is its governance and utility token.' },
  compound: { sector: 'defi', cat: 'decentralized lending protocol token', year: 2020, consensus: null, blurb: 'Compound is a pioneering algorithmic money-market protocol for lending and borrowing crypto; COMP is its governance token.' },
  dydx: { sector: 'defi', cat: 'decentralized derivatives exchange token', year: 2021, consensus: null, blurb: 'dYdX is a decentralized perpetual-futures exchange that migrated to its own Cosmos app-chain; DYDX is its governance and staking token.' },
  gmx: { sector: 'defi', cat: 'on-chain perpetuals exchange token', year: 2021, consensus: null, blurb: 'GMX is a decentralized spot and perpetual-futures exchange on Arbitrum and Avalanche with a unique multi-asset liquidity pool (GLP).' },
  pendle: { sector: 'defi', cat: 'yield-tokenization protocol token', year: 2021, consensus: null, blurb: 'Pendle is a DeFi protocol that tokenizes and lets users trade future yield, becoming a hub of the on-chain fixed-income and points economy.' },
  'lido-dao': { sector: 'staking', cat: 'liquid-staking protocol token', year: 2020, consensus: null, blurb: 'Lido is the largest liquid-staking protocol, issuing stETH for staked Ethereum; LDO is its DAO governance token.' },
  'rocket-pool': { sector: 'staking', cat: 'decentralized staking protocol token', year: 2021, consensus: null, blurb: 'Rocket Pool is a decentralized Ethereum staking protocol that lets users stake with as little as a fraction of the usual minimum via a permissionless node network.' },
  frax: { sector: 'defi', cat: 'algorithmic-stablecoin ecosystem token', year: 2020, consensus: null, blurb: 'Frax is a DeFi ecosystem built around the FRAX stablecoin and a suite of related protocols; FRAX/FXS power its governance and stability.' },
  thorchain: { sector: 'dex', cat: 'cross-chain liquidity protocol token', year: 2021, consensus: 'proof-of-stake (Tendermint)', blurb: 'THORChain (RUNE) is a decentralized cross-chain liquidity network that enables native asset swaps between blockchains without wrapping.' },
  'ribbon-finance': { sector: 'defi', cat: 'DeFi options-vault token', year: 2021, consensus: null, blurb: 'Ribbon Finance is a DeFi protocol offering automated options-based structured-product vaults (now part of the Aevo derivatives platform).' },
  ethena: { sector: 'defi', cat: 'synthetic-dollar protocol token', year: 2024, consensus: null, blurb: 'Ethena issues USDe, a delta-hedged synthetic dollar backed by crypto collateral and futures; ENA is its governance token.' },
  jupiter: { sector: 'dex', cat: 'Solana DEX aggregator token', year: 2024, consensus: null, blurb: 'Jupiter is the leading DEX aggregator and swap layer on Solana; JUP is its governance token, distributed via one of the largest airdrops.' },
  raydium: { sector: 'dex', cat: 'Solana AMM / DEX token', year: 2021, consensus: null, blurb: 'Raydium is a leading automated-market-maker and liquidity provider on Solana; RAY is its protocol token.' },
  gnosis: { sector: 'defi', cat: 'prediction-market & infrastructure token', year: 2017, consensus: null, blurb: 'Gnosis (GNO) builds DeFi and infrastructure tooling including Safe (multisig), Gnosis Chain and prediction-market technology.' },
  kava: { sector: 'defi', cat: 'DeFi-focused Layer-1', year: 2019, consensus: 'proof-of-stake (Tendermint)', blurb: 'Kava is a Cosmos-based Layer-1 with a co-chain architecture that combines Cosmos and EVM environments for DeFi applications.' },

  // ── Oracles & interoperability ──
  chainlink: { sector: 'oracle', cat: 'decentralized oracle network token', year: 2019, consensus: null, blurb: 'Chainlink is the dominant decentralized oracle network, feeding real-world data and cross-chain messaging (CCIP) to smart contracts across most major blockchains.' },
  'pyth-network': { sector: 'oracle', cat: 'low-latency oracle token', year: 2023, consensus: null, blurb: 'Pyth Network is a low-latency oracle that publishes first-party financial market data on-chain, sourced directly from major trading firms and exchanges.' },
  band: { sector: 'oracle', cat: 'cross-chain oracle token', year: 2019, consensus: null, blurb: 'Band Protocol is a cross-chain data oracle that aggregates and connects real-world data to smart contracts.' },
  quant: { sector: 'interop', cat: 'enterprise interoperability token', year: 2018, consensus: null, blurb: 'Quant (QNT) builds Overledger, an enterprise interoperability gateway connecting different blockchains and legacy financial systems.' },
  'quant-network': { sector: 'interop', cat: 'enterprise interoperability token', year: 2018, consensus: null, blurb: 'Quant (QNT) builds Overledger, an enterprise interoperability gateway connecting different blockchains and legacy financial systems.' },
  injective: { sector: 'defi', cat: 'finance-focused Layer-1', year: 2021, consensus: 'proof-of-stake (Tendermint)', blurb: 'Injective is a Cosmos-based Layer-1 optimised for decentralized finance, offering an on-chain order book and modules for derivatives and RWAs.' },
  'sei-network': { sector: 'defi', cat: 'trading-optimised Layer-1', year: 2023, consensus: 'proof-of-stake (Tendermint)', blurb: 'Sei is a Layer-1 optimised for trading, featuring built-in order-book infrastructure and parallelised execution for low-latency markets.' },
  celestia: { sector: 'l1', cat: 'modular data-availability network', year: 2023, consensus: 'proof-of-stake (Tendermint)', blurb: 'Celestia (TIA) is the first modular data-availability network, letting rollups publish data cheaply rather than bundling execution and consensus.' },
  stellar: { sector: 'payments', cat: 'cross-border payments network', year: 2014, consensus: 'Stellar Consensus Protocol', blurb: 'Stellar (XLM) is a payments network for fast, low-cost cross-border transfers and asset issuance, with a focus on financial inclusion.' },
  ripple: { sector: 'payments', cat: 'cross-border settlement asset', year: 2012, consensus: 'XRP Ledger Consensus Protocol', blurb: 'XRP is the native asset of the XRP Ledger, designed for fast, low-cost cross-border value transfer and used by Ripple in institutional payments.' },
  // `xrp` is the friendly compare/prediction slug for the same asset as `ripple` (CoinGecko id). Mirror it so /compare/*-vs-xrp pages get rich facts, not the thin fallback.
  xrp: { sector: 'payments', cat: 'cross-border settlement asset', year: 2012, consensus: 'XRP Ledger Consensus Protocol', blurb: 'XRP is the native asset of the XRP Ledger, designed for fast, low-cost cross-border value transfer and used by Ripple in institutional payments.' },

  // ── AI & DePIN & compute ──
  render: { sector: 'depin', cat: 'decentralized GPU rendering network', year: 2020, consensus: null, blurb: 'Render Network (RNDR/RENDER) is a DePIN marketplace that connects idle GPUs to artists and AI workloads needing rendering and compute power.' },
  'fetch-ai': { sector: 'ai', cat: 'AI agents & machine-learning token', year: 2019, consensus: null, blurb: 'Fetch.ai (FET) builds autonomous AI agents and is a founding member of the Artificial Superintelligence Alliance (with SingularityNET and Ocean).' },
  bittensor: { sector: 'ai', cat: 'decentralized machine-learning network', year: 2021, consensus: 'proof-of-stake (Yuma consensus)', blurb: 'Bittensor (TAO) is a decentralized network where competing "subnets" of machine-learning models are rewarded for producing useful intelligence.' },
  singularitynet: { sector: 'ai', cat: 'decentralized AI marketplace token', year: 2017, consensus: null, blurb: 'SingularityNET (AGIX) is a decentralized marketplace for AI services and a founding member of the Artificial Superintelligence Alliance.' },
  'ocean-protocol': { sector: 'ai', cat: 'data-economy & AI token', year: 2019, consensus: null, blurb: 'Ocean Protocol (OCEAN) is a decentralized data-sharing and monetisation network for AI, and a member of the Artificial Superintelligence Alliance.' },
  'akash-network': { sector: 'depin', cat: 'decentralized cloud-compute marketplace', year: 2020, consensus: 'proof-of-stake (Tendermint)', blurb: 'Akash (AKT) is a decentralized cloud-compute marketplace — a "supercloud" where users rent spare GPU and server capacity, popular for AI workloads.' },
  helium: { sector: 'depin', cat: 'decentralized wireless network token', year: 2019, consensus: null, blurb: 'Helium (HNT) is a DePIN project that crowdsources wireless coverage (IoT and 5G) through community-operated hotspots rewarded in tokens.' },
  filecoin: { sector: 'storage', cat: 'decentralized storage network token', year: 2020, consensus: 'proof-of-replication / proof-of-spacetime', blurb: 'Filecoin (FIL) is a decentralized storage network where providers earn tokens for storing data and proving they continue to hold it.' },
  arweave: { sector: 'storage', cat: 'permanent-storage network token', year: 2018, consensus: 'proof-of-access', blurb: 'Arweave (AR) offers permanent, pay-once data storage via its "permaweb," using a novel proof-of-access blockweave structure.' },
  worldcoin: { sector: 'depin', cat: 'proof-of-personhood / identity token', year: 2023, consensus: null, blurb: 'Worldcoin (WLD), co-founded by Sam Altman, is a proof-of-personhood project that verifies unique humans via iris-scanning "Orb" devices.' },
  'the-graph': { sector: 'depin', cat: 'blockchain-indexing protocol token', year: 2020, consensus: null, blurb: 'The Graph (GRT) is a decentralized indexing protocol — the "Google of blockchains" — that lets apps query on-chain data via open APIs called subgraphs.' },

  // ── Meme coins ──
  dogecoin: { sector: 'meme', cat: 'original meme coin', year: 2013, consensus: 'proof-of-work (Scrypt, merge-mined)', blurb: 'Dogecoin is the original meme coin, started as a joke in 2013, that grew into a widely-held cryptocurrency with a strong community and tipping culture.' },
  'shiba-inu': { sector: 'meme', cat: 'Ethereum-based meme coin', year: 2020, consensus: null, blurb: 'Shiba Inu (SHIB) is an Ethereum-based meme coin that expanded into an ecosystem including the Shibarium Layer-2 and the ShibaSwap DEX.' },
  pepe: { sector: 'meme', cat: 'Ethereum meme coin', year: 2023, consensus: null, blurb: 'Pepe (PEPE) is an Ethereum meme coin based on the Pepe the Frog meme that became one of the most-traded meme assets of the 2023–2024 cycle.' },
  bonk: { sector: 'meme', cat: 'Solana meme coin', year: 2022, consensus: null, blurb: 'Bonk (BONK) is a Solana-based meme coin launched via a community airdrop that became a flagship asset of the Solana meme economy.' },
  floki: { sector: 'meme', cat: 'meme coin & ecosystem token', year: 2021, consensus: null, blurb: 'Floki (FLOKI) is a meme coin that has built out an ecosystem including education, gaming and a DeFi platform.' },
  dogwifcoin: { sector: 'meme', cat: 'Solana meme coin', year: 2023, consensus: null, blurb: 'dogwifhat (WIF) is a Solana meme coin built around the image of a dog wearing a hat that became a defining meme asset of the 2024 cycle.' },
  ordinals: { sector: 'meme', cat: 'Bitcoin-ecosystem token (ORDI)', year: 2023, consensus: null, blurb: 'ORDI is the first BRC-20 token, created using the Bitcoin Ordinals inscription protocol that brought NFTs and fungible tokens to Bitcoin.' },
  jasmycoin: { sector: 'depin', cat: 'IoT data-democracy token', year: 2021, consensus: null, blurb: 'JasmyCoin (JASMY) is a Japanese IoT project focused on personal data sovereignty, letting users control and monetise their device data.' },

  // ── Gaming / metaverse / NFT ──
  'the-sandbox': { sector: 'gaming', cat: 'metaverse gaming token', year: 2020, consensus: null, blurb: 'The Sandbox (SAND) is a virtual-world platform where users build, own and monetise gaming experiences and virtual LAND as NFTs.' },
  decentraland: { sector: 'gaming', cat: 'metaverse virtual-world token', year: 2017, consensus: null, blurb: 'Decentraland (MANA) is a user-owned virtual world where land, wearables and experiences are NFTs governed by a DAO.' },
  'axie-infinity': { sector: 'gaming', cat: 'play-to-earn gaming token', year: 2020, consensus: null, blurb: 'Axie Infinity (AXS) is a pioneering play-to-earn game where players breed, battle and trade NFT creatures called Axies; AXS is its governance token.' },
  gala: { sector: 'gaming', cat: 'blockchain-gaming platform token', year: 2020, consensus: null, blurb: 'Gala (GALA) is a blockchain-gaming platform and publisher where the token is used across its catalogue of games and node network.' },
  chiliz: { sector: 'gaming', cat: 'sports & fan-token platform', year: 2019, consensus: null, blurb: 'Chiliz (CHZ) powers Socios.com, a fan-engagement platform that issues Fan Tokens for major sports clubs and teams.' },
  enjincoin: { sector: 'gaming', cat: 'NFT-gaming infrastructure token', year: 2017, consensus: null, blurb: 'Enjin (ENJ) provides NFT and gaming infrastructure, letting developers mint and back digital items with on-chain value.' },
  gmt: { sector: 'gaming', cat: 'move-to-earn lifestyle token', year: 2022, consensus: null, blurb: 'GMT is the governance token of STEPN, a move-to-earn app that rewards users for walking and running with NFT sneakers.' },
  blur: { sector: 'nft', cat: 'NFT-marketplace token', year: 2023, consensus: null, blurb: 'Blur (BLUR) is an NFT marketplace and aggregator built for professional traders, known for advanced analytics and incentive airdrops.' },
  ens: { sector: 'nft', cat: 'decentralized naming-service token', year: 2021, consensus: null, blurb: 'Ethereum Name Service (ENS) maps human-readable names like "name.eth" to wallet addresses; ENS is its DAO governance token.' },
  axie: { sector: 'gaming', cat: 'play-to-earn gaming token', year: 2020, consensus: null, blurb: 'Axie Infinity (AXS) is a pioneering play-to-earn NFT game; AXS is its governance token.' },

  // ── RWA & exchange & other ──
  'ondo-finance': { sector: 'rwa', cat: 'real-world-asset (RWA) token', year: 2024, consensus: null, blurb: 'Ondo Finance (ONDO) is a leading real-world-asset protocol that tokenizes US Treasuries and other yield-bearing instruments for on-chain access.' },
  ton: { sector: 'smartcontract', cat: 'Telegram-linked Layer-1', year: 2021, consensus: 'proof-of-stake', blurb: 'Toncoin (TON) is the Layer-1 originally designed by Telegram and now community-developed, deeply integrated with the Telegram messaging app and its mini-apps.' },
  jito: { sector: 'staking', cat: 'Solana liquid-staking & MEV token', year: 2023, consensus: null, blurb: 'Jito (JTO) governs Solana’s leading liquid-staking protocol and MEV infrastructure, issuing the JitoSOL liquid-staking token.' },
  starknet_token: { sector: 'l2', cat: 'Ethereum Layer-2 token', year: 2024, consensus: null, blurb: 'STRK is the native token of Starknet, used for fees, staking and governance of the ZK-rollup.' },
};

// Normalise: ensure both alias spellings resolve. Returns null if unknown so the
// prerenderer can gracefully fall back to generic copy.
export function coinFacts(slug) {
  return COIN_FACTS[slug] || null;
}

// ── Sector-specific price drivers ──────────────────────────────────────────────
// One evergreen sentence per sector describing the catalysts that tend to move
// that category of asset. Woven into forecasts so pages in different sectors read
// very differently (cuts cross-coin template similarity) AND are more useful.
export const SECTOR_DRIVERS = {
  store: 'macro liquidity, interest-rate expectations, ETF flows and the four-year halving cycle',
  payments: 'transaction demand, merchant and remittance adoption, and broader Bitcoin-driven market trends',
  smartcontract: 'network activity, total value locked (TVL), developer growth and competition among Layer-1s',
  l1: 'network usage, security guarantees, developer adoption and competition among base layers',
  l2: 'Ethereum activity, rollup adoption, fee revenue and sequencer decentralisation progress',
  defi: 'total value locked, protocol fees, governance changes and the broader DeFi risk appetite',
  dex: 'on-chain trading volume, fee capture, liquidity incentives and DeFi market conditions',
  meme: 'social momentum, community virality, exchange listings and overall market risk appetite',
  ai: 'the AI narrative, compute demand, partnerships and progress in decentralized machine learning',
  depin: 'real-world network growth, hardware adoption and demand for the physical resource it coordinates',
  gaming: 'active users, game launches, partnerships and the strength of the broader gaming-token narrative',
  nft: 'NFT trading volume, marketplace share and on-chain collectible demand',
  privacy: 'demand for financial privacy, regulatory pressure and exchange-listing dynamics',
  rwa: 'tokenized-asset demand, yields on real-world instruments and institutional adoption of on-chain finance',
  oracle: 'smart-contract demand for reliable data, cross-chain expansion and integrations across DeFi',
  interop: 'cross-chain volume, the number of connected chains and demand for shared security',
  storage: 'demand for decentralized data storage, network utilisation and provider economics',
  exchange: 'exchange volume, token-burn mechanics and the health of its parent ecosystem',
  staking: 'staking yields, total assets staked and the security/economics of the underlying chain',
  governance: 'protocol revenue, treasury decisions and governance participation',
};

export function sectorDriver(slug) {
  const f = COIN_FACTS[slug];
  if (!f) return null;
  return SECTOR_DRIVERS[f.sector] || null;
}
