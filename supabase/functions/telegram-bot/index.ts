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
};

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
            content: `You are Oracle Bot 🔮, a wise and friendly crypto oracle for the Oracle community. You have cosmic insight into the crypto markets!

Personality:
- Mystical but approachable - use cosmic language occasionally ("The stars reveal...", "My cosmic vision shows...")
- Knowledgeable about ALL crypto topics: DeFi, NFTs, trading, staking, airdrops, protocols, chains, etc.
- NEVER give financial advice - always neutral and educational
- Keep responses under 200 words, use emojis sparingly
- Reference the group's interests when relevant
- Be helpful for both beginners and experienced traders
- End market discussions with "For informational purposes. Not financial advice."

${marketContext}

${userName ? `Speaking to: ${userName}` : ""}`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 600,
        temperature: 0.8,
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

// Generate chart preview for tokens
async function generateTokenChart(symbol: string) {
  const data = await fetchPrice(symbol);
  if (!data) return null;
  
  const change = data.change24h || 0;
  const bars = Math.abs(Math.round(change / 2));
  const barChar = change >= 0 ? "🟢" : "🔴";
  const chartBar = barChar.repeat(Math.min(bars, 8));
  
  return `${change >= 0 ? "📈" : "📉"} *${data.symbol}* $${data.price?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
${chartBar || "⚪"} ${change >= 0 ? "+" : ""}${change.toFixed(1)}%
Vol: ${formatNumber(data.volume)} | MCap: ${formatNumber(data.marketCap)}`;
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
/chart <TOKEN> - Token chart visual
/gas <CHAIN> - Gas fees
/chain <NAME> - Chain overview
/global - Global market
/trending - Hot tokens

*🔔 Smart Alerts*
/alert - Set any type of alert
/myalerts - View your alerts

*🗳️ Community*
/poll <question> - Create a poll
/vibe - Group sentiment
/insights - What we talk about

*🤖 AI Features*
/analyze <TOKEN> - Deep analysis
/ask <anything> - Ask me anything
/learn <topic> - Crypto education
/compare <A> vs <B> - Compare tokens

*📌 More*
/sentimentvisual - Sentiment with visual
/pin <message> - Pin insight
/website - Explore Oracle website

💬 Or just chat with me naturally!
        `);
        break;

      case "/help":
        await sendMessage(chatId, `
🔮 *Oracle Bot Commands*

*Prices & Charts:*
/price btc eth sol
/chart btc - Visual chart
/gas eth base polygon

*Chains & Markets:*
/chain ethereum - Chain overview
/chain base, /chain arbitrum
/global - Global market stats
/trending - Hot tokens
/pulse - Market pulse

*Alerts:* 
/alert price BTC above 100000
/alert sentiment fear/greed
/alert whale BTC 1000000

*Community:*
/poll Question here?
/vibe, /insights

*AI:*
/analyze, /ask, /learn, /compare

*Website:*
/website - Oracle website links

💬 I also respond to natural questions!
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
        const chartData = await generateTokenChart(args[0]);
        if (chartData) {
          await sendPhoto(chatId, MASCOT_IMAGE, chartData);
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
