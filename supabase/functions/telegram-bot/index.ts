import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY_1");

const WEBSITE_URL = "https://oraclebull.com";
const MASCOT_IMAGE = "https://oraclebull.com/oracle-bot-mascot.jpg";
const ORACLE_LOGO = "https://oraclebull.com/oracle-logo.jpg";
const COSMIC_HERO = "https://oraclebull.com/cosmic-oracle-hero.jpg";

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

// Generate live price chart using QuickChart API
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

// Fetch price history for chart
async function fetchPriceHistory(coinId: string, days = 7): Promise<{ prices: number[], labels: string[], change: number } | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    const data = await response.json();
    
    if (data.prices?.length > 0) {
      // Sample ~20 points for cleaner chart
      const step = Math.max(1, Math.floor(data.prices.length / 20));
      const sampled = data.prices.filter((_: any, i: number) => i % step === 0);
      
      const prices = sampled.map((p: number[]) => p[1]);
      const labels = sampled.map((p: number[]) => {
        const date = new Date(p[0]);
        return `${date.getMonth()+1}/${date.getDate()}`;
      });
      
      const firstPrice = data.prices[0][1];
      const lastPrice = data.prices[data.prices.length - 1][1];
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      return { prices, labels, change };
    }
    return null;
  } catch (error) {
    console.error("Error fetching price history:", error);
    return null;
  }
}

// Get coin ID from symbol
async function getCoinId(symbol: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
    const data = await response.json();
    return data.coins?.[0]?.id || null;
  } catch {
    return null;
  }
}

// ============ DATA FETCHING ============

async function fetchPrice(symbol: string) {
  try {
    const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
    const searchData = await searchResponse.json();
    
    if (searchData.coins?.length > 0) {
      const coin = searchData.coins[0];
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      const priceData = await priceResponse.json();
      if (priceData[coin.id]) {
        return {
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: priceData[coin.id].usd,
          change24h: priceData[coin.id].usd_24h_change,
          volume: priceData[coin.id].usd_24h_vol,
          marketCap: priceData[coin.id].usd_market_cap,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
}

async function fetchTopCoins(limit = 10) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching top coins:", error);
    return [];
  }
}

async function fetchTrending() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/search/trending");
    const data = await response.json();
    return data.coins?.slice(0, 7) || [];
  } catch (error) {
    console.error("Error fetching trending:", error);
    return [];
  }
}

async function fetchGas(chain: string) {
  try {
    const chainLower = chain.toLowerCase();
    const network = ALCHEMY_NETWORKS[chainLower] || "eth-mainnet";

    const response = await fetch(`https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1 }),
    });
    const data = await response.json();
    const gasGwei = parseInt(data.result, 16) / 1e9;
    return { slow: Math.round(gasGwei * 0.8), average: Math.round(gasGwei), fast: Math.round(gasGwei * 1.2) };
  } catch (error) {
    console.error("Error fetching gas:", error);
    return null;
  }
}

// Fetch comprehensive chain metrics from Alchemy
async function fetchChainMetrics(chain: string) {
  try {
    const chainLower = chain.toLowerCase();
    const network = ALCHEMY_NETWORKS[chainLower] || "eth-mainnet";
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

// Fetch token data for specific chain
async function fetchChainTokens(chain: string, limit = 5) {
  try {
    // Map chain to CoinGecko platform
    const platformMap: Record<string, string> = {
      ethereum: "ethereum",
      base: "base",
      arbitrum: "arbitrum-one",
      polygon: "polygon-pos",
      optimism: "optimistic-ethereum",
      avalanche: "avalanche",
      bsc: "binance-smart-chain",
      solana: "solana",
    };
    
    const platform = platformMap[chain.toLowerCase()] || "ethereum";
    
    // Get top tokens by market cap for the chain
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${platform}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      // Fallback to general market data
      const fallbackResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
      );
      return await fallbackResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching chain tokens:", error);
    return [];
  }
}

// Fetch DeFi TVL data
async function fetchDefiTVL(chain: string) {
  try {
    // Use DeFiLlama API for TVL data
    const response = await fetch("https://api.llama.fi/v2/chains");
    const data = await response.json();
    
    const chainMap: Record<string, string> = {
      ethereum: "Ethereum",
      base: "Base",
      arbitrum: "Arbitrum",
      polygon: "Polygon",
      optimism: "Optimism",
      avalanche: "Avalanche",
      bsc: "BSC",
      solana: "Solana",
    };
    
    const chainName = chainMap[chain.toLowerCase()] || "Ethereum";
    const chainData = data.find((c: any) => c.name === chainName);
    
    return chainData ? {
      tvl: chainData.tvl,
      change1d: chainData.change_1d,
      change7d: chainData.change_7d,
    } : null;
  } catch (error) {
    console.error("Error fetching TVL:", error);
    return null;
  }
}

async function fetchSentiment() {
  try {
    const response = await fetch("https://api.alternative.me/fng/?limit=1");
    const data = await response.json();
    return { fearGreed: data.data?.[0]?.value || "50", classification: data.data?.[0]?.value_classification || "Neutral" };
  } catch (error) {
    return { fearGreed: "50", classification: "Neutral" };
  }
}

async function fetchGlobalMarket() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/global");
    const data = await response.json();
    return {
      totalMarketCap: data.data?.total_market_cap?.usd,
      totalVolume: data.data?.total_volume?.usd,
      btcDominance: data.data?.market_cap_percentage?.btc,
      ethDominance: data.data?.market_cap_percentage?.eth,
      marketCapChange: data.data?.market_cap_change_percentage_24h_usd,
      activeCryptocurrencies: data.data?.active_cryptocurrencies,
    };
  } catch (error) {
    return null;
  }
}

function formatNumber(num: number): string {
  if (!num) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatNumberRaw(num: number): string {
  if (!num) return "N/A";
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

// Fetch crypto news from CoinGecko status updates
async function fetchCryptoNews() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/status_updates?per_page=5");
    const data = await response.json();
    return data.status_updates?.slice(0, 5) || [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

// Fetch whale transactions using Alchemy
async function fetchWhaleTransactions() {
  try {
    // Get latest block
    const blockResponse = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    });
    const blockData = await blockResponse.json();
    const latestBlock = blockData.result;

    // Get asset transfers for large ETH movements (>100 ETH)
    const transfersResponse = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
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

// ============ WALLET SCANNER ============

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
    const solBalance = (solBalanceData.result?.value || 0) / 1e9; // lamports to SOL

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

    // Try to get token metadata for known tokens
    const enrichedTokens = await enrichSolanaTokens(tokens);

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

// Enrich Solana tokens with metadata from known tokens
async function enrichSolanaTokens(tokens: any[]) {
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

    // Get native token balance (ETH, MATIC, etc.)
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
      ethereum: "ETH",
      eth: "ETH",
      polygon: "MATIC",
      matic: "MATIC",
      arbitrum: "ETH",
      arb: "ETH",
      base: "ETH",
      optimism: "ETH",
      opt: "ETH",
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
  // Auto-detect if it's a Solana address
  if (chain === "auto" || chain === "solana" || chain === "sol") {
    if (isSolanaAddress(address)) {
      return await fetchSolanaWalletBalances(address);
    }
  }
  
  // Default to EVM
  const evmChain = chain === "auto" ? "ethereum" : chain;
  return await fetchEvmWalletBalances(address, evmChain);
}

// Get token prices for wallet holdings
async function enrichWalletWithPrices(walletData: any) {
  if (!walletData) return null;
  
  try {
    // Get native token price (SOL or ETH/MATIC etc)
    const isSolana = walletData.chain === "solana";
    const nativeSymbol = walletData.nativeSymbol || (isSolana ? "SOL" : "ETH");
    const nativeCoinId = isSolana ? "solana" : (nativeSymbol === "MATIC" ? "matic-network" : "ethereum");
    
    const nativeData = await fetchPrice(nativeCoinId);
    const nativeUsdValue = (walletData.nativeBalance || 0) * (nativeData?.price || 0);
    
    // Try to get prices for tokens
    let totalTokenValue = 0;
    const enrichedTokens = [];
    
    for (const token of walletData.tokens.slice(0, 8)) {
      try {
        const priceData = await fetchPrice(token.symbol);
        const usdValue = priceData ? token.balance * priceData.price : 0;
        totalTokenValue += usdValue;
        
        enrichedTokens.push({
          ...token,
          price: priceData?.price || 0,
          usdValue,
          change24h: priceData?.change24h || 0,
        });
      } catch (e) {
        enrichedTokens.push({
          ...token,
          price: 0,
          usdValue: 0,
          change24h: 0,
        });
      }
    }
    
    // Sort by USD value
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

// Generate AI analysis for wallet
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
- Total Tokens: ${walletData.totalTokens || 0}

Provide: 1) Wallet type (whale/retail/degen/inactive), 2) Risk level, 3) One insight about holdings. Be concise.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a crypto wallet analyst. Give brief, actionable insights. No financial advice." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error analyzing wallet:", error);
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
  
  // Simple sentiment analysis
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

    // Update group learned topics
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
    // Get recent conversations
    const { data: conversations } = await supabase
      .from("telegram_conversations")
      .select("message_text, sentiment, topics, username")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(20);

    // Get group info
    const { data: group } = await supabase
      .from("telegram_groups")
      .select("learned_topics, community_sentiment")
      .eq("chat_id", chatId)
      .single();

    // Calculate community sentiment
    const sentiments = conversations?.map(c => c.sentiment) || [];
    const bullishCount = sentiments.filter(s => s === "bullish").length;
    const bearishCount = sentiments.filter(s => s === "bearish").length;
    
    let communitySentiment = "neutral";
    if (bullishCount > bearishCount * 1.5) communitySentiment = "bullish";
    else if (bearishCount > bullishCount * 1.5) communitySentiment = "bearish";

    // Update community sentiment
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
    const btcData = await fetchPrice("bitcoin");
    const ethData = await fetchPrice("ethereum");
    const sentiment = await fetchSentiment();
    const globalMarket = await fetchGlobalMarket();
    
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
Live Market Data:
- BTC: $${btcData?.price?.toLocaleString()} (${btcData?.change24h?.toFixed(2)}% 24h)
- ETH: $${ethData?.price?.toLocaleString()} (${ethData?.change24h?.toFixed(2)}% 24h)
- Total Market Cap: ${formatNumber(globalMarket?.totalMarketCap || 0)}
- Fear & Greed: ${sentiment?.fearGreed}/100 (${sentiment?.classification})
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

Examples of good responses:
- "BTC looking strong at 97k, ETH following. Sentiment's neutral rn"
- "Yeah that's a solid project, been around since 2021"
- "Nah wouldn't touch that, looks sketchy tbh"

${marketContext}

${userName ? `Talking to: ${userName}` : ""}`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 150,
        temperature: 0.9,
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

// Generate visual sentiment bar
function generateSentimentBar(value: number): string {
  const filled = Math.round(value / 10);
  const empty = 10 - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return bar;
}

async function generateMarketPulse() {
  const btcData = await fetchPrice("bitcoin");
  const ethData = await fetchPrice("ethereum");
  const sentiment = await fetchSentiment();
  const fgValue = parseInt(sentiment?.fearGreed || "50");
  const sentimentEmoji = fgValue <= 25 ? "😱" : fgValue <= 45 ? "😰" : fgValue >= 75 ? "🤑" : fgValue >= 55 ? "😊" : "😐";

  return `🔮 *ORACLE PULSE*
💎 BTC $${btcData?.price?.toLocaleString()} ${btcData?.change24h >= 0 ? "🟢" : "🔴"}${btcData?.change24h?.toFixed(1)}%
⟠ ETH $${ethData?.price?.toLocaleString()} ${ethData?.change24h >= 0 ? "🟢" : "🔴"}${ethData?.change24h?.toFixed(1)}%
${sentimentEmoji} F&G: ${sentiment?.fearGreed}/100
🌐 ${WEBSITE_URL}`;
}

// Short trending update
async function generateTrendingUpdate() {
  const trending = await fetchTrending();
  const list = trending.slice(0, 5).map((t: any, i: number) => {
    const item = t.item;
    const price = item?.data?.price ? `$${parseFloat(item.data.price).toFixed(4)}` : "";
    return `${i + 1}. *${item?.symbol?.toUpperCase()}* ${price}`;
  }).join("\n");

  return `🔥 *TRENDING NOW*\n${list}\n🔍 ${WEBSITE_PAGES.explorer}`;
}

// Short whale alert with real Etherscan link
function formatWhaleAlert(tx: any, ethPrice: number) {
  const value = tx.value || 0;
  const usdValue = value * ethPrice;
  const txHash = tx.hash || tx.uniqueId || "";
  const etherscanLink = txHash ? `https://etherscan.io/tx/${txHash}` : "https://etherscan.io";
  
  return `🐋 *WHALE ALERT*
${value.toFixed(1)} ETH (${formatNumber(usdValue)})
📤 ${tx.from?.slice(0, 10)}...
📥 ${tx.to?.slice(0, 10)}...
🔗 [View TX](${etherscanLink})
📊 ${WEBSITE_PAGES.dashboard}`;
}

// Short news update
async function generateNewsUpdate() {
  const news = await fetchCryptoNews();
  if (!news.length) return null;
  
  const headlines = news.slice(0, 3).map((n: any, i: number) => 
    `${i + 1}. ${n.project?.name || "Crypto"}: ${(n.description || "").slice(0, 50)}...`
  ).join("\n");

  return `📰 *CRYPTO NEWS*\n${headlines}\n📚 ${WEBSITE_PAGES.learn}`;
}

// Generate social sentiment update
async function generateSocialSentimentUpdate() {
  const sentiment = await fetchSentiment();
  const fgValue = parseInt(sentiment?.fearGreed || "50");
  const bar = generateSentimentBar(fgValue);
  
  let mood = "Neutral";
  let emoji = "😐";
  if (fgValue <= 20) { mood = "Extreme Fear"; emoji = "😱"; }
  else if (fgValue <= 40) { mood = "Fear"; emoji = "😰"; }
  else if (fgValue >= 80) { mood = "Extreme Greed"; emoji = "🤑"; }
  else if (fgValue >= 60) { mood = "Greed"; emoji = "😊"; }
  
  const global = await fetchGlobalMarket();
  
  return `🎭 *SOCIAL SENTIMENT*
${emoji} ${mood}
${bar} ${fgValue}/100
📈 24h MCap: ${global?.marketCapChange?.toFixed(1) || 0}%
₿ BTC Dom: ${global?.btcDominance?.toFixed(1) || 0}%
🔗 ${WEBSITE_PAGES.sentiment}`;
}

// Generate random chain update
async function generateRandomChainUpdate() {
  const chains = ["ethereum", "base", "arbitrum", "polygon", "optimism"];
  const randomChain = chains[Math.floor(Math.random() * chains.length)];
  
  const metrics = await fetchChainMetrics(randomChain);
  const tvl = await fetchDefiTVL(randomChain);
  
  if (!metrics) return null;
  
  const chainNames: Record<string, string> = {
    ethereum: "Ethereum ⟠",
    base: "Base 🔵",
    arbitrum: "Arbitrum 🔶",
    polygon: "Polygon 💜",
    optimism: "Optimism 🔴",
  };
  
  return `⛓️ *${chainNames[randomChain] || randomChain.toUpperCase()}*
📦 Block: ${metrics.blockNumber.toLocaleString()}
⛽ Gas: ${metrics.gasPrice} Gwei
${tvl ? `💰 TVL: ${formatNumber(tvl.tvl)}` : ""}
🔗 ${CHAIN_PAGES[randomChain] || CHAIN_PAGES.ethereum}`;
}

// Generate crypto tip/fact
function generateCryptoTip() {
  const tips = [
    { tip: "Never share your seed phrase with anyone - not even support!", emoji: "🔐" },
    { tip: "DCA (Dollar Cost Average) helps reduce volatility impact", emoji: "📊" },
    { tip: "Gas fees are lowest on weekends and late night UTC", emoji: "⛽" },
    { tip: "Always verify contract addresses before swapping", emoji: "✅" },
    { tip: "Hardware wallets provide the best security for hodlers", emoji: "🔒" },
    { tip: "Staking rewards vary by validator - research first!", emoji: "💎" },
    { tip: "Layer 2s like Base & Arbitrum offer cheaper transactions", emoji: "⚡" },
    { tip: "Impermanent loss affects LP positions during volatility", emoji: "📉" },
    { tip: "Check TVL trends before depositing into protocols", emoji: "💰" },
    { tip: "Fear & Greed extremes often signal reversal opportunities", emoji: "🎭" },
  ];
  
  const random = tips[Math.floor(Math.random() * tips.length)];
  return `${random.emoji} *CRYPTO TIP*
${random.tip}
📚 ${WEBSITE_PAGES.learn}`;
}

// Generate top movers update
async function generateTopMoversUpdate() {
  const coins = await fetchTopCoins(20);
  if (!coins.length) return null;
  
  // Sort by 24h change
  const sorted = [...coins].sort((a: any, b: any) => 
    (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
  );
  
  const topGainer = sorted[0];
  const topLoser = sorted[sorted.length - 1];
  
  return `📊 *TOP MOVERS*
🚀 ${topGainer?.symbol?.toUpperCase()}: +${topGainer?.price_change_percentage_24h?.toFixed(1)}%
📉 ${topLoser?.symbol?.toUpperCase()}: ${topLoser?.price_change_percentage_24h?.toFixed(1)}%
🔍 ${WEBSITE_PAGES.dashboard}`;
}

// Generate chart preview for tokens - returns { chartUrl, caption }
async function generateTokenChart(symbol: string): Promise<{ chartUrl: string; caption: string } | null> {
  const coinId = await getCoinId(symbol);
  if (!coinId) return null;
  
  const [priceData, history] = await Promise.all([
    fetchPrice(symbol),
    fetchPriceHistory(coinId, 7)
  ]);
  
  if (!priceData || !history) return null;
  
  const change = history.change;
  const chartUrl = generateChartUrl(priceData.symbol, history.prices, history.labels, change >= 0);
  
  const caption = `${change >= 0 ? "📈" : "📉"} *${priceData.symbol}* $${priceData.price?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
7D: ${change >= 0 ? "+" : ""}${change.toFixed(1)}%
Vol: ${formatNumber(priceData.volume)} | MCap: ${formatNumber(priceData.marketCap)}`;
  
  return { chartUrl, caption };
}

// Generate sentiment visual
async function generateSentimentVisual() {
  const sentiment = await fetchSentiment();
  const fgValue = parseInt(sentiment?.fearGreed || "50");
  const bar = generateSentimentBar(fgValue);
  let status = "NEUTRAL 😐";
  if (fgValue <= 20) status = "EXTREME FEAR 😱";
  else if (fgValue <= 40) status = "FEAR 😰";
  else if (fgValue >= 80) status = "EXTREME GREED 🤑";
  else if (fgValue >= 60) status = "GREED 😊";
  
  return `🎭 *SENTIMENT*\n${bar} ${fgValue}/100\n*${status}*\n🎭 ${WEBSITE_PAGES.sentiment}`;
}

// Generate comprehensive chain overview with website image
async function generateChainOverview(chain: string) {
  const chainLower = chain.toLowerCase();
  const metrics = await fetchChainMetrics(chainLower);
  const tvl = await fetchDefiTVL(chainLower);
  const tokens = await fetchChainTokens(chainLower, 3);
  
  if (!metrics) return null;
  
  const chainNames: Record<string, string> = {
    ethereum: "Ethereum",
    eth: "Ethereum", 
    base: "Base",
    arbitrum: "Arbitrum",
    arb: "Arbitrum",
    polygon: "Polygon",
    matic: "Polygon",
    optimism: "Optimism",
    opt: "Optimism",
    solana: "Solana",
    sol: "Solana",
    avalanche: "Avalanche",
    avax: "Avalanche",
    bsc: "BNB Chain",
    bnb: "BNB Chain",
  };
  
  const displayName = chainNames[chainLower] || chain.toUpperCase();
  const chainKey = Object.keys(CHAIN_PAGES).find(k => chainLower.includes(k)) || "ethereum";
  const chainUrl = CHAIN_PAGES[chainKey] || CHAIN_PAGES.ethereum;
  
  let topTokens = "";
  if (tokens && tokens.length > 0) {
    topTokens = tokens.slice(0, 3).map((t: any) => {
      const change = t.price_change_percentage_24h || 0;
      const emoji = change >= 0 ? "🟢" : "🔴";
      return `${t.symbol?.toUpperCase()}: $${t.current_price?.toLocaleString()} ${emoji}${change.toFixed(1)}%`;
    }).join("\n");
  }
  
  return {
    text: `⛓️ *${displayName} Overview*

📊 *Network Stats*
Block: ${metrics.blockNumber.toLocaleString()}
Gas: ${metrics.gasPrice} Gwei${metrics.baseFee ? ` (Base: ${metrics.baseFee})` : ""}
TXs/Block: ~${metrics.txCount}
${tvl ? `TVL: ${formatNumber(tvl.tvl)} ${tvl.change1d >= 0 ? "🟢" : "🔴"}${tvl.change1d?.toFixed(1)}%` : ""}

${topTokens ? `📈 *Top Tokens*\n${topTokens}` : ""}

🔗 ${chainUrl}`,
    chainUrl,
  };
}

// Generate global market overview
async function generateGlobalOverview() {
  const global = await fetchGlobalMarket();
  const sentiment = await fetchSentiment();
  const btc = await fetchPrice("bitcoin");
  const eth = await fetchPrice("ethereum");
  
  if (!global) return null;
  
  const fgValue = parseInt(sentiment?.fearGreed || "50");
  const sentimentBar = generateSentimentBar(fgValue);
  
  return `🌐 *GLOBAL MARKET*

💎 *BTC* $${btc?.price?.toLocaleString()} ${btc?.change24h >= 0 ? "🟢" : "🔴"}${btc?.change24h?.toFixed(1)}%
⟠ *ETH* $${eth?.price?.toLocaleString()} ${eth?.change24h >= 0 ? "🟢" : "🔴"}${eth?.change24h?.toFixed(1)}%

📊 Total MCap: ${formatNumber(global.totalMarketCap)}
📈 24h Vol: ${formatNumber(global.totalVolume)}
₿ BTC Dom: ${global.btcDominance?.toFixed(1)}%
⟠ ETH Dom: ${global.ethDominance?.toFixed(1)}%

${sentimentBar} F&G: ${fgValue}/100

🌐 ${WEBSITE_PAGES.dashboard}`;
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
    
    // Learn from conversation
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

*📊 Market Data*
/price <TOKEN> - Live prices
/chart <TOKEN> - Token chart
/chain <NAME> - Chain overview
/global - Global market

*🔍 Research*
/wallet <ADDRESS> - Scan any wallet
/trending - Hot tokens
/whales - Whale activity

*🔔 Smart Alerts*
/alert - Set any alert
/myalerts - Your alerts

*🤖 AI Features*
/analyze <TOKEN> - Deep analysis
/ask <anything> - Ask me anything

*🗳️ Community*
/poll, /vibe, /insights

💬 Or just chat with me naturally!
        `);
        break;

      case "/help":
        await sendMessage(chatId, `
🔮 *Oracle Bot Commands*

*Market:*
/price btc eth sol - Live prices
/chart btc - Token chart
/gas eth base - Gas fees
/chain ethereum - Chain stats
/global - Global market

*Wallet Scanner:*
/wallet 0x... - Scan EVM wallet
/wallet ABC... - Scan Solana wallet (auto-detect)
/wallet 0x... base - Specify chain

*Research:*
/trending - Hot tokens
/whales - Whale moves
/analyze btc - AI analysis

*Alerts:*
/alert price BTC above 100000
/alert sentiment fear
/myalerts - View alerts

*Community:*
/poll, /vibe, /insights

*AI:*
/ask, /learn, /compare

💬 I also respond naturally!
        `);
        break;

      case "/price":
        if (args.length === 0) {
          await sendMessage(chatId, "🔮 Which token? Try: `/price btc` or `/price eth sol ada`");
          break;
        }
        // Support multiple tokens
        const tokens = args.slice(0, 5);
        let priceMsg = "📊 *Live Prices*\n\n";
        
        for (const t of tokens) {
          const data = await fetchPrice(t);
          if (data) {
            const emoji = data.change24h >= 0 ? "🟢" : "🔴";
            priceMsg += `*${data.symbol}* $${data.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${emoji}${data.change24h?.toFixed(1)}%\n`;
          }
        }
        priceMsg += "\n_Not financial advice._";
        await sendMessage(chatId, priceMsg);
        break;

      case "/gas":
        const chain = args[0]?.toLowerCase() || "eth";
        const gasData = await fetchGas(chain);
        if (gasData) {
          await sendMessage(chatId, `⛽ *${chain.toUpperCase()} Gas*\n🐢 ${gasData.slow} | 🚶 ${gasData.average} | 🚀 ${gasData.fast} Gwei`);
        } else {
          await sendMessage(chatId, "❌ Try: eth, polygon, arbitrum, base, optimism");
        }
        break;

      case "/trending":
        const trending = await fetchTrending();
        let trendMsg = "🔥 *Trending Now*\n\n";
        trending.slice(0, 10).forEach((t: any, i: number) => {
          const item = t.item;
          trendMsg += `${i + 1}. *${item?.symbol?.toUpperCase()}* - ${item?.name}\n`;
        });
        await sendMessage(chatId, trendMsg);
        break;

      case "/news":
        const newsUpdate = await generateNewsUpdate();
        if (newsUpdate) {
          await sendMessage(chatId, newsUpdate);
        } else {
          await sendMessage(chatId, "📰 No news available right now");
        }
        break;

      case "/whales":
        await sendMessage(chatId, "🐋 Scanning for whale activity...");
        const ethPrice = (await fetchPrice("ethereum"))?.price || 3000;
        const whaleTxs = await fetchWhaleTransactions();
        if (whaleTxs.length > 0) {
          let whaleMsg = "🐋 *RECENT WHALE MOVES*\n";
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
          await sendMessage(chatId, `🔍 *Wallet Scanner*

Scan any EVM or Solana wallet for holdings & AI insights!

Usage:
\`/wallet 0x1234...abcd\` (EVM)
\`/wallet ABC...xyz\` (Solana - auto-detected)
\`/wallet 0x... base\` (specify chain)

Supported: ethereum, base, arbitrum, polygon, optimism, solana`);
          break;
        }
        
        const walletAddress = args[0];
        const walletChain = args[1]?.toLowerCase() || "auto";
        
        // Validate address format - support both EVM and Solana
        const isEvmAddress = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
        const isSolAddress = isSolanaAddress(walletAddress);
        
        if (!isEvmAddress && !isSolAddress) {
          await sendMessage(chatId, "❌ Invalid address format.\n\nEVM: `0x` + 40 hex chars\nSolana: 32-44 base58 chars");
          break;
        }
        
        const detectedChain = isSolAddress ? "solana" : (walletChain === "auto" ? "ethereum" : walletChain);
        await sendMessage(chatId, `🔍 Scanning ${isSolAddress ? "Solana" : detectedChain.toUpperCase()} wallet...`);
        
        try {
          const walletData = await fetchWalletBalances(walletAddress, detectedChain);
          
          if (!walletData) {
            await sendMessage(chatId, "❌ Could not scan wallet. Try again.");
            break;
          }
          
          // Enrich with prices
          const enrichedWallet = await enrichWalletWithPrices(walletData);
          const isSolanaWallet = enrichedWallet.chain === "solana";
          const nativeSymbol = enrichedWallet.nativeSymbol || (isSolanaWallet ? "SOL" : "ETH");
          
          // Explorer link based on chain
          const explorerLinks: Record<string, string> = {
            ethereum: `https://etherscan.io/address/${walletAddress}`,
            base: `https://basescan.org/address/${walletAddress}`,
            arbitrum: `https://arbiscan.io/address/${walletAddress}`,
            polygon: `https://polygonscan.com/address/${walletAddress}`,
            optimism: `https://optimistic.etherscan.io/address/${walletAddress}`,
            solana: `https://solscan.io/account/${walletAddress}`,
          };
          const explorerLink = explorerLinks[enrichedWallet.chain] || explorerLinks.ethereum;
          
          // Format holdings
          let holdingsMsg = `🔍 *WALLET SCAN*

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
          
          // Generate AI analysis
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
          await sendMessage(chatId, "❌ Chain not found. Try: ethereum, base, arbitrum, polygon");
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

      case "/sentimentvisual":
      case "/fng":
      case "/feargreed":
        const sentimentVisual = await generateSentimentVisual();
        await sendPhoto(chatId, MASCOT_IMAGE, sentimentVisual);
        break;

      case "/sentiment":
        const sent = await fetchSentiment();
        const fgVal = parseInt(sent?.fearGreed || "50");
        const emoji = fgVal <= 25 ? "😱 EXTREME FEAR" : fgVal <= 45 ? "😰 FEAR" : fgVal >= 75 ? "🤑 EXTREME GREED" : fgVal >= 55 ? "😊 GREED" : "😐 NEUTRAL";
        const sentBar = generateSentimentBar(fgVal);
        await sendMessage(chatId, `🎭 *Market Sentiment*\n\n${emoji}\n\n${sentBar} *${sent?.fearGreed}/100*\n\n🎭 [Full Analysis](${WEBSITE_PAGES.sentiment})`);
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

_Your cosmic crypto companion!_
        `);
        break;

      case "/alert":
        if (args.length < 3) {
          await sendMessage(chatId, `
🔔 *Smart Alerts*

*Price Alerts:*
/alert price BTC above 100000
/alert price ETH below 3000

*Sentiment Alerts:*
/alert sentiment fear
/alert sentiment greed

*Whale Alerts:*
/alert whale BTC 1000000

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
        } else if (alertType === "sentiment") {
          const type = args[1].toLowerCase();
          const threshold = type === "fear" ? 25 : type === "greed" ? 75 : 50;
          const dbType = type === "fear" ? "sentiment_fear" : "sentiment_greed";
          success = await createAlert(userId, chatId, dbType, "market", threshold);
          alertMsg = `🎭 Sentiment ${type} alert`;
        } else if (alertType === "whale") {
          const token = args[1].toUpperCase();
          const minValue = parseFloat(args[2]) || 1000000;
          success = await createAlert(userId, chatId, "whale", token, minValue);
          alertMsg = `🐋 ${token} whale moves > $${formatNumber(minValue)}`;
        } else if (alertType === "volume") {
          const token = args[1].toUpperCase();
          success = await createAlert(userId, chatId, "volume_spike", token, 100);
          alertMsg = `📈 ${token} volume spike`;
        } else if (alertType === "trending") {
          const token = args[1].toUpperCase();
          success = await createAlert(userId, chatId, "trending", token, 1);
          alertMsg = `🔥 ${token} trending alert`;
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
            const emoji = a.alert_type.includes("price") ? "💰" : a.alert_type.includes("sentiment") ? "🎭" : a.alert_type.includes("whale") ? "🐋" : "📊";
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

      case "/analyze":
        if (args.length === 0) {
          await sendMessage(chatId, "🔮 Analyze what? `/analyze eth`");
          break;
        }
        await sendMessage(chatId, "🔮 Consulting the cosmic charts...");
        const analysis = await getAIResponse(
          `Provide a concise technical analysis for ${args[0]}. Include: current trend, key levels, volume analysis, and 24h outlook. Be specific with numbers.`,
          chatId, userName
        );
        await sendMessage(chatId, analysis || "❌ Could not analyze. Try again.");
        break;

      case "/ask":
        if (argText.length < 3) {
          await sendMessage(chatId, "🔮 Ask me anything! `/ask what is impermanent loss?`");
          break;
        }
        const answer = await getAIResponse(argText, chatId, userName);
        await sendMessage(chatId, answer || "❌ Could not process. Try again.");
        break;

      case "/learn":
        const topic = argText || "crypto basics";
        const lesson = await getAIResponse(
          `Explain ${topic} in simple terms for someone learning crypto. Be educational, use examples, keep under 150 words.`,
          chatId, userName
        );
        await sendMessage(chatId, `📚 *Learn: ${topic}*\n\n${lesson || "Could not generate lesson."}`);
        break;

      case "/compare":
        if (args.length < 2) {
          await sendMessage(chatId, "⚖️ Compare tokens: `/compare btc vs eth`");
          break;
        }
        const tokenA = args[0].toUpperCase();
        const tokenB = args.find((a: string) => a.toLowerCase() !== "vs" && a.toUpperCase() !== tokenA)?.toUpperCase() || "ETH";
        
        const [dataA, dataB] = await Promise.all([fetchPrice(tokenA), fetchPrice(tokenB)]);
        
        if (dataA && dataB) {
          await sendMessage(chatId, `
⚖️ *${tokenA} vs ${tokenB}*

*${tokenA}*
💰 $${dataA.price?.toLocaleString()}
📊 24h: ${dataA.change24h?.toFixed(2)}%
💎 MCap: ${formatNumber(dataA.marketCap)}

*${tokenB}*
💰 $${dataB.price?.toLocaleString()}
📊 24h: ${dataB.change24h?.toFixed(2)}%
💎 MCap: ${formatNumber(dataB.marketCap)}

_Not financial advice._
          `);
        }
        break;

      default:
        // Unknown command - use AI
        const aiResp = await getAIResponse(text, chatId, userName);
        if (aiResp) await sendMessage(chatId, aiResp);
        else await sendMessage(chatId, "❓ Unknown command. Try /help");
        break;
    }
  } else {
    // Natural language - respond in groups only when mentioned
    const botMentioned = text.toLowerCase().includes("oracle") || 
                         text.toLowerCase().includes("@oraclebot") ||
                         message.reply_to_message?.from?.is_bot;
    
    if (!isGroup || botMentioned) {
      const response = await getAIResponse(text, chatId, userName);
      if (response) await sendMessage(chatId, response);
    }
  }
}

// ============ AUTO UPDATES & ALERTS ============

// Update types for rotation
const UPDATE_TYPES = [
  "pulse",
  "sentiment", 
  "chain",
  "trending",
  "tip",
  "movers",
  "whale",
];

async function sendAutoUpdates() {
  console.log("Running auto updates...");
  
  const { data: groups } = await supabase
    .from("telegram_groups")
    .select("*")
    .eq("is_active", true)
    .eq("auto_digest", true);

  if (!groups?.length) return { sent: 0, type: "none" };

  let sent = 0;
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  
  // Rotate update type based on time (changes every 10 min cycle)
  const cycleIndex = Math.floor((currentHour * 6 + Math.floor(currentMinute / 10)) % UPDATE_TYPES.length);
  const updateType = UPDATE_TYPES[cycleIndex];
  
  console.log(`Update type for this cycle: ${updateType}`);

  // Generate the appropriate update
  let updateContent: string | null = null;
  let usePhoto = false;
  
  switch (updateType) {
    case "pulse":
      updateContent = await generateMarketPulse();
      break;
    case "sentiment":
      updateContent = await generateSocialSentimentUpdate();
      break;
    case "chain":
      updateContent = await generateRandomChainUpdate();
      break;
    case "trending":
      updateContent = await generateTrendingUpdate();
      break;
    case "tip":
      updateContent = generateCryptoTip();
      break;
    case "movers":
      updateContent = await generateTopMoversUpdate();
      break;
    case "whale":
      const ethPrice = (await fetchPrice("ethereum"))?.price || 3000;
      const whaleTxs = await fetchWhaleTransactions();
      if (whaleTxs.length > 0) {
        updateContent = formatWhaleAlert(whaleTxs[0], ethPrice);
      } else {
        // Fallback to pulse if no whale activity
        updateContent = await generateMarketPulse();
      }
      break;
    default:
      updateContent = await generateMarketPulse();
  }

  if (!updateContent) {
    updateContent = await generateMarketPulse();
  }

  for (const group of groups) {
    try {
      if (usePhoto) {
        await sendPhoto(group.chat_id, MASCOT_IMAGE, updateContent);
      } else {
        await sendMessage(group.chat_id, updateContent);
      }
      sent++;
      await new Promise(r => setTimeout(r, 150));
    } catch (e) {
      console.error(`Failed to send to ${group.chat_id}:`, e);
    }
  }

  return { sent, type: updateType };
}

// Check for whale transactions and alert groups (runs separately for big whales)
async function checkWhaleActivity() {
  console.log("Checking whale activity...");
  
  const { data: groups } = await supabase
    .from("telegram_groups")
    .select("*")
    .eq("is_active", true);

  if (!groups?.length) return { whales: 0 };

  const ethPrice = (await fetchPrice("ethereum"))?.price || 3000;
  const whaleTxs = await fetchWhaleTransactions();
  
  // Only alert on VERY large transactions (>1000 ETH = ~$3M+) for instant alerts
  const bigWhales = whaleTxs.filter((tx: any) => tx.value && tx.value > 1000);
  
  if (bigWhales.length === 0) return { whales: 0 };

  let alertsSent = 0;
  for (const group of groups) {
    try {
      const whale = bigWhales[0];
      const msg = `🚨 *MAJOR WHALE DETECTED!*\n\n${formatWhaleAlert(whale, ethPrice)}`;
      await sendPhoto(group.chat_id, MASCOT_IMAGE, msg);
      alertsSent++;
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.error(`Whale alert failed:`, e);
    }
  }

  return { whales: alertsSent };
}

async function checkAlerts() {
  console.log("Checking alerts...");
  
  const { data: alerts } = await supabase
    .from("telegram_alerts")
    .select("*")
    .eq("is_active", true)
    .is("triggered_at", null);

  if (!alerts?.length) return { checked: 0, triggered: 0 };

  let triggered = 0;
  const sentiment = await fetchSentiment();
  const fgValue = parseInt(sentiment?.fearGreed || "50");

  for (const alert of alerts) {
    try {
      let shouldTrigger = false;
      let currentValue = 0;
      let unit = "$";

      if (alert.alert_type === "price_above" || alert.alert_type === "price_below") {
        const price = await fetchPrice(alert.token_or_chain);
        currentValue = price?.price || 0;
        if (alert.alert_type === "price_above" && currentValue >= alert.threshold_value) shouldTrigger = true;
        if (alert.alert_type === "price_below" && currentValue <= alert.threshold_value) shouldTrigger = true;
      } else if (alert.alert_type === "gas") {
        const gas = await fetchGas(alert.token_or_chain);
        currentValue = gas?.average || 0;
        unit = " Gwei";
        if (currentValue >= alert.threshold_value) shouldTrigger = true;
      } else if (alert.alert_type === "sentiment_fear") {
        currentValue = fgValue;
        unit = "";
        if (fgValue <= alert.threshold_value) shouldTrigger = true;
      } else if (alert.alert_type === "sentiment_greed") {
        currentValue = fgValue;
        unit = "";
        if (fgValue >= alert.threshold_value) shouldTrigger = true;
      }

      if (shouldTrigger) {
        const typeEmoji = alert.alert_type.includes("price") ? "💰" : alert.alert_type.includes("sentiment") ? "🎭" : "📊";
        await sendMessage(alert.telegram_chat_id, `
🚨 *ALERT TRIGGERED!*

${typeEmoji} *${alert.token_or_chain}*
📍 ${alert.alert_type.replace("_", " ")}
🎯 Target: ${unit === "$" ? "$" : ""}${alert.threshold_value}${unit !== "$" ? unit : ""}
📊 Current: ${unit === "$" ? "$" : ""}${currentValue.toLocaleString()}${unit !== "$" ? unit : ""}

_For informational purposes. Not financial advice._
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
      const updates = await sendAutoUpdates();
      const alerts = await checkAlerts();
      const whales = await checkWhaleActivity();
      return new Response(JSON.stringify({ updates, alerts, whales }), {
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
