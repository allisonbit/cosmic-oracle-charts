import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chainId } = await req.json();
    console.log("Chain data request:", chainId);

    // Generate realistic mock data
    const response = {
      overview: {
        marketCap: Math.random() * 500e9,
        volume24h: Math.random() * 50e9,
        transactions24h: Math.floor(Math.random() * 2000000),
        gasFees: Math.random() * 50,
        tps: Math.floor(Math.random() * 5000),
        activeWallets: Math.floor(Math.random() * 500000),
        defiTvl: Math.random() * 20e9,
        priceChange24h: (Math.random() - 0.5) * 20,
      },
      whaleActivity: Array.from({ length: 30 }, () => ({
        type: ["buy", "sell", "transfer"][Math.floor(Math.random() * 3)],
        amount: Math.random() * 10000,
        token: ["ETH", "USDT", "USDC"][Math.floor(Math.random() * 3)],
        timestamp: Date.now() - Math.random() * 3600000,
        value: Math.random() * 5000000,
      })),
      tokenHeat: Array.from({ length: 16 }, (_, i) => ({
        symbol: `TOKEN${i + 1}`,
        name: `Token ${i + 1}`,
        momentum: Math.random() * 100,
        volumeSpike: Math.random() * 100,
        volatility: Math.random() * 100,
        socialScore: Math.random() * 100,
        liquidityChange: (Math.random() - 0.5) * 40,
        price: Math.random() * 100,
        change24h: (Math.random() - 0.5) * 30,
      })),
      smartMoneyFlow: {
        inflow: Math.random() * 100e6,
        outflow: Math.random() * 80e6,
        netFlow: Math.random() * 20e6,
        topSwaps: Array.from({ length: 5 }, () => ({
          from: "ETH",
          to: "USDC",
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
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
