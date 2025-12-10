import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chain-specific mock data with realistic values
const chainOverviews: Record<string, any> = {
  ethereum: { marketCap: 440e9, volume24h: 18e9, transactions24h: 1200000, gasFees: 25, tps: 15, activeWallets: 450000, defiTvl: 48e9 },
  solana: { marketCap: 105e9, volume24h: 4.5e9, transactions24h: 45000000, gasFees: 0.00025, tps: 4000, activeWallets: 800000, defiTvl: 8e9 },
  bnb: { marketCap: 100e9, volume24h: 2e9, transactions24h: 5000000, gasFees: 0.10, tps: 160, activeWallets: 2000000, defiTvl: 5e9 },
  avalanche: { marketCap: 21e9, volume24h: 800e6, transactions24h: 1500000, gasFees: 0.05, tps: 4500, activeWallets: 150000, defiTvl: 1.2e9 },
  polygon: { marketCap: 6e9, volume24h: 400e6, transactions24h: 3000000, gasFees: 0.01, tps: 7000, activeWallets: 350000, defiTvl: 900e6 },
  arbitrum: { marketCap: 4.6e9, volume24h: 450e6, transactions24h: 2000000, gasFees: 0.15, tps: 100, activeWallets: 200000, defiTvl: 3.2e9 },
  base: { marketCap: 2e9, volume24h: 300e6, transactions24h: 1000000, gasFees: 0.001, tps: 100, activeWallets: 100000, defiTvl: 1.5e9 },
};

const tokenSets: Record<string, string[]> = {
  ethereum: ["ETH", "LINK", "UNI", "AAVE", "LDO", "MKR", "CRV", "COMP", "ENS", "SNX", "SUSHI", "YFI", "1INCH", "BAL", "DYDX", "RPL"],
  solana: ["SOL", "RAY", "ORCA", "MNGO", "STEP", "SRM", "FIDA", "COPE", "MEAN", "TULIP", "SLND", "PORT", "SABER", "MARINADE", "JTO", "BONK"],
  bnb: ["BNB", "CAKE", "XVS", "BAKE", "ALPACA", "TWT", "AUTO", "BURGER", "CHESS", "DODO", "EPS", "LIT", "RAMP", "VENUS", "WIN", "BIFI"],
  avalanche: ["AVAX", "JOE", "PNG", "QI", "SPELL", "TIME", "BENQI", "GRAPE", "XAVA", "TEDDY", "COOK", "ELK", "PEFI", "SNOB", "BSGG", "YAK"],
  polygon: ["MATIC", "QUICK", "GHST", "SUSHI", "AAVE", "BALL", "DFYN", "IRON", "KOGECOIN", "MIMATIC", "MUST", "POLYDOGE", "QI", "WMATIC", "WETH", "WBTC"],
  arbitrum: ["ARB", "GMX", "MAGIC", "RDNT", "GNS", "JONES", "DPX", "VELA", "CAMELOT", "PENDLE", "LDO", "SUSHI", "UNI", "WETH", "GRAIL", "DODO"],
  base: ["ETH", "AERO", "BRETT", "DEGEN", "MOCHI", "TOSHI", "HIGHER", "FRIEND", "NORMIE", "BALD", "BASED", "MIM", "XCAD", "SEAM", "USDbC", "DAI"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chainId } = await req.json();
    console.log("Chain data request:", chainId);

    const baseOverview = chainOverviews[chainId] || chainOverviews.ethereum;
    const tokens = tokenSets[chainId] || tokenSets.ethereum;
    
    // Add some randomness to make it feel live
    const priceChange = (Math.random() - 0.5) * 10;

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
      },
      whaleActivity: Array.from({ length: 30 }, (_, i) => ({
        type: ["buy", "sell", "transfer"][Math.floor(Math.random() * 3)],
        amount: Math.random() * 10000,
        token: tokens[Math.floor(Math.random() * Math.min(tokens.length, 8))],
        timestamp: Date.now() - Math.random() * 3600000,
        value: Math.random() * 5000000,
        wallet: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      })),
      tokenHeat: tokens.slice(0, 16).map((symbol, i) => ({
        symbol,
        name: symbol,
        momentum: Math.random() * 100,
        volumeSpike: Math.random() * 100,
        volatility: Math.random() * 100,
        socialScore: Math.random() * 100,
        liquidityChange: (Math.random() - 0.5) * 40,
        price: Math.random() * (symbol === tokens[0] ? 3000 : 100),
        change24h: (Math.random() - 0.5) * 30,
      })),
      smartMoneyFlow: {
        inflow: Math.random() * 100e6,
        outflow: Math.random() * 80e6,
        netFlow: (Math.random() - 0.3) * 30e6,
        topSwaps: Array.from({ length: 5 }, () => ({
          from: tokens[Math.floor(Math.random() * 3)],
          to: tokens[Math.floor(Math.random() * 5) + 3],
          amount: Math.random() * 1e6,
        })),
        liquidityAdded: Math.random() * 50e6,
        liquidityRemoved: Math.random() * 30e6,
      },
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
