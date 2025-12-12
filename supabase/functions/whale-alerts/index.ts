import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chain-specific whale thresholds and data
const chainWhaleConfig: Record<string, { threshold: number; tokens: string[]; explorerTx: string }> = {
  ethereum: {
    threshold: 100000,
    tokens: ["ETH", "USDC", "USDT", "WBTC", "LINK", "UNI", "AAVE", "LDO"],
    explorerTx: "https://etherscan.io/tx/",
  },
  solana: {
    threshold: 50000,
    tokens: ["SOL", "USDC", "RAY", "JTO", "PYTH", "JUP", "BONK", "WIF"],
    explorerTx: "https://solscan.io/tx/",
  },
  optimism: {
    threshold: 25000,
    tokens: ["OP", "ETH", "USDC", "VELO", "SNX", "PERP", "LYRA", "THALES"],
    explorerTx: "https://optimistic.etherscan.io/tx/",
  },
  sui: {
    threshold: 30000,
    tokens: ["SUI", "CETUS", "TURBOS", "NAVI", "SCALLOP", "BUCK", "HASUI"],
    explorerTx: "https://suiscan.xyz/tx/",
  },
  ton: {
    threshold: 25000,
    tokens: ["TON", "NOT", "DOGS", "HMSTR", "CATI", "USDT", "STON"],
    explorerTx: "https://tonscan.org/tx/",
  },
  bnb: {
    threshold: 50000,
    tokens: ["BNB", "CAKE", "XVS", "BAKE", "TWT", "USDT", "BUSD"],
    explorerTx: "https://bscscan.com/tx/",
  },
  arbitrum: {
    threshold: 25000,
    tokens: ["ARB", "ETH", "GMX", "MAGIC", "RDNT", "GNS", "PENDLE"],
    explorerTx: "https://arbiscan.io/tx/",
  },
  base: {
    threshold: 20000,
    tokens: ["ETH", "AERO", "BRETT", "DEGEN", "TOSHI", "HIGHER", "VIRTUAL"],
    explorerTx: "https://basescan.org/tx/",
  },
  avalanche: {
    threshold: 30000,
    tokens: ["AVAX", "JOE", "PNG", "QI", "GMX", "BENQI", "YAK"],
    explorerTx: "https://snowtrace.io/tx/",
  },
  polygon: {
    threshold: 20000,
    tokens: ["POL", "QUICK", "GHST", "SUSHI", "AAVE", "QI"],
    explorerTx: "https://polygonscan.com/tx/",
  },
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { chainId, limit = 20 } = await req.json();
      console.log("Fetching whale alerts for:", chainId);
      
      const alerts = generateWhaleAlerts(chainId, limit);
      
      return new Response(JSON.stringify({ alerts, timestamp: Date.now() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch whale alerts" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // WebSocket for real-time whale alerts
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let intervalId: number | null = null;
  let subscribedChain = "ethereum";

  socket.onopen = () => {
    console.log("WebSocket connection opened for whale alerts");
    
    // Send initial whale data
    sendWhaleAlert(socket, subscribedChain);
    
    // Generate new whale alerts periodically (simulating real-time monitoring)
    intervalId = setInterval(() => {
      // 30% chance of a new whale alert every 10 seconds
      if (Math.random() < 0.3) {
        sendWhaleAlert(socket, subscribedChain, true);
      }
    }, 10000);
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === "subscribe") {
        subscribedChain = message.chainId || "ethereum";
        console.log("Subscribed to whale alerts for:", subscribedChain);
        sendWhaleAlert(socket, subscribedChain);
      }
      
      if (message.type === "ping") {
        socket.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
    if (intervalId) clearInterval(intervalId);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (intervalId) clearInterval(intervalId);
  };

  return response;
});

function sendWhaleAlert(socket: WebSocket, chainId: string, isNew = false) {
  const alerts = generateWhaleAlerts(chainId, isNew ? 1 : 10);
  socket.send(JSON.stringify({
    type: isNew ? "new_whale_alert" : "whale_alerts",
    chainId,
    alerts,
    timestamp: Date.now(),
  }));
}

function generateWhaleAlerts(chainId: string, count: number) {
  const config = chainWhaleConfig[chainId] || chainWhaleConfig.ethereum;
  const alerts = [];

  for (let i = 0; i < count; i++) {
    const token = config.tokens[Math.floor(Math.random() * config.tokens.length)];
    const type = ["buy", "sell", "transfer"][Math.floor(Math.random() * 3)] as "buy" | "sell" | "transfer";
    const amount = config.threshold * (1 + Math.random() * 10);
    const txHash = `0x${generateHex(64)}`;
    const fromWallet = `0x${generateHex(40)}`;
    const toWallet = type === "transfer" ? `0x${generateHex(40)}` : undefined;

    alerts.push({
      id: `whale-${Date.now()}-${i}`,
      type,
      token,
      amount,
      value: amount * getTokenPrice(token, chainId),
      timestamp: Date.now() - Math.random() * 3600000,
      txHash,
      fromWallet,
      toWallet,
      explorerUrl: `${config.explorerTx}${txHash}`,
      chainId,
      impact: amount > config.threshold * 5 ? "high" : amount > config.threshold * 2 ? "medium" : "low",
    });
  }

  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

function generateHex(length: number): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
}

function getTokenPrice(token: string, chainId: string): number {
  const prices: Record<string, number> = {
    ETH: 3650, SOL: 225, BTC: 97500, BNB: 680, AVAX: 52,
    OP: 2.45, SUI: 4.35, TON: 6.20, ARB: 1.15, POL: 0.62,
    LINK: 28, UNI: 16.5, AAVE: 280, LDO: 2.8, MKR: 2100,
    GMX: 45, MAGIC: 1.2, RDNT: 0.15, GNS: 4.5, PENDLE: 5.2,
    CETUS: 0.35, TURBOS: 0.08, NAVI: 0.12, SCALLOP: 0.45,
    NOT: 0.015, DOGS: 0.001, HMSTR: 0.005, CATI: 0.08,
    VELO: 0.12, SNX: 3.5, PERP: 1.2, LYRA: 0.18, THALES: 0.45,
    AERO: 1.8, BRETT: 0.15, DEGEN: 0.02, TOSHI: 0.0008,
    JTO: 3.5, PYTH: 0.45, JUP: 1.2, BONK: 0.00003, WIF: 2.8,
    RAY: 5.5, ORCA: 4.2, USDC: 1, USDT: 1, WBTC: 97500,
    CAKE: 2.8, XVS: 8.5, BAKE: 0.35, TWT: 1.2,
    JOE: 0.55, PNG: 0.18, QI: 0.02, BENQI: 0.03, YAK: 12,
    QUICK: 0.06, GHST: 1.1, SUSHI: 1.8,
  };
  return prices[token] || 1;
}
