import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Helmet } from "react-helmet-async";
import { TrendingUp, Star, Shield, Zap, BarChart3, ChevronRight, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Market page config — one entry per /market/:slug route
const MARKET_CONFIGS: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  keywords: string;
  faqQ: string;
  faqA: string;
  coins: string[];
  relatedMarkets: { slug: string; label: string }[];
  badge: string;
  badgeColor: string;
}> = {
  "best-crypto-to-buy-today": {
    title: "Best Crypto to Buy Today",
    subtitle: "AI-Curated Daily Picks",
    description: "Our AI analyzes 150+ signals — momentum, volume, whale activity, and sentiment — to surface the highest-conviction crypto buys for today's session.",
    keywords: "best crypto to buy today, top crypto picks today, AI crypto picks, crypto to buy now",
    faqQ: "What is the best crypto to buy today?",
    faqA: "The best crypto to buy today depends on your risk tolerance. Our AI currently highlights Bitcoin, Ethereum, and Solana as high-conviction plays based on today's momentum, volume spikes, and whale accumulation signals.",
    coins: ["bitcoin","ethereum","solana","binancecoin","ripple","cardano","polkadot","chainlink","toncoin","arbitrum"],
    relatedMarkets: [
      { slug: "top-crypto-gainers-today", label: "Top Gainers Today" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
      { slug: "cheap-crypto-to-buy-now", label: "Cheap Crypto Now" },
      { slug: "best-altcoins-to-buy", label: "Best Altcoins" },
    ],
    badge: "Daily Picks",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  "top-crypto-gainers-today": {
    title: "Top Crypto Gainers Today",
    subtitle: "Biggest 24-Hour Winners",
    description: "Live rankings of today's top-performing cryptocurrencies by 24-hour price change. Includes volume analysis, momentum scores, and AI commentary on whether gains are sustainable.",
    keywords: "top crypto gainers today, biggest crypto movers today, best performing crypto today, crypto up today",
    faqQ: "Which cryptos are gaining the most today?",
    faqA: "Today's top gainers are typically smaller-cap altcoins with catalysts like exchange listings, protocol upgrades, or viral social sentiment. Our AI tracks these in real-time across all market caps.",
    coins: ["solana","pepe","dogecoin","shiba-inu","bonk","floki","toncoin","injective-protocol","render-token","fetch-ai"],
    relatedMarkets: [
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "which-crypto-will-go-up-today", label: "Will Go Up Today" },
      { slug: "crypto-market-prediction-today", label: "Market Prediction" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
    ],
    badge: "Live Gainers",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  "crypto-market-prediction-today": {
    title: "Crypto Market Prediction Today",
    subtitle: "Bullish or Bearish?",
    description: "Today's overall crypto market outlook powered by AI. Covers BTC dominance shifts, altcoin rotation signals, Fear & Greed Index, and key support/resistance levels for the session.",
    keywords: "crypto market prediction today, will crypto go up today, crypto market outlook, bitcoin market today",
    faqQ: "What is the crypto market prediction for today?",
    faqA: "Our AI model analyzes BTC dominance, total market cap momentum, Fear & Greed Index, and on-chain flows to generate a daily market outlook. Today's signals point to continued monitoring of Bitcoin's key $90K–$100K range.",
    coins: ["bitcoin","ethereum","solana","binancecoin","ripple","cardano","dogecoin","polkadot","toncoin","chainlink"],
    relatedMarkets: [
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "is-crypto-going-up-today", label: "Is Crypto Going Up?" },
      { slug: "which-crypto-will-go-up-today", label: "Which Will Go Up?" },
      { slug: "crypto-losers-today", label: "Crypto Losers Today" },
    ],
    badge: "Market Outlook",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  "which-crypto-will-go-up-today": {
    title: "Which Crypto Will Go Up Today?",
    subtitle: "AI Breakout Predictions",
    description: "AI-ranked list of cryptocurrencies most likely to go up today based on breakout signals, RSI momentum, whale accumulation, and social volume spikes.",
    keywords: "which crypto will go up today, crypto going up today, crypto to buy today, best crypto for today",
    faqQ: "Which cryptocurrency is most likely to go up today?",
    faqA: "Based on today's signals, coins showing bullish divergence on RSI, increasing whale wallet accumulation, and rising social volume are most likely to outperform. Our AI updates these rankings every 30 minutes.",
    coins: ["bitcoin","ethereum","solana","pepe","dogecoin","chainlink","arbitrum","toncoin","render-token","near"],
    relatedMarkets: [
      { slug: "top-crypto-gainers-today", label: "Top Gainers Today" },
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "crypto-market-prediction-today", label: "Market Prediction" },
      { slug: "is-crypto-going-up-today", label: "Is Crypto Going Up?" },
    ],
    badge: "Breakout Watch",
    badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  "crypto-losers-today": {
    title: "Crypto Losers Today",
    subtitle: "Biggest Decliners & Bounce Candidates",
    description: "Today's biggest crypto losers ranked by 24-hour decline. Our AI evaluates each for oversold bounce probability, key support levels, and whether the drop is a buying opportunity.",
    keywords: "crypto losers today, biggest crypto decliners, crypto down today, oversold crypto",
    faqQ: "Which cryptos are losing the most today?",
    faqA: "Today's biggest losers may represent buying opportunities if they're oversold (RSI below 30) and hitting key support zones. Our AI gives each a 'bounce probability' score to help you decide.",
    coins: ["bitcoin","ethereum","solana","cardano","polkadot","litecoin","cosmos","vechain","filecoin","theta-token"],
    relatedMarkets: [
      { slug: "top-crypto-gainers-today", label: "Top Gainers Today" },
      { slug: "undervalued-crypto-to-buy", label: "Undervalued Crypto" },
      { slug: "safest-crypto-to-invest", label: "Safest to Invest" },
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
    ],
    badge: "Oversold Scanner",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  "is-crypto-going-up-today": {
    title: "Is Crypto Going Up Today?",
    subtitle: "Real-Time Market Direction",
    description: "Is the overall crypto market bullish or bearish today? Our AI analyzes total market cap momentum, Bitcoin price action, altcoin season indicators, and macro factors.",
    keywords: "is crypto going up today, crypto market direction, will crypto rise today, crypto bullish today",
    faqQ: "Is the crypto market going up today?",
    faqA: "Market direction depends on Bitcoin's price action, total crypto market cap trend, and macro sentiment. Our AI factors in BTC dominance, exchange inflows/outflows, and social sentiment to give you a real-time directional bias.",
    coins: ["bitcoin","ethereum","solana","binancecoin","ripple","cardano","dogecoin","polkadot","toncoin","arbitrum"],
    relatedMarkets: [
      { slug: "crypto-market-prediction-today", label: "Market Prediction" },
      { slug: "which-crypto-will-go-up-today", label: "Which Will Go Up?" },
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "top-crypto-gainers-today", label: "Top Gainers Today" },
    ],
    badge: "Market Direction",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  "best-crypto-to-buy-this-week": {
    title: "Best Crypto to Buy This Week",
    subtitle: "Top Weekly Swing Picks",
    description: "This week's top crypto picks for swing traders. Each pick includes AI-generated entry zones, resistance targets, stop-loss levels, and weekly forecast confidence scores.",
    keywords: "best crypto to buy this week, top crypto this week, crypto weekly picks, swing trading crypto",
    faqQ: "What is the best crypto to buy this week?",
    faqA: "This week's top picks combine strong weekly chart setups with positive macro tailwinds. Our AI identifies coins with bullish weekly closes, rising volume trends, and upcoming catalysts like protocol upgrades or exchange listings.",
    coins: ["bitcoin","ethereum","solana","binancecoin","ripple","chainlink","toncoin","arbitrum","near","injective-protocol"],
    relatedMarkets: [
      { slug: "crypto-prediction-this-week", label: "Weekly Prediction" },
      { slug: "crypto-to-watch-this-week", label: "Crypto to Watch" },
      { slug: "top-crypto-gainers-this-week", label: "Weekly Gainers" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
    ],
    badge: "Weekly Picks",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  },
  "crypto-prediction-this-week": {
    title: "Crypto Prediction This Week",
    subtitle: "Weekly Market Forecast",
    description: "Complete weekly cryptocurrency market forecast. AI analysis of BTC, ETH, and altcoin outlooks, key support and resistance levels, macro economic events, and sector rotation signals.",
    keywords: "crypto prediction this week, crypto forecast this week, weekly crypto analysis, bitcoin this week",
    faqQ: "What is the crypto market prediction for this week?",
    faqA: "This week's crypto forecast accounts for upcoming economic data releases, Federal Reserve communications, Bitcoin ETF flow data, and on-chain accumulation trends. The overall weekly bias is updated every Monday morning.",
    coins: ["bitcoin","ethereum","solana","binancecoin","ripple","cardano","polkadot","chainlink","toncoin","dogecoin"],
    relatedMarkets: [
      { slug: "best-crypto-to-buy-this-week", label: "Best to Buy This Week" },
      { slug: "crypto-to-watch-this-week", label: "Crypto to Watch" },
      { slug: "top-crypto-gainers-this-week", label: "Weekly Gainers" },
      { slug: "crypto-market-prediction-today", label: "Today's Prediction" },
    ],
    badge: "Weekly Forecast",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  "crypto-to-watch-this-week": {
    title: "Crypto to Watch This Week",
    subtitle: "Upcoming Catalysts & Breakouts",
    description: "This week's cryptocurrencies with high-impact upcoming catalysts: protocol upgrades, token unlocks, exchange listings, governance votes, and technical breakouts identified by AI.",
    keywords: "crypto to watch this week, crypto catalysts this week, crypto breakouts, crypto alerts this week",
    faqQ: "Which cryptocurrencies should I watch this week?",
    faqA: "This week's watchlist focuses on coins with confirmed catalysts and strong technical setups. Coins approaching key resistance levels with rising volume and positive social sentiment are flagged by our AI as high-probability movers.",
    coins: ["solana","chainlink","arbitrum","near","injective-protocol","render-token","fetch-ai","toncoin","sui","aptos"],
    relatedMarkets: [
      { slug: "best-crypto-to-buy-this-week", label: "Best to Buy This Week" },
      { slug: "crypto-prediction-this-week", label: "Weekly Prediction" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
      { slug: "top-crypto-gainers-this-week", label: "Weekly Gainers" },
    ],
    badge: "Catalyst Watch",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  "top-crypto-gainers-this-week": {
    title: "Top Crypto Gainers This Week",
    subtitle: "Weekly Performance Leaders",
    description: "This week's best-performing cryptocurrencies ranked by 7-day price gain across all market cap tiers. Includes trend analysis, volume confirmation, and AI sustainability scores.",
    keywords: "top crypto gainers this week, best performing crypto this week, weekly crypto winners",
    faqQ: "Which cryptos gained the most this week?",
    faqA: "This week's top gainers span multiple market cap tiers. Large caps like Bitcoin and Ethereum often lead sustained rallies, while mid and small cap altcoins provide amplified gains with higher risk. Our AI ranks each by momentum sustainability.",
    coins: ["bitcoin","ethereum","solana","toncoin","arbitrum","near","injective-protocol","render-token","pepe","bonk"],
    relatedMarkets: [
      { slug: "top-crypto-gainers-today", label: "Today's Gainers" },
      { slug: "best-crypto-to-buy-this-week", label: "Best to Buy" },
      { slug: "crypto-prediction-this-week", label: "Weekly Prediction" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
    ],
    badge: "Weekly Winners",
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  "next-crypto-to-explode": {
    title: "Next Crypto to Explode",
    subtitle: "High-Potential Altcoins",
    description: "AI-identified cryptocurrencies with the highest short-to-medium term explosion potential. Ranked by fundamentals score, community growth rate, technical setup, and smart money flow analysis.",
    keywords: "next crypto to explode, crypto to explode soon, next 100x crypto, altcoins about to pump",
    faqQ: "Which crypto is most likely to explode next?",
    faqA: "Cryptos most likely to explode combine strong fundamentals with early-stage accumulation by smart money wallets, viral social momentum, and an upcoming catalyst. Our AI scores each by these combined factors and updates daily.",
    coins: ["solana","toncoin","pepe","injective-protocol","render-token","fetch-ai","near","sui","aptos","bonk"],
    relatedMarkets: [
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "cheap-crypto-to-buy-now", label: "Cheap Crypto" },
      { slug: "top-meme-coins", label: "Top Meme Coins" },
      { slug: "top-ai-crypto-tokens", label: "Top AI Tokens" },
    ],
    badge: "Explosion Radar",
    badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  "safest-crypto-to-invest": {
    title: "Safest Crypto to Invest",
    subtitle: "Low-Risk Blue Chip Assets",
    description: "The safest cryptocurrencies for conservative investors ranked by liquidity, market cap stability, institutional adoption, track record, and AI risk score. Build a solid foundation.",
    keywords: "safest crypto to invest, safe cryptocurrency, low risk crypto, stable crypto investment",
    faqQ: "What is the safest cryptocurrency to invest in?",
    faqA: "Bitcoin and Ethereum are widely considered the safest crypto investments due to their massive liquidity, institutional adoption, proven track records, and regulatory clarity. Our AI also highlights BNB, Solana, and XRP as relatively safe mid-cap options.",
    coins: ["bitcoin","ethereum","binancecoin","ripple","solana","cardano","polkadot","litecoin","stellar","monero"],
    relatedMarkets: [
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "undervalued-crypto-to-buy", label: "Undervalued Crypto" },
      { slug: "crypto-with-most-potential", label: "Most Potential" },
      { slug: "best-altcoins-to-buy", label: "Best Altcoins" },
    ],
    badge: "Low Risk",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  "cheap-crypto-to-buy-now": {
    title: "Cheap Crypto to Buy Now",
    subtitle: "Best Affordable Coins Under $1",
    description: "Top low-priced cryptocurrencies worth buying now. Affordable tokens under $1 analyzed by AI for utility strength, community size, tokenomics health, and growth trajectory.",
    keywords: "cheap crypto to buy now, best crypto under $1, affordable crypto, low price high potential",
    faqQ: "What is the best cheap crypto to buy right now?",
    faqA: "The best cheap cryptos combine low price with strong fundamentals. Our AI evaluates utility, tokenomics, team activity, and community growth. Top under-$1 picks currently include SHIB, FLOKI, BONK, VeChain, and Stellar.",
    coins: ["shiba-inu","floki","bonk","vechain","stellar","tron","dogecoin","hedera","kaspa","cardano"],
    relatedMarkets: [
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
      { slug: "undervalued-crypto-to-buy", label: "Undervalued Crypto" },
      { slug: "top-meme-coins", label: "Top Meme Coins" },
      { slug: "best-altcoins-to-buy", label: "Best Altcoins" },
    ],
    badge: "Under $1",
    badgeColor: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  },
  "undervalued-crypto-to-buy": {
    title: "Undervalued Crypto to Buy",
    subtitle: "Hidden Gems Below Fair Value",
    description: "Cryptocurrencies trading below their AI-estimated fair value based on network activity, protocol revenue, developer activity, and comparable asset valuations. Find overlooked opportunities.",
    keywords: "undervalued crypto to buy, undervalued cryptocurrency, crypto hidden gems, crypto below fair value",
    faqQ: "Which cryptocurrencies are currently undervalued?",
    faqA: "Our AI identifies undervalued cryptos by comparing current market cap to on-chain metrics like active addresses, transaction volume, and protocol revenue. Tokens with strong fundamentals but depressed prices represent the best risk-reward.",
    coins: ["chainlink","polkadot","cosmos","near","arbitrum","injective-protocol","filecoin","render-token","fetch-ai","internet-computer"],
    relatedMarkets: [
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
      { slug: "crypto-with-most-potential", label: "Most Potential" },
      { slug: "best-altcoins-to-buy", label: "Best Altcoins" },
      { slug: "safest-crypto-to-invest", label: "Safest to Invest" },
    ],
    badge: "Value Picks",
    badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
  "crypto-with-most-potential": {
    title: "Crypto with Most Potential",
    subtitle: "Highest Upside Picks",
    description: "Cryptocurrencies with the highest long-term growth potential scored by AI across technology innovation, total addressable market, team quality, ecosystem momentum, and tokenomics design.",
    keywords: "crypto with most potential, highest potential crypto, best crypto long term, most promising crypto",
    faqQ: "Which cryptocurrency has the most potential?",
    faqA: "Long-term potential depends on technology differentiation, market size, ecosystem adoption, and token value accrual. Our AI consistently scores Ethereum, Solana, Chainlink, and emerging Layer-2 and AI-blockchain projects highest for long-term upside.",
    coins: ["ethereum","solana","chainlink","arbitrum","near","injective-protocol","render-token","fetch-ai","sui","aptos"],
    relatedMarkets: [
      { slug: "undervalued-crypto-to-buy", label: "Undervalued Crypto" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
      { slug: "best-altcoins-to-buy", label: "Best Altcoins" },
      { slug: "top-ai-crypto-tokens", label: "Top AI Tokens" },
    ],
    badge: "Long Term",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  },
  "best-altcoins-to-buy": {
    title: "Best Altcoins to Buy Right Now",
    subtitle: "Top Non-Bitcoin Picks",
    description: "The best altcoins to buy now ranked by AI investment score. Covers Layer-1s, Layer-2s, DeFi, AI tokens, and meme coins — with momentum data, risk assessment, and entry zones.",
    keywords: "best altcoins to buy, best altcoins 2026, top altcoins, altcoins to invest in",
    faqQ: "What are the best altcoins to buy right now?",
    faqA: "The best altcoins right now combine strong fundamentals with positive momentum. Our AI currently highlights Solana, Chainlink, Arbitrum, NEAR, and Injective as top-tier altcoins with institutional-grade fundamentals and improving price action.",
    coins: ["ethereum","solana","chainlink","arbitrum","near","injective-protocol","toncoin","polkadot","cosmos","aptos"],
    relatedMarkets: [
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "top-ai-crypto-tokens", label: "Top AI Tokens" },
      { slug: "best-defi-tokens", label: "Best DeFi Tokens" },
      { slug: "undervalued-crypto-to-buy", label: "Undervalued Crypto" },
    ],
    badge: "Altcoin Season",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  "top-meme-coins": {
    title: "Top Meme Coins Right Now",
    subtitle: "Best Meme Crypto Rankings",
    description: "Live rankings of the hottest meme coins by community strength, social buzz, trading volume, and price momentum. Includes DOGE, SHIB, PEPE, FLOKI, BONK and emerging meme tokens.",
    keywords: "top meme coins, best meme crypto, meme coin rankings, best meme coins to buy",
    faqQ: "What are the top meme coins right now?",
    faqA: "Top meme coins by market cap include Dogecoin (DOGE), Shiba Inu (SHIB), Pepe (PEPE), Floki (FLOKI), and Bonk (BONK). Our AI tracks social buzz, celebrity mentions, and viral momentum to surface emerging meme coin opportunities early.",
    coins: ["dogecoin","shiba-inu","pepe","floki","bonk","matic-network","tron","kaspa","vechain","hedera"],
    relatedMarkets: [
      { slug: "cheap-crypto-to-buy-now", label: "Cheap Crypto" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
      { slug: "best-crypto-to-buy-today", label: "Best to Buy Today" },
      { slug: "top-crypto-gainers-today", label: "Top Gainers Today" },
    ],
    badge: "Meme Season",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  },
  "best-defi-tokens": {
    title: "Best DeFi Tokens to Buy",
    subtitle: "Top Decentralized Finance Coins",
    description: "The best DeFi tokens ranked by protocol TVL growth, revenue generation, tokenomics quality, and AI investment score. From DEX governance tokens to lending protocols and yield aggregators.",
    keywords: "best defi tokens, top defi coins, defi tokens to buy, best defi crypto",
    faqQ: "What are the best DeFi tokens to buy?",
    faqA: "The best DeFi tokens combine strong protocol revenue, growing TVL, solid tokenomics with value accrual, and active development. Our AI highlights Uniswap (UNI), Chainlink (LINK), Arbitrum (ARB), and Injective (INJ) as top-tier DeFi investments.",
    coins: ["uniswap","chainlink","arbitrum","injective-protocol","near","cosmos","polkadot","avalanche-2","optimism","fetch-ai"],
    relatedMarkets: [
      { slug: "best-altcoins-to-buy", label: "Best Altcoins" },
      { slug: "top-ai-crypto-tokens", label: "Top AI Tokens" },
      { slug: "undervalued-crypto-to-buy", label: "Undervalued Crypto" },
      { slug: "crypto-with-most-potential", label: "Most Potential" },
    ],
    badge: "DeFi Alpha",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  },
  "top-ai-crypto-tokens": {
    title: "Top AI Crypto Tokens",
    subtitle: "Best Artificial Intelligence Coins",
    description: "Rankings of the best AI-focused blockchain projects by market cap, utility, ecosystem growth, and AI investment score. Track the AI crypto narrative: Render, Fetch.ai, and more.",
    keywords: "top AI crypto tokens, best AI crypto, artificial intelligence coins, AI blockchain projects",
    faqQ: "What are the top AI cryptocurrency tokens?",
    faqA: "The top AI crypto tokens leverage artificial intelligence for decentralized compute, autonomous agents, or on-chain AI inference. Our AI currently ranks Render (RNDR), Fetch.ai (FET), Internet Computer (ICP), and Injective (INJ) as the strongest AI narrative plays.",
    coins: ["render-token","fetch-ai","internet-computer","injective-protocol","near","arbitrum","chainlink","sui","aptos","polkadot"],
    relatedMarkets: [
      { slug: "best-altcoins-to-buy", label: "Best Altcoins" },
      { slug: "next-crypto-to-explode", label: "Next to Explode" },
      { slug: "best-defi-tokens", label: "Best DeFi Tokens" },
      { slug: "crypto-with-most-potential", label: "Most Potential" },
    ],
    badge: "AI Narrative",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
};

const COIN_NAMES: Record<string, { name: string; symbol: string }> = {
  bitcoin: { name: "Bitcoin", symbol: "BTC" },
  ethereum: { name: "Ethereum", symbol: "ETH" },
  solana: { name: "Solana", symbol: "SOL" },
  binancecoin: { name: "BNB", symbol: "BNB" },
  ripple: { name: "XRP", symbol: "XRP" },
  cardano: { name: "Cardano", symbol: "ADA" },
  dogecoin: { name: "Dogecoin", symbol: "DOGE" },
  polkadot: { name: "Polkadot", symbol: "DOT" },
  chainlink: { name: "Chainlink", symbol: "LINK" },
  "avalanche-2": { name: "Avalanche", symbol: "AVAX" },
  "matic-network": { name: "Polygon", symbol: "MATIC" },
  "shiba-inu": { name: "Shiba Inu", symbol: "SHIB" },
  litecoin: { name: "Litecoin", symbol: "LTC" },
  uniswap: { name: "Uniswap", symbol: "UNI" },
  cosmos: { name: "Cosmos", symbol: "ATOM" },
  near: { name: "NEAR Protocol", symbol: "NEAR" },
  arbitrum: { name: "Arbitrum", symbol: "ARB" },
  optimism: { name: "Optimism", symbol: "OP" },
  aptos: { name: "Aptos", symbol: "APT" },
  sui: { name: "Sui", symbol: "SUI" },
  pepe: { name: "Pepe", symbol: "PEPE" },
  floki: { name: "Floki", symbol: "FLOKI" },
  bonk: { name: "Bonk", symbol: "BONK" },
  toncoin: { name: "Toncoin", symbol: "TON" },
  tron: { name: "TRON", symbol: "TRX" },
  stellar: { name: "Stellar", symbol: "XLM" },
  monero: { name: "Monero", symbol: "XMR" },
  okb: { name: "OKB", symbol: "OKB" },
  hedera: { name: "Hedera", symbol: "HBAR" },
  filecoin: { name: "Filecoin", symbol: "FIL" },
  vechain: { name: "VeChain", symbol: "VET" },
  "internet-computer": { name: "Internet Computer", symbol: "ICP" },
  "render-token": { name: "Render", symbol: "RNDR" },
  "fetch-ai": { name: "Fetch.ai", symbol: "FET" },
  "injective-protocol": { name: "Injective", symbol: "INJ" },
  kaspa: { name: "Kaspa", symbol: "KAS" },
  "theta-token": { name: "Theta", symbol: "THETA" },
};

export default function MarketPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? MARKET_CONFIGS[slug] : null;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
  const currentYear = new Date().getFullYear();

  // Fallback for unknown market slugs — show a generic helpful page
  const title = config?.title ?? (slug ? slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Market Analysis");
  const subtitle = config?.subtitle ?? "AI-Powered Market Intelligence";
  const description = config?.description ?? `Real-time AI analysis and rankings for ${title}. Updated ${currentMonth} ${currentYear}.`;
  const coins = config?.coins ?? ["bitcoin","ethereum","solana","binancecoin","ripple","cardano","dogecoin","polkadot","toncoin","chainlink"];
  const relatedMarkets = config?.relatedMarkets ?? [];

  const faqSchema = config ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": config.faqQ,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": config.faqA,
      }
    }],
    "dateModified": new Date().toISOString(),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oraclebull.com/" },
      { "@type": "ListItem", "position": 2, "name": "Market Analysis", "item": "https://oraclebull.com/predictions" },
      { "@type": "ListItem", "position": 3, "name": title, "item": `https://oraclebull.com/market/${slug}` },
    ]
  };

  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <Helmet>
        {faqSchema && (
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        )}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <header>
        <Navbar />
      </header>

      <main className="flex-1 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/predictions" className="hover:text-foreground transition-colors">Market Analysis</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{title}</span>
          </nav>

          {/* Hero */}
          <div className="mb-10">
            {config && (
              <Badge className={`mb-4 border ${config.badgeColor} text-xs font-semibold px-3 py-1`}>
                {config.badge}
              </Badge>
            )}
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-2">{subtitle}</p>
            <p className="text-sm text-muted-foreground/70">Updated {currentDate} · AI-Powered Analysis</p>
          </div>

          {/* Description card */}
          <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 mt-0.5 shrink-0">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">AI Market Analysis</h2>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          </div>

          {/* Coin List */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Top Picks — {currentMonth} {currentYear}
            </h2>
            <div className="grid gap-3">
              {coins.map((coinId, index) => {
                const coin = COIN_NAMES[coinId];
                if (!coin) return null;
                const rank = index + 1;
                const isTop3 = rank <= 3;
                return (
                  <Link
                    key={coinId}
                    to={`/price-prediction/${coinId}`}
                    className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 hover:border-primary/40 hover:bg-card/60 transition-all duration-200"
                    aria-label={`View ${coin.name} AI price prediction`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                        isTop3 ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                      }`}>
                        {rank}
                      </div>
                      <div>
                        <p className="font-bold group-hover:text-primary transition-colors">{coin.name}</p>
                        <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isTop3 && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <Badge variant="outline" className="text-xs hidden sm:flex">
                        View AI Prediction
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* FAQ */}
          {config && (
            <section className="mb-12 rounded-2xl border border-border/50 bg-card/20 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Frequently Asked Question
              </h2>
              <div>
                <h3 className="font-semibold text-base mb-2">{config.faqQ}</h3>
                <p className="text-muted-foreground leading-relaxed">{config.faqA}</p>
              </div>
            </section>
          )}

          {/* Tools CTA */}
          <section className="mb-12 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Go Deeper with Oracle Bull Tools
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Get real-time market data, whale alerts, technical analysis, and AI-generated trading signals across all major cryptocurrencies.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" variant="default">
                <Link to="/predictions">AI Predictions Hub</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/sentiment">Sentiment Analysis</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/strength">Strength Meter</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/factory">Crypto Factory</Link>
              </Button>
            </div>
          </section>

          {/* Related Market Pages */}
          {relatedMarkets.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Related Market Analysis</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {relatedMarkets.map((m) => (
                  <Link
                    key={m.slug}
                    to={`/market/${m.slug}`}
                    className="group rounded-xl border border-border/50 bg-card/20 p-4 hover:border-primary/40 hover:bg-card/50 transition-all text-center"
                  >
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{m.label}</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
