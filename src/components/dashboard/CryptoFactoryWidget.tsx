import { Calendar, TrendingUp, Globe, Newspaper, ArrowRight, AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCryptoFactory } from "@/hooks/useCryptoFactory";

export function CryptoFactoryWidget() {
  const { data, isLoading } = useCryptoFactory();

  const upcomingEvents = data?.events.slice(0, 3) || [];
  const recentActivity = data?.onChainActivity.slice(0, 2) || [];
  const topNarrative = data?.narratives[0];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-danger bg-danger/20';
      case 'medium': return 'text-warning bg-warning/20';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-2.5 h-2.5" />;
      case 'medium': return <Zap className="w-2.5 h-2.5" />;
      default: return null;
    }
  };

  const getActivityDescription = (activity: typeof recentActivity[0]) => {
    const direction = activity.direction === 'inflow' ? 'into' : 'from';
    return `${activity.amount.toLocaleString()} ${activity.asset} ${direction} ${activity.to}`;
  };

  return (
    <div className="holo-card p-3 sm:p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-display text-xs sm:text-sm md:text-base font-bold flex items-center gap-2">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="truncate">CRYPTO FACTORY</span>
        </h3>
        <Link to="/crypto-factory" className="text-primary hover:text-primary/80 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* Upcoming Events */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-display uppercase">Upcoming Events</span>
            </div>
            <div className="space-y-1.5">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-2 p-1.5 rounded bg-muted/30">
                  <span className={cn("text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5", getImpactColor(event.impact))}>
                    {getImpactIcon(event.impact)}
                    {event.impact.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium truncate">{event.title}</p>
                    <p className="text-[8px] sm:text-[9px] text-muted-foreground">
                      {event.asset} • {new Date(event.datetime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On-Chain Activity */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-display uppercase">On-Chain Activity</span>
            </div>
            <div className="space-y-1.5">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    activity.type === 'whale_movement' ? "bg-primary" : 
                    activity.type === 'exchange_flow' ? "bg-warning" : "bg-muted-foreground"
                  )} />
                  <p className="text-[10px] sm:text-xs truncate flex-1">{getActivityDescription(activity)}</p>
                  <span className="text-[8px] text-muted-foreground flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Narrative */}
          {topNarrative && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Newspaper className="w-3 h-3 text-primary" />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-display uppercase">Trending Narrative</span>
              </div>
              <div className="p-2 rounded bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-primary">{topNarrative.narrative}</span>
                  <span className={cn(
                    "text-[8px] px-1.5 py-0.5 rounded",
                    topNarrative.weeklyChange > 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                  )}>
                    {topNarrative.weeklyChange > 0 ? '+' : ''}{topNarrative.weeklyChange}%
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 line-clamp-1">
                  {topNarrative.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Link 
        to="/crypto-factory" 
        className="block text-center text-[10px] text-primary hover:text-primary/80 mt-3 font-display"
      >
        View Full Calendar →
      </Link>
    </div>
  );
}
