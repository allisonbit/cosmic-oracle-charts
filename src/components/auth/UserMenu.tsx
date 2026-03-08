import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, Star, Bell, Settings, PieChart, Zap, Wallet, Users, DollarSign, BookOpen, Newspaper, TrendingUp, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function UserMenu({ className }: { className?: string }) {
  const { user, profile, loading, signOut } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/my`,
      });
    } catch (e) {
      console.error("Sign in error:", e);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("w-9 h-9 rounded-full bg-muted animate-pulse", className)} />
    );
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignIn}
        disabled={signingIn}
        className={cn("gap-2 h-9 px-3 border-primary/30 hover:bg-primary/10 hover:text-primary", className)}
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    );
  }

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50", className)}>
          <Avatar className="w-9 h-9 border-2 border-primary/30 hover:border-primary/60 transition-colors">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground truncate">
            {profile?.display_name || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
          </p>
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
        <DropdownMenuItem onClick={() => navigate("/my/settings")} className="gap-2 cursor-pointer">
          <Settings className="w-4 h-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
