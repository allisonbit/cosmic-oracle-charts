import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chain-specific comprehensive data with realistic values
const chainOverviews: Record<string, any> = {
  ethereum: { marketCap: 440e9, volume24h: 18e9, transactions24h: 1200000, gasFees: 25, tps: 15, activeWallets: 450000, defiTvl: 48e9 },
  solana: { marketCap: 105e9, volume24h: 4.5e9, transactions24h: 45000000, gasFees: 0.00025, tps: 4000, activeWallets: 800000, defiTvl: 8e9 },
  bnb: { marketCap: 100e9, volume24h: 2e9, transactions24h: 5000000, gasFees: 0.10, tps: 160, activeWallets: 2000000, defiTvl: 5e9 },
  avalanche: { marketCap: 21e9, volume24h: 800e6, transactions24h: 1500000, gasFees: 0.05, tps: 4500, activeWallets: 150000, defiTvl: 1.2e9 },
  polygon: { marketCap: 6e9, volume24h: 400e6, transactions24h: 3000000, gasFees: 0.01, tps: 7000, activeWallets: 350000, defiTvl: 900e6 },
  arbitrum: { marketCap: 4.6e9, volume24h: 450e6, transactions24h: 2000000, gasFees: 0.15, tps: 100, activeWallets: 200000, defiTvl: 3.2e9 },
  base: { marketCap: 2e9, volume24h: 300e6, transactions24h: 1000000, gasFees: 0.001, tps: 100, activeWallets: 100000, defiTvl: 1.5e9 },
  // OPTIMISM - Layer 2 Ethereum Rollup
  optimism: { 
    marketCap: 2.8e9, 
    volume24h: 280e6, 
    transactions24h: 850000, 
    gasFees: 0.002, 
    tps: 100, 
    activeWallets: 180000, 
    defiTvl: 980e6,
    l2ToBridge: 2.1e9,
    sequencerUptime: 99.97,
    batchesPosted24h: 1440,
    l1DataCost: 0.0008,
  },
  // SUI - Move-based Layer 1
  sui: { 
    marketCap: 14e9, 
    volume24h: 850e6, 
    transactions24h: 12000000, 
    gasFees: 0.0001, 
    tps: 10000, 
    activeWallets: 650000, 
    defiTvl: 1.8e9,
    objectsCreated24h: 45000000,
    checkpoints24h: 86400,
    validatorCount: 106,
    stakingApr: 4.2,
  },
  // TON - Telegram Open Network
  ton: { 
    marketCap: 15e9, 
    volume24h: 320e6, 
    transactions24h: 8000000, 
    gasFees: 0.005, 
    tps: 100000, 
    activeWallets: 2500000, 
    defiTvl: 450e6,
    masterchainBlocks24h: 86400,
    shardchains: 256,
    validatorCount: 350,
    stakingApr: 5.8,
    telegramUsers: 900e6,
  },
};

// Chain-specific token sets with real ecosystem tokens
const tokenSets: Record<string, { symbol: string; name: string; coingeckoId?: string }[]> = {
  ethereum: [
    { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
    { symbol: "LINK", name: "Chainlink", coingeckoId: "chainlink" },
    { symbol: "UNI", name: "Uniswap", coingeckoId: "uniswap" },
    { symbol: "AAVE", name: "Aave", coingeckoId: "aave" },
    { symbol: "LDO", name: "Lido DAO", coingeckoId: "lido-dao" },
    { symbol: "MKR", name: "Maker", coingeckoId: "maker" },
    { symbol: "CRV", name: "Curve", coingeckoId: "curve-dao-token" },
    { symbol: "COMP", name: "Compound", coingeckoId: "compound-governance-token" },
    { symbol: "ENS", name: "Ethereum Name Service", coingeckoId: "ethereum-name-service" },
    { symbol: "SNX", name: "Synthetix", coingeckoId: "synthetix-network-token" },
    { symbol: "RPL", name: "Rocket Pool", coingeckoId: "rocket-pool" },
    { symbol: "DYDX", name: "dYdX", coingeckoId: "dydx" },
  ],
  solana: [
    { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
    { symbol: "RAY", name: "Raydium", coingeckoId: "raydium" },
    { symbol: "ORCA", name: "Orca", coingeckoId: "orca" },
    { symbol: "JTO", name: "Jito", coingeckoId: "jito-governance-token" },
    { symbol: "PYTH", name: "Pyth Network", coingeckoId: "pyth-network" },
    { symbol: "JUP", name: "Jupiter", coingeckoId: "jupiter-exchange-solana" },
    { symbol: "BONK", name: "Bonk", coingeckoId: "bonk" },
    { symbol: "WIF", name: "dogwifhat", coingeckoId: "dogwifcoin" },
    { symbol: "RENDER", name: "Render", coingeckoId: "render-token" },
    { symbol: "HNT", name: "Helium", coingeckoId: "helium" },
  ],
  // OPTIMISM tokens
  optimism: [
    { symbol: "OP", name: "Optimism", coingeckoId: "optimism" },
    { symbol: "VELO", name: "Velodrome", coingeckoId: "velodrome-finance" },
    { symbol: "SNX", name: "Synthetix", coingeckoId: "synthetix-network-token" },
    { symbol: "PERP", name: "Perpetual Protocol", coingeckoId: "perpetual-protocol" },
    { symbol: "LYRA", name: "Lyra Finance", coingeckoId: "lyra-finance" },
    { symbol: "THALES", name: "Thales", coingeckoId: "thales" },
    { symbol: "KWENTA", name: "Kwenta", coingeckoId: "kwenta" },
    { symbol: "EXTRA", name: "Extra Finance", coingeckoId: "extra-finance" },
    { symbol: "SONNE", name: "Sonne Finance", coingeckoId: "sonne-finance" },
    { symbol: "BEEFY", name: "Beefy Finance", coingeckoId: "beefy-finance" },
  ],
  // SUI tokens
  sui: [
    { symbol: "SUI", name: "Sui", coingeckoId: "sui" },
    { symbol: "CETUS", name: "Cetus Protocol", coingeckoId: "cetus-protocol" },
    { symbol: "TURBOS", name: "Turbos Finance", coingeckoId: "turbos-finance" },
    { symbol: "NAVI", name: "NAVI Protocol", coingeckoId: "navi-protocol" },
    { symbol: "SCALLOP", name: "Scallop", coingeckoId: "scallop-2" },
    { symbol: "BUCK", name: "Bucket Protocol", coingeckoId: "bucket-protocol" },
    { symbol: "HASUI", name: "Haedal staked SUI", coingeckoId: "haedal-staked-sui" },
    { symbol: "DEEP", name: "DeepBook", coingeckoId: "deepbook" },
    { symbol: "BLUEFIN", name: "Bluefin", coingeckoId: "bluefin" },
    { symbol: "SUIA", name: "Suia", coingeckoId: "suia" },
  ],
  // TON tokens
  ton: [
    { symbol: "TON", name: "Toncoin", coingeckoId: "the-open-network" },
    { symbol: "NOT", name: "Notcoin", coingeckoId: "notcoin" },
    { symbol: "DOGS", name: "DOGS", coingeckoId: "dogs-2" },
    { symbol: "HMSTR", name: "Hamster Kombat", coingeckoId: "hamster-kombat" },
    { symbol: "CATI", name: "Catizen", coingeckoId: "catizen" },
    { symbol: "STON", name: "STON.fi", coingeckoId: "ston-fi" },
    { symbol: "JETTON", name: "Jetton", coingeckoId: "jetton" },
    { symbol: "GRAM", name: "Gram", coingeckoId: "gram-2" },
    { symbol: "SCALE", name: "Scale", coingeckoId: "scale-2" },
    { symbol: "BOLT", name: "Bolt", coingeckoId: "bolt-ton" },
  ],
  bnb: [
    { symbol: "BNB", name: "BNB", coingeckoId: "binancecoin" },
    { symbol: "CAKE", name: "PancakeSwap", coingeckoId: "pancakeswap-token" },
    { symbol: "XVS", name: "Venus", coingeckoId: "venus" },
    { symbol: "BAKE", name: "BakeryToken", coingeckoId: "bakerytoken" },
    { symbol: "TWT", name: "Trust Wallet Token", coingeckoId: "trust-wallet-token" },
    { symbol: "ALPACA", name: "Alpaca Finance", coingeckoId: "alpaca-finance" },
    { symbol: "DODO", name: "DODO", coingeckoId: "dodo" },
    { symbol: "VENUS", name: "Venus", coingeckoId: "venus" },
  ],
  avalanche: [
    { symbol: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2" },
    { symbol: "JOE", name: "Trader Joe", coingeckoId: "joe" },
    { symbol: "PNG", name: "Pangolin", coingeckoId: "pangolin" },
    { symbol: "QI", name: "BENQI", coingeckoId: "benqi" },
    { symbol: "SPELL", name: "Spell Token", coingeckoId: "spell-token" },
    { symbol: "GMX", name: "GMX", coingeckoId: "gmx" },
    { symbol: "YAK", name: "Yield Yak", coingeckoId: "yield-yak" },
    { symbol: "BENQI", name: "BENQI", coingeckoId: "benqi" },
  ],
  polygon: [
    { symbol: "POL", name: "Polygon", coingeckoId: "matic-network" },
    { symbol: "QUICK", name: "QuickSwap", coingeckoId: "quickswap" },
    { symbol: "GHST", name: "Aavegotchi", coingeckoId: "aavegotchi" },
    { symbol: "SUSHI", name: "SushiSwap", coingeckoId: "sushi" },
    { symbol: "AAVE", name: "Aave", coingeckoId: "aave" },
    { symbol: "DFYN", name: "DFYN", coingeckoId: "dfyn-network" },
    { symbol: "QI", name: "BENQI", coingeckoId: "benqi" },
  ],
  arbitrum: [
    { symbol: "ARB", name: "Arbitrum", coingeckoId: "arbitrum" },
    { symbol: "GMX", name: "GMX", coingeckoId: "gmx" },
    { symbol: "MAGIC", name: "Magic", coingeckoId: "magic" },
    { symbol: "RDNT", name: "Radiant", coingeckoId: "radiant-capital" },
    { symbol: "GNS", name: "Gains Network", coingeckoId: "gains-network" },
    { symbol: "PENDLE", name: "Pendle", coingeckoId: "pendle" },
    { symbol: "JONES", name: "Jones DAO", coingeckoId: "jones-dao" },
    { symbol: "DPX", name: "Dopex", coingeckoId: "dopex" },
  ],
  base: [
    { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
    { symbol: "AERO", name: "Aerodrome", coingeckoId: "aerodrome-finance" },
    { symbol: "BRETT", name: "Brett", coingeckoId: "brett" },
    { symbol: "DEGEN", name: "Degen", coingeckoId: "degen-base" },
    { symbol: "TOSHI", name: "Toshi", coingeckoId: "toshi" },
    { symbol: "HIGHER", name: "Higher", coingeckoId: "higher" },
    { symbol: "VIRTUAL", name: "Virtual Protocol", coingeckoId: "virtual-protocol" },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chainId } = await req.json();
    console.log("Chain data request for:", chainId);

    const baseOverview = chainOverviews[chainId] || chainOverviews.ethereum;
    const tokens = tokenSets[chainId] || tokenSets.ethereum;
    
    // Add some randomness to make it feel live
    const priceChange = (Math.random() - 0.5) * 10;

    // Generate chain-specific whale activity
    const whaleActivity = generateWhaleActivity(chainId, tokens);
    
    // Generate token heat data
    const tokenHeat = generateTokenHeat(chainId, tokens);
    
    // Generate smart money flow
    const smartMoneyFlow = generateSmartMoneyFlow(chainId, tokens);

    const response = {
      overview: {
        marketCap: baseOverview.marketCap * (1 + (Math.random() - 0.5) * 0.02),
        volume24h: baseOverview.volume24h * (1 + (Math.random() - 0.5) * 0.1),
        transactions24h: Math.floor(baseOverview.transactions24h * (1 + (Math.random() - 0.5) * 0.1)),
        gasFees: baseOverview.gasFees * (1 + (Math.random() - 0.5) * 0.3),
        tps: Math.floor(baseOverview.tps * (1 + (Math.random() - 0.5) * 0.2)),
        activeWallets: Math.floor(baseOverview.activeWallets * (1 + (Math.random() - 0.5) * 0.1)),
        defiTvl: baseOverview.defiTvl * (1 + (Math.random() - 0.5) * 0.05),
        priceChange24h: priceChange,
        // Chain-specific metrics
        ...(chainId === "optimism" && {
          l2ToBridge: baseOverview.l2ToBridge,
          sequencerUptime: baseOverview.sequencerUptime,
          batchesPosted24h: baseOverview.batchesPosted24h,
          l1DataCost: baseOverview.l1DataCost,
        }),
        ...(chainId === "sui" && {
          objectsCreated24h: baseOverview.objectsCreated24h,
          checkpoints24h: baseOverview.checkpoints24h,
          validatorCount: baseOverview.validatorCount,
          stakingApr: baseOverview.stakingApr,
        }),
        ...(chainId === "ton" && {
          masterchainBlocks24h: baseOverview.masterchainBlocks24h,
          shardchains: baseOverview.shardchains,
          validatorCount: baseOverview.validatorCount,
          stakingApr: baseOverview.stakingApr,
          telegramUsers: baseOverview.telegramUsers,
        }),
      },
      whaleActivity,
      tokenHeat,
      smartMoneyFlow,
      chainSpecificData: getChainSpecificData(chainId),
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateWhaleActivity(chainId: string, tokens: { symbol: string; name: string }[]) {
  const explorerUrls: Record<string, string> = {
    ethereum: "https://etherscan.io",
    solana: "https://solscan.io",
    optimism: "https://optimistic.etherscan.io",
    sui: "https://suiscan.xyz",
    ton: "https://tonscan.org",
    bnb: "https://bscscan.com",
    arbitrum: "https://arbiscan.io",
    base: "https://basescan.org",
    avalanche: "https://snowtrace.io",
    polygon: "https://polygonscan.com",
  };

  const explorerUrl = explorerUrls[chainId] || explorerUrls.ethereum;

  return Array.from({ length: 30 }, (_, i) => {
    const token = tokens[Math.floor(Math.random() * Math.min(tokens.length, 8))];
    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    const wallet = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    
    return {
      type: ["buy", "sell", "transfer"][Math.floor(Math.random() * 3)],
      amount: Math.random() * 10000,
      token: token.symbol,
      tokenName: token.name,
      timestamp: Date.now() - Math.random() * 3600000,
      value: Math.random() * 5000000,
      wallet,
      txHash,
      explorerUrl: `${explorerUrl}/tx/${txHash}`,
      walletExplorerUrl: `${explorerUrl}/address/${wallet}`,
    };
  });
}

function generateTokenHeat(chainId: string, tokens: { symbol: string; name: string }[]) {
  return tokens.slice(0, 16).map((token, i) => ({
    symbol: token.symbol,
    name: token.name,
    momentum: Math.random() * 100,
    volumeSpike: Math.random() * 100,
    volatility: Math.random() * 100,
    socialScore: Math.random() * 100,
    liquidityChange: (Math.random() - 0.5) * 40,
    price: Math.random() * (i === 0 ? 3000 : 100),
    change24h: (Math.random() - 0.5) * 30,
    chainId,
  }));
}

function generateSmartMoneyFlow(chainId: string, tokens: { symbol: string; name: string }[]) {
  return {
    inflow: Math.random() * 100e6,
    outflow: Math.random() * 80e6,
    netFlow: (Math.random() - 0.3) * 30e6,
    topSwaps: Array.from({ length: 5 }, () => ({
      from: tokens[Math.floor(Math.random() * 3)].symbol,
      to: tokens[Math.floor(Math.random() * 5) + 3]?.symbol || tokens[0].symbol,
      amount: Math.random() * 1e6,
    })),
    liquidityAdded: Math.random() * 50e6,
    liquidityRemoved: Math.random() * 30e6,
    chainId,
  };
}

function getChainSpecificData(chainId: string) {
  const chainData: Record<string, any> = {
    optimism: {
      type: "layer2",
      rollupType: "Optimistic Rollup",
      parentChain: "Ethereum",
      features: ["EVM Compatible", "Low Fees", "Fast Finality", "Superchain"],
      governance: "OP Collective",
      bridges: [
        { name: "Optimism Bridge", url: "https://app.optimism.io/bridge" },
        { name: "Hop Protocol", url: "https://hop.exchange" },
        { name: "Stargate", url: "https://stargate.finance" },
      ],
      dexes: [
        { name: "Velodrome", url: "https://velodrome.finance", volume24h: 85e6 },
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 42e6 },
        { name: "Sushiswap", url: "https://sushi.com", volume24h: 12e6 },
      ],
      defiProtocols: [
        { name: "Aave", tvl: 180e6, category: "Lending" },
        { name: "Synthetix", tvl: 350e6, category: "Derivatives" },
        { name: "Velodrome", tvl: 280e6, category: "DEX" },
        { name: "Sonne Finance", tvl: 45e6, category: "Lending" },
      ],
      recentUpgrades: [
        { name: "Bedrock", date: "2023-06-06", description: "Major upgrade improving performance" },
        { name: "Ecotone", date: "2024-03-14", description: "EIP-4844 blob support" },
      ],
    },
    sui: {
      type: "layer1",
      consensus: "Narwhal & Bullshark",
      language: "Move",
      features: ["Object-Centric Model", "Parallel Execution", "zkLogin", "Sponsored Transactions"],
      governance: "Sui Foundation",
      bridges: [
        { name: "Wormhole", url: "https://wormhole.com" },
        { name: "LayerZero", url: "https://layerzero.network" },
      ],
      dexes: [
        { name: "Cetus", url: "https://app.cetus.zone", volume24h: 120e6 },
        { name: "Turbos", url: "https://app.turbos.finance", volume24h: 45e6 },
        { name: "DeepBook", url: "https://deepbook.tech", volume24h: 85e6 },
      ],
      defiProtocols: [
        { name: "NAVI Protocol", tvl: 450e6, category: "Lending" },
        { name: "Scallop", tvl: 320e6, category: "Lending" },
        { name: "Cetus", tvl: 280e6, category: "DEX" },
        { name: "Bucket Protocol", tvl: 120e6, category: "Stablecoin" },
      ],
      uniqueMetrics: {
        objectsTotal: 2.5e9,
        movePackages: 45000,
        ptbExecutions24h: 8000000,
      },
    },
    ton: {
      type: "layer1",
      consensus: "Proof of Stake",
      language: "FunC/Tact",
      features: ["Infinite Sharding", "Telegram Integration", "TON DNS", "TON Storage"],
      governance: "TON Foundation",
      bridges: [
        { name: "TON Bridge", url: "https://bridge.ton.org" },
        { name: "Orbit Bridge", url: "https://bridge.orbitchain.io" },
      ],
      dexes: [
        { name: "STON.fi", url: "https://app.ston.fi", volume24h: 45e6 },
        { name: "DeDust", url: "https://dedust.io", volume24h: 32e6 },
        { name: "Megaton Finance", url: "https://megaton.fi", volume24h: 8e6 },
      ],
      defiProtocols: [
        { name: "STON.fi", tvl: 180e6, category: "DEX" },
        { name: "DeDust", tvl: 120e6, category: "DEX" },
        { name: "Evaa Protocol", tvl: 45e6, category: "Lending" },
        { name: "Storm Trade", tvl: 25e6, category: "Derivatives" },
      ],
      telegramApps: [
        { name: "Notcoin", users: 35e6, category: "Gaming" },
        { name: "Hamster Kombat", users: 300e6, category: "Gaming" },
        { name: "Catizen", users: 20e6, category: "Gaming" },
        { name: "TON Space", users: 10e6, category: "Wallet" },
      ],
      uniqueMetrics: {
        telegramMiniApps: 1200,
        activeWallets7d: 8000000,
        jettonTypes: 15000,
      },
    },
    // AVALANCHE - C-Chain Layer 1
    avalanche: {
      type: "layer1",
      consensus: "Avalanche Consensus",
      language: "Solidity (EVM)",
      features: ["Subnets", "Sub-second Finality", "EVM Compatible", "Low Fees"],
      governance: "Avalanche Foundation",
      bridges: [
        { name: "Avalanche Bridge", url: "https://bridge.avax.network" },
        { name: "LayerZero", url: "https://layerzero.network" },
        { name: "Stargate", url: "https://stargate.finance" },
      ],
      dexes: [
        { name: "Trader Joe", url: "https://traderjoexyz.com", volume24h: 85e6 },
        { name: "Pangolin", url: "https://pangolin.exchange", volume24h: 25e6 },
        { name: "GMX", url: "https://gmx.io", volume24h: 120e6 },
      ],
      defiProtocols: [
        { name: "Aave", tvl: 450e6, category: "Lending" },
        { name: "BENQI", tvl: 280e6, category: "Lending" },
        { name: "GMX", tvl: 380e6, category: "Perpetuals" },
        { name: "Trader Joe", tvl: 180e6, category: "DEX" },
        { name: "Yield Yak", tvl: 45e6, category: "Yield Aggregator" },
      ],
      subnets: [
        { name: "DFK Chain", description: "DeFi Kingdoms gaming subnet", tvl: 25e6 },
        { name: "Swimmer Network", description: "Crabada gaming subnet", tvl: 5e6 },
        { name: "MELD", description: "Banking subnet", tvl: 15e6 },
      ],
      uniqueMetrics: {
        activeSubnets: 45,
        validatorCount: 1200,
        stakingApr: 8.2,
        c_chainTps: 4500,
      },
      ecosystemTokens: [
        { symbol: "AVAX", name: "Avalanche", address: "Native", category: "Native" },
        { symbol: "JOE", name: "Trader Joe", address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", category: "DEX" },
        { symbol: "PNG", name: "Pangolin", address: "0x60781C2586D68229fde47564546784ab3fACA982", category: "DEX" },
        { symbol: "QI", name: "BENQI", address: "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5", category: "Lending" },
        { symbol: "GMX", name: "GMX", address: "0x62edc0692BD897D2295872a9FFCac5425011c661", category: "Perpetuals" },
        { symbol: "STG", name: "Stargate", address: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590", category: "Bridge" },
      ],
    },
    // POLYGON - PoS Sidechain
    polygon: {
      type: "sidechain",
      consensus: "Proof of Stake",
      language: "Solidity (EVM)",
      features: ["EVM Compatible", "Low Fees", "Fast Transactions", "zkEVM"],
      governance: "Polygon Labs",
      bridges: [
        { name: "Polygon Bridge", url: "https://portal.polygon.technology/bridge" },
        { name: "Hop Protocol", url: "https://hop.exchange" },
        { name: "Multichain", url: "https://multichain.org" },
      ],
      dexes: [
        { name: "QuickSwap", url: "https://quickswap.exchange", volume24h: 45e6 },
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 85e6 },
        { name: "SushiSwap", url: "https://sushi.com", volume24h: 25e6 },
      ],
      defiProtocols: [
        { name: "Aave", tvl: 850e6, category: "Lending" },
        { name: "QuickSwap", tvl: 180e6, category: "DEX" },
        { name: "Balancer", tvl: 120e6, category: "DEX" },
        { name: "Curve", tvl: 95e6, category: "Stableswap" },
        { name: "Beefy Finance", tvl: 45e6, category: "Yield Aggregator" },
      ],
      zkSolutions: [
        { name: "Polygon zkEVM", status: "Mainnet", tps: 2000 },
        { name: "Polygon Miden", status: "Development", tps: 5000 },
        { name: "Polygon ID", status: "Live", description: "Decentralized Identity" },
      ],
      uniqueMetrics: {
        validatorCount: 100,
        stakingApr: 5.5,
        checkpointsDaily: 96,
        avgBlockTime: 2.1,
      },
      ecosystemTokens: [
        { symbol: "POL", name: "Polygon", address: "0x0000000000000000000000000000000000001010", category: "Native" },
        { symbol: "QUICK", name: "QuickSwap", address: "0xB5C064F955D8e7F38fE0460C556a72987494eE17", category: "DEX" },
        { symbol: "GHST", name: "Aavegotchi", address: "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7", category: "Gaming" },
        { symbol: "SUSHI", name: "SushiSwap", address: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a", category: "DEX" },
        { symbol: "AAVE", name: "Aave", address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", category: "Lending" },
        { symbol: "BAL", name: "Balancer", address: "0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3", category: "DEX" },
      ],
    },
    // ARBITRUM - Optimistic L2
    arbitrum: {
      type: "layer2",
      rollupType: "Optimistic Rollup",
      parentChain: "Ethereum",
      language: "Solidity (EVM)",
      features: ["EVM Compatible", "Low Fees", "High Throughput", "Nitro Stack"],
      governance: "Arbitrum DAO",
      bridges: [
        { name: "Arbitrum Bridge", url: "https://bridge.arbitrum.io" },
        { name: "Hop Protocol", url: "https://hop.exchange" },
        { name: "Stargate", url: "https://stargate.finance" },
      ],
      dexes: [
        { name: "GMX", url: "https://gmx.io", volume24h: 250e6 },
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 180e6 },
        { name: "Camelot", url: "https://camelot.exchange", volume24h: 45e6 },
        { name: "SushiSwap", url: "https://sushi.com", volume24h: 35e6 },
      ],
      defiProtocols: [
        { name: "GMX", tvl: 580e6, category: "Perpetuals" },
        { name: "Aave", tvl: 420e6, category: "Lending" },
        { name: "Radiant Capital", tvl: 180e6, category: "Lending" },
        { name: "Pendle", tvl: 350e6, category: "Yield" },
        { name: "Camelot", tvl: 120e6, category: "DEX" },
        { name: "Jones DAO", tvl: 45e6, category: "Options" },
      ],
      orbitChains: [
        { name: "Xai", description: "Gaming-focused L3", status: "Live" },
        { name: "Nova", description: "Gaming & social", status: "Live" },
        { name: "Degen Chain", description: "Degen community L3", status: "Live" },
      ],
      uniqueMetrics: {
        sequencerUptime: 99.98,
        batchesPosted24h: 2880,
        l1DataCost: 0.0005,
        avgTxCost: 0.12,
      },
      ecosystemTokens: [
        { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", category: "Governance" },
        { symbol: "GMX", name: "GMX", address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", category: "Perpetuals" },
        { symbol: "MAGIC", name: "Magic", address: "0x539bdE0d7Dbd336b79148AA742883198BBF60342", category: "Gaming" },
        { symbol: "RDNT", name: "Radiant", address: "0x3082CC23568eA640225c2467653dB90e9250AaA0", category: "Lending" },
        { symbol: "PENDLE", name: "Pendle", address: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8", category: "Yield" },
        { symbol: "GNS", name: "Gains Network", address: "0x18c11FD286C5EC11c3b683Caa813B77f5163A122", category: "Trading" },
        { symbol: "GRAIL", name: "Camelot", address: "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8", category: "DEX" },
      ],
    },
  };

  return chainData[chainId] || null;
}
