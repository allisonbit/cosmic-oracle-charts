import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

export function DashboardHeader({ lastUpdate }: { lastUpdate: Date }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 md:mb-8">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold">
          Live Crypto Dashboard
        </h1>
        <p className="text-muted-foreground text-[10px] sm:text-xs flex items-center gap-1.5 mt-1">
          <Clock className="w-3 h-3" />
          Updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] sm:text-xs text-muted-foreground font-display">LIVE</span>
        </div>
        <Link 
          to="/chain/ethereum"
          className="text-[10px] sm:text-xs text-primary hover:text-primary/80 font-display flex items-center gap-1"
        >
          Advanced <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
