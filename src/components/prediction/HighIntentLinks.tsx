import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, BarChart3, Zap, Target,
  Calendar, Clock, CalendarDays, ChevronRight, Flame,
  Activity, Shield, DollarSign, LineChart
} from "lucide-react";
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
  { path: '/crypto-strength-meter', label: 'Crypto Strength Meter', icon: Activity, description: 'Real-time asset rankings' },
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

// ── Editorial sidebar section wrapper ──
function SidebarSection({ icon: Icon, title, children, className }: { icon?: any; title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border-t border-border/30 pt-4 ${className ?? ''}`}>
      <div className="section-label mb-3 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        {title}
      </div>
      {children}
    </section>
  );
}

export function MarketQuestionsLinks({ className }: { className?: string }) {
  return (
    <SidebarSection icon={Target} title="Investment Questions" className={className}>
      <div className="grid grid-cols-1 gap-0">
        {MARKET_QUESTIONS.map((q) => (
          <Link
            key={q.slug}
            to={`/market/${q.slug}`}
            className="editorial-row group text-sm"
          >
            <q.icon className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="group-hover:text-primary transition-colors truncate">{q.label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </SidebarSection>
  );
}

export function RelatedToolsLinks({ className }: { className?: string }) {
  return (
    <SidebarSection icon={BarChart3} title="Market Tools" className={className}>
      <div>
        {RELATED_TOOLS.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="editorial-row group justify-between"
          >
            <div className="flex items-center gap-3">
              <tool.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium text-sm group-hover:text-primary transition-colors">{tool.label}</div>
                <div className="text-xs text-muted-foreground">{tool.description}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </SidebarSection>
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
    <SidebarSection icon={Zap} title="Quick Predictions" className={className}>
      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        {TOP_COINS.filter(c => c.id !== currentCoin).map((coin) => (
          <Link
            key={coin.id}
            to={`/price-prediction/${coin.id}/${timeframe}`}
            className="text-center group hover:opacity-80 transition-opacity"
          >
            <div className="font-display font-bold text-sm group-hover:text-primary transition-colors">{coin.symbol}</div>
            <div className="text-xs text-muted-foreground">{coin.name}</div>
          </Link>
        ))}
      </div>
    </SidebarSection>
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
    <SidebarSection title={`Other ${coinName} Predictions`}>
      <div>
        {timeframes.filter(tf => tf.id !== currentTimeframe).map((tf) => (
          <Link
            key={tf.id}
            to={`/price-prediction/${coinId}/${tf.id}`}
            className="editorial-row group justify-between"
          >
            <div className="flex items-center gap-3">
              <tf.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium text-sm group-hover:text-primary transition-colors">{coinName} {tf.label}</div>
                <div className="text-xs text-muted-foreground">{tf.question}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </SidebarSection>
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
    <section className="border-l-4 border-primary pl-5 py-1">
      <h3 className="font-display font-bold text-lg mb-2">
        Should You Buy {coinName} ({symbol.toUpperCase()}) Now?
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Get comprehensive analysis including technical indicators, risk assessment,
        and AI-powered trading zones to make informed decisions.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          to={`/crypto-strength-meter?coin=${symbol.toLowerCase()}`}
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
    </section>
  );
}
