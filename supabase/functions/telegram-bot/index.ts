import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ALCHEMY_API_KEY = Deno.env.get("ALCHEMY_API_KEY_1");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to send Telegram messages
async function sendMessage(chatId: number, text: string, parseMode = "Markdown") {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Fetch crypto price from CoinGecko
async function fetchPrice(symbol: string) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    );
    const data = await response.json();
    const coinId = Object.keys(data)[0];
    if (coinId) {
      return {
        price: data[coinId].usd,
        change24h: data[coinId].usd_24h_change,
        volume: data[coinId].usd_24h_vol,
        marketCap: data[coinId].usd_market_cap,
      };
    }
    
    // Try searching by symbol
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${symbol}`
    );
    const searchData = await searchResponse.json();
    if (searchData.coins?.length > 0) {
      const coinId = searchData.coins[0].id;
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      const priceData = await priceResponse.json();
      if (priceData[coinId]) {
        return {
          name: searchData.coins[0].name,
          symbol: searchData.coins[0].symbol.toUpperCase(),
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
async function fetchSentiment(token: string) {
  try {
    // Use Fear & Greed Index as base sentiment
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

// AI-powered analysis
async function analyzeToken(token: string) {
  if (!OPENAI_API_KEY) return null;
  
  try {
    const priceData = await fetchPrice(token);
    if (!priceData) return null;

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
            content: "You are a cryptocurrency analyst. Provide brief, neutral analysis. Never give financial advice. Keep responses under 200 words.",
          },
          {
            role: "user",
            content: `Analyze ${token}: Price $${priceData.price?.toFixed(6)}, 24h change: ${priceData.change24h?.toFixed(2)}%, Volume: $${(priceData.volume/1e6)?.toFixed(2)}M. Provide brief technical outlook.`,
          },
        ],
        max_tokens: 300,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Error in AI analysis:", error);
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

// Handle commands
async function handleCommand(message: any) {
  const chatId = message.chat.id;
  const userId = message.from.id;
  const text = message.text || "";
  const [command, ...args] = text.split(" ");

  console.log(`Command: ${command}, Args: ${args.join(" ")}`);
  await logUsage(userId, chatId, command, { args });

  switch (command.toLowerCase()) {
    case "/start":
      await sendMessage(chatId, `
🔮 *Welcome to Oracle Bot!*

Your real-time blockchain intelligence assistant.

*Available Commands:*

📊 *Market Data*
/price <TOKEN> - Get current price & stats
/gas <CHAIN> - Get gas prices (eth/polygon/base/arb)
/sentiment <TOKEN> - Market sentiment analysis

🔔 *Alerts*
/alert price <TOKEN> above/below <VALUE>
/alert gas <CHAIN> above <GWEI>
/myalerts - View your active alerts
/deletealert <ID> - Remove an alert

🤖 *AI Analysis*
/analyze <TOKEN> - AI-powered token analysis

📚 *Learn*
/learn <TOPIC> - Crypto education

ℹ️ /help - Show this menu

_For informational purposes. Not financial advice._
      `);
      break;

    case "/help":
      await sendMessage(chatId, `
🔮 *Oracle Bot Commands*

/price btc - Bitcoin price
/price eth - Ethereum price
/gas eth - Ethereum gas fees
/sentiment btc - Market sentiment
/analyze eth - AI analysis
/learn defi - Learn about DeFi

_For informational purposes. Not financial advice._
      `);
      break;

    case "/price":
      if (args.length === 0) {
        await sendMessage(chatId, "⚠️ Please specify a token. Example: `/price btc`");
        break;
      }
      const token = args[0].toUpperCase();
      const priceData = await fetchPrice(args[0]);
      if (priceData) {
        const changeEmoji = priceData.change24h >= 0 ? "🟢" : "🔴";
        await sendMessage(chatId, `
📊 *${priceData.name || token} Price*

💰 *Price:* $${priceData.price?.toLocaleString(undefined, { maximumFractionDigits: 8 })}
${changeEmoji} *24h Change:* ${priceData.change24h?.toFixed(2)}%
📈 *24h Volume:* ${formatNumber(priceData.volume)}
💎 *Market Cap:* ${formatNumber(priceData.marketCap)}

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

🐢 *Slow:* ${gasData.slow} Gwei
🚶 *Average:* ${gasData.average} Gwei  
🚀 *Fast:* ${gasData.fast} Gwei

_Updated just now. Prices fluctuate frequently._
        `);
      } else {
        await sendMessage(chatId, "❌ Unable to fetch gas prices. Try: eth, polygon, arbitrum, base, optimism");
      }
      break;

    case "/sentiment":
      const sentimentData = await fetchSentiment(args[0] || "bitcoin");
      if (sentimentData) {
        let emoji = "😐";
        if (parseInt(sentimentData.fearGreed) <= 25) emoji = "😱";
        else if (parseInt(sentimentData.fearGreed) <= 45) emoji = "😰";
        else if (parseInt(sentimentData.fearGreed) >= 75) emoji = "🤑";
        else if (parseInt(sentimentData.fearGreed) >= 55) emoji = "😊";

        await sendMessage(chatId, `
🎭 *Market Sentiment*

${emoji} *Fear & Greed Index:* ${sentimentData.fearGreed}/100
📊 *Classification:* ${sentimentData.classification}

_Sentiment is a lagging indicator. Not financial advice._
        `);
      } else {
        await sendMessage(chatId, "❌ Unable to fetch sentiment data.");
      }
      break;

    case "/analyze":
      if (args.length === 0) {
        await sendMessage(chatId, "⚠️ Please specify a token. Example: `/analyze eth`");
        break;
      }
      await sendMessage(chatId, "🔮 Analyzing... Please wait.");
      const analysis = await analyzeToken(args[0]);
      if (analysis) {
        await sendMessage(chatId, `
🤖 *AI Analysis: ${args[0].toUpperCase()}*

${analysis}

_For informational purposes. Not financial advice._
        `);
      } else {
        await sendMessage(chatId, "❌ Unable to generate analysis. Please try again.");
      }
      break;

    case "/alert":
      if (args.length < 4) {
        await sendMessage(chatId, `
⚠️ *Alert Format:*
/alert price BTC above 100000
/alert price ETH below 3000
/alert gas eth above 50
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
        await sendMessage(chatId, "❌ Invalid alert type. Use: price above/below, gas above");
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

📍 *Type:* ${alertType} ${direction}
🪙 *Token/Chain:* ${alertToken}
🎯 *Threshold:* ${alertType === "gas" ? `${threshold} Gwei` : `$${threshold.toLocaleString()}`}

You'll be notified when the condition is met.
        `);
      } catch (error) {
        console.error("Error creating alert:", error);
        await sendMessage(chatId, "❌ Failed to create alert. Please try again.");
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
          await sendMessage(chatId, "📭 You have no active alerts. Create one with /alert");
          break;
        }

        let alertList = "🔔 *Your Active Alerts:*\n\n";
        alerts.forEach((alert, i) => {
          const typeEmoji = alert.alert_type.includes("price") ? "💰" : "⛽";
          const direction = alert.alert_type.includes("above") ? "↗️ above" : "↘️ below";
          alertList += `${i + 1}. ${typeEmoji} ${alert.token_or_chain} ${direction} ${alert.threshold_value}\n   ID: \`${alert.id.slice(0, 8)}\`\n\n`;
        });
        alertList += "_Delete with /deletealert <ID>_";
        await sendMessage(chatId, alertList);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        await sendMessage(chatId, "❌ Failed to fetch alerts.");
      }
      break;

    case "/deletealert":
      if (args.length === 0) {
        await sendMessage(chatId, "⚠️ Please provide alert ID. Use /myalerts to see IDs.");
        break;
      }
      try {
        const { error } = await supabase
          .from("telegram_alerts")
          .update({ is_active: false })
          .eq("telegram_user_id", userId)
          .ilike("id", `${args[0]}%`);

        if (error) throw error;
        await sendMessage(chatId, "✅ Alert deleted successfully.");
      } catch (error) {
        console.error("Error deleting alert:", error);
        await sendMessage(chatId, "❌ Failed to delete alert.");
      }
      break;

    case "/learn":
      const topic = args.join(" ").toLowerCase() || "crypto";
      let learnContent = "";

      if (topic.includes("defi")) {
        learnContent = `
📚 *DeFi (Decentralized Finance)*

DeFi refers to financial services built on blockchain technology that operate without traditional intermediaries like banks.

*Key Concepts:*
• *Liquidity Pools:* Token pairs locked in smart contracts for trading
• *Yield Farming:* Earning rewards by providing liquidity
• *AMM:* Automated Market Makers that enable decentralized trading
• *TVL:* Total Value Locked - measure of DeFi protocol size

*Popular DeFi Protocols:*
• Uniswap, Aave, Compound, MakerDAO, Curve
        `;
      } else if (topic.includes("gas")) {
        learnContent = `
📚 *Gas Fees Explained*

Gas is the unit measuring computational effort for Ethereum transactions.

*Key Points:*
• *Gwei:* Gas is priced in Gwei (1 ETH = 1 billion Gwei)
• *Gas Limit:* Maximum gas you're willing to spend
• *Gas Price:* How much you pay per unit of gas
• *Total Fee:* Gas Used × Gas Price

*Tips:*
• Transactions cost more when network is busy
• Use Layer 2s (Arbitrum, Base, Optimism) for lower fees
• Off-peak hours (weekends, late nights UTC) often have lower fees
        `;
      } else if (topic.includes("wallet")) {
        learnContent = `
📚 *Crypto Wallets*

Wallets store your private keys and let you interact with blockchains.

*Types:*
• *Hot Wallets:* Connected to internet (MetaMask, Trust Wallet)
• *Cold Wallets:* Offline storage (Ledger, Trezor)
• *Custodial:* Exchange holds your keys (Coinbase, Binance)
• *Non-Custodial:* You control your keys

*Security Tips:*
• Never share your seed phrase
• Use hardware wallets for large amounts
• Verify addresses before sending
• Beware of phishing sites
        `;
      } else {
        learnContent = `
📚 *Crypto Basics*

*Topics Available:*
• /learn defi - Decentralized Finance
• /learn gas - Gas fees explained
• /learn wallet - Crypto wallets

*Quick Facts:*
• Bitcoin was created in 2009 by Satoshi Nakamoto
• Ethereum introduced smart contracts in 2015
• Market cap = Price × Circulating Supply
• DYOR = Do Your Own Research
        `;
      }

      await sendMessage(chatId, learnContent + "\n\n_For informational purposes. Not financial advice._");
      break;

    case "/digest":
      await sendMessage(chatId, "📊 Fetching market digest...");
      try {
        const btcData = await fetchPrice("bitcoin");
        const ethData = await fetchPrice("ethereum");
        const sentiment = await fetchSentiment("bitcoin");
        const gasData = await fetchGas("eth");

        await sendMessage(chatId, `
🔮 *ORACLE MARKET DIGEST*
_${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}_

━━━━━━━━━━━━━━━━━━━━

💎 *BITCOIN (BTC)*
Price: $${btcData?.price?.toLocaleString()}
24h: ${btcData?.change24h?.toFixed(2)}% ${btcData?.change24h >= 0 ? "🟢" : "🔴"}

⟠ *ETHEREUM (ETH)*  
Price: $${ethData?.price?.toLocaleString()}
24h: ${ethData?.change24h?.toFixed(2)}% ${ethData?.change24h >= 0 ? "🟢" : "🔴"}

━━━━━━━━━━━━━━━━━━━━

🎭 *SENTIMENT*
Fear & Greed: ${sentiment?.fearGreed}/100 (${sentiment?.classification})

⛽ *ETH GAS*
Slow: ${gasData?.slow} | Avg: ${gasData?.average} | Fast: ${gasData?.fast} Gwei

━━━━━━━━━━━━━━━━━━━━

_For informational purposes. Not financial advice._
        `);
      } catch (error) {
        console.error("Error generating digest:", error);
        await sendMessage(chatId, "❌ Unable to generate digest. Please try again.");
      }
      break;

    default:
      // Handle natural language queries
      if (text.toLowerCase().includes("price") && text.toLowerCase().includes("btc")) {
        await handleCommand({ ...message, text: "/price btc" });
      } else if (text.toLowerCase().includes("price") && text.toLowerCase().includes("eth")) {
        await handleCommand({ ...message, text: "/price eth" });
      } else if (text.toLowerCase().includes("gas")) {
        await handleCommand({ ...message, text: "/gas eth" });
      } else if (text.startsWith("/")) {
        await sendMessage(chatId, "❓ Unknown command. Type /help to see available commands.");
      }
      break;
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
