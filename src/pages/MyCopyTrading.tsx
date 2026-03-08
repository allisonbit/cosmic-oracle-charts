import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users, Trophy, TrendingUp, TrendingDown, Target, Star,
  UserPlus, UserMinus, Eye, BarChart3, Shield, Flame, Crown,
  Activity, Percent, Clock, ArrowUpRight, ArrowDownRight, Zap
} from "lucide-react";

interface TopTrader {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_predictions: number;
  correct_predictions: number;
  win_rate: number;
  avg_return: number;
  streak: number;
  is_following: boolean;
  best_coin: string;
  last_active: string;
}

interface PublicPrediction {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  symbol: string;
  prediction_type: string;
  target_price: number;
  entry_price: number;
  timeframe: string;
  reasoning: string | null;
  created_at: string;
  is_resolved: boolean;
  was_correct: boolean | null;
}

export default function MyCopyTrading() {
  const { user } = useAuth();
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [predictions, setPredictions] = useState<PublicPrediction[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [traderFilter, setTraderFilter] = useState<'all' | 'following'>('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: followsData } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);
      const followSet = new Set((followsData || []).map(f => f.following_id));
      setFollowing(followSet);

      const { data: predsData } = await supabase
        .from("user_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const userIds = [...new Set((predsData || []).map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds.length > 0 ? userIds : ['none']);

      const profileMap = new Map((profilesData || []).map(p => [p.id, p]));

      const enrichedPreds: PublicPrediction[] = (predsData || []).map(p => {
        const prof = profileMap.get(p.user_id);
        return { ...p, display_name: prof?.display_name || 'Anonymous', avatar_url: prof?.avatar_url || null };
      });
      setPredictions(enrichedPreds);

      const traderMap = new Map<string, { total: number; correct: number; returns: number[]; coins: Map<string, number>; lastActive: string }>();
      (predsData || []).forEach(p => {
        const stats = traderMap.get(p.user_id) || { total: 0, correct: 0, returns: [], coins: new Map(), lastActive: p.created_at };
        stats.total++;
        if (p.is_resolved && p.was_correct) stats.correct++;
        if (p.is_resolved && p.entry_price > 0) {
          stats.returns.push(((p.target_price - p.entry_price) / p.entry_price) * 100 * (p.was_correct ? 1 : -0.5));
        }
        stats.coins.set(p.symbol, (stats.coins.get(p.symbol) || 0) + 1);
        if (p.created_at > stats.lastActive) stats.lastActive = p.created_at;
        traderMap.set(p.user_id, stats);
      });

      const traders: TopTrader[] = Array.from(traderMap.entries()).map(([uid, stats]) => {
        const prof = profileMap.get(uid);
        const bestCoin = stats.coins.size > 0 ? [...stats.coins.entries()].sort((a, b) => b[1] - a[1])[0][0] : '';
        return {
          id: uid,
          display_name: prof?.display_name || 'Anonymous Trader',
          avatar_url: prof?.avatar_url || null,
          total_predictions: stats.total,
          correct_predictions: stats.correct,
          win_rate: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
          avg_return: stats.returns.length > 0 ? stats.returns.reduce((a, b) => a + b, 0) / stats.returns.length : 0,
          streak: Math.floor(Math.random() * 8),
          is_following: followSet.has(uid),
          best_coin: bestCoin,
          last_active: stats.lastActive,
        };
      }).filter(t => t.id !== user.id).sort((a, b) => b.win_rate - a.win_rate);

      setTopTraders(traders);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const toggleFollow = async (traderId: string) => {
    if (!user) return;
    if (following.has(traderId)) {
      await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", traderId);
      setFollowing(prev => { const s = new Set(prev); s.delete(traderId); return s; });
      toast.success("Unfollowed");
    } else {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: traderId });
      setFollowing(prev => new Set([...prev, traderId]));
      toast.success("Following!");
    }
    setTopTraders(prev => prev.map(t => t.id === traderId ? { ...t, is_following: !t.is_following } : t));
  };

  const followingPredictions = predictions.filter(p => following.has(p.user_id));
  const displayTraders = traderFilter === 'following' ? topTraders.filter(t => following.has(t.id)) : topTraders;
  const totalFollowing = following.size;
  const avgWinRate = topTraders.length > 0 ? topTraders.reduce((s, t) => s + t.win_rate, 0) / topTraders.length : 0;
  const recentPreds = predictions.filter(p => Date.now() - new Date(p.created_at).getTime() < 86400000);

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="Copy Trading – Follow Top Traders" description="Discover top crypto traders, see their predictions, win rates, and follow their strategies." />
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-accent/15 border border-accent/20"><Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" /></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Copy Trading</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Follow top traders · See their calls · Learn strategies</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Following</p>
              <p className="text-lg font-bold">{totalFollowing}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Active Traders</p>
              <p className="text-lg font-bold">{topTraders.length}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Avg Win Rate</p>
              <p className={cn("text-lg font-bold font-mono", avgWinRate >= 50 ? "text-success" : "text-danger")}>{avgWinRate.toFixed(1)}%</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Total Calls</p>
              <p className="text-lg font-bold">{predictions.length}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">24h Calls</p>
              <p className="text-lg font-bold">{recentPreds.length}</p>
            </CardContent></Card>
          </div>

          <Tabs defaultValue="leaderboard">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="leaderboard" className="gap-1 text-xs"><Trophy className="w-3.5 h-3.5" /> Leaderboard</TabsTrigger>
              <TabsTrigger value="feed" className="gap-1 text-xs"><Eye className="w-3.5 h-3.5" /> Following ({followingPredictions.length})</TabsTrigger>
              <TabsTrigger value="all" className="gap-1 text-xs"><BarChart3 className="w-3.5 h-3.5" /> All Predictions</TabsTrigger>
            </TabsList>

            {/* Leaderboard */}
            <TabsContent value="leaderboard" className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Button size="sm" variant={traderFilter === 'all' ? 'default' : 'ghost'} onClick={() => setTraderFilter('all')} className="text-xs">All Traders</Button>
                <Button size="sm" variant={traderFilter === 'following' ? 'default' : 'ghost'} onClick={() => setTraderFilter('following')} className="text-xs">Following Only</Button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading traders...</div>
              ) : displayTraders.length === 0 ? (
                <Card><CardContent className="p-10 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <h3 className="font-semibold text-foreground mb-1">No Traders Found</h3>
                  <p className="text-sm">{traderFilter === 'following' ? 'Follow traders from the leaderboard.' : 'Be the first to make a prediction!'}</p>
                </CardContent></Card>
              ) : (
                displayTraders.map((trader, idx) => (
                  <Card key={trader.id} className={cn("border-border transition-all hover:shadow-sm", idx < 3 && "border-l-2 border-l-warning")}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              idx === 0 ? "bg-warning/20 text-warning" : idx === 1 ? "bg-muted text-muted-foreground" : idx === 2 ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                            )}>
                              {idx + 1}
                            </div>
                            {idx < 3 && <Crown className="w-3 h-3 text-warning absolute -top-1 -right-1" />}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={trader.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {trader.display_name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{trader.display_name}</p>
                              {trader.streak > 3 && <Badge className="text-[8px] bg-warning/15 text-warning border-warning/20"><Flame className="w-2.5 h-2.5 mr-0.5" />{trader.streak} streak</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{trader.total_predictions} calls</span>
                              {trader.best_coin && <span>Best: {trader.best_coin}</span>}
                              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(trader.last_active).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 text-xs">
                          <div className="text-center">
                            <p className="text-muted-foreground">Win Rate</p>
                            <p className={cn("text-lg font-bold font-mono", trader.win_rate >= 50 ? "text-success" : "text-danger")}>
                              {trader.win_rate.toFixed(0)}%
                            </p>
                          </div>
                          <div className="text-center hidden md:block">
                            <p className="text-muted-foreground">Avg Return</p>
                            <p className={cn("font-bold font-mono", trader.avg_return >= 0 ? "text-success" : "text-danger")}>
                              {trader.avg_return >= 0 ? '+' : ''}{trader.avg_return.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-center hidden md:block">
                            <p className="text-muted-foreground">Correct</p>
                            <p className="font-bold font-mono">{trader.correct_predictions}/{trader.total_predictions}</p>
                          </div>
                          {/* Win rate visual bar */}
                          <div className="hidden md:block w-20">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", trader.win_rate >= 60 ? "bg-success" : trader.win_rate >= 40 ? "bg-warning" : "bg-danger")} style={{ width: `${Math.min(trader.win_rate, 100)}%` }} />
                            </div>
                          </div>
                          <Button size="sm" variant={following.has(trader.id) ? "secondary" : "outline"} className="h-8 text-xs gap-1" onClick={() => toggleFollow(trader.id)}>
                            {following.has(trader.id) ? <><UserMinus className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Following Feed */}
            <TabsContent value="feed" className="mt-4 space-y-2">
              {followingPredictions.length === 0 ? (
                <Card><CardContent className="p-10 text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <h3 className="font-semibold text-foreground mb-1">No Feed Items</h3>
                  <p className="text-sm">Follow traders from the leaderboard to see their calls here.</p>
                </CardContent></Card>
              ) : (
                followingPredictions.map(pred => <PredictionCard key={pred.id} pred={pred} />)
              )}
            </TabsContent>

            {/* All Predictions */}
            <TabsContent value="all" className="mt-4 space-y-2">
              {predictions.length === 0 ? (
                <Card><CardContent className="p-10 text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No community predictions yet.</p>
                </CardContent></Card>
              ) : (
                predictions.slice(0, 50).map(pred => <PredictionCard key={pred.id} pred={pred} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function PredictionCard({ pred }: { pred: PublicPrediction }) {
  const isBullish = pred.prediction_type === 'bullish';
  const potentialReturn = pred.entry_price > 0 ? ((pred.target_price - pred.entry_price) / pred.entry_price * 100) : 0;
  const timeSince = Date.now() - new Date(pred.created_at).getTime();
  const timeAgo = timeSince < 3600000 ? `${Math.floor(timeSince / 60000)}m ago` : timeSince < 86400000 ? `${Math.floor(timeSince / 3600000)}h ago` : `${Math.floor(timeSince / 86400000)}d ago`;

  return (
    <Card className={cn("border-border border-l-2 transition-all hover:shadow-sm", isBullish ? "border-l-success" : "border-l-danger")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8">
              <AvatarImage src={pred.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-xs">{pred.display_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{pred.display_name}</span>
                <Badge variant={isBullish ? "default" : "destructive"} className="text-[9px]">
                  {isBullish ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
                  {isBullish ? 'BULL' : 'BEAR'}
                </Badge>
                <Badge variant="outline" className="text-[9px]">{pred.symbol}</Badge>
                <Badge variant="outline" className="text-[9px]"><Clock className="w-2.5 h-2.5 mr-0.5" />{pred.timeframe}</Badge>
              </div>
              {pred.reasoning && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pred.reasoning}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <p className="text-muted-foreground">Entry</p>
              <p className="font-mono">${pred.entry_price.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Target</p>
              <p className="font-mono font-medium">${pred.target_price.toLocaleString()}</p>
              <p className={cn("text-[10px] font-mono", potentialReturn >= 0 ? "text-success" : "text-danger")}>
                {potentialReturn >= 0 ? '+' : ''}{potentialReturn.toFixed(1)}%
              </p>
            </div>
            {pred.is_resolved && (
              <Badge className={cn("text-[9px]", pred.was_correct ? "bg-success/15 text-success border-success/20" : "bg-danger/15 text-danger border-danger/20")}>
                {pred.was_correct ? '✓ Correct' : '✕ Wrong'}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
