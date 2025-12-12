import { Layout } from "@/components/layout/Layout";
import { 
  BookOpen, TrendingUp, BarChart3, Zap, Target, Shield, Brain, Rocket, 
  AlertTriangle, Clock, Calendar, ChevronRight, ExternalLink, GraduationCap, 
  Lightbulb, Star, Flame, Play, CheckCircle, Award, Users, Link2,
  Youtube, Twitter, FileText, Globe, MessageCircle, Bookmark, Share2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DailyTip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  learnMore?: string;
}

interface LearningModule {
  id: string;
  icon: typeof BookOpen;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  lessons: {
    title: string;
    duration: string;
    content: string[];
    keyTakeaways: string[];
    resources: { name: string; url: string; type: 'video' | 'article' | 'tool' }[];
  }[];
}

interface ExternalResource {
  name: string;
  description: string;
  url: string;
  category: string;
  icon: string;
}

const externalResources: ExternalResource[] = [
  { name: 'CoinGecko Learn', description: 'Free crypto education', url: 'https://www.coingecko.com/learn', category: 'Education', icon: '🦎' },
  { name: 'Binance Academy', description: 'Comprehensive guides', url: 'https://academy.binance.com', category: 'Education', icon: '📚' },
  { name: 'Investopedia Crypto', description: 'Crypto definitions & guides', url: 'https://www.investopedia.com/cryptocurrency-4427699', category: 'Education', icon: '📖' },
  { name: 'TradingView', description: 'Charts & analysis', url: 'https://www.tradingview.com', category: 'Tools', icon: '📊' },
  { name: 'DeFi Llama', description: 'DeFi analytics', url: 'https://defillama.com', category: 'Tools', icon: '🦙' },
  { name: 'Glassnode', description: 'On-chain analytics', url: 'https://glassnode.com', category: 'Analytics', icon: '🔍' },
  { name: 'Messari', description: 'Crypto research', url: 'https://messari.io', category: 'Research', icon: '📈' },
  { name: 'The Block', description: 'Crypto news & data', url: 'https://www.theblock.co', category: 'News', icon: '📰' },
];

const modules: LearningModule[] = [
  {
    id: "basics",
    icon: GraduationCap,
    title: "Crypto Basics",
    description: "Foundations of cryptocurrency and blockchain technology",
    difficulty: "beginner",
    estimatedTime: "45 min",
    lessons: [
      {
        title: "What is Cryptocurrency?",
        duration: "10 min",
        content: [
          "Cryptocurrency is digital money secured by cryptography, making it nearly impossible to counterfeit",
          "Unlike traditional money, it's decentralized - no single authority like a bank or government controls it",
          "Bitcoin was the first cryptocurrency, created in 2009 by the pseudonymous Satoshi Nakamoto",
          "Transactions are recorded on a public ledger called the blockchain, visible to everyone",
          "You store crypto in digital wallets with private keys - think of it as your password to your funds"
        ],
        keyTakeaways: [
          "Crypto is digital money secured by math, not governments",
          "No central authority controls it - it's peer-to-peer",
          "Your private keys = your funds. Guard them carefully"
        ],
        resources: [
          { name: "Bitcoin Whitepaper", url: "https://bitcoin.org/bitcoin.pdf", type: "article" },
          { name: "What is Bitcoin? (Video)", url: "https://www.youtube.com/watch?v=s4g1XFU8Gto", type: "video" },
          { name: "Blockchain Explorer", url: "https://blockchain.info", type: "tool" }
        ]
      },
      {
        title: "Understanding Blockchain",
        duration: "15 min",
        content: [
          "Blockchain is a chain of data blocks linked together using cryptographic hashes",
          "Each block contains transaction data, a timestamp, and a unique hash fingerprint",
          "Once added, blocks cannot be altered without changing all subsequent blocks - ensuring immutability",
          "Miners/validators verify transactions and add new blocks through consensus mechanisms",
          "Different blockchains use different consensus: Proof of Work (Bitcoin), Proof of Stake (Ethereum)"
        ],
        keyTakeaways: [
          "Blockchain = immutable public ledger",
          "Each block is cryptographically linked to the previous",
          "Consensus mechanisms ensure network agreement"
        ],
        resources: [
          { name: "How Blockchain Works", url: "https://www.youtube.com/watch?v=SSo_EIwHSd4", type: "video" },
          { name: "Etherscan Explorer", url: "https://etherscan.io", type: "tool" },
          { name: "Blockchain Demo", url: "https://andersbrownworth.com/blockchain/", type: "tool" }
        ]
      },
      {
        title: "Types of Cryptocurrencies",
        duration: "20 min",
        content: [
          "Bitcoin (BTC) - Digital gold, store of value, the original cryptocurrency with 21M max supply",
          "Ethereum (ETH) - Smart contract platform enabling decentralized applications (dApps)",
          "Stablecoins (USDT, USDC, DAI) - Pegged to fiat currencies for stability, used for trading",
          "Altcoins - Alternative cryptocurrencies with various use cases: payments, gaming, AI, etc.",
          "Meme coins (DOGE, SHIB, PEPE) - Community-driven, high risk/reward tokens"
        ],
        keyTakeaways: [
          "BTC = digital gold, ETH = programmable money",
          "Stablecoins provide stability in volatile markets",
          "Always research altcoins before investing - many fail"
        ],
        resources: [
          { name: "CoinMarketCap", url: "https://coinmarketcap.com", type: "tool" },
          { name: "Token Categories", url: "https://www.coingecko.com/en/categories", type: "tool" },
          { name: "Crypto Sectors Explained", url: "https://messari.io/research", type: "article" }
        ]
      }
    ]
  },
  {
    id: "charts",
    icon: BarChart3,
    title: "Chart Analysis",
    description: "Master reading and interpreting price charts",
    difficulty: "beginner",
    estimatedTime: "1 hour",
    lessons: [
      {
        title: "Candlestick Basics",
        duration: "15 min",
        content: [
          "Each candle shows open, high, low, and close prices for a time period",
          "Green/white candles = price went UP during the period (close > open)",
          "Red/black candles = price went DOWN during the period (close < open)",
          "The body shows the open-close range; wicks show the high and low reached",
          "Common patterns: Doji (indecision), Hammer (reversal), Engulfing (strong reversal)"
        ],
        keyTakeaways: [
          "Green = bullish, Red = bearish",
          "Long wicks show rejection at price levels",
          "Candle patterns help predict short-term moves"
        ],
        resources: [
          { name: "TradingView Charts", url: "https://www.tradingview.com", type: "tool" },
          { name: "Candlestick Patterns", url: "https://www.investopedia.com/articles/active-trading/092315/5-most-powerful-candlestick-patterns.asp", type: "article" },
          { name: "Chart Patterns Course", url: "https://www.youtube.com/watch?v=eynxyoKgpng", type: "video" }
        ]
      },
      {
        title: "Key Chart Patterns",
        duration: "25 min",
        content: [
          "Head & Shoulders - Classic reversal pattern signaling trend change",
          "Double Top/Bottom - Strong support/resistance confirmation and reversal signal",
          "Triangles (Ascending, Descending, Symmetrical) - Consolidation before breakout",
          "Cup & Handle - Bullish continuation pattern showing accumulation",
          "Flags & Pennants - Short-term continuation signals within trends"
        ],
        keyTakeaways: [
          "Patterns suggest probable outcomes, not certainties",
          "Volume confirms pattern validity",
          "Always use stop losses when trading patterns"
        ],
        resources: [
          { name: "Pattern Recognition Tool", url: "https://www.tradingview.com/chart/", type: "tool" },
          { name: "Chart Patterns Cheat Sheet", url: "https://www.investopedia.com/articles/technical/112601.asp", type: "article" },
          { name: "Pattern Trading Tutorial", url: "https://www.youtube.com/watch?v=wQvFMi-kMWI", type: "video" }
        ]
      },
      {
        title: "Volume Analysis",
        duration: "20 min",
        content: [
          "Volume confirms price movements - it shows conviction behind moves",
          "High volume = strong conviction in the move, likely to continue",
          "Low volume = weak moves, potential reversals or consolidation",
          "Volume spikes often precede major moves - watch for unusual activity",
          "Divergence between price and volume signals caution (price up, volume down = weakness)"
        ],
        keyTakeaways: [
          "Volume validates price action",
          "Watch for volume spikes at key levels",
          "Divergences warn of potential reversals"
        ],
        resources: [
          { name: "Volume Profile Guide", url: "https://www.tradingview.com/support/solutions/43000502040-volume-profile/", type: "article" },
          { name: "On-Chain Volume", url: "https://glassnode.com", type: "tool" },
          { name: "Volume Trading Strategies", url: "https://www.youtube.com/watch?v=rlZRtQkfK04", type: "video" }
        ]
      }
    ]
  },
  {
    id: "trading",
    icon: TrendingUp,
    title: "Trading Strategies",
    description: "Learn profitable trading approaches",
    difficulty: "intermediate",
    estimatedTime: "1.5 hours",
    lessons: [
      {
        title: "Trend Following",
        duration: "20 min",
        content: [
          "The trend is your friend - trade with the momentum, not against it",
          "Use moving averages (20, 50, 200 SMA/EMA) to identify trend direction",
          "Wait for pullbacks to enter in trending markets - don't chase pumps",
          "Set stop losses below recent swing lows in uptrends (above swing highs in downtrends)",
          "Let winners run, cut losers quickly - asymmetric risk/reward wins long-term"
        ],
        keyTakeaways: [
          "Trade with the trend, not against it",
          "Enter on pullbacks, not breakouts",
          "Use moving averages as dynamic support/resistance"
        ],
        resources: [
          { name: "Moving Averages Guide", url: "https://www.investopedia.com/terms/m/movingaverage.asp", type: "article" },
          { name: "Trend Analysis Tool", url: "https://www.tradingview.com/chart/", type: "tool" },
          { name: "Trend Trading Masterclass", url: "https://www.youtube.com/watch?v=QjYYGJ9c_Pc", type: "video" }
        ]
      },
      {
        title: "Support & Resistance Trading",
        duration: "25 min",
        content: [
          "Support = price level where buying pressure is strong enough to stop declines",
          "Resistance = price level where selling pressure is strong enough to stop rallies",
          "These levels act as psychological barriers where traders place orders",
          "Breakouts above resistance often lead to rallies; breakdowns below support lead to dumps",
          "Old resistance becomes new support after breakout (and vice versa)"
        ],
        keyTakeaways: [
          "Buy at support, sell at resistance (range trading)",
          "Trade breakouts with volume confirmation",
          "Key levels from daily/weekly timeframes are strongest"
        ],
        resources: [
          { name: "Support/Resistance Finder", url: "https://www.tradingview.com/chart/", type: "tool" },
          { name: "Key Levels Trading", url: "https://www.investopedia.com/trading/support-and-resistance-basics/", type: "article" },
          { name: "S/R Trading Strategy", url: "https://www.youtube.com/watch?v=8aGhZQkoFbQ", type: "video" }
        ]
      },
      {
        title: "Risk-Reward Management",
        duration: "25 min",
        content: [
          "Always know your risk before entering a trade - plan your exit first",
          "Aim for at least 2:1 reward-to-risk ratio (make $2 for every $1 risked)",
          "Never risk more than 1-2% of your portfolio per trade",
          "Use stop losses religiously - emotions will betray you without them",
          "Position sizing is more important than entry timing - size based on stop distance"
        ],
        keyTakeaways: [
          "Risk 1-2% max per trade",
          "Target 2:1 or better risk/reward",
          "Position size = Risk Amount / Stop Distance"
        ],
        resources: [
          { name: "Position Size Calculator", url: "https://www.myfxbook.com/forex-calculators/position-size", type: "tool" },
          { name: "Risk Management Guide", url: "https://www.investopedia.com/articles/trading/09/risk-management.asp", type: "article" },
          { name: "Kelly Criterion Explained", url: "https://www.youtube.com/watch?v=_FuuYSM7yOo", type: "video" }
        ]
      }
    ]
  },
  {
    id: "defi",
    icon: Zap,
    title: "DeFi Essentials",
    description: "Decentralized finance protocols and strategies",
    difficulty: "intermediate",
    estimatedTime: "1.5 hours",
    lessons: [
      {
        title: "What is DeFi?",
        duration: "20 min",
        content: [
          "DeFi = Decentralized Finance - banking without banks, using smart contracts",
          "Smart contracts automate financial transactions without intermediaries",
          "Anyone can participate - no KYC, no minimum balances, permissionless access",
          "Higher yields but also higher risks - smart contract bugs, rug pulls, impermanent loss",
          "Popular protocols: Uniswap (DEX), Aave (lending), Compound (lending), Curve (stableswaps)"
        ],
        keyTakeaways: [
          "DeFi = permissionless financial services",
          "Higher yields come with higher risks",
          "Always verify smart contract audits"
        ],
        resources: [
          { name: "DeFi Llama Analytics", url: "https://defillama.com", type: "tool" },
          { name: "DeFi Pulse", url: "https://www.defipulse.com", type: "tool" },
          { name: "DeFi Explained", url: "https://www.youtube.com/watch?v=k9HYC0EJU6E", type: "video" }
        ]
      },
      {
        title: "Yield Farming Basics",
        duration: "25 min",
        content: [
          "Provide liquidity to DEXs to earn trading fees from swaps",
          "Stake tokens in protocols to earn rewards (governance tokens, yield)",
          "APY = Annual Percentage Yield (includes compounding), APR doesn't compound",
          "Beware of impermanent loss in liquidity pools - affects volatile pairs most",
          "High APYs often mean higher risks - unsustainable or dying protocols"
        ],
        keyTakeaways: [
          "APY includes compounding, APR doesn't",
          "Impermanent loss is real - understand it before LPing",
          "Sustainable yields are usually 5-20%, not 1000%"
        ],
        resources: [
          { name: "Impermanent Loss Calculator", url: "https://dailydefi.org/tools/impermanent-loss-calculator/", type: "tool" },
          { name: "Yield Farming Guide", url: "https://academy.binance.com/en/articles/what-is-yield-farming-in-decentralized-finance-defi", type: "article" },
          { name: "Yield Farming Tutorial", url: "https://www.youtube.com/watch?v=ClnnLI1SClA", type: "video" }
        ]
      },
      {
        title: "DEX vs CEX",
        duration: "20 min",
        content: [
          "DEX = Decentralized Exchange (Uniswap, SushiSwap, Jupiter) - trade directly from wallet",
          "CEX = Centralized Exchange (Binance, Coinbase, Kraken) - custody by exchange",
          "DEXs: No custody, higher privacy, but higher fees and slippage",
          "CEXs: Easier to use, more liquidity, lower fees, but custody risk",
          "Not your keys, not your coins - CEX hacks happen regularly"
        ],
        keyTakeaways: [
          "DEX = self-custody, CEX = exchange custody",
          "Use DEXs for privacy and control",
          "Use CEXs for liquidity and convenience"
        ],
        resources: [
          { name: "Uniswap", url: "https://app.uniswap.org", type: "tool" },
          { name: "DEX Aggregator (1inch)", url: "https://1inch.io", type: "tool" },
          { name: "CEX vs DEX Comparison", url: "https://www.youtube.com/watch?v=2tTVJL4bpTU", type: "video" }
        ]
      }
    ]
  },
  {
    id: "risk",
    icon: Shield,
    title: "Risk Management",
    description: "Protect your capital and survive the market",
    difficulty: "advanced",
    estimatedTime: "1 hour",
    lessons: [
      {
        title: "Position Sizing",
        duration: "20 min",
        content: [
          "Never risk more than you can afford to lose - this is rule #1",
          "Kelly Criterion helps calculate optimal position size based on edge",
          "Diversify across different assets, sectors, and chains - correlation matters",
          "Consider correlation between positions - many alts move together",
          "Reduce size in volatile markets - same % risk = smaller positions"
        ],
        keyTakeaways: [
          "Size positions based on risk tolerance, not greed",
          "Diversification reduces portfolio volatility",
          "Correlation kills - spread across uncorrelated assets"
        ],
        resources: [
          { name: "Kelly Calculator", url: "https://www.investopedia.com/articles/trading/04/091504.asp", type: "article" },
          { name: "Portfolio Tracker", url: "https://www.coingecko.com/en/portfolio", type: "tool" },
          { name: "Position Sizing Guide", url: "https://www.youtube.com/watch?v=zQGKyv3YoAE", type: "video" }
        ]
      },
      {
        title: "Psychology & Emotions",
        duration: "20 min",
        content: [
          "Fear and greed are your biggest enemies - they override logic",
          "FOMO (Fear Of Missing Out) leads to buying tops at the worst times",
          "Panic selling locks in losses - markets recover, paperhands don't",
          "Have a plan and stick to it - write it down, follow the rules",
          "Take breaks when emotions run high - sleep on big decisions"
        ],
        keyTakeaways: [
          "FOMO and panic are portfolio killers",
          "Pre-plan entries, exits, and position sizes",
          "Taking breaks saves money"
        ],
        resources: [
          { name: "Trading Psychology Book", url: "https://www.amazon.com/Trading-Zone-Confidence-Discipline-Attitude/dp/0735201447", type: "article" },
          { name: "Fear & Greed Index", url: "https://alternative.me/crypto/fear-and-greed-index/", type: "tool" },
          { name: "Trading Psychology Course", url: "https://www.youtube.com/watch?v=kxGWsHYITAw", type: "video" }
        ]
      },
      {
        title: "Common Scams to Avoid",
        duration: "20 min",
        content: [
          "Rug pulls - Devs abandon project after pumping, liquidity removed",
          "Phishing - Fake websites stealing your seed phrase or private keys",
          "Pump & dumps - Coordinated price manipulation, insiders dump on buyers",
          "Honeypots - Tokens you can buy but can't sell due to malicious code",
          "Always DYOR - Do Your Own Research: check team, audits, tokenomics, community"
        ],
        keyTakeaways: [
          "If it sounds too good to be true, it is",
          "Never share your seed phrase - ever",
          "Verify contracts before interacting"
        ],
        resources: [
          { name: "Token Sniffer", url: "https://tokensniffer.com", type: "tool" },
          { name: "Rug Check", url: "https://www.rugcheck.xyz", type: "tool" },
          { name: "How to Spot Scams", url: "https://www.youtube.com/watch?v=kU83e_9KQvU", type: "video" }
        ]
      }
    ]
  },
  {
    id: "advanced",
    icon: Brain,
    title: "Advanced Analysis",
    description: "Professional-level market analysis techniques",
    difficulty: "advanced",
    estimatedTime: "1.5 hours",
    lessons: [
      {
        title: "On-Chain Analysis",
        duration: "30 min",
        content: [
          "Track whale movements and accumulation patterns - large wallets lead",
          "Monitor exchange inflows/outflows - outflows = bullish, inflows = selling pressure",
          "Analyze holder distribution - top 10 holders, retail vs smart money",
          "Use tools like Glassnode, Nansen, Arkham for on-chain intelligence",
          "On-chain data often leads price action - fundamentals matter"
        ],
        keyTakeaways: [
          "Follow the smart money on-chain",
          "Exchange flows predict selling pressure",
          "Holder distribution shows concentration risk"
        ],
        resources: [
          { name: "Glassnode", url: "https://glassnode.com", type: "tool" },
          { name: "Nansen", url: "https://nansen.ai", type: "tool" },
          { name: "On-Chain Analysis Guide", url: "https://www.youtube.com/watch?v=VfVJl2kDTKY", type: "video" }
        ]
      },
      {
        title: "Market Cycles",
        duration: "25 min",
        content: [
          "Crypto moves in 4-year cycles roughly aligned with Bitcoin halving events",
          "Accumulation → Markup → Distribution → Markdown (Wyckoff cycle)",
          "Extreme fear = buying opportunities for long-term investors",
          "Extreme greed = selling opportunities to take profits",
          "Be patient - cycles take time, don't force trades"
        ],
        keyTakeaways: [
          "Buy fear, sell greed",
          "Halving cycles drive macro trends",
          "Patience is the ultimate edge"
        ],
        resources: [
          { name: "Bitcoin Rainbow Chart", url: "https://www.blockchaincenter.net/en/bitcoin-rainbow-chart/", type: "tool" },
          { name: "Market Cycles Explained", url: "https://academy.binance.com/en/articles/the-psychology-of-market-cycles", type: "article" },
          { name: "Wyckoff Method", url: "https://www.youtube.com/watch?v=jK5jm-QEJPI", type: "video" }
        ]
      },
      {
        title: "Macro Analysis",
        duration: "25 min",
        content: [
          "Crypto correlates with traditional markets, especially tech/risk assets",
          "Interest rates affect risk appetite - higher rates = risk-off, lower rates = risk-on",
          "Dollar strength (DXY) inversely impacts crypto prices",
          "Regulatory news causes volatility - watch SEC, CFTC, global regulators",
          "Follow Fed policy and economic indicators (CPI, employment, GDP)"
        ],
        keyTakeaways: [
          "Macro matters - crypto doesn't exist in isolation",
          "Rising rates hurt risk assets including crypto",
          "Follow the Fed and global central banks"
        ],
        resources: [
          { name: "Fed Calendar", url: "https://www.federalreserve.gov/newsevents/calendar.htm", type: "tool" },
          { name: "Economic Calendar", url: "https://www.investing.com/economic-calendar/", type: "tool" },
          { name: "Macro for Crypto", url: "https://www.youtube.com/watch?v=PHe0bXAIuk0", type: "video" }
        ]
      }
    ]
  }
];

const dailyTips = [
  { title: "Set Stop Losses", content: "Always protect your capital with stop losses. A small loss today is better than a big loss tomorrow. Consider using trailing stops to lock in profits.", category: "Risk", learnMore: "https://www.investopedia.com/terms/s/stop-lossorder.asp" },
  { title: "Dollar Cost Average", content: "DCA is one of the safest strategies. Invest fixed amounts regularly regardless of price. Time in the market beats timing the market.", category: "Strategy", learnMore: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp" },
  { title: "Diversify Smart", content: "Don't put all eggs in one basket. Spread across different coins, sectors, and chains. Consider BTC/ETH as core holdings.", category: "Portfolio", learnMore: "https://academy.binance.com/en/articles/asset-allocation-and-diversification-explained" },
  { title: "Take Profits", content: "Greed kills portfolios. Set profit targets and take some off the table when reached. Nobody ever went broke taking profits.", category: "Strategy", learnMore: "https://www.investopedia.com/articles/active-trading/090115/6-best-strategies-taking-profits.asp" },
  { title: "DYOR Always", content: "Never invest based on hype alone. Research the team, tokenomics, use case, and competition. Check for audits and verify contracts.", category: "Research", learnMore: "https://academy.binance.com/en/articles/how-to-dyor-when-researching-crypto" },
  { title: "Secure Your Keys", content: "Use hardware wallets for large holdings. Never share your seed phrase with anyone. Verify websites before connecting wallets.", category: "Security", learnMore: "https://www.ledger.com/academy/hardwarewallet/best-practices-when-using-a-hardware-wallet" },
  { title: "Follow the Trend", content: "The trend is your friend. Trading against strong trends is a recipe for losses. Wait for confirmation before fading momentum.", category: "Trading", learnMore: "https://www.investopedia.com/articles/technical/03/060303.asp" },
];

const generateDailyTip = (date: Date): DailyTip => {
  const dayIndex = date.getDate() % dailyTips.length;
  return {
    id: dayIndex,
    ...dailyTips[dayIndex],
    date: date.toISOString().split("T")[0]
  };
};

const LearnPage = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [dailyTip, setDailyTip] = useState<DailyTip>(() => generateDailyTip(new Date()));
  const [resourceModal, setResourceModal] = useState<{ name: string; resources: any[] } | null>(null);

  useEffect(() => {
    setDailyTip(generateDailyTip(new Date()));
  }, []);

  const currentModule = modules.find(m => m.id === selectedModule);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "text-success bg-success/20";
      case "intermediate": return "text-warning bg-warning/20";
      case "advanced": return "text-danger bg-danger/20";
      default: return "text-muted-foreground";
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return Youtube;
      case 'article': return FileText;
      case 'tool': return Globe;
      default: return Link2;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">ACADEMY</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Master crypto trading with comprehensive learning modules, daily tips, and curated resources
          </p>
        </div>

        {/* Daily Tip - Enhanced */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="holo-card p-6 border-l-4 border-l-warning">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-display font-bold">Daily Tip</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">{dailyTip.category}</span>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-1">{dailyTip.title}</h4>
                <p className="text-muted-foreground mb-3">{dailyTip.content}</p>
                {dailyTip.learnMore && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => window.open(dailyTip.learnMore, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" /> Learn More
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Module Grid or Detail View */}
        {!selectedModule ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="holo-card p-4 text-center">
                <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-display font-bold">{modules.length}</div>
                <div className="text-xs text-muted-foreground">Modules</div>
              </div>
              <div className="holo-card p-4 text-center">
                <GraduationCap className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-display font-bold">
                  {modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
              <div className="holo-card p-4 text-center">
                <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
                <div className="text-2xl font-display font-bold">7h+</div>
                <div className="text-xs text-muted-foreground">Content</div>
              </div>
              <div className="holo-card p-4 text-center">
                <Star className="w-6 h-6 text-success mx-auto mb-2" />
                <div className="text-2xl font-display font-bold">Free</div>
                <div className="text-xs text-muted-foreground">Forever</div>
              </div>
            </div>

            {/* Module Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {modules.map((module, i) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className="holo-card p-6 text-left hover:scale-[1.02] transition-transform animate-fade-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className={cn("text-xs px-2 py-1 rounded font-bold uppercase", getDifficultyColor(module.difficulty))}>
                        {module.difficulty}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" /> {module.lessons.length} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {module.estimatedTime}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* External Resources */}
            <div className="holo-card p-6 mb-8">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                RECOMMENDED RESOURCES
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {externalResources.map((resource) => (
                  <button
                    key={resource.name}
                    onClick={() => window.open(resource.url, '_blank')}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all text-center group"
                  >
                    <span className="text-2xl mb-2 block">{resource.icon}</span>
                    <div className="text-xs font-medium truncate">{resource.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{resource.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a 
                href="https://www.tradingview.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="holo-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-bold text-sm">TradingView</div>
                  <div className="text-xs text-muted-foreground">Charts & Analysis</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
              <a 
                href="https://defillama.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="holo-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <Zap className="w-8 h-8 text-secondary" />
                <div>
                  <div className="font-bold text-sm">DeFi Llama</div>
                  <div className="text-xs text-muted-foreground">DeFi Analytics</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
              <a 
                href="https://alternative.me/crypto/fear-and-greed-index/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="holo-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <Target className="w-8 h-8 text-warning" />
                <div>
                  <div className="font-bold text-sm">Fear & Greed</div>
                  <div className="text-xs text-muted-foreground">Market Sentiment</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
              <a 
                href="https://tokensniffer.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="holo-card p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <Shield className="w-8 h-8 text-success" />
                <div>
                  <div className="font-bold text-sm">Token Sniffer</div>
                  <div className="text-xs text-muted-foreground">Scam Detection</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Back Button & Module Header */}
            <Button variant="ghost" onClick={() => { setSelectedModule(null); setExpandedLesson(null); }} className="mb-6 gap-2">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Modules
            </Button>

            {currentModule && (
              <div className="space-y-6">
                {/* Module Header */}
                <div className="holo-card p-6">
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                      <currentModule.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-bold text-2xl">{currentModule.title}</h2>
                      <p className="text-muted-foreground">{currentModule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {currentModule.estimatedTime}
                      </span>
                      <span className={cn("text-xs px-3 py-1 rounded font-bold uppercase", getDifficultyColor(currentModule.difficulty))}>
                        {currentModule.difficulty}
                      </span>
                    </div>
                  </div>
                  <Progress value={(currentModule.lessons.indexOf(currentModule.lessons.find(l => l.title === expandedLesson) || currentModule.lessons[0]) + 1) / currentModule.lessons.length * 100} className="h-2" />
                </div>

                {/* Lessons */}
                <div className="space-y-4">
                  {currentModule.lessons.map((lesson, i) => (
                    <div key={lesson.title} className="holo-card overflow-hidden">
                      <button
                        onClick={() => setExpandedLesson(expandedLesson === lesson.title ? null : lesson.title)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                            {i + 1}
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold">{lesson.title}</h4>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {lesson.duration}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={cn("w-5 h-5 transition-transform", expandedLesson === lesson.title && "rotate-90")} />
                      </button>

                      {expandedLesson === lesson.title && (
                        <div className="p-4 pt-0 border-t border-border space-y-4">
                          {/* Content */}
                          <ul className="space-y-2">
                            {lesson.content.map((point, j) => (
                              <li key={j} className="flex gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Key Takeaways */}
                          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                            <h5 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                              <Award className="w-4 h-4 text-primary" />
                              KEY TAKEAWAYS
                            </h5>
                            <ul className="space-y-1">
                              {lesson.keyTakeaways.map((takeaway, j) => (
                                <li key={j} className="text-sm flex items-center gap-2">
                                  <Star className="w-3 h-3 text-warning" />
                                  {takeaway}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Resources */}
                          <div>
                            <h5 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                              <Link2 className="w-4 h-4 text-secondary" />
                              RESOURCES
                            </h5>
                            <div className="grid sm:grid-cols-3 gap-2">
                              {lesson.resources.map((resource) => {
                                const ResourceIcon = getResourceIcon(resource.type);
                                return (
                                  <button
                                    key={resource.name}
                                    onClick={() => window.open(resource.url, '_blank')}
                                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-2 text-left"
                                  >
                                    <ResourceIcon className={cn("w-4 h-4 shrink-0", 
                                      resource.type === 'video' ? 'text-danger' : 
                                      resource.type === 'article' ? 'text-primary' : 'text-success'
                                    )} />
                                    <span className="text-xs truncate">{resource.name}</span>
                                    <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground shrink-0" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default LearnPage;
