import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY_1");

// Bot mascot image URL
const BOT_MASCOT_URL = "https://qynszkirmcrldqmiplwh.supabase.co/storage/v1/object/public/assets/oracle-bot-mascot.jpg";
const WEBSITE_URL = "https://oracle-crypto.lovable.app";

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to send Telegram messages
async function sendMessage(chatId: number, text: string, parseMode = "Markdown") {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Helper to send photo with caption
async function sendPhoto(chatId: number, photoUrl: string, caption: string) {
  try {
    await fetch(`${TELEGRAM_API}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Error sending photo:", error);
  }
}

// Fetch crypto price from CoinGecko
async function fetchPrice(symbol: string) {
  try {
    // Try searching by symbol first
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${symbol}`
    );
    const searchData = await searchResponse.json();
    
    if (searchData.coins?.length > 0) {
      const coin = searchData.coins[0];
      const coinId = coin.id;
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      const priceData = await priceResponse.json();
      if (priceData[coinId]) {
        return {
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: priceData[coinId].usd,
          change24h: priceData[coinId].usd_24h_change,
          volume: priceData[coinId].usd_24h_vol,
          marketCap: priceData[coinId].usd_market_cap,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
}

// Fetch multiple top coins
async function fetchTopCoins() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching top coins:", error);
    return [];
  }
}

// Fetch gas prices
async function fetchGas(chain: string) {
  try {
    let network = "eth-mainnet";
    if (chain.toLowerCase() === "polygon") network = "polygon-mainnet";
    if (chain.toLowerCase() === "arbitrum") network = "arb-mainnet";
    if (chain.toLowerCase() === "base") network = "base-mainnet";
    if (chain.toLowerCase() === "optimism") network = "opt-mainnet";

    const response = await fetch(
      `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_gasPrice",
          params: [],
          id: 1,
        }),
      }
    );
    const data = await response.json();
    const gasWei = parseInt(data.result, 16);
    const gasGwei = gasWei / 1e9;
    return {
      slow: Math.round(gasGwei * 0.8),
      average: Math.round(gasGwei),
      fast: Math.round(gasGwei * 1.2),
    };
  } catch (error) {
    console.error("Error fetching gas:", error);
    return null;
  }
}

// Fetch market sentiment
async function fetchSentiment() {
  try {
    const fgiResponse = await fetch("https://api.alternative.me/fng/?limit=1");
    const fgiData = await fgiResponse.json();
    const fgi = fgiData.data?.[0];
    
    return {
      fearGreed: fgi?.value || "N/A",
      classification: fgi?.value_classification || "N/A",
    };
  } catch (error) {
    console.error("Error fetching sentiment:", error);
    return null;
  }
}

// Fetch global market data
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
    };
  } catch (error) {
    console.error("Error fetching global market:", error);
    return null;
  }
}

// Format number helper
function formatNumber(num: number): string {
  if (!num) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

// AI-powered response for any question
async function getAIResponse(message: string, context?: string) {
  if (!OPENAI_API_KEY) return null;
  
  try {
    // Fetch current market data for context
    const btcData = await fetchPrice("bitcoin");
    const ethData = await fetchPrice("ethereum");
    const sentiment = await fetchSentiment();
    const globalMarket = await fetchGlobalMarket();

    const marketContext = `
Current Market Data:
- BTC: $${btcData?.price?.toLocaleString()} (${btcData?.change24h?.toFixed(2)}% 24h)
- ETH: $${ethData?.price?.toLocaleString()} (${ethData?.change24h?.toFixed(2)}% 24h)
- Total Market Cap: ${formatNumber(globalMarket?.totalMarketCap || 0)}
- Fear & Greed Index: ${sentiment?.fearGreed}/100 (${sentiment?.classification})
- BTC Dominance: ${globalMarket?.btcDominance?.toFixed(1)}%
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Oracle Bot 🔮, a friendly and knowledgeable crypto assistant for the Oracle community on Telegram. You have a cosmic, mystical personality - you're the Cosmic Oracle that sees all in the crypto universe.

Your traits:
- Helpful and informative about crypto, blockchain, DeFi, NFTs, trading concepts
- Use cosmic/oracle-themed language occasionally (e.g., "The stars reveal...", "My cosmic vision shows...")
- Always neutral - NEVER give financial advice or buy/sell recommendations
- Keep responses concise (under 200 words) but informative
- Use emojis sparingly but effectively
- End with "For informational purposes. Not financial advice." on any price/market discussion
- You can discuss: prices, market trends, blockchain concepts, DeFi protocols, gas fees, staking, airdrops, etc.
- You represent the Oracle platform at ${WEBSITE_URL}

${marketContext}

${context || ""}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error in AI response:", error);
    return null;
  }
}

// Log usage
async function logUsage(userId: number, chatId: number, command: string, params?: any) {
  try {
    await supabase.from("telegram_bot_usage").insert({
      telegram_user_id: userId,
      telegram_chat_id: chatId,
      command,
      query_params: params,
    });
  } catch (error) {
    console.error("Error logging usage:", error);
  }
}

// Register group for auto-updates
async function registerGroup(chatId: number, chatTitle?: string) {
  try {
    await supabase.from("telegram_groups").upsert({
      chat_id: chatId,
      chat_title: chatTitle,
      is_active: true,
      auto_digest: true,
    }, { onConflict: "chat_id" });
  } catch (error) {
    console.error("Error registering group:", error);
  }
}

// Generate market pulse message
async function generateMarketPulse() {
  const btcData = await fetchPrice("bitcoin");
  const ethData = await fetchPrice("ethereum");
  const solData = await fetchPrice("solana");
  const sentiment = await fetchSentiment();
  const globalMarket = await fetchGlobalMarket();
  const gasData = await fetchGas("eth");

  let sentimentEmoji = "😐";
  const fgValue = parseInt(sentiment?.fearGreed || "50");
  if (fgValue <= 25) sentimentEmoji = "😱";
  else if (fgValue <= 45) sentimentEmoji = "😰";
  else if (fgValue >= 75) sentimentEmoji = "🤑";
  else if (fgValue >= 55) sentimentEmoji = "😊";

  const btcChange = btcData?.change24h || 0;
  const marketTrend = btcChange >= 2 ? "🚀 BULLISH" : btcChange <= -2 ? "📉 BEARISH" : "➡️ SIDEWAYS";

  return `
🔮 *ORACLE MARKET PULSE*
_${new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} UTC_

━━━━━━━━━━━━━━━━━━━━

📊 *MARKET OVERVIEW*
💰 Total Cap: ${formatNumber(globalMarket?.totalMarketCap || 0)}
📈 24h Change: ${globalMarket?.marketCapChange?.toFixed(2)}%
📊 Trend: ${marketTrend}

━━━━━━━━━━━━━━━━━━━━

💎 *BTC* $${btcData?.price?.toLocaleString()} ${btcData?.change24h >= 0 ? "🟢" : "🔴"} ${btcData?.change24h?.toFixed(2)}%
⟠ *ETH* $${ethData?.price?.toLocaleString()} ${ethData?.change24h >= 0 ? "🟢" : "🔴"} ${ethData?.change24h?.toFixed(2)}%
◎ *SOL* $${solData?.price?.toLocaleString()} ${solData?.change24h >= 0 ? "🟢" : "🔴"} ${solData?.change24h?.toFixed(2)}%

━━━━━━━━━━━━━━━━━━━━

${sentimentEmoji} *Sentiment:* ${sentiment?.fearGreed}/100 (${sentiment?.classification})
⛽ *ETH Gas:* ${gasData?.average} Gwei
👑 *BTC Dom:* ${globalMarket?.btcDominance?.toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━

🌐 More insights: ${WEBSITE_URL}

_For informational purposes. Not financial advice._
  `;
}

// Handle commands
async function handleCommand(message: any) {
  const chatId = message.chat.id;
  const userId = message.from?.id || 0;
  const chatTitle = message.chat.title;
  const text = message.text || "";
  const isGroup = message.chat.type === "group" || message.chat.type === "supergroup";

  // Register group if it's a group chat
  if (isGroup) {
    await registerGroup(chatId, chatTitle);
  }

  const [command, ...args] = text.split(" ");
  const commandLower = command.toLowerCase();

  console.log(`Chat: ${chatId}, Command: ${command}, Args: ${args.join(" ")}, IsGroup: ${isGroup}`);
  await logUsage(userId, chatId, command, { args, isGroup });

  // Check if it's a command (starts with /)
  if (text.startsWith("/")) {
    switch (commandLower) {
      case "/start":
        const welcomeMsg = `
🔮 *Welcome to Oracle Bot!*

I am the Cosmic Oracle - your real-time blockchain intelligence assistant. I can see all that happens in the crypto universe!

*Commands:*
📊 /price <TOKEN> - Get live prices
⛽ /gas <CHAIN> - Gas fees
🎭 /sentiment - Market mood
📋 /pulse - Full market overview
🤖 /analyze <TOKEN> - AI analysis
📚 /learn <TOPIC> - Crypto education
🔔 /alert - Set price alerts

Or just *ask me anything* about crypto! I'm here to help 24/7.

🌐 Visit: ${WEBSITE_URL}

_For informational purposes. Not financial advice._
        `;
        await sendMessage(chatId, welcomeMsg);
        break;

      case "/help":
        await sendMessage(chatId, `
🔮 *Oracle Bot Commands*

/price btc - Bitcoin price
/price eth - Ethereum price
/gas eth - Ethereum gas fees
/sentiment - Market fear/greed
/pulse - Full market update
/analyze eth - AI analysis
/learn defi - Learn about DeFi

💬 Or just ask me anything about crypto!

_For informational purposes. Not financial advice._
        `);
        break;

      case "/price":
        if (args.length === 0) {
          await sendMessage(chatId, "🔮 Which token would you like to check? Example: `/price btc`");
          break;
        }
        const token = args[0].toUpperCase();
        const priceData = await fetchPrice(args[0]);
        if (priceData) {
          const changeEmoji = priceData.change24h >= 0 ? "🟢" : "🔴";
          await sendMessage(chatId, `
🔮 *${priceData.name} (${priceData.symbol})*

💰 *Price:* $${priceData.price?.toLocaleString(undefined, { maximumFractionDigits: 8 })}
${changeEmoji} *24h:* ${priceData.change24h?.toFixed(2)}%
📈 *Volume:* ${formatNumber(priceData.volume)}
💎 *MCap:* ${formatNumber(priceData.marketCap)}

_For informational purposes. Not financial advice._
          `);
        } else {
          await sendMessage(chatId, `❌ Token "${token}" not found. Try the full name like "bitcoin" or "ethereum".`);
        }
        break;

      case "/gas":
        const chain = args[0]?.toLowerCase() || "eth";
        const gasData = await fetchGas(chain);
        if (gasData) {
          await sendMessage(chatId, `
⛽ *${chain.toUpperCase()} Gas Prices*

🐢 Slow: ${gasData.slow} Gwei
🚶 Average: ${gasData.average} Gwei  
🚀 Fast: ${gasData.fast} Gwei

_Updated just now._
          `);
        } else {
          await sendMessage(chatId, "❌ Try: eth, polygon, arbitrum, base, optimism");
        }
        break;

      case "/sentiment":
        const sentimentData = await fetchSentiment();
        if (sentimentData) {
          let emoji = "😐";
          if (parseInt(sentimentData.fearGreed) <= 25) emoji = "😱";
          else if (parseInt(sentimentData.fearGreed) <= 45) emoji = "😰";
          else if (parseInt(sentimentData.fearGreed) >= 75) emoji = "🤑";
          else if (parseInt(sentimentData.fearGreed) >= 55) emoji = "😊";

          await sendMessage(chatId, `
🎭 *Market Sentiment*

${emoji} *Fear & Greed:* ${sentimentData.fearGreed}/100
📊 *Classification:* ${sentimentData.classification}

_Sentiment is a lagging indicator._
          `);
        }
        break;

      case "/pulse":
      case "/digest":
      case "/market":
        const pulseMsg = await generateMarketPulse();
        await sendMessage(chatId, pulseMsg);
        break;

      case "/analyze":
        if (args.length === 0) {
          await sendMessage(chatId, "🔮 Which token should I analyze? Example: `/analyze eth`");
          break;
        }
        await sendMessage(chatId, "🔮 Consulting the cosmic charts... Please wait.");
        const analysisResponse = await getAIResponse(
          `Provide a brief technical analysis and outlook for ${args[0]}. Include current trend, key levels to watch, and market context.`
        );
        if (analysisResponse) {
          await sendMessage(chatId, `🔮 *Analysis: ${args[0].toUpperCase()}*\n\n${analysisResponse}`);
        } else {
          await sendMessage(chatId, "❌ Unable to generate analysis. Please try again.");
        }
        break;

      case "/alert":
        if (args.length < 4) {
          await sendMessage(chatId, `
🔔 *Set Price Alerts:*
/alert price BTC above 100000
/alert price ETH below 3000
/alert gas eth above 50

View alerts: /myalerts
          `);
          break;
        }
        const alertType = args[0].toLowerCase();
        const alertToken = args[1].toUpperCase();
        const direction = args[2].toLowerCase();
        const threshold = parseFloat(args[3]);

        if (isNaN(threshold)) {
          await sendMessage(chatId, "❌ Invalid threshold value.");
          break;
        }

        let dbAlertType = "";
        if (alertType === "price" && direction === "above") dbAlertType = "price_above";
        else if (alertType === "price" && direction === "below") dbAlertType = "price_below";
        else if (alertType === "gas" && direction === "above") dbAlertType = "gas";
        else {
          await sendMessage(chatId, "❌ Use: price above/below, gas above");
          break;
        }

        try {
          await supabase.from("telegram_alerts").insert({
            telegram_user_id: userId,
            telegram_chat_id: chatId,
            alert_type: dbAlertType,
            token_or_chain: alertToken,
            threshold_value: threshold,
          });
          await sendMessage(chatId, `
✅ *Alert Created!*

📍 ${alertType} ${direction} ${alertType === "gas" ? `${threshold} Gwei` : `$${threshold.toLocaleString()}`}
🪙 ${alertToken}

You'll be notified when triggered.
          `);
        } catch (error) {
          console.error("Error creating alert:", error);
          await sendMessage(chatId, "❌ Failed to create alert.");
        }
        break;

      case "/myalerts":
        try {
          const { data: alerts } = await supabase
            .from("telegram_alerts")
            .select("*")
            .eq("telegram_user_id", userId)
            .eq("is_active", true)
            .order("created_at", { ascending: false });

          if (!alerts || alerts.length === 0) {
            await sendMessage(chatId, "📭 No active alerts. Create one with /alert");
            break;
          }

          let alertList = "🔔 *Your Alerts:*\n\n";
          alerts.forEach((alert, i) => {
            const typeEmoji = alert.alert_type.includes("price") ? "💰" : "⛽";
            const direction = alert.alert_type.includes("above") ? "↗️" : "↘️";
            alertList += `${i + 1}. ${typeEmoji} ${alert.token_or_chain} ${direction} ${alert.threshold_value}\n`;
          });
          await sendMessage(chatId, alertList);
        } catch (error) {
          await sendMessage(chatId, "❌ Failed to fetch alerts.");
        }
        break;

      case "/learn":
        const topic = args.join(" ").toLowerCase() || "crypto";
        const learnResponse = await getAIResponse(
          `Explain ${topic} in simple terms for someone learning about crypto. Keep it educational and under 150 words.`
        );
        if (learnResponse) {
          await sendMessage(chatId, `📚 *Learn: ${topic.charAt(0).toUpperCase() + topic.slice(1)}*\n\n${learnResponse}`);
        } else {
          await sendMessage(chatId, `
📚 *Quick Topics:*
/learn defi - Decentralized Finance
/learn gas - Gas fees explained
/learn staking - Staking basics
/learn nft - NFT fundamentals
          `);
        }
        break;

      default:
        // Unknown command - try AI response
        const aiHelp = await getAIResponse(text);
        if (aiHelp) {
          await sendMessage(chatId, aiHelp);
        } else {
          await sendMessage(chatId, "❓ Unknown command. Type /help for options or just ask me a question!");
        }
        break;
    }
  } else {
    // Not a command - handle natural language
    // In groups, only respond if bot is mentioned or replied to
    const botMentioned = text.toLowerCase().includes("oracle") || 
                         text.toLowerCase().includes("@") ||
                         message.reply_to_message?.from?.is_bot;
    
    if (!isGroup || botMentioned) {
      // Get AI response for the message
      const aiResponse = await getAIResponse(text);
      if (aiResponse) {
        await sendMessage(chatId, aiResponse);
      }
    }
  }
}

// Send automatic updates to all registered groups
async function sendAutoUpdates() {
  console.log("Sending auto updates to all groups...");
  
  try {
    const { data: groups } = await supabase
      .from("telegram_groups")
      .select("*")
      .eq("is_active", true)
      .eq("auto_digest", true);

    if (!groups || groups.length === 0) {
      console.log("No groups registered for auto updates");
      return { sent: 0 };
    }

    const pulseMsg = await generateMarketPulse();
    let sentCount = 0;

    for (const group of groups) {
      try {
        await sendMessage(group.chat_id, pulseMsg);
        sentCount++;
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send to group ${group.chat_id}:`, error);
      }
    }

    console.log(`Auto updates sent to ${sentCount} groups`);
    return { sent: sentCount };
  } catch (error) {
    console.error("Error in auto updates:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Check and trigger alerts
async function checkAlerts() {
  console.log("Checking alerts...");
  
  try {
    const { data: alerts } = await supabase
      .from("telegram_alerts")
      .select("*")
      .eq("is_active", true)
      .is("triggered_at", null);

    if (!alerts || alerts.length === 0) return { checked: 0, triggered: 0 };

    let triggeredCount = 0;

    for (const alert of alerts) {
      try {
        let currentValue = 0;
        
        if (alert.alert_type === "gas") {
          const gasData = await fetchGas(alert.token_or_chain);
          currentValue = gasData?.average || 0;
        } else {
          const priceData = await fetchPrice(alert.token_or_chain);
          currentValue = priceData?.price || 0;
        }

        let triggered = false;
        if (alert.alert_type === "price_above" && currentValue >= alert.threshold_value) triggered = true;
        if (alert.alert_type === "price_below" && currentValue <= alert.threshold_value) triggered = true;
        if (alert.alert_type === "gas" && currentValue >= alert.threshold_value) triggered = true;

        if (triggered) {
          const direction = alert.alert_type.includes("above") ? "risen above" : "fallen below";
          const unit = alert.alert_type === "gas" ? "Gwei" : "$";
          
          await sendMessage(alert.telegram_chat_id, `
🚨 *ALERT TRIGGERED!*

${alert.alert_type === "gas" ? "⛽" : "💰"} *${alert.token_or_chain}* has ${direction} your target!

🎯 Target: ${unit}${alert.threshold_value.toLocaleString()}
📍 Current: ${unit}${currentValue.toLocaleString()}

_For informational purposes. Not financial advice._
          `);

          await supabase
            .from("telegram_alerts")
            .update({ triggered_at: new Date().toISOString(), is_active: false })
            .eq("id", alert.id);

          triggeredCount++;
        }
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }

    return { checked: alerts.length, triggered: triggeredCount };
  } catch (error) {
    console.error("Error checking alerts:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Webhook setup endpoint
    if (url.pathname.endsWith("/setup")) {
      const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-bot`;
      const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });
      const result = await response.json();
      console.log("Webhook setup result:", result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cron endpoint for auto updates (every 10 minutes)
    if (url.pathname.endsWith("/cron")) {
      const updateResult = await sendAutoUpdates();
      const alertResult = await checkAlerts();
      return new Response(JSON.stringify({ updates: updateResult, alerts: alertResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle Telegram updates
    const update = await req.json();
    console.log("Received update:", JSON.stringify(update));

    if (update.message) {
      await handleCommand(update.message);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing update:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
