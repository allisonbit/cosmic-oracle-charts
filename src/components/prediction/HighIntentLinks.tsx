import { Link } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, BarChart3, Zap, Target, 
  Calendar, Clock, CalendarDays, ChevronRight, Flame,
  Activity, Shield, DollarSign, LineChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HighIntentLinksProps {
  currentCoin?: string;
  currentTimeframe?: 'daily' | 'weekly' | 'monthly';
  coinName?: string;
  symbol?: string;
}

// High-value market questions for internal linking
const MARKET_QUESTIONS = [
  { slug: 'best-crypto-to-buy-today', label: 'Best Crypto to Buy Today', icon: Flame },
  { slug: 'top-crypto-gainers-today', label: 'Top Gainers Today', icon: TrendingUp },
  { slug: 'which-crypto-will-go-up-today', label: 'Which Crypto Will Go Up?', icon: Target },
  { slug: 'next-crypto-to-explode', label: 'Next Crypto to Explode', icon: Zap },
  { slug: 'safest-crypto-to-invest', label: 'Safest Crypto to Invest', icon: Shield },
  { slug: 'cheap-crypto-to-buy-now', label: 'Cheap Crypto to Buy', icon: DollarSign },
];

// Related tools for cross-linking
const RELATED_TOOLS = [
  { path: '/strength', label: 'Crypto Strength Meter', icon: Activity, description: 'Real-time asset rankings' },
  { path: '/factory', label: 'Crypto Factory', icon: Calendar, description: 'Market events & signals' },
  { path: '/dashboard', label: 'Market Dashboard', icon: BarChart3, description: 'Live market overview' },
  { path: '/sentiment', label: 'Sentiment Analysis', icon: LineChart, description: 'Social & whale tracking' },
];

// Top coins for quick navigation
const TOP_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'xrp', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
];

export function MarketQuestionsLinks({ className }: { className?: string }) {
  return (
    <Card className={`bg-card/50 border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Investment Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {MARKET_QUESTIONS.map((q) => (
            <Link
              key={q.slug}
              to={`/market/${q.slug}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group text-sm"
            >
              <q.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="group-hover:text-primary transition-colors truncate">
                {q.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RelatedToolsLinks({ className }: { className?: string }) {
  return (
    <Card className={`bg-card/50 border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Market Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {RELATED_TOOLS.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <tool.icon className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {tool.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickCoinLinks({ 
  currentCoin, 
  timeframe = 'daily',
  className 
}: { 
  currentCoin?: string; 
  timeframe?: string;
  className?: string;
}) {
  return (
    <Card className={`bg-card/50 border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {TOP_COINS.filter(c => c.id !== currentCoin).map((coin) => (
            <Link
              key={coin.id}
              to={`/price-prediction/${coin.id}/${timeframe}`}
              className="text-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 hover:border-primary/30 border border-transparent transition-all group"
            >
              <div className="font-display font-bold text-sm group-hover:text-primary transition-colors">
                {coin.symbol}
              </div>
              <div className="text-xs text-muted-foreground">{coin.name}</div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TimeframeCrossLinks({ 
  coinId, 
  coinName, 
  currentTimeframe 
}: { 
  coinId: string; 
  coinName: string; 
  currentTimeframe: string;
}) {
  const timeframes = [
    { id: 'daily', label: 'Today', icon: Clock, question: `Will ${coinName} go up today?` },
    { id: 'weekly', label: 'This Week', icon: Calendar, question: `${coinName} price this week` },
    { id: 'monthly', label: 'This Month', icon: CalendarDays, question: `${coinName} prediction this month` },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Other {coinName} Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {timeframes.filter(tf => tf.id !== currentTimeframe).map((tf) => (
            <Link
              key={tf.id}
              to={`/price-prediction/${coinId}/${tf.id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <tf.icon className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {coinName} {tf.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{tf.question}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function InvestorActionBadge({ 
  bias, 
  confidence 
}: { 
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}) {
  const getAction = () => {
    if (bias === 'bullish' && confidence >= 70) return { label: 'Consider Buy', color: 'bg-green-600/20 text-green-400 border-green-600/30' };
    if (bias === 'bullish' && confidence >= 55) return { label: 'Watch for Entry', color: 'bg-green-600/10 text-green-300 border-green-600/20' };
    if (bias === 'bearish' && confidence >= 70) return { label: 'Consider Sell', color: 'bg-red-600/20 text-red-400 border-red-600/30' };
    if (bias === 'bearish' && confidence >= 55) return { label: 'Caution', color: 'bg-red-600/10 text-red-300 border-red-600/20' };
    return { label: 'Hold / Wait', color: 'bg-muted text-muted-foreground border-muted' };
  };

  const action = getAction();

  return (
    <Badge className={`${action.color} px-3 py-1`}>
      {bias === 'bullish' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
       bias === 'bearish' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
      {action.label}
    </Badge>
  );
}

export function HighIntentCTA({ coinName, symbol }: { coinName: string; symbol: string }) {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-6">
        <h3 className="font-display font-bold text-lg mb-2">
          Should You Buy {coinName} ({symbol.toUpperCase()}) Now?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get comprehensive analysis including technical indicators, risk assessment, 
          and AI-powered trading zones to make informed decisions.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/strength?coin=${symbol.toLowerCase()}`}
            className="text-sm px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
          >
            Check {symbol} Strength
          </Link>
          <Link
            to="/factory"
            className="text-sm px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            View Market Events
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
