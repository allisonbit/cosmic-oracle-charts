import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory cache
let cache: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 60_000; // 60s

// Chain-specific base data
const chainOverviews: Record<string, any> = {
  ethereum: { marketCap: 440e9, volume24h: 18e9, transactions24h: 1200000, gasFees: 25, tps: 15, activeWallets: 450000, defiTvl: 48e9 },
  solana: { marketCap: 105e9, volume24h: 4.5e9, transactions24h: 45000000, gasFees: 0.00025, tps: 4000, activeWallets: 800000, defiTvl: 8e9 },
  bnb: { marketCap: 100e9, volume24h: 2e9, transactions24h: 5000000, gasFees: 0.10, tps: 160, activeWallets: 2000000, defiTvl: 5e9 },
  avalanche: { marketCap: 21e9, volume24h: 800e6, transactions24h: 1500000, gasFees: 0.05, tps: 4500, activeWallets: 150000, defiTvl: 1.2e9 },
  polygon: { marketCap: 6e9, volume24h: 400e6, transactions24h: 3000000, gasFees: 0.01, tps: 7000, activeWallets: 350000, defiTvl: 900e6 },
  arbitrum: { marketCap: 4.6e9, volume24h: 450e6, transactions24h: 2000000, gasFees: 0.15, tps: 100, activeWallets: 200000, defiTvl: 3.2e9 },
  base: { marketCap: 2e9, volume24h: 300e6, transactions24h: 1000000, gasFees: 0.001, tps: 100, activeWallets: 100000, defiTvl: 1.5e9 },
  optimism: { marketCap: 2.8e9, volume24h: 280e6, transactions24h: 850000, gasFees: 0.002, tps: 100, activeWallets: 180000, defiTvl: 980e6 },
  sui: { marketCap: 14e9, volume24h: 850e6, transactions24h: 12000000, gasFees: 0.0001, tps: 10000, activeWallets: 650000, defiTvl: 1.8e9 },
  ton: { marketCap: 15e9, volume24h: 320e6, transactions24h: 8000000, gasFees: 0.005, tps: 100000, activeWallets: 2500000, defiTvl: 450e6 },
};

// CoinGecko IDs for each chain's ecosystem tokens
const tokenSets: Record<string, { symbol: string; name: string; coingeckoId: string }[]> = {
  ethereum: [
    { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
    { symbol: "LINK", name: "Chainlink", coingeckoId: "chainlink" },
    { symbol: "UNI", name: "Uniswap", coingeckoId: "uniswap" },
    { symbol: "AAVE", name: "Aave", coingeckoId: "aave" },
    { symbol: "LDO", name: "Lido DAO", coingeckoId: "lido-dao" },
    { symbol: "MKR", name: "Maker", coingeckoId: "maker" },
    { symbol: "CRV", name: "Curve", coingeckoId: "curve-dao-token" },
    { symbol: "ENS", name: "ENS", coingeckoId: "ethereum-name-service" },
    { symbol: "SNX", name: "Synthetix", coingeckoId: "synthetix-network-token" },
    { symbol: "RPL", name: "Rocket Pool", coingeckoId: "rocket-pool" },
  ],
  solana: [
    { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
    { symbol: "RAY", name: "Raydium", coingeckoId: "raydium" },
    { symbol: "JTO", name: "Jito", coingeckoId: "jito-governance-token" },
    { symbol: "PYTH", name: "Pyth Network", coingeckoId: "pyth-network" },
    { symbol: "JUP", name: "Jupiter", coingeckoId: "jupiter-exchange-solana" },
    { symbol: "BONK", name: "Bonk", coingeckoId: "bonk" },
    { symbol: "WIF", name: "dogwifhat", coingeckoId: "dogwifcoin" },
    { symbol: "RENDER", name: "Render", coingeckoId: "render-token" },
    { symbol: "HNT", name: "Helium", coingeckoId: "helium" },
    { symbol: "ORCA", name: "Orca", coingeckoId: "orca" },
  ],
  bnb: [
    { symbol: "BNB", name: "BNB", coingeckoId: "binancecoin" },
    { symbol: "CAKE", name: "PancakeSwap", coingeckoId: "pancakeswap-token" },
    { symbol: "XVS", name: "Venus", coingeckoId: "venus" },
    { symbol: "TWT", name: "Trust Wallet", coingeckoId: "trust-wallet-token" },
    { symbol: "ALPACA", name: "Alpaca Finance", coingeckoId: "alpaca-finance" },
    { symbol: "DODO", name: "DODO", coingeckoId: "dodo" },
    { symbol: "BAKE", name: "BakeryToken", coingeckoId: "bakerytoken" },
  ],
  avalanche: [
    { symbol: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2" },
    { symbol: "JOE", name: "Trader Joe", coingeckoId: "joe" },
    { symbol: "GMX", name: "GMX", coingeckoId: "gmx" },
    { symbol: "QI", name: "BENQI", coingeckoId: "benqi" },
    { symbol: "PNG", name: "Pangolin", coingeckoId: "pangolin" },
    { symbol: "YAK", name: "Yield Yak", coingeckoId: "yield-yak" },
  ],
  polygon: [
    { symbol: "POL", name: "Polygon", coingeckoId: "matic-network" },
    { symbol: "QUICK", name: "QuickSwap", coingeckoId: "quickswap" },
    { symbol: "GHST", name: "Aavegotchi", coingeckoId: "aavegotchi" },
    { symbol: "SUSHI", name: "SushiSwap", coingeckoId: "sushi" },
    { symbol: "AAVE", name: "Aave", coingeckoId: "aave" },
  ],
  arbitrum: [
    { symbol: "ARB", name: "Arbitrum", coingeckoId: "arbitrum" },
    { symbol: "GMX", name: "GMX", coingeckoId: "gmx" },
    { symbol: "MAGIC", name: "Magic", coingeckoId: "magic" },
    { symbol: "RDNT", name: "Radiant", coingeckoId: "radiant-capital" },
    { symbol: "PENDLE", name: "Pendle", coingeckoId: "pendle" },
    { symbol: "GNS", name: "Gains Network", coingeckoId: "gains-network" },
  ],
  base: [
    { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
    { symbol: "AERO", name: "Aerodrome", coingeckoId: "aerodrome-finance" },
    { symbol: "VIRTUAL", name: "Virtual Protocol", coingeckoId: "virtual-protocol" },
    { symbol: "BRETT", name: "Brett", coingeckoId: "brett" },
    { symbol: "DEGEN", name: "Degen", coingeckoId: "degen-base" },
  ],
  optimism: [
    { symbol: "OP", name: "Optimism", coingeckoId: "optimism" },
    { symbol: "VELO", name: "Velodrome", coingeckoId: "velodrome-finance" },
    { symbol: "SNX", name: "Synthetix", coingeckoId: "synthetix-network-token" },
    { symbol: "PERP", name: "Perpetual", coingeckoId: "perpetual-protocol" },
    { symbol: "THALES", name: "Thales", coingeckoId: "thales" },
  ],
  sui: [
    { symbol: "SUI", name: "Sui", coingeckoId: "sui" },
    { symbol: "CETUS", name: "Cetus", coingeckoId: "cetus-protocol" },
    { symbol: "NAVI", name: "NAVI Protocol", coingeckoId: "navi-protocol" },
    { symbol: "TURBOS", name: "Turbos", coingeckoId: "turbos-finance" },
    { symbol: "DEEP", name: "DeepBook", coingeckoId: "deepbook" },
  ],
  ton: [
    { symbol: "TON", name: "Toncoin", coingeckoId: "the-open-network" },
    { symbol: "NOT", name: "Notcoin", coingeckoId: "notcoin" },
    { symbol: "DOGS", name: "DOGS", coingeckoId: "dogs-2" },
    { symbol: "HMSTR", name: "Hamster Kombat", coingeckoId: "hamster-kombat" },
    { symbol: "CATI", name: "Catizen", coingeckoId: "catizen" },
  ],
};

// Fetch real prices from CoinGecko
async function fetchTokenPrices(tokens: { symbol: string; name: string; coingeckoId: string }[]): Promise<Record<string, { price: number; change24h: number; volume: number; marketCap: number }>> {
  const ids = tokens.map(t => t.coingeckoId).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, { price: number; change24h: number; volume: number; marketCap: number }> = {};
    for (const t of tokens) {
      const d = data[t.coingeckoId];
      if (d) {
        result[t.symbol] = {
          price: d.usd || 0,
          change24h: d.usd_24h_change || 0,
          volume: d.usd_24h_vol || 0,
          marketCap: d.usd_market_cap || 0,
        };
      }
    }
    return result;
  } catch (e) {
    console.error("CoinGecko fetch error:", e);
    return {};
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chainId } = await req.json();
    console.log("Chain data request for:", chainId);

    // Check cache
    const cached = cache[chainId];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseOverview = chainOverviews[chainId] || chainOverviews.ethereum;
    const tokens = tokenSets[chainId] || tokenSets.ethereum;

    // Fetch real prices from CoinGecko
    const realPrices = await fetchTokenPrices(tokens);
    const hasRealPrices = Object.keys(realPrices).length > 0;

    // Update overview with real native token data
    const nativeSymbol = tokens[0]?.symbol;
    const nativePrice = realPrices[nativeSymbol];
    const overview = {
      marketCap: nativePrice?.marketCap || baseOverview.marketCap,
      volume24h: nativePrice?.volume || baseOverview.volume24h,
      transactions24h: Math.floor(baseOverview.transactions24h * (1 + (Math.random() - 0.5) * 0.05)),
      gasFees: baseOverview.gasFees,
      tps: baseOverview.tps,
      activeWallets: Math.floor(baseOverview.activeWallets * (1 + (Math.random() - 0.5) * 0.05)),
      defiTvl: baseOverview.defiTvl,
      priceChange24h: nativePrice?.change24h || 0,
      nativePrice: nativePrice?.price || 0,
    };

    // Generate token heat with REAL prices
    const tokenHeat = tokens.map((token, i) => {
      const rp = realPrices[token.symbol];
      return {
        symbol: token.symbol,
        name: token.name,
        momentum: Math.random() * 100,
        volumeSpike: Math.random() * 100,
        volatility: Math.random() * 100,
        socialScore: Math.random() * 100,
        liquidityChange: (Math.random() - 0.5) * 40,
        price: rp?.price ?? Math.random() * (i === 0 ? 3000 : 100),
        change24h: rp?.change24h ?? (Math.random() - 0.5) * 20,
        volume24h: rp?.volume ?? 0,
        marketCap: rp?.marketCap ?? 0,
        chainId,
      };
    });

    // Generate whale activity
    const explorerUrls: Record<string, string> = {
      ethereum: "https://etherscan.io", solana: "https://solscan.io",
      optimism: "https://optimistic.etherscan.io", sui: "https://suiscan.xyz",
      ton: "https://tonscan.org", bnb: "https://bscscan.com",
      arbitrum: "https://arbiscan.io", base: "https://basescan.org",
      avalanche: "https://snowtrace.io", polygon: "https://polygonscan.com",
    };
    const explorerUrl = explorerUrls[chainId] || explorerUrls.ethereum;

    const whaleActivity = Array.from({ length: 25 }, () => {
      const token = tokens[Math.floor(Math.random() * Math.min(tokens.length, 6))];
      const rp = realPrices[token.symbol];
      const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      const wallet = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
      const amount = Math.random() * 10000;
      return {
        type: ["buy", "sell", "transfer"][Math.floor(Math.random() * 3)],
        amount,
        token: token.symbol,
        tokenName: token.name,
        timestamp: Date.now() - Math.random() * 3600000,
        value: rp ? amount * rp.price : Math.random() * 5000000,
        wallet,
        txHash,
        explorerUrl: `${explorerUrl}/tx/${txHash}`,
        walletExplorerUrl: `${explorerUrl}/address/${wallet}`,
      };
    });

    // Smart money flow
    const smartMoneyFlow = {
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

    const response = {
      overview,
      whaleActivity,
      tokenHeat,
      smartMoneyFlow,
      chainSpecificData: getChainSpecificData(chainId),
      realPrices: hasRealPrices,
      timestamp: Date.now(),
    };

    // Cache result
    cache[chainId] = { data: response, ts: Date.now() };

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

function getChainSpecificData(chainId: string) {
  const chainData: Record<string, any> = {
    ethereum: {
      type: "layer1", consensus: "Proof of Stake", language: "Solidity",
      features: ["EVM", "Smart Contracts", "DeFi Hub", "NFT Standard"],
      governance: "Ethereum Foundation",
      bridges: [
        { name: "Arbitrum Bridge", url: "https://bridge.arbitrum.io" },
        { name: "Optimism Bridge", url: "https://app.optimism.io/bridge" },
        { name: "Polygon Bridge", url: "https://portal.polygon.technology" },
      ],
      dexes: [
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 1.2e9 },
        { name: "Curve", url: "https://curve.fi", volume24h: 450e6 },
        { name: "1inch", url: "https://app.1inch.io", volume24h: 320e6 },
      ],
      defiProtocols: [
        { name: "Lido", tvl: 25e9, category: "Liquid Staking" },
        { name: "Aave", tvl: 12e9, category: "Lending" },
        { name: "MakerDAO", tvl: 8e9, category: "CDP" },
        { name: "EigenLayer", tvl: 15e9, category: "Restaking" },
        { name: "Uniswap", tvl: 6e9, category: "DEX" },
      ],
      uniqueMetrics: { validatorCount: 1000000, stakingApr: 3.8, gasUsedDaily: 110e9, ethBurned24h: 2500 },
      ecosystemTokens: [
        { symbol: "ETH", name: "Ethereum", address: "Native", category: "Native" },
        { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", category: "Oracle" },
        { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", category: "DEX" },
        { symbol: "AAVE", name: "Aave", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", category: "Lending" },
        { symbol: "LDO", name: "Lido DAO", address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", category: "Staking" },
        { symbol: "MKR", name: "Maker", address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", category: "CDP" },
        { symbol: "CRV", name: "Curve DAO", address: "0xD533a949740bb3306d119CC777fa900bA034cd52", category: "DEX" },
        { symbol: "ENS", name: "ENS", address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", category: "Identity" },
      ],
    },
    solana: {
      type: "layer1", consensus: "Proof of History + Proof of Stake", language: "Rust",
      features: ["Parallel Execution", "400ms Block Time", "Low Fees", "High TPS"],
      governance: "Solana Foundation",
      bridges: [
        { name: "Wormhole", url: "https://wormhole.com" },
        { name: "Portal Bridge", url: "https://portalbridge.com" },
      ],
      dexes: [
        { name: "Jupiter", url: "https://jup.ag", volume24h: 1.8e9 },
        { name: "Raydium", url: "https://raydium.io", volume24h: 450e6 },
        { name: "Orca", url: "https://orca.so", volume24h: 180e6 },
      ],
      defiProtocols: [
        { name: "Jito", tvl: 2e9, category: "MEV/Staking" },
        { name: "Marinade", tvl: 1.5e9, category: "Liquid Staking" },
        { name: "Kamino", tvl: 1.2e9, category: "Yield" },
        { name: "Jupiter", tvl: 800e6, category: "DEX Aggregator" },
      ],
      uniqueMetrics: { validatorCount: 1850, stakingApr: 7.2, tpsAverage: 3500, slotTime: 400 },
      ecosystemTokens: [
        { symbol: "SOL", name: "Solana", address: "Native", category: "Native" },
        { symbol: "JUP", name: "Jupiter", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", category: "DEX" },
        { symbol: "JTO", name: "Jito", address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", category: "MEV" },
        { symbol: "RAY", name: "Raydium", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", category: "DEX" },
        { symbol: "PYTH", name: "Pyth", address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", category: "Oracle" },
        { symbol: "BONK", name: "Bonk", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", category: "Meme" },
        { symbol: "WIF", name: "dogwifhat", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", category: "Meme" },
      ],
    },
    bnb: {
      type: "layer1", consensus: "Proof of Staked Authority", language: "Solidity (EVM)",
      features: ["EVM Compatible", "Fast Finality", "Low Fees", "BEP-20"],
      governance: "Binance",
      bridges: [{ name: "BNB Bridge", url: "https://www.bnbchain.org/bridge" }],
      dexes: [
        { name: "PancakeSwap", url: "https://pancakeswap.finance", volume24h: 350e6 },
        { name: "DODO", url: "https://dodo.io", volume24h: 28e6 },
      ],
      defiProtocols: [
        { name: "PancakeSwap", tvl: 1.8e9, category: "DEX" },
        { name: "Venus", tvl: 1.2e9, category: "Lending" },
      ],
      uniqueMetrics: { validatorCount: 29, stakingApr: 2.8, blockTime: 3, dailyTransactions: 4500000 },
      ecosystemTokens: [
        { symbol: "BNB", name: "BNB", address: "Native", category: "Native" },
        { symbol: "CAKE", name: "PancakeSwap", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", category: "DEX" },
        { symbol: "XVS", name: "Venus", address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63", category: "Lending" },
        { symbol: "TWT", name: "Trust Wallet", address: "0x4B0F1812e5Df2A09796481Ff14017e6005508003", category: "Wallet" },
      ],
    },
    avalanche: {
      type: "layer1", consensus: "Avalanche Consensus", language: "Solidity (EVM)",
      features: ["Subnets", "Sub-second Finality", "EVM Compatible"],
      governance: "Avalanche Foundation",
      bridges: [{ name: "Avalanche Bridge", url: "https://bridge.avax.network" }],
      dexes: [
        { name: "Trader Joe", url: "https://traderjoexyz.com", volume24h: 85e6 },
        { name: "GMX", url: "https://gmx.io", volume24h: 120e6 },
      ],
      defiProtocols: [
        { name: "Aave", tvl: 450e6, category: "Lending" },
        { name: "BENQI", tvl: 280e6, category: "Lending" },
        { name: "GMX", tvl: 380e6, category: "Perpetuals" },
      ],
      subnets: [
        { name: "DFK Chain", description: "DeFi Kingdoms gaming subnet", tvl: 25e6 },
        { name: "MELD", description: "Banking subnet", tvl: 15e6 },
      ],
      uniqueMetrics: { activeSubnets: 45, validatorCount: 1200, stakingApr: 8.2, c_chainTps: 4500 },
      ecosystemTokens: [
        { symbol: "AVAX", name: "Avalanche", address: "Native", category: "Native" },
        { symbol: "JOE", name: "Trader Joe", address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", category: "DEX" },
        { symbol: "GMX", name: "GMX", address: "0x62edc0692BD897D2295872a9FFCac5425011c661", category: "Perpetuals" },
        { symbol: "QI", name: "BENQI", address: "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5", category: "Lending" },
      ],
    },
    polygon: {
      type: "sidechain", consensus: "Proof of Stake", language: "Solidity (EVM)",
      features: ["EVM Compatible", "Low Fees", "Fast Transactions", "zkEVM"],
      governance: "Polygon Labs",
      bridges: [{ name: "Polygon Bridge", url: "https://portal.polygon.technology/bridge" }],
      dexes: [
        { name: "QuickSwap", url: "https://quickswap.exchange", volume24h: 45e6 },
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 85e6 },
      ],
      defiProtocols: [
        { name: "Aave", tvl: 850e6, category: "Lending" },
        { name: "QuickSwap", tvl: 180e6, category: "DEX" },
      ],
      zkSolutions: [
        { name: "Polygon zkEVM", status: "Mainnet", tps: 2000 },
        { name: "Polygon Miden", status: "Development", tps: 5000 },
      ],
      uniqueMetrics: { validatorCount: 100, stakingApr: 5.5, checkpointsDaily: 96, avgBlockTime: 2.1 },
      ecosystemTokens: [
        { symbol: "POL", name: "Polygon", address: "0x0000000000000000000000000000000000001010", category: "Native" },
        { symbol: "QUICK", name: "QuickSwap", address: "0xB5C064F955D8e7F38fE0460C556a72987494eE17", category: "DEX" },
        { symbol: "AAVE", name: "Aave", address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", category: "Lending" },
      ],
    },
    arbitrum: {
      type: "layer2", rollupType: "Optimistic Rollup", parentChain: "Ethereum", language: "Solidity (EVM)",
      features: ["EVM Compatible", "Low Fees", "High Throughput", "Nitro Stack"],
      governance: "Arbitrum DAO",
      bridges: [{ name: "Arbitrum Bridge", url: "https://bridge.arbitrum.io" }],
      dexes: [
        { name: "GMX", url: "https://gmx.io", volume24h: 250e6 },
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 180e6 },
        { name: "Camelot", url: "https://camelot.exchange", volume24h: 45e6 },
      ],
      defiProtocols: [
        { name: "GMX", tvl: 580e6, category: "Perpetuals" },
        { name: "Aave", tvl: 420e6, category: "Lending" },
        { name: "Pendle", tvl: 350e6, category: "Yield" },
      ],
      orbitChains: [
        { name: "Xai", description: "Gaming-focused L3", status: "Live" },
        { name: "Nova", description: "Gaming & social", status: "Live" },
      ],
      uniqueMetrics: { sequencerUptime: 99.98, batchesPosted24h: 2880, l1DataCost: 0.0005, avgTxCost: 0.12 },
      ecosystemTokens: [
        { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", category: "Governance" },
        { symbol: "GMX", name: "GMX", address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", category: "Perpetuals" },
        { symbol: "PENDLE", name: "Pendle", address: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8", category: "Yield" },
        { symbol: "MAGIC", name: "Magic", address: "0x539bdE0d7Dbd336b79148AA742883198BBF60342", category: "Gaming" },
      ],
    },
    base: {
      type: "layer2", rollupType: "Optimistic Rollup", parentChain: "Ethereum", language: "Solidity (EVM)",
      features: ["EVM Compatible", "Low Fees", "Coinbase Ecosystem", "OP Stack"],
      governance: "Coinbase",
      bridges: [{ name: "Base Bridge", url: "https://bridge.base.org" }],
      dexes: [
        { name: "Aerodrome", url: "https://aerodrome.finance", volume24h: 180e6 },
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 120e6 },
      ],
      defiProtocols: [
        { name: "Aerodrome", tvl: 850e6, category: "DEX" },
        { name: "Aave", tvl: 280e6, category: "Lending" },
      ],
      uniqueMetrics: { sequencerUptime: 99.99, batchesPosted24h: 1440, l1DataCost: 0.0003, avgTxCost: 0.02 },
      ecosystemTokens: [
        { symbol: "ETH", name: "Ethereum", address: "Native", category: "Native" },
        { symbol: "AERO", name: "Aerodrome", address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", category: "DEX" },
        { symbol: "VIRTUAL", name: "Virtual Protocol", address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", category: "AI" },
        { symbol: "BRETT", name: "Brett", address: "0x532f27101965dd16442E59d40670FaF5eBB142E4", category: "Meme" },
      ],
    },
    optimism: {
      type: "layer2", rollupType: "Optimistic Rollup", parentChain: "Ethereum",
      features: ["EVM Compatible", "Low Fees", "Fast Finality", "Superchain"],
      governance: "OP Collective",
      bridges: [{ name: "Optimism Bridge", url: "https://app.optimism.io/bridge" }],
      dexes: [
        { name: "Velodrome", url: "https://velodrome.finance", volume24h: 85e6 },
        { name: "Uniswap", url: "https://app.uniswap.org", volume24h: 42e6 },
      ],
      defiProtocols: [
        { name: "Synthetix", tvl: 350e6, category: "Derivatives" },
        { name: "Velodrome", tvl: 280e6, category: "DEX" },
        { name: "Aave", tvl: 180e6, category: "Lending" },
      ],
      recentUpgrades: [
        { name: "Bedrock", date: "2023-06-06", description: "Major upgrade improving performance" },
        { name: "Ecotone", date: "2024-03-14", description: "EIP-4844 blob support" },
      ],
      ecosystemTokens: [
        { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", category: "Governance" },
        { symbol: "VELO", name: "Velodrome", address: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db", category: "DEX" },
        { symbol: "SNX", name: "Synthetix", address: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4", category: "Derivatives" },
      ],
    },
    sui: {
      type: "layer1", consensus: "Narwhal & Bullshark", language: "Move",
      features: ["Object-Centric Model", "Parallel Execution", "zkLogin", "Sponsored Transactions"],
      governance: "Sui Foundation",
      bridges: [{ name: "Wormhole", url: "https://wormhole.com" }],
      dexes: [
        { name: "Cetus", url: "https://app.cetus.zone", volume24h: 120e6 },
        { name: "DeepBook", url: "https://deepbook.tech", volume24h: 85e6 },
      ],
      defiProtocols: [
        { name: "NAVI Protocol", tvl: 450e6, category: "Lending" },
        { name: "Scallop", tvl: 320e6, category: "Lending" },
        { name: "Cetus", tvl: 280e6, category: "DEX" },
      ],
      uniqueMetrics: { objectsTotal: 2.5e9, movePackages: 45000, ptbExecutions24h: 8000000 },
      ecosystemTokens: [
        { symbol: "SUI", name: "Sui", address: "Native", category: "Native" },
        { symbol: "CETUS", name: "Cetus", address: "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS", category: "DEX" },
        { symbol: "NAVI", name: "NAVI Protocol", address: "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX", category: "Lending" },
      ],
    },
    ton: {
      type: "layer1", consensus: "Proof of Stake", language: "FunC/Tact",
      features: ["Infinite Sharding", "Telegram Integration", "TON DNS", "TON Storage"],
      governance: "TON Foundation",
      bridges: [{ name: "TON Bridge", url: "https://bridge.ton.org" }],
      dexes: [
        { name: "STON.fi", url: "https://app.ston.fi", volume24h: 45e6 },
        { name: "DeDust", url: "https://dedust.io", volume24h: 32e6 },
      ],
      defiProtocols: [
        { name: "STON.fi", tvl: 180e6, category: "DEX" },
        { name: "DeDust", tvl: 120e6, category: "DEX" },
      ],
      telegramApps: [
        { name: "Notcoin", users: 35e6, category: "Gaming" },
        { name: "Hamster Kombat", users: 300e6, category: "Gaming" },
        { name: "Catizen", users: 20e6, category: "Gaming" },
      ],
      uniqueMetrics: { telegramMiniApps: 1200, activeWallets7d: 8000000, jettonTypes: 15000 },
      ecosystemTokens: [
        { symbol: "TON", name: "Toncoin", address: "Native", category: "Native" },
        { symbol: "NOT", name: "Notcoin", address: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT", category: "Gaming" },
        { symbol: "DOGS", name: "DOGS", address: "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS", category: "Meme" },
        { symbol: "HMSTR", name: "Hamster", address: "EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo", category: "Gaming" },
        { symbol: "CATI", name: "Catizen", address: "EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7", category: "Gaming" },
      ],
    },
  };
  return chainData[chainId] || null;
}
