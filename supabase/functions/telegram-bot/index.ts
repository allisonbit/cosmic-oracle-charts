import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY_1");

const WEBSITE_URL = "https://oracle-crypto.lovable.app";

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
    let network = "eth-mainnet";
    if (chain.toLowerCase() === "polygon") network = "polygon-mainnet";
    if (chain.toLowerCase() === "arbitrum") network = "arb-mainnet";
    if (chain.toLowerCase() === "base") network = "base-mainnet";
    if (chain.toLowerCase() === "optimism") network = "opt-mainnet";

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
      marketCapChange: data.data?.market_cap_change_percentage_24h_usd,
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

async function generateMarketPulse() {
  const btcData = await fetchPrice("bitcoin");
  const ethData = await fetchPrice("ethereum");
  const solData = await fetchPrice("solana");
  const sentiment = await fetchSentiment();
  const globalMarket = await fetchGlobalMarket();
  const gasData = await fetchGas("eth");
  const trending = await fetchTrending();

  const fgValue = parseInt(sentiment?.fearGreed || "50");
  let sentimentEmoji = fgValue <= 25 ? "😱" : fgValue <= 45 ? "😰" : fgValue >= 75 ? "🤑" : fgValue >= 55 ? "😊" : "😐";

  const btcChange = btcData?.change24h || 0;
  const marketTrend = btcChange >= 2 ? "🚀 BULLISH" : btcChange <= -2 ? "📉 BEARISH" : "➡️ SIDEWAYS";

  const trendingList = trending.slice(0, 5).map((t: any, i: number) => 
    `${i + 1}. ${t.item?.symbol?.toUpperCase() || "?"}`
  ).join(" | ");

  return `
🔮 *ORACLE MARKET PULSE*
_${new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} UTC_

━━━━━━━━━━━━━━━━━━━━

📊 *MARKET*
💰 Cap: ${formatNumber(globalMarket?.totalMarketCap || 0)} (${globalMarket?.marketCapChange?.toFixed(1)}%)
📈 Trend: ${marketTrend}

━━━━━━━━━━━━━━━━━━━━

💎 *BTC* $${btcData?.price?.toLocaleString()} ${btcData?.change24h >= 0 ? "🟢" : "🔴"}${btcData?.change24h?.toFixed(1)}%
⟠ *ETH* $${ethData?.price?.toLocaleString()} ${ethData?.change24h >= 0 ? "🟢" : "🔴"}${ethData?.change24h?.toFixed(1)}%
◎ *SOL* $${solData?.price?.toLocaleString()} ${solData?.change24h >= 0 ? "🟢" : "🔴"}${solData?.change24h?.toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━

🔥 *TRENDING*
${trendingList}

━━━━━━━━━━━━━━━━━━━━

${sentimentEmoji} Sentiment: ${sentiment?.fearGreed}/100 | ⛽ Gas: ${gasData?.average} Gwei

🌐 ${WEBSITE_URL}
_For informational purposes. Not financial advice._
  `;
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
        await sendMessage(chatId, `
🔮 *Welcome to Oracle Bot!*

I am the Cosmic Oracle - your intelligent crypto companion. I learn from our conversations and provide real-time insights!

*📊 Market Data*
/price <TOKEN> - Live prices
/gas <CHAIN> - Gas fees
/trending - Hot tokens
/pulse - Full market update

*🔔 Smart Alerts*
/alert - Set any type of alert
/myalerts - View your alerts

*🗳️ Community*
/poll <question> - Create a poll
/vote - Current polls
/vibe - Group sentiment
/insights - What we talk about

*🤖 AI Features*
/analyze <TOKEN> - Deep analysis
/ask <anything> - Ask me anything
/learn <topic> - Crypto education
/compare <A> vs <B> - Compare tokens

*📌 More*
/pin <message> - Pin insight
/digest - Summary
/help - All commands

💬 Or just chat with me naturally!

🌐 ${WEBSITE_URL}
        `);
        break;

      case "/help":
        await sendMessage(chatId, `
🔮 *Oracle Bot Commands*

*Prices:* /price btc, /price eth sol ada
*Gas:* /gas eth, /gas base
*Trending:* /trending
*Market:* /pulse, /digest

*Alerts:* 
/alert price BTC above 100000
/alert price ETH below 3000
/alert sentiment fear (when F&G < 25)
/alert sentiment greed (when F&G > 75)
/alert whale BTC 1000000 (whale moves)
/alert trending SOL (if SOL trends)

*Community:*
/poll Will BTC hit 100k this month?
/vibe - Group mood
/insights - Hot topics

*AI:*
/analyze, /ask, /learn, /compare

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

      case "/pulse":
      case "/digest":
      case "/market":
        const pulse = await generateMarketPulse();
        await sendMessage(chatId, pulse);
        break;

      case "/sentiment":
        const sent = await fetchSentiment();
        const fgVal = parseInt(sent?.fearGreed || "50");
        const emoji = fgVal <= 25 ? "😱 EXTREME FEAR" : fgVal <= 45 ? "😰 FEAR" : fgVal >= 75 ? "🤑 EXTREME GREED" : fgVal >= 55 ? "😊 GREED" : "😐 NEUTRAL";
        await sendMessage(chatId, `🎭 *Market Sentiment*\n\n${emoji}\n📊 Fear & Greed: *${sent?.fearGreed}/100*`);
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

async function sendAutoUpdates() {
  console.log("Running auto updates...");
  
  const { data: groups } = await supabase
    .from("telegram_groups")
    .select("*")
    .eq("is_active", true)
    .eq("auto_digest", true);

  if (!groups?.length) return { sent: 0 };

  const pulse = await generateMarketPulse();
  let sent = 0;

  for (const group of groups) {
    try {
      await sendMessage(group.chat_id, pulse);
      sent++;
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.error(`Failed to send to ${group.chat_id}`);
    }
  }

  return { sent };
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
      return new Response(JSON.stringify({ updates, alerts }), {
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
