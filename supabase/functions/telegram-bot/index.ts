import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY_1");
const ALCHEMY_API_KEY_2 = Deno.env.get("ALCHEMY_API_KEY_2");

const WEBSITE_URL = "https://oraclebull.com";
const MASCOT_IMAGE = "https://oraclebull.com/oracle-bot-mascot.jpg";

// Website page URLs for sharing
const WEBSITE_PAGES = {
  home: WEBSITE_URL,
  dashboard: `${WEBSITE_URL}/dashboard`,
  sentiment: `${WEBSITE_URL}/sentiment`,
  explorer: `${WEBSITE_URL}/explorer`,
  learn: `${WEBSITE_URL}/learn`,
  portfolio: `${WEBSITE_URL}/portfolio`,
  contact: `${WEBSITE_URL}/contact`,
};

// Chain-specific pages
const CHAIN_PAGES: Record<string, string> = {
  ethereum: `${WEBSITE_URL}/chain/ethereum`,
  solana: `${WEBSITE_URL}/chain/solana`,
  base: `${WEBSITE_URL}/chain/base`,
  arbitrum: `${WEBSITE_URL}/chain/arbitrum`,
  polygon: `${WEBSITE_URL}/chain/polygon`,
  optimism: `${WEBSITE_URL}/chain/optimism`,
  avalanche: `${WEBSITE_URL}/chain/avalanche`,
  bsc: `${WEBSITE_URL}/chain/bsc`,
};

// Alchemy network mapping
const ALCHEMY_NETWORKS: Record<string, string> = {
  ethereum: "eth-mainnet",
  eth: "eth-mainnet",
  polygon: "polygon-mainnet",
  matic: "polygon-mainnet",
  arbitrum: "arb-mainnet",
  arb: "arb-mainnet",
  base: "base-mainnet",
  optimism: "opt-mainnet",
  opt: "opt-mainnet",
  solana: "solana-mainnet",
  sol: "solana-mainnet",
};

// Token symbol to DexScreener chain mapping
const DEXSCREENER_CHAINS: Record<string, string> = {
  ethereum: "ethereum",
  eth: "ethereum",
  base: "base",
  arbitrum: "arbitrum",
  polygon: "polygon",
  optimism: "optimism",
  solana: "solana",
  sol: "solana",
  bsc: "bsc",
  avalanche: "avalanche",
};

// Common token addresses for DexScreener lookups
const TOKEN_ADDRESSES: Record<string, { address: string; chain: string }> = {
  btc: { address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", chain: "ethereum" }, // WBTC
  wbtc: { address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", chain: "ethereum" },
  eth: { address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", chain: "ethereum" }, // WETH
  weth: { address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", chain: "ethereum" },
  usdt: { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", chain: "ethereum" },
  usdc: { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", chain: "ethereum" },
  sol: { address: "So11111111111111111111111111111111111111112", chain: "solana" },
  link: { address: "0x514910771af9ca656af840dff83e8264ecf986ca", chain: "ethereum" },
  uni: { address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", chain: "ethereum" },
  aave: { address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", chain: "ethereum" },
  matic: { address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", chain: "ethereum" },
  arb: { address: "0xb50721bcf8d664c30412cfbc6cf7a15145234ad1", chain: "ethereum" },
  op: { address: "0x4200000000000000000000000000000000000042", chain: "optimism" },
  pepe: { address: "0x6982508145454ce325ddbe47a25d4ec3d2311933", chain: "ethereum" },
  shib: { address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce", chain: "ethereum" },
  doge: { address: "0x4206931337dc273a630d328da6441786bfad668f", chain: "ethereum" },
};

// Check if address is Solana (base58, 32-44 chars, no 0x prefix)
function isSolanaAddress(address: string): boolean {
  if (address.startsWith("0x")) return false;
  if (address.length < 32 || address.length > 44) return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ TELEGRAM HELPERS ============

async function sendMessage(chatId: number, text: string, parseMode = "Markdown", replyMarkup?: any) {
  try {
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    };
    if (replyMarkup) body.reply_markup = replyMarkup;
    
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function sendPhoto(chatId: number, photoUrl: string, caption: string, parseMode = "Markdown") {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: parseMode,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending photo:", error);
  }
}

async function sendPoll(chatId: number, question: string, options: string[], isAnonymous = false) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendPoll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        question,
        options,
        is_anonymous: isAnonymous,
        allows_multiple_answers: false,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending poll:", error);
  }
}

async function pinMessage(chatId: number, messageId: number) {
  try {
    await fetch(`${TELEGRAM_API}/pinChatMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        disable_notification: true,
      }),
    });
  } catch (error) {
    console.error("Error pinning message:", error);
  }
}

// ============ CHART GENERATION ============

function generateChartUrl(symbol: string, prices: number[], labels: string[], isPositive: boolean): string {
  const chartConfig = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: symbol.toUpperCase(),
        data: prices,
        borderColor: isPositive ? '#10b981' : '#ef4444',
        backgroundColor: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 3,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: `${symbol.toUpperCase()} - 7D`, color: '#fff', font: { size: 18 } }
      },
      scales: {
        x: { display: false },
        y: { 
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#888', callback: (v: number) => '$' + v.toLocaleString() }
        }
      }
    }
  };
  
  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encoded}&w=600&h=400&bkg=%231a1a2e`;
}

// ============ ALCHEMY + DEXSCREENER DATA FETCHING ============

// Fetch token price from DexScreener (Alchemy doesn't provide market prices)
async function fetchPriceFromDexScreener(symbolOrAddress: string, chain = "ethereum") {
  try {
    const symbolLower = symbolOrAddress.toLowerCase();
    
    // Check if it's a known token
    const knownToken = TOKEN_ADDRESSES[symbolLower];
    let searchUrl = "";
    
    if (knownToken) {
      searchUrl = `https://api.dexscreener.com/latest/dex/tokens/${knownToken.address}`;
    } else if (symbolOrAddress.startsWith("0x") || isSolanaAddress(symbolOrAddress)) {
      // Direct address lookup
      searchUrl = `https://api.dexscreener.com/latest/dex/tokens/${symbolOrAddress}`;
    } else {
      // Search by symbol
      searchUrl = `https://api.dexscreener.com/latest/dex/search?q=${symbolOrAddress}`;
    }
    
    console.log(`DexScreener fetch: ${searchUrl}`);
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    // Get best pair (highest liquidity)
    const pairs = data.pairs || [];
    if (pairs.length === 0) return null;
    
    // Sort by liquidity and get the best one
    const bestPair = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
    
    return {
      name: bestPair.baseToken?.name || symbolOrAddress,
      symbol: bestPair.baseToken?.symbol?.toUpperCase() || symbolOrAddress.toUpperCase(),
      price: parseFloat(bestPair.priceUsd) || 0,
      change24h: bestPair.priceChange?.h24 || 0,
      volume: bestPair.volume?.h24 || 0,
      marketCap: bestPair.fdv || 0,
      liquidity: bestPair.liquidity?.usd || 0,
      pairAddress: bestPair.pairAddress,
      dexUrl: bestPair.url,
      chain: bestPair.chainId,
    };
  } catch (error) {
    console.error("DexScreener error:", error);
    return null;
  }
}

// Get top tokens from DexScreener by chain
async function fetchTopTokensByChain(chain: string, limit = 10) {
  try {
    const chainId = DEXSCREENER_CHAINS[chain.toLowerCase()] || "ethereum";
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/trending/${chainId}`);
    
    if (!response.ok) {
      // Fallback: search for popular tokens on the chain
      const popularSearches = ["eth", "usdc", "usdt", "wbtc", "link"];
      const results = [];
      for (const search of popularSearches.slice(0, limit)) {
        const token = await fetchPriceFromDexScreener(search, chain);
        if (token) results.push(token);
      }
      return results;
    }
    
    const data = await response.json();
    return (data.pairs || []).slice(0, limit).map((pair: any) => ({
      symbol: pair.baseToken?.symbol?.toUpperCase(),
      name: pair.baseToken?.name,
      price: parseFloat(pair.priceUsd) || 0,
      change24h: pair.priceChange?.h24 || 0,
      volume: pair.volume?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
    }));
  } catch (error) {
    console.error("Error fetching top tokens:", error);
    return [];
  }
}

// Fetch trending tokens from DexScreener
async function fetchTrendingTokens() {
  try {
    const response = await fetch("https://api.dexscreener.com/token-boosts/top/v1");
    const data = await response.json();
    
    if (!data || !Array.isArray(data)) return [];
    
    return data.slice(0, 10).map((item: any) => ({
      symbol: item.tokenAddress?.slice(0, 8) || "???",
      name: item.description || "Trending Token",
      url: item.url,
      chain: item.chainId,
    }));
  } catch (error) {
    console.error("Error fetching trending:", error);
    return [];
  }
}

// Fetch gas price using Alchemy
async function fetchGas(chain: string) {
  try {
    const chainLower = chain.toLowerCase();
    const network = ALCHEMY_NETWORKS[chainLower] || "eth-mainnet";
    
    // Solana doesn't have gas in the same way
    if (chainLower === "solana" || chainLower === "sol") {
      return { slow: 0.000005, average: 0.000005, fast: 0.00001, unit: "SOL" };
    }

    const response = await fetch(`https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1 }),
    });
    const data = await response.json();
    const gasGwei = parseInt(data.result, 16) / 1e9;
    return { slow: Math.round(gasGwei * 0.8), average: Math.round(gasGwei), fast: Math.round(gasGwei * 1.2), unit: "Gwei" };
  } catch (error) {
    console.error("Error fetching gas:", error);
    return null;
  }
}

// Fetch comprehensive chain metrics from Alchemy
async function fetchChainMetrics(chain: string) {
  try {
    const chainLower = chain.toLowerCase();
    const network = ALCHEMY_NETWORKS[chainLower];
    
    if (!network) return null;
    
    // Handle Solana differently
    if (chainLower === "solana" || chainLower === "sol") {
      return await fetchSolanaChainMetrics();
    }
    
    const alchemyUrl = `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    // Batch RPC calls for efficiency
    const batchResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 },
        { jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 2 },
        { jsonrpc: "2.0", method: "eth_syncing", params: [], id: 3 },
      ]),
    });
    const batchData = await batchResponse.json();
    
    const blockNumber = parseInt(batchData[0]?.result || "0", 16);
    const gasPrice = parseInt(batchData[1]?.result || "0", 16) / 1e9;
    const syncing = batchData[2]?.result;

    // Get latest block for timestamp and tx count
    const blockResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [batchData[0]?.result, false],
        id: 1
      }),
    });
    const blockData = await blockResponse.json();
    const block = blockData.result || {};
    
    const txCount = block.transactions?.length || 0;
    const timestamp = parseInt(block.timestamp || "0", 16);
    const baseFee = block.baseFeePerGas ? parseInt(block.baseFeePerGas, 16) / 1e9 : null;

    return {
      chain: chainLower,
      blockNumber,
      gasPrice: Math.round(gasPrice),
      baseFee: baseFee ? Math.round(baseFee) : null,
      txCount,
      timestamp,
      syncing: syncing === false ? "synced" : "syncing",
      chainPage: CHAIN_PAGES[chainLower] || CHAIN_PAGES.ethereum,
    };
  } catch (error) {
    console.error("Error fetching chain metrics:", error);
    return null;
  }
}

// Fetch Solana chain metrics using Alchemy
async function fetchSolanaChainMetrics() {
  try {
    const alchemyUrl = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    
    // Get slot (equivalent to block number)
    const slotResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "getSlot", params: [], id: 1 }),
    });
    const slotData = await slotResponse.json();
    
    // Get recent performance samples for TPS
    const perfResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "getRecentPerformanceSamples", params: [1], id: 2 }),
    });
    const perfData = await perfResponse.json();
    const perf = perfData.result?.[0];
    
    const tps = perf ? Math.round(perf.numTransactions / perf.samplePeriodSecs) : 0;
    
    return {
      chain: "solana",
      blockNumber: slotData.result || 0,
      gasPrice: 0.000005, // Fixed lamport fee
      baseFee: null,
      txCount: tps,
      tps,
      timestamp: Date.now() / 1000,
      syncing: "synced",
      chainPage: CHAIN_PAGES.solana,
    };
  } catch (error) {
    console.error("Error fetching Solana metrics:", error);
    return null;
  }
}

// Fetch whale transactions using Alchemy
async function fetchWhaleTransactions(chain = "ethereum") {
  try {
    const network = ALCHEMY_NETWORKS[chain.toLowerCase()] || "eth-mainnet";
    const alchemyUrl = `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    
    // Get latest block
    const blockResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    });
    const blockData = await blockResponse.json();
    const latestBlock = blockData.result;

    // Get asset transfers for large ETH movements (>100 ETH)
    const transfersResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getAssetTransfers",
        params: [{
          fromBlock: `0x${(parseInt(latestBlock, 16) - 50).toString(16)}`,
          toBlock: latestBlock,
          category: ["external"],
          withMetadata: false,
          excludeZeroValue: true,
          maxCount: "0x64",
          order: "desc"
        }],
        id: 1
      }),
    });
    const transfersData = await transfersResponse.json();
    
    // Filter for whale transactions (>100 ETH)
    const whales = (transfersData.result?.transfers || [])
      .filter((tx: any) => tx.value && tx.value > 100)
      .slice(0, 5);
    
    return whales;
  } catch (error) {
    console.error("Error fetching whale transactions:", error);
    return [];
  }
}

// ============ WALLET SCANNER (ALCHEMY) ============

// Fetch Solana wallet balances using Alchemy
async function fetchSolanaWalletBalances(address: string) {
  try {
    const alchemyUrl = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    // Get SOL balance
    const solBalanceResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getBalance",
        params: [address],
        id: 1,
      }),
    });
    const solBalanceData = await solBalanceResponse.json();
    const solBalance = (solBalanceData.result?.value || 0) / 1e9;

    // Get SPL token accounts
    const tokenAccountsResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccountsByOwner",
        params: [
          address,
          { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
          { encoding: "jsonParsed" }
        ],
        id: 2,
      }),
    });
    const tokenAccountsData = await tokenAccountsResponse.json();
    const tokenAccounts = tokenAccountsData.result?.value || [];

    // Parse SPL tokens
    const tokens = [];
    for (const account of tokenAccounts.slice(0, 15)) {
      try {
        const info = account.account?.data?.parsed?.info;
        if (info && info.tokenAmount) {
          const balance = parseFloat(info.tokenAmount.uiAmountString || "0");
          if (balance > 0.0001) {
            tokens.push({
              address: info.mint,
              symbol: info.mint?.slice(0, 6) || "SPL",
              name: "SPL Token",
              balance,
              decimals: info.tokenAmount.decimals || 9,
              mint: info.mint,
            });
          }
        }
      } catch (e) {
        console.error("SPL token parse error:", e);
      }
    }

    // Enrich tokens with known metadata
    const enrichedTokens = enrichSolanaTokens(tokens);

    return {
      address,
      chain: "solana",
      nativeSymbol: "SOL",
      nativeBalance: solBalance,
      tokens: enrichedTokens,
      totalTokens: tokenAccounts.length,
    };
  } catch (error) {
    console.error("Error fetching Solana wallet:", error);
    return null;
  }
}

// Enrich Solana tokens with metadata
function enrichSolanaTokens(tokens: any[]) {
  const knownTokens: Record<string, { symbol: string; name: string }> = {
    "So11111111111111111111111111111111111111112": { symbol: "wSOL", name: "Wrapped SOL" },
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { symbol: "USDC", name: "USD Coin" },
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { symbol: "USDT", name: "Tether USD" },
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": { symbol: "stSOL", name: "Lido Staked SOL" },
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": { symbol: "mSOL", name: "Marinade Staked SOL" },
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": { symbol: "BONK", name: "Bonk" },
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": { symbol: "JUP", name: "Jupiter" },
    "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk": { symbol: "WEN", name: "Wen" },
    "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr": { symbol: "POPCAT", name: "Popcat" },
    "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82": { symbol: "BOME", name: "Book of Meme" },
    "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm": { symbol: "WIF", name: "dogwifhat" },
    "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof": { symbol: "RENDER", name: "Render Token" },
  };

  return tokens.map(token => {
    const known = knownTokens[token.mint];
    return {
      ...token,
      symbol: known?.symbol || token.symbol,
      name: known?.name || token.name,
    };
  });
}

// Fetch EVM wallet token balances using Alchemy
async function fetchEvmWalletBalances(address: string, chain = "ethereum") {
  try {
    const chainLower = chain.toLowerCase();
    const network = ALCHEMY_NETWORKS[chainLower] || "eth-mainnet";
    const alchemyUrl = `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

    // Get native token balance
    const nativeBalanceResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });
    const nativeBalanceData = await nativeBalanceResponse.json();
    const nativeBalance = parseInt(nativeBalanceData.result || "0", 16) / 1e18;

    // Get token balances
    const tokenBalancesResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [address],
        id: 2,
      }),
    });
    const tokenBalancesData = await tokenBalancesResponse.json();
    const tokenBalances = tokenBalancesData.result?.tokenBalances || [];

    // Filter non-zero balances and get metadata
    const nonZeroTokens = tokenBalances
      .filter((t: any) => t.tokenBalance && t.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000")
      .slice(0, 10);

    // Get token metadata for each
    const tokensWithMetadata = [];
    for (const token of nonZeroTokens) {
      try {
        const metadataResponse = await fetch(alchemyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "alchemy_getTokenMetadata",
            params: [token.contractAddress],
            id: 3,
          }),
        });
        const metadataData = await metadataResponse.json();
        const metadata = metadataData.result || {};
        
        const decimals = metadata.decimals || 18;
        const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, decimals);
        
        if (balance > 0.0001) {
          tokensWithMetadata.push({
            address: token.contractAddress,
            symbol: metadata.symbol || "???",
            name: metadata.name || "Unknown",
            balance,
            decimals,
          });
        }
      } catch (e) {
        console.error("Token metadata error:", e);
      }
    }

    // Native symbol mapping
    const nativeSymbols: Record<string, string> = {
      ethereum: "ETH", eth: "ETH",
      polygon: "MATIC", matic: "MATIC",
      arbitrum: "ETH", arb: "ETH",
      base: "ETH", optimism: "ETH", opt: "ETH",
    };

    return {
      address,
      chain: chainLower,
      nativeSymbol: nativeSymbols[chainLower] || "ETH",
      nativeBalance,
      tokens: tokensWithMetadata,
      totalTokens: tokenBalances.length,
    };
  } catch (error) {
    console.error("Error fetching EVM wallet balances:", error);
    return null;
  }
}

// Main wallet balance fetcher - auto-detects chain
async function fetchWalletBalances(address: string, chain = "auto") {
  if (chain === "auto" || chain === "solana" || chain === "sol") {
    if (isSolanaAddress(address)) {
      return await fetchSolanaWalletBalances(address);
    }
  }
  const evmChain = chain === "auto" ? "ethereum" : chain;
  return await fetchEvmWalletBalances(address, evmChain);
}

// Enrich wallet with prices from DexScreener
async function enrichWalletWithPrices(walletData: any) {
  if (!walletData) return null;
  
  try {
    const isSolana = walletData.chain === "solana";
    const nativeSymbol = walletData.nativeSymbol || (isSolana ? "SOL" : "ETH");
    
    // Get native token price
    const nativeData = await fetchPriceFromDexScreener(nativeSymbol.toLowerCase());
    const nativeUsdValue = (walletData.nativeBalance || 0) * (nativeData?.price || 0);
    
    let totalTokenValue = 0;
    const enrichedTokens = [];
    
    for (const token of walletData.tokens.slice(0, 8)) {
      try {
        const priceData = await fetchPriceFromDexScreener(token.address || token.symbol);
        const usdValue = priceData ? token.balance * priceData.price : 0;
        totalTokenValue += usdValue;
        
        enrichedTokens.push({
          ...token,
          price: priceData?.price || 0,
          usdValue,
          change24h: priceData?.change24h || 0,
        });
      } catch (e) {
        enrichedTokens.push({ ...token, price: 0, usdValue: 0, change24h: 0 });
      }
    }
    
    enrichedTokens.sort((a, b) => b.usdValue - a.usdValue);
    
    return {
      ...walletData,
      nativePrice: nativeData?.price || 0,
      nativeUsdValue,
      tokens: enrichedTokens,
      totalTokenValue,
      totalPortfolioValue: nativeUsdValue + totalTokenValue,
    };
  } catch (error) {
    console.error("Error enriching wallet:", error);
    return walletData;
  }
}

// AI wallet analysis
async function analyzeWallet(walletData: any) {
  if (!walletData || !OPENAI_API_KEY) return null;
  
  try {
    const isSolana = walletData.chain === "solana";
    const nativeSymbol = walletData.nativeSymbol || (isSolana ? "SOL" : "ETH");
    
    const topHoldings = walletData.tokens.slice(0, 5).map((t: any) => 
      `${t.symbol}: ${t.balance.toFixed(4)} (${formatNumber(t.usdValue || 0)})`
    ).join(", ");
    
    const prompt = `Analyze this ${isSolana ? "Solana" : "EVM"} crypto wallet briefly (under 100 words):
- Chain: ${walletData.chain?.toUpperCase() || "Unknown"}
- ${nativeSymbol} Balance: ${(walletData.nativeBalance || 0).toFixed(4)} ${nativeSymbol} (${formatNumber(walletData.nativeUsdValue || 0)})
- Top Holdings: ${topHoldings || "None"}
- Total Portfolio: ${formatNumber(walletData.totalPortfolioValue || 0)}

Provide: 1) Wallet type (whale/retail/degen/inactive), 2) Risk level, 3) One insight. Be concise.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a crypto wallet analyst. Brief, actionable insights. No financial advice." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error analyzing wallet:", error);
    return null;
  }
}

// ============ HELPER FUNCTIONS ============

function formatNumber(num: number): string {
  if (!num) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function generateSentimentBar(value: number): string {
  const filled = Math.round(value / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

// Fetch global market data via DexScreener aggregation
async function fetchGlobalMarketData() {
  try {
    // Get major token prices
    const [btc, eth, sol] = await Promise.all([
      fetchPriceFromDexScreener("wbtc"),
      fetchPriceFromDexScreener("eth"),
      fetchPriceFromDexScreener("sol"),
    ]);
    
    // Estimate market cap from major tokens (simplified)
    const estimatedMcap = ((btc?.marketCap || 0) * 1.5) + (eth?.marketCap || 0) + (sol?.marketCap || 0);
    
    return {
      btc,
      eth,
      sol,
      totalMarketCap: estimatedMcap,
      btcDominance: btc?.marketCap ? (btc.marketCap / estimatedMcap) * 100 : 50,
    };
  } catch (error) {
    console.error("Error fetching global market:", error);
    return null;
  }
}

// ============ CONVERSATION LEARNING ============

async function extractTopicsAndSentiment(text: string) {
  const cryptoKeywords = [
    "btc", "bitcoin", "eth", "ethereum", "sol", "solana", "bnb", "xrp", "ada", "doge",
    "defi", "nft", "staking", "yield", "airdrop", "pump", "dump", "moon", "rekt",
    "bullish", "bearish", "hodl", "fomo", "fud", "whale", "rug", "dex", "cex",
    "gas", "bridge", "swap", "liquidity", "tvl", "apy", "apr", "farming"
  ];
  
  const textLower = text.toLowerCase();
  const topics = cryptoKeywords.filter(keyword => textLower.includes(keyword));
  
  const bullishWords = ["bullish", "moon", "pump", "up", "green", "buy", "long", "ath", "breakout", "gains"];
  const bearishWords = ["bearish", "dump", "down", "red", "sell", "short", "crash", "rekt", "fear", "drop"];
  
  let bullScore = bullishWords.filter(w => textLower.includes(w)).length;
  let bearScore = bearishWords.filter(w => textLower.includes(w)).length;
  
  let sentiment = "neutral";
  if (bullScore > bearScore) sentiment = "bullish";
  else if (bearScore > bullScore) sentiment = "bearish";
  
  return { topics, sentiment };
}

async function saveConversation(chatId: number, userId: number, username: string, text: string) {
  try {
    const { topics, sentiment } = await extractTopicsAndSentiment(text);
    
    await supabase.from("telegram_conversations").insert({
      chat_id: chatId,
      user_id: userId,
      username,
      message_text: text,
      sentiment,
      topics,
    });

    if (topics.length > 0) {
      const { data: group } = await supabase
        .from("telegram_groups")
        .select("learned_topics")
        .eq("chat_id", chatId)
        .single();
      
      if (group) {
        const existingTopics = group.learned_topics || [];
        const newTopics = [...new Set([...existingTopics, ...topics])].slice(-50);
        await supabase.from("telegram_groups").update({ learned_topics: newTopics }).eq("chat_id", chatId);
      }
    }
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

async function getGroupContext(chatId: number) {
  try {
    const { data: conversations } = await supabase
      .from("telegram_conversations")
      .select("message_text, sentiment, topics, username")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: group } = await supabase
      .from("telegram_groups")
      .select("learned_topics, community_sentiment")
      .eq("chat_id", chatId)
      .single();

    const sentiments = conversations?.map(c => c.sentiment) || [];
    const bullishCount = sentiments.filter(s => s === "bullish").length;
    const bearishCount = sentiments.filter(s => s === "bearish").length;
    
    let communitySentiment = "neutral";
    if (bullishCount > bearishCount * 1.5) communitySentiment = "bullish";
    else if (bearishCount > bullishCount * 1.5) communitySentiment = "bearish";

    if (group) {
      await supabase.from("telegram_groups").update({ community_sentiment: communitySentiment }).eq("chat_id", chatId);
    }

    const recentTopics = [...new Set(conversations?.flatMap(c => c.topics || []) || [])].slice(0, 10);
    const recentMessages = conversations?.slice(0, 5).map(c => `${c.username}: ${c.message_text.slice(0, 100)}`).join("\n") || "";

    return {
      recentTopics,
      communitySentiment,
      recentMessages,
      learnedTopics: group?.learned_topics || [],
    };
  } catch (error) {
    console.error("Error getting group context:", error);
    return { recentTopics: [], communitySentiment: "neutral", recentMessages: "", learnedTopics: [] };
  }
}

// ============ AI RESPONSE ============

async function getAIResponse(message: string, chatId?: number, userName?: string) {
  if (!OPENAI_API_KEY) return null;
  
  try {
    const globalData = await fetchGlobalMarketData();
    
    let groupContext = "";
    if (chatId) {
      const ctx = await getGroupContext(chatId);
      groupContext = `
Community Context:
- Recent hot topics: ${ctx.recentTopics.join(", ") || "general crypto"}
- Community mood: ${ctx.communitySentiment}
- Topics this group discusses often: ${ctx.learnedTopics.slice(0, 10).join(", ") || "various crypto topics"}
`;
    }

    const marketContext = `
Live Market Data (via Alchemy + DexScreener):
- BTC: $${globalData?.btc?.price?.toLocaleString()} (${globalData?.btc?.change24h?.toFixed(2)}% 24h)
- ETH: $${globalData?.eth?.price?.toLocaleString()} (${globalData?.eth?.change24h?.toFixed(2)}% 24h)
- SOL: $${globalData?.sol?.price?.toLocaleString()} (${globalData?.sol?.change24h?.toFixed(2)}% 24h)
${groupContext}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Oracle Bot 🔮 - a chill crypto homie who keeps it real.

CRITICAL RULES:
- MAX 2-3 sentences. No walls of text. Ever.
- Talk like a real person, not a bot. Be casual and direct.
- Skip the fluff - get straight to the point
- One emoji max per response, if any
- NO disclaimers unless directly asked about trading
- Sound like you're texting a friend, not writing an essay

${marketContext}

${userName ? `Talking to: ${userName}` : ""}`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error in AI response:", error);
    return null;
  }
}

// ============ ALERT SYSTEM ============

async function createAlert(userId: number, chatId: number, alertType: string, target: string, threshold: number, metadata?: any) {
  try {
    await supabase.from("telegram_alerts").insert({
      telegram_user_id: userId,
      telegram_chat_id: chatId,
      alert_type: alertType,
      token_or_chain: target,
      threshold_value: threshold,
      metadata: metadata || {},
    });
    return true;
  } catch (error) {
    console.error("Error creating alert:", error);
    return false;
  }
}

// ============ MARKET PULSE ============

async function generateMarketPulse() {
  const globalData = await fetchGlobalMarketData();
  if (!globalData) return "❌ Could not fetch market data";
  
  const btcChange = (globalData.btc?.change24h || 0) >= 0 ? "🟢" : "🔴";
  const ethChange = (globalData.eth?.change24h || 0) >= 0 ? "🟢" : "🔴";
  const solChange = (globalData.sol?.change24h || 0) >= 0 ? "🟢" : "🔴";

  return `🔮 *ORACLE PULSE*

💎 BTC $${globalData.btc?.price?.toLocaleString() || "N/A"} ${btcChange}${globalData.btc?.change24h?.toFixed(1) || 0}%
⟠ ETH $${globalData.eth?.price?.toLocaleString() || "N/A"} ${ethChange}${globalData.eth?.change24h?.toFixed(1) || 0}%
◎ SOL $${globalData.sol?.price?.toLocaleString() || "N/A"} ${solChange}${globalData.sol?.change24h?.toFixed(1) || 0}%

📊 MCap: ${formatNumber(globalData.totalMarketCap || 0)}
₿ Dominance: ${globalData.btcDominance?.toFixed(1) || 50}%

[Live Dashboard](${WEBSITE_PAGES.dashboard})`;
}

// Generate chain overview
async function generateChainOverview(chain: string) {
  const chainLower = chain.toLowerCase();
  const metrics = await fetchChainMetrics(chainLower);
  const tokens = await fetchTopTokensByChain(chainLower, 3);
  
  if (!metrics) return null;
  
  const chainNames: Record<string, string> = {
    ethereum: "Ethereum", eth: "Ethereum",
    base: "Base", arbitrum: "Arbitrum", arb: "Arbitrum",
    polygon: "Polygon", matic: "Polygon",
    optimism: "Optimism", opt: "Optimism",
    solana: "Solana", sol: "Solana",
    avalanche: "Avalanche", avax: "Avalanche",
    bsc: "BNB Chain", bnb: "BNB Chain",
  };
  
  const displayName = chainNames[chainLower] || chain.toUpperCase();
  const chainKey = Object.keys(CHAIN_PAGES).find(k => chainLower.includes(k)) || "ethereum";
  const chainUrl = CHAIN_PAGES[chainKey] || CHAIN_PAGES.ethereum;
  
  let topTokens = "";
  if (tokens && tokens.length > 0) {
    topTokens = tokens.slice(0, 3).map((t: any) => {
      const change = t.change24h || 0;
      const emoji = change >= 0 ? "🟢" : "🔴";
      return `${t.symbol}: $${t.price?.toLocaleString() || 0} ${emoji}${change.toFixed(1)}%`;
    }).join("\n");
  }
  
  const isSolana = chainLower === "solana" || chainLower === "sol";
  
  return {
    text: `⛓️ *${displayName} Overview*

📊 *Network Stats (via Alchemy)*
${isSolana ? "Slot" : "Block"}: ${metrics.blockNumber.toLocaleString()}
${isSolana ? `TPS: ~${(metrics as any).tps || metrics.txCount || 0}` : `Gas: ${metrics.gasPrice} Gwei${metrics.baseFee ? ` (Base: ${metrics.baseFee})` : ""}`}
TXs/${isSolana ? "sec" : "Block"}: ~${metrics.txCount}

${topTokens ? `📈 *Top Tokens*\n${topTokens}` : ""}

🔗 ${chainUrl}`,
    chainUrl,
  };
}

// Generate global overview
async function generateGlobalOverview() {
  const globalData = await fetchGlobalMarketData();
  if (!globalData) return null;
  
  return `🌐 *GLOBAL MARKET*

💎 *BTC* $${globalData.btc?.price?.toLocaleString() || "N/A"} ${(globalData.btc?.change24h || 0) >= 0 ? "🟢" : "🔴"}${globalData.btc?.change24h?.toFixed(1) || 0}%
⟠ *ETH* $${globalData.eth?.price?.toLocaleString() || "N/A"} ${(globalData.eth?.change24h || 0) >= 0 ? "🟢" : "🔴"}${globalData.eth?.change24h?.toFixed(1) || 0}%
◎ *SOL* $${globalData.sol?.price?.toLocaleString() || "N/A"} ${(globalData.sol?.change24h || 0) >= 0 ? "🟢" : "🔴"}${globalData.sol?.change24h?.toFixed(1) || 0}%

📊 Total MCap: ${formatNumber(globalData.totalMarketCap || 0)}
₿ BTC Dom: ${globalData.btcDominance?.toFixed(1) || 50}%

🌐 ${WEBSITE_PAGES.dashboard}`;
}

// Generate token chart
async function generateTokenChart(symbol: string): Promise<{ chartUrl: string; caption: string } | null> {
  const priceData = await fetchPriceFromDexScreener(symbol);
  if (!priceData) return null;
  
  // Generate simple chart with current price point
  const isPositive = (priceData.change24h || 0) >= 0;
  const prices = [priceData.price * 0.98, priceData.price * 0.99, priceData.price * 1.01, priceData.price * 0.995, priceData.price];
  const labels = ["4h", "3h", "2h", "1h", "Now"];
  
  const chartUrl = generateChartUrl(priceData.symbol, prices, labels, isPositive);
  
  const caption = `${isPositive ? "📈" : "📉"} *${priceData.symbol}* $${priceData.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
24h: ${isPositive ? "+" : ""}${priceData.change24h?.toFixed(1)}%
Vol: ${formatNumber(priceData.volume)} | Liq: ${formatNumber(priceData.liquidity)}`;
  
  return { chartUrl, caption };
}

// Format whale alert
function formatWhaleAlert(tx: any, nativePrice: number) {
  const value = tx.value || 0;
  const usdValue = value * nativePrice;
  const txHash = tx.hash || tx.uniqueId || "";
  const etherscanLink = txHash ? `https://etherscan.io/tx/${txHash}` : "https://etherscan.io";
  
  return `🐋 *WHALE ALERT*
${value.toFixed(1)} ETH (${formatNumber(usdValue)})
📤 ${tx.from?.slice(0, 10)}...
📥 ${tx.to?.slice(0, 10)}...
🔗 [View TX](${etherscanLink})`;
}

// ============ COMMAND HANDLERS ============

async function handleCommand(message: any) {
  const chatId = message.chat.id;
  const userId = message.from?.id || 0;
  const userName = message.from?.first_name || message.from?.username || "Anon";
  const chatTitle = message.chat.title;
  const text = message.text || "";
  const isGroup = message.chat.type === "group" || message.chat.type === "supergroup";

  // Register group and save conversation for learning
  if (isGroup) {
    await supabase.from("telegram_groups").upsert({
      chat_id: chatId,
      chat_title: chatTitle,
      is_active: true,
    }, { onConflict: "chat_id" });
    
    if (text.length > 3 && !text.startsWith("/")) {
      await saveConversation(chatId, userId, userName, text);
    }
  }

  const [command, ...args] = text.split(" ");
  const commandLower = command.toLowerCase();
  const argText = args.join(" ");

  console.log(`[${chatId}] ${userName}: ${text.slice(0, 100)}`);

  if (text.startsWith("/")) {
    switch (commandLower) {
      case "/start":
        await sendPhoto(chatId, MASCOT_IMAGE, `
🔮 *Welcome to Oracle Bot!*

I am the Cosmic Oracle - your intelligent crypto companion from ${WEBSITE_URL}!

📊 *Market Data*
/price <TOKEN> - Live prices
/chart <TOKEN> - Token chart
/chain <NAME> - Chain overview
/global - Global market

🔍 *Research*
/wallet <ADDRESS> - Scan any wallet
/trending - Hot tokens
/whales - Whale activity

🔔 *Smart Alerts*
/alert - Set any alert
/myalerts - Your alerts

🤖 *AI Features*
/analyze <TOKEN> - Deep analysis
/ask <anything> - Ask me anything

🗳️ *Community*
/poll, /vibe, /insights

💬 Or just chat with me naturally!
        `);
        break;

      case "/help":
        await sendMessage(chatId, `
🔮 *Oracle Bot Commands*

*Market (Alchemy + DexScreener):*
/price btc eth sol - Live prices
/chart btc - Token chart
/gas eth base - Gas fees
/chain ethereum - Chain stats
/global - Global market

*Wallet Scanner (Alchemy):*
/wallet 0x... - Scan EVM wallet
/wallet ABC... - Scan Solana wallet
/wallet 0x... base - Specify chain

*Research:*
/trending - Hot tokens
/whales - Whale moves
/analyze btc - AI analysis

*Alerts:*
/alert price BTC above 100000
/myalerts - View alerts

*Community:*
/poll, /vibe, /insights

*AI:*
/ask <anything>

💬 I also respond naturally!
        `);
        break;

      case "/price":
        if (args.length === 0) {
          await sendMessage(chatId, "🔮 Which token? Try: `/price btc` or `/price eth sol`");
          break;
        }
        const tokens = args.slice(0, 5);
        let priceMsg = "📊 *Live Prices (DexScreener)*\n\n";
        
        for (const t of tokens) {
          const data = await fetchPriceFromDexScreener(t);
          if (data) {
            const emoji = (data.change24h || 0) >= 0 ? "🟢" : "🔴";
            priceMsg += `*${data.symbol}* $${data.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${emoji}${data.change24h?.toFixed(1)}%\n`;
          } else {
            priceMsg += `*${t.toUpperCase()}* - Not found\n`;
          }
        }
        priceMsg += "\n_Real-time data_";
        await sendMessage(chatId, priceMsg);
        break;

      case "/gas":
        const gasChain = args[0]?.toLowerCase() || "eth";
        const gasData = await fetchGas(gasChain);
        if (gasData) {
          if (gasChain === "solana" || gasChain === "sol") {
            await sendMessage(chatId, `⛽ *Solana Fees*\nFixed: ~0.000005 SOL per tx\n_Data via Alchemy_`);
          } else {
            await sendMessage(chatId, `⛽ *${gasChain.toUpperCase()} Gas (Alchemy)*\n🐢 ${gasData.slow} | 🚶 ${gasData.average} | 🚀 ${gasData.fast} Gwei`);
          }
        } else {
          await sendMessage(chatId, "❌ Try: eth, polygon, arbitrum, base, optimism, solana");
        }
        break;

      case "/trending":
        const trending = await fetchTrendingTokens();
        if (trending.length > 0) {
          let trendMsg = "🔥 *Trending (DexScreener)*\n\n";
          trending.slice(0, 7).forEach((t: any, i: number) => {
            trendMsg += `${i + 1}. ${t.name || t.symbol} (${t.chain})\n`;
          });
          await sendMessage(chatId, trendMsg);
        } else {
          await sendMessage(chatId, "🔥 No trending data available");
        }
        break;

      case "/whales":
        await sendMessage(chatId, "🐋 Scanning for whale activity (Alchemy)...");
        const ethData = await fetchPriceFromDexScreener("eth");
        const ethPrice = ethData?.price || 3000;
        const whaleTxs = await fetchWhaleTransactions();
        if (whaleTxs.length > 0) {
          let whaleMsg = "🐋 *RECENT WHALE MOVES (Alchemy)*\n";
          whaleTxs.slice(0, 3).forEach((tx: any) => {
            const usd = (tx.value || 0) * ethPrice;
            whaleMsg += `\n${(tx.value || 0).toFixed(1)} ETH (${formatNumber(usd)})`;
          });
          await sendMessage(chatId, whaleMsg);
        } else {
          await sendMessage(chatId, "🐋 No major whale moves detected");
        }
        break;

      case "/wallet":
      case "/wallets":
      case "/scan":
        if (args.length === 0) {
          await sendMessage(chatId, `🔍 *Wallet Scanner (Alchemy)*

Scan any EVM or Solana wallet!

Usage:
\`/wallet 0x1234...abcd\` (EVM)
\`/wallet ABC...xyz\` (Solana)
\`/wallet 0x... base\` (specify chain)

Supported: ethereum, base, arbitrum, polygon, optimism, solana`);
          break;
        }
        
        const walletAddress = args[0];
        const walletChain = args[1]?.toLowerCase() || "auto";
        
        const isEvmAddress = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
        const isSolAddress = isSolanaAddress(walletAddress);
        
        if (!isEvmAddress && !isSolAddress) {
          await sendMessage(chatId, "❌ Invalid address format.\n\nEVM: `0x` + 40 hex chars\nSolana: 32-44 base58 chars");
          break;
        }
        
        const detectedChain = isSolAddress ? "solana" : (walletChain === "auto" ? "ethereum" : walletChain);
        await sendMessage(chatId, `🔍 Scanning ${isSolAddress ? "Solana" : detectedChain.toUpperCase()} wallet (Alchemy)...`);
        
        try {
          const walletData = await fetchWalletBalances(walletAddress, detectedChain);
          
          if (!walletData) {
            await sendMessage(chatId, "❌ Could not scan wallet. Try again.");
            break;
          }
          
          const enrichedWallet = await enrichWalletWithPrices(walletData);
          const isSolanaWallet = enrichedWallet.chain === "solana";
          const nativeSymbol = enrichedWallet.nativeSymbol || (isSolanaWallet ? "SOL" : "ETH");
          
          const explorerLinks: Record<string, string> = {
            ethereum: `https://etherscan.io/address/${walletAddress}`,
            base: `https://basescan.org/address/${walletAddress}`,
            arbitrum: `https://arbiscan.io/address/${walletAddress}`,
            polygon: `https://polygonscan.com/address/${walletAddress}`,
            optimism: `https://optimistic.etherscan.io/address/${walletAddress}`,
            solana: `https://solscan.io/account/${walletAddress}`,
          };
          const explorerLink = explorerLinks[enrichedWallet.chain] || explorerLinks.ethereum;
          
          let holdingsMsg = `🔍 *WALLET SCAN (Alchemy)*

📍 \`${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}\`
⛓️ ${enrichedWallet.chain?.toUpperCase() || "UNKNOWN"}

💰 *Native Balance*
${(enrichedWallet.nativeBalance || 0).toFixed(4)} ${nativeSymbol} (${formatNumber(enrichedWallet.nativeUsdValue || 0)})

`;
          
          if (enrichedWallet.tokens.length > 0) {
            holdingsMsg += `📊 *Top Holdings*\n`;
            enrichedWallet.tokens.slice(0, 5).forEach((t: any) => {
              const changeEmoji = (t.change24h || 0) >= 0 ? "🟢" : "🔴";
              holdingsMsg += `${t.symbol}: ${t.balance < 1 ? t.balance.toFixed(6) : t.balance.toFixed(2)} ${t.usdValue > 0 ? `(${formatNumber(t.usdValue)})` : ""} ${t.change24h ? `${changeEmoji}${t.change24h.toFixed(1)}%` : ""}\n`;
            });
          }
          
          holdingsMsg += `
💎 *Portfolio Value*: ${formatNumber(enrichedWallet.totalPortfolioValue || 0)}
🪙 Total Tokens: ${enrichedWallet.totalTokens || 0}

🔗 [View on Explorer](${explorerLink})
📊 ${WEBSITE_PAGES.portfolio}`;

          await sendPhoto(chatId, MASCOT_IMAGE, holdingsMsg);
          
          const aiAnalysis = await analyzeWallet(enrichedWallet);
          if (aiAnalysis) {
            await sendMessage(chatId, `🧠 *AI Analysis*\n\n${aiAnalysis}\n\n_Not financial advice._`);
          }
          
        } catch (e) {
          console.error("Wallet scan error:", e);
          await sendMessage(chatId, "❌ Error scanning wallet. Try again.");
        }
        break;

      case "/pulse":
      case "/digest":
      case "/market":
        await sendMessage(chatId, await generateMarketPulse());
        break;

      case "/chain":
        if (args.length === 0) {
          await sendMessage(chatId, `⛓️ Which chain? Try:
/chain ethereum
/chain base
/chain arbitrum
/chain polygon
/chain optimism
/chain solana`);
          break;
        }
        const chainOverview = await generateChainOverview(args[0]);
        if (chainOverview) {
          await sendPhoto(chatId, MASCOT_IMAGE, chainOverview.text);
        } else {
          await sendMessage(chatId, "❌ Chain not found. Try: ethereum, base, arbitrum, polygon, solana");
        }
        break;

      case "/global":
        const globalOverview = await generateGlobalOverview();
        if (globalOverview) {
          await sendPhoto(chatId, MASCOT_IMAGE, globalOverview);
        } else {
          await sendMessage(chatId, "❌ Could not fetch global data");
        }
        break;

      case "/chart":
        if (args.length === 0) {
          await sendMessage(chatId, "📊 Which token? Try: `/chart btc`");
          break;
        }
        const chartResult = await generateTokenChart(args[0]);
        if (chartResult) {
          await sendPhoto(chatId, chartResult.chartUrl, chartResult.caption);
        } else {
          await sendMessage(chatId, "❌ Token not found");
        }
        break;

      case "/analyze":
        if (args.length === 0) {
          await sendMessage(chatId, "🤖 Which token? Try: `/analyze btc`");
          break;
        }
        await sendMessage(chatId, "🔮 Analyzing...");
        const tokenData = await fetchPriceFromDexScreener(args[0]);
        if (tokenData && OPENAI_API_KEY) {
          const analysisPrompt = `Brief analysis (under 80 words) of ${tokenData.symbol}:
- Price: $${tokenData.price}
- 24h Change: ${tokenData.change24h}%
- Volume: $${tokenData.volume}
- Liquidity: $${tokenData.liquidity}

Give: 1) Current trend, 2) Key level, 3) One insight. Be direct.`;
          
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are a crypto analyst. Brief, direct insights. No financial advice." },
                { role: "user", content: analysisPrompt },
              ],
              max_tokens: 150,
            }),
          });
          const data = await response.json();
          const analysis = data.choices?.[0]?.message?.content;
          
          await sendMessage(chatId, `🤖 *${tokenData.symbol} Analysis*\n\n${analysis || "Could not generate analysis"}\n\n_Not financial advice._`);
        } else {
          await sendMessage(chatId, "❌ Could not analyze token");
        }
        break;

      case "/website":
      case "/oracle":
      case "/links":
        await sendPhoto(chatId, MASCOT_IMAGE, `
🔮 *Explore Oracle*

📊 [Dashboard](${WEBSITE_PAGES.dashboard}) - Live market overview
🎭 [Sentiment](${WEBSITE_PAGES.sentiment}) - Fear & Greed analysis
⛓️ [Chains](${CHAIN_PAGES.ethereum}) - Blockchain analytics
🔍 [Explorer](${WEBSITE_PAGES.explorer}) - Token search
📚 [Learn](${WEBSITE_PAGES.learn}) - Crypto education

🌐 *Main Site:* ${WEBSITE_URL}

_Real-time market data_
        `);
        break;

      case "/alert":
        if (args.length < 3) {
          await sendMessage(chatId, `
🔔 *Smart Alerts*

*Price Alerts:*
/alert price BTC above 100000
/alert price ETH below 3000

*Volume Alerts:*
/alert volume ETH spike

Examples work for any token!
          `);
          break;
        }

        const alertType = args[0].toLowerCase();
        let success = false;
        let alertMsg = "";

        if (alertType === "price") {
          const token = args[1].toUpperCase();
          const direction = args[2].toLowerCase();
          const value = parseFloat(args[3]);
          
          if (!isNaN(value)) {
            const dbType = direction === "above" ? "price_above" : "price_below";
            success = await createAlert(userId, chatId, dbType, token, value);
            alertMsg = `💰 ${token} ${direction} $${value.toLocaleString()}`;
          }
        } else if (alertType === "volume") {
          const token = args[1].toUpperCase();
          success = await createAlert(userId, chatId, "volume_spike", token, 100);
          alertMsg = `📈 ${token} volume spike`;
        }

        if (success) {
          await sendMessage(chatId, `✅ *Alert Created!*\n\n${alertMsg}\n\nYou will be notified when triggered.`);
        } else {
          await sendMessage(chatId, "❌ Could not create alert. Check format with /alert");
        }
        break;

      case "/myalerts":
        const { data: alerts } = await supabase
          .from("telegram_alerts")
          .select("*")
          .eq("telegram_user_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!alerts?.length) {
          await sendMessage(chatId, "📭 No active alerts. Create with /alert");
        } else {
          let list = "🔔 *Your Alerts*\n\n";
          alerts.forEach((a, i) => {
            const emoji = a.alert_type.includes("price") ? "💰" : "📊";
            list += `${i + 1}. ${emoji} ${a.token_or_chain} - ${a.alert_type.replace("_", " ")}\n`;
          });
          await sendMessage(chatId, list);
        }
        break;

      case "/poll":
        if (argText.length < 5) {
          await sendMessage(chatId, "📊 Create a poll:\n`/poll Will BTC break 100k this week?`\n\nDefault options: Yes / No / Maybe");
          break;
        }
        
        const pollResult = await sendPoll(chatId, argText, ["Yes ✅", "No ❌", "Maybe 🤔", "Show results 📊"]);
        
        if (pollResult?.ok) {
          await supabase.from("telegram_polls").insert({
            chat_id: chatId,
            created_by: userId,
            question: argText,
            options: ["Yes", "No", "Maybe", "Show results"],
          });
        }
        break;

      case "/vibe":
      case "/mood":
        const ctx = await getGroupContext(chatId);
        const vibeEmoji = ctx.communitySentiment === "bullish" ? "🐂" : ctx.communitySentiment === "bearish" ? "🐻" : "😐";
        await sendMessage(chatId, `
${vibeEmoji} *Community Vibe: ${ctx.communitySentiment.toUpperCase()}*

🔥 *Hot Topics:* ${ctx.recentTopics.slice(0, 5).join(", ") || "general discussion"}

_Based on recent conversations_
        `);
        break;

      case "/insights":
        const insights = await getGroupContext(chatId);
        await sendMessage(chatId, `
🧠 *Community Insights*

📚 *Topics We Discuss:*
${insights.learnedTopics.slice(0, 15).join(", ") || "Various crypto topics"}

🔥 *Recent Focus:*
${insights.recentTopics.slice(0, 8).join(", ") || "General chat"}

📊 *Current Mood:* ${insights.communitySentiment}

_Oracle learns from your conversations!_
        `);
        break;

      case "/pin":
        if (argText.length < 5) {
          await sendMessage(chatId, "📌 Pin a message:\n`/pin BTC key support at 89k`");
          break;
        }
        
        const pinnedMsg = await sendMessage(chatId, `📌 *PINNED INSIGHT*\n\n${argText}\n\n_by ${userName}_`);
        if (pinnedMsg?.result?.message_id) {
          await pinMessage(chatId, pinnedMsg.result.message_id);
          await supabase.from("telegram_pinned").insert({
            chat_id: chatId,
            content_type: "insight",
            content: argText,
            metadata: { by: userName },
          });
        }
        break;

      case "/ask":
        if (argText.length < 3) {
          await sendMessage(chatId, "🔮 Ask me anything:\n`/ask What's happening with ETH?`");
          break;
        }
        const answer = await getAIResponse(argText, chatId, userName);
        if (answer) {
          await sendMessage(chatId, answer);
        } else {
          await sendMessage(chatId, "❌ Couldn't process that. Try again.");
        }
        break;

      default:
        // Unknown command - try AI response
        if (text.startsWith("/")) {
          await sendMessage(chatId, "🔮 Unknown command. Try /help");
        }
    }
  } else if (isGroup && (text.toLowerCase().includes("oracle") || text.toLowerCase().includes("@"))) {
    // Natural language response in groups when mentioned
    const aiResponse = await getAIResponse(text, chatId, userName);
    if (aiResponse) {
      await sendMessage(chatId, aiResponse);
    }
  } else if (!isGroup) {
    // DM - always respond
    const aiResponse = await getAIResponse(text, chatId, userName);
    if (aiResponse) {
      await sendMessage(chatId, aiResponse);
    }
  }
}

// ============ ALERT CHECKER ============

async function checkAlerts() {
  console.log("Checking alerts...");
  
  const { data: alerts } = await supabase
    .from("telegram_alerts")
    .select("*")
    .eq("is_active", true)
    .is("triggered_at", null);

  if (!alerts?.length) return { checked: 0, triggered: 0 };

  let triggered = 0;

  for (const alert of alerts) {
    try {
      let shouldTrigger = false;
      let currentValue = 0;
      let unit = "$";

      if (alert.alert_type === "price_above" || alert.alert_type === "price_below") {
        const price = await fetchPriceFromDexScreener(alert.token_or_chain);
        currentValue = price?.price || 0;
        if (alert.alert_type === "price_above" && currentValue >= alert.threshold_value) shouldTrigger = true;
        if (alert.alert_type === "price_below" && currentValue <= alert.threshold_value) shouldTrigger = true;
      } else if (alert.alert_type === "gas") {
        const gas = await fetchGas(alert.token_or_chain);
        currentValue = gas?.average || 0;
        unit = " Gwei";
        if (currentValue >= alert.threshold_value) shouldTrigger = true;
      }

      if (shouldTrigger) {
        const typeEmoji = alert.alert_type.includes("price") ? "💰" : "📊";
        await sendMessage(alert.telegram_chat_id, `
🚨 *ALERT TRIGGERED!*

${typeEmoji} *${alert.token_or_chain}*
📍 ${alert.alert_type.replace("_", " ")}
🎯 Target: ${unit === "$" ? "$" : ""}${alert.threshold_value}${unit !== "$" ? unit : ""}
📊 Current: ${unit === "$" ? "$" : ""}${currentValue.toLocaleString()}${unit !== "$" ? unit : ""}

_Real-time alert_
        `);

        await supabase
          .from("telegram_alerts")
          .update({ triggered_at: new Date().toISOString(), is_active: false })
          .eq("id", alert.id);

        triggered++;
      }
    } catch (e) {
      console.error(`Alert check failed: ${alert.id}`);
    }
  }

  return { checked: alerts.length, triggered };
}

// ============ MAIN SERVER ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    if (url.pathname.endsWith("/setup")) {
      const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-bot`;
      const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });
      return new Response(JSON.stringify(await response.json()), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname.endsWith("/cron")) {
      // Only check user alerts - no auto-updates
      const alerts = await checkAlerts();
      return new Response(JSON.stringify({ alerts, autoUpdates: "disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const update = await req.json();
    console.log("Update:", JSON.stringify(update).slice(0, 500));

    if (update.message) {
      await handleCommand(update.message);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
