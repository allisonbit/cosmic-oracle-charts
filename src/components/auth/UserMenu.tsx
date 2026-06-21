import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { LogIn, LogOut, Star, Bell, Settings, PieChart, Zap, Wallet, Users, DollarSign, BookOpen, Newspaper, TrendingUp, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function UserMenu({ className }: { className?: string }) {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading) {
    return <div className={cn("w-9 h-9 rounded-full bg-muted animate-pulse", className)} />;
  }

  // Logged out → real email sign-in (creates a Supabase session, unlike wallet connect)
  if (!user) {
    return (
      <AuthDialog defaultTab="signin">
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2 h-9 px-3 border-primary/30 hover:bg-primary/10 hover:text-primary", className)}
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
      </AuthDialog>
    );
  }

  const name = profile?.display_name || user.email?.split("@")[0] || "Account";
  const initials = (profile?.display_name || user.email || "U")
    .split(/[\s@.]/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className={cn("flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50", className)}
        >
          <Avatar className="w-9 h-9 border-2 border-primary/30 hover:border-primary/60 transition-colors">
            <AvatarImage src={profile?.avatar_url || undefined} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/my/watchlist")} className="gap-2 cursor-pointer">
          <Star className="w-4 h-4" /> Watchlist
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/portfolio")} className="gap-2 cursor-pointer">
          <PieChart className="w-4 h-4" /> Portfolio
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/alerts")} className="gap-2 cursor-pointer">
          <Bell className="w-4 h-4" /> Alerts
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/tracker")} className="gap-2 cursor-pointer">
          <DollarSign className="w-4 h-4" /> P&L Tracker
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/signals")} className="gap-2 cursor-pointer">
          <Zap className="w-4 h-4" /> AI Signals
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/scanner")} className="gap-2 cursor-pointer">
          <Wallet className="w-4 h-4" /> Wallet Scanner
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/social")} className="gap-2 cursor-pointer">
          <Users className="w-4 h-4" /> Social & Leaderboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/journal")} className="gap-2 cursor-pointer">
          <BookOpen className="w-4 h-4" /> Trade Journal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/news")} className="gap-2 cursor-pointer">
          <Newspaper className="w-4 h-4" /> News Feed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/dca")} className="gap-2 cursor-pointer">
          <TrendingUp className="w-4 h-4" /> DCA Planner
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/copy")} className="gap-2 cursor-pointer">
          <Copy className="w-4 h-4" /> Copy Trading
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my/settings")} className="gap-2 cursor-pointer">
          <Settings className="w-4 h-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
