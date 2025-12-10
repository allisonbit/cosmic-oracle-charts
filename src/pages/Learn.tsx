import { Layout } from "@/components/layout/Layout";
import { BookOpen, TrendingUp, BarChart3, Zap, Target, Shield, Brain, Rocket, AlertTriangle, Clock, Calendar, ChevronRight, ExternalLink, GraduationCap, Lightbulb, Star, Flame } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface DailyTip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

interface LearningModule {
  id: string;
  icon: typeof BookOpen;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessons: {
    title: string;
    duration: string;
    content: string[];
  }[];
}

const modules: LearningModule[] = [
  {
    id: "basics",
    icon: GraduationCap,
    title: "Crypto Basics",
    description: "Foundations of cryptocurrency and blockchain technology",
    difficulty: "beginner",
    lessons: [
      {
        title: "What is Cryptocurrency?",
        duration: "5 min",
        content: [
          "Cryptocurrency is digital money secured by cryptography",
          "Unlike traditional money, it's decentralized - no single authority controls it",
          "Bitcoin was the first cryptocurrency, created in 2009",
          "Transactions are recorded on a public ledger called the blockchain",
          "You store crypto in digital wallets with private keys"
        ]
      },
      {
        title: "Understanding Blockchain",
        duration: "7 min",
        content: [
          "Blockchain is a chain of data blocks linked together",
          "Each block contains transaction data and a unique hash",
          "Once added, blocks cannot be altered - ensuring security",
          "Miners/validators verify transactions and add new blocks",
          "Different blockchains have different consensus mechanisms"
        ]
      },
      {
        title: "Types of Cryptocurrencies",
        duration: "6 min",
        content: [
          "Bitcoin (BTC) - Digital gold, store of value",
          "Ethereum (ETH) - Smart contract platform",
          "Stablecoins (USDT, USDC) - Pegged to fiat currencies",
          "Altcoins - Alternative cryptocurrencies with various use cases",
          "Meme coins - Community-driven, high risk tokens"
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
    lessons: [
      {
        title: "Candlestick Basics",
        duration: "8 min",
        content: [
          "Each candle shows open, high, low, and close prices",
          "Green/white candles = price went UP during the period",
          "Red/black candles = price went DOWN during the period",
          "The body shows the open-close range",
          "The wicks show the highest and lowest prices reached"
        ]
      },
      {
        title: "Key Chart Patterns",
        duration: "10 min",
        content: [
          "Head & Shoulders - Classic reversal pattern",
          "Double Top/Bottom - Strong support/resistance confirmation",
          "Triangles - Consolidation before breakout",
          "Cup & Handle - Bullish continuation pattern",
          "Flags & Pennants - Short-term continuation signals"
        ]
      },
      {
        title: "Volume Analysis",
        duration: "6 min",
        content: [
          "Volume confirms price movements",
          "High volume = strong conviction in the move",
          "Low volume = weak moves, potential reversals",
          "Volume spikes often precede major moves",
          "Divergence between price and volume signals caution"
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
    lessons: [
      {
        title: "Trend Following",
        duration: "8 min",
        content: [
          "The trend is your friend - trade with the momentum",
          "Use moving averages to identify trend direction",
          "Wait for pullbacks to enter in trending markets",
          "Set stop losses below recent swing lows",
          "Let winners run, cut losers quickly"
        ]
      },
      {
        title: "Support & Resistance Trading",
        duration: "10 min",
        content: [
          "Support = price level where buying pressure is strong",
          "Resistance = price level where selling pressure is strong",
          "These levels act as psychological barriers",
          "Breakouts above resistance often lead to rallies",
          "Breakdowns below support often lead to dumps"
        ]
      },
      {
        title: "Risk-Reward Management",
        duration: "7 min",
        content: [
          "Always know your risk before entering a trade",
          "Aim for at least 2:1 reward-to-risk ratio",
          "Never risk more than 1-2% per trade",
          "Use stop losses religiously",
          "Position sizing is more important than entry timing"
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
    lessons: [
      {
        title: "What is DeFi?",
        duration: "6 min",
        content: [
          "DeFi = Decentralized Finance - banking without banks",
          "Smart contracts automate financial transactions",
          "Anyone can participate - no KYC required",
          "Higher yields but also higher risks",
          "Popular protocols: Uniswap, Aave, Compound"
        ]
      },
      {
        title: "Yield Farming Basics",
        duration: "8 min",
        content: [
          "Provide liquidity to earn trading fees",
          "Stake tokens to earn rewards",
          "APY = Annual Percentage Yield (includes compounding)",
          "Beware of impermanent loss in liquidity pools",
          "High APYs often mean higher risks"
        ]
      },
      {
        title: "DEX vs CEX",
        duration: "5 min",
        content: [
          "DEX = Decentralized Exchange (Uniswap, SushiSwap)",
          "CEX = Centralized Exchange (Binance, Coinbase)",
          "DEXs: No custody, higher privacy, but higher fees",
          "CEXs: Easier to use, more liquidity, but custody risk",
          "Not your keys, not your coins"
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
    lessons: [
      {
        title: "Position Sizing",
        duration: "7 min",
        content: [
          "Never risk more than you can afford to lose",
          "Kelly Criterion helps calculate optimal position size",
          "Diversify across different assets and sectors",
          "Consider correlation between positions",
          "Reduce size in volatile markets"
        ]
      },
      {
        title: "Psychology & Emotions",
        duration: "8 min",
        content: [
          "Fear and greed are your biggest enemies",
          "FOMO leads to buying tops",
          "Panic selling locks in losses",
          "Have a plan and stick to it",
          "Take breaks when emotions run high"
        ]
      },
      {
        title: "Common Scams to Avoid",
        duration: "6 min",
        content: [
          "Rug pulls - Devs abandon project after pumping",
          "Phishing - Fake websites stealing your keys",
          "Pump & dumps - Coordinated price manipulation",
          "Honeypots - Tokens you can't sell",
          "Always DYOR - Do Your Own Research"
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
    lessons: [
      {
        title: "On-Chain Analysis",
        duration: "10 min",
        content: [
          "Track whale movements and accumulation",
          "Monitor exchange inflows/outflows",
          "Analyze holder distribution",
          "Use tools like Glassnode, Nansen",
          "On-chain data often leads price action"
        ]
      },
      {
        title: "Market Cycles",
        duration: "8 min",
        content: [
          "Crypto moves in 4-year cycles (Bitcoin halving)",
          "Accumulation → Markup → Distribution → Markdown",
          "Extreme fear = buying opportunities",
          "Extreme greed = selling opportunities",
          "Be patient - cycles take time"
        ]
      },
      {
        title: "Macro Analysis",
        duration: "7 min",
        content: [
          "Crypto correlates with traditional markets",
          "Interest rates affect risk appetite",
          "Dollar strength impacts crypto prices",
          "Regulatory news causes volatility",
          "Follow Fed policy and economic indicators"
        ]
      }
    ]
  }
];

// Generate daily tips based on the date
const generateDailyTip = (date: Date): DailyTip => {
  const tips = [
    { title: "Set Stop Losses", content: "Always protect your capital with stop losses. A small loss today is better than a big loss tomorrow.", category: "Risk" },
    { title: "Dollar Cost Average", content: "DCA is one of the safest strategies. Invest fixed amounts regularly regardless of price.", category: "Strategy" },
    { title: "Diversify Smart", content: "Don't put all eggs in one basket. Spread across different coins, sectors, and chains.", category: "Portfolio" },
    { title: "Take Profits", content: "Greed kills portfolios. Set profit targets and take some off the table when reached.", category: "Strategy" },
    { title: "DYOR Always", content: "Never invest based on hype alone. Research the team, tokenomics, and use case.", category: "Research" },
    { title: "Secure Your Keys", content: "Use hardware wallets for large holdings. Never share your seed phrase with anyone.", category: "Security" },
    { title: "Follow the Trend", content: "The trend is your friend. Trading against strong trends is a recipe for losses.", category: "Trading" },
  ];
  
  const dayIndex = date.getDate() % tips.length;
  return {
    id: dayIndex,
    ...tips[dayIndex],
    date: date.toISOString().split("T")[0]
  };
};

const LearnPage = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [dailyTip, setDailyTip] = useState<DailyTip>(() => generateDailyTip(new Date()));

  // Update tip daily
  useEffect(() => {
    const now = new Date();
    setDailyTip(generateDailyTip(now));
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="glow-text">ORACLE</span> <span className="text-gradient-cosmic">ACADEMY</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Master crypto trading with our comprehensive learning modules • Updated daily
          </p>
        </div>

        {/* Daily Tip */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="holo-card p-6 border-l-4 border-l-warning">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-bold">Daily Tip</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">{dailyTip.category}</span>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-1">{dailyTip.title}</h4>
                <p className="text-muted-foreground">{dailyTip.content}</p>
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
                <div className="text-2xl font-display font-bold">2h+</div>
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
                  <div
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    className="holo-card p-6 cursor-pointer hover:scale-[1.02] transition-transform animate-fade-in"
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
                      <span>{module.lessons.length} lessons</span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Back Button & Module Header */}
            <Button variant="ghost" onClick={() => setSelectedModule(null)} className="mb-6 gap-2">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Modules
            </Button>

            {currentModule && (
              <div className="space-y-6">
                {/* Module Header */}
                <div className="holo-card p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                      <currentModule.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-2xl">{currentModule.title}</h2>
                      <p className="text-muted-foreground">{currentModule.description}</p>
                    </div>
                    <span className={cn("text-xs px-3 py-1 rounded font-bold uppercase ml-auto", getDifficultyColor(currentModule.difficulty))}>
                      {currentModule.difficulty}
                    </span>
                  </div>
                </div>

                {/* Lessons */}
                <div className="space-y-4">
                  {currentModule.lessons.map((lesson, i) => (
                    <div key={lesson.title} className="holo-card overflow-hidden">
                      <button
                        onClick={() => setExpandedLesson(expandedLesson === lesson.title ? null : lesson.title)}
                        className="w-full p-6 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-display font-bold text-primary">{i + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-display font-bold">{lesson.title}</h3>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "w-5 h-5 text-primary transition-transform",
                          expandedLesson === lesson.title && "rotate-90"
                        )} />
                      </button>
                      
                      {expandedLesson === lesson.title && (
                        <div className="px-6 pb-6 pt-0 animate-fade-in">
                          <div className="border-t border-border pt-4">
                            <ul className="space-y-3">
                              {lesson.content.map((point, j) => (
                                <li key={j} className="flex items-start gap-3 text-muted-foreground">
                                  <span className="text-primary mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
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

        {/* Disclaimer */}
        <div className="mt-12 holo-card p-6 text-center max-w-3xl mx-auto">
          <h3 className="font-display font-bold text-warning mb-2 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            IMPORTANT DISCLAIMER
          </h3>
          <p className="text-muted-foreground text-sm">
            This content is for educational purposes only and should not be considered financial advice. 
            Cryptocurrency investments carry significant risk. Always do your own research and consider 
            consulting a financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LearnPage;
