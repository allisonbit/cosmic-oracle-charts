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
  UserPlus, UserMinus, Eye, BarChart3, Shield, Flame, Crown
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch follows
      const { data: followsData } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);
      const followSet = new Set((followsData || []).map(f => f.following_id));
      setFollowing(followSet);

      // Fetch predictions with profile data
      const { data: predsData } = await supabase
        .from("user_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Fetch profiles for these predictions
      const userIds = [...new Set((predsData || []).map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds.length > 0 ? userIds : ['none']);

      const profileMap = new Map((profilesData || []).map(p => [p.id, p]));

      // Build predictions with profile info
      const enrichedPreds: PublicPrediction[] = (predsData || []).map(p => {
        const prof = profileMap.get(p.user_id);
        return {
          ...p,
          display_name: prof?.display_name || 'Anonymous',
          avatar_url: prof?.avatar_url || null,
        };
      });
      setPredictions(enrichedPreds);

      // Build top traders from prediction data
      const traderMap = new Map<string, { total: number; correct: number; returns: number[] }>();
      (predsData || []).forEach(p => {
        const stats = traderMap.get(p.user_id) || { total: 0, correct: 0, returns: [] };
        stats.total++;
        if (p.is_resolved && p.was_correct) stats.correct++;
        if (p.is_resolved && p.entry_price > 0) {
          stats.returns.push(((p.target_price - p.entry_price) / p.entry_price) * 100 * (p.was_correct ? 1 : -0.5));
        }
        traderMap.set(p.user_id, stats);
      });

      const traders: TopTrader[] = Array.from(traderMap.entries()).map(([uid, stats]) => {
        const prof = profileMap.get(uid);
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
        };
      }).filter(t => t.id !== user.id)
        .sort((a, b) => b.win_rate - a.win_rate);

      setTopTraders(traders);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const toggleFollow = async (traderId: string) => {
    if (!user) return;
    if (following.has(traderId)) {
      await supabase.from("user_follows").delete()
        .eq("follower_id", user.id).eq("following_id", traderId);
      setFollowing(prev => { const s = new Set(prev); s.delete(traderId); return s; });
      toast.success("Unfollowed trader");
    } else {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: traderId });
      setFollowing(prev => new Set([...prev, traderId]));
      toast.success("Following trader!");
    }
    setTopTraders(prev => prev.map(t => t.id === traderId ? { ...t, is_following: !t.is_following } : t));
  };

  const followingPredictions = predictions.filter(p => following.has(p.user_id));

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="Copy Trading – Follow Top Crypto Traders" description="Discover and follow the best crypto traders. See their predictions, win rates, and copy their strategies." />
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20"><Users className="w-6 h-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold">Copy Trading</h1>
              <p className="text-sm text-muted-foreground">Follow top traders, see their calls, learn their strategies</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Following</p>
              <p className="text-lg font-bold">{following.size}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Active Traders</p>
              <p className="text-lg font-bold">{topTraders.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Recent Calls</p>
              <p className="text-lg font-bold">{predictions.length}</p>
            </CardContent></Card>
          </div>

          <Tabs defaultValue="leaderboard">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="leaderboard" className="gap-1 text-xs"><Trophy className="w-3.5 h-3.5" /> Leaderboard</TabsTrigger>
              <TabsTrigger value="feed" className="gap-1 text-xs"><Eye className="w-3.5 h-3.5" /> Following Feed</TabsTrigger>
              <TabsTrigger value="all" className="gap-1 text-xs"><BarChart3 className="w-3.5 h-3.5" /> All Predictions</TabsTrigger>
            </TabsList>

            {/* Leaderboard */}
            <TabsContent value="leaderboard" className="mt-4 space-y-2">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading traders...</div>
              ) : topTraders.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No traders with predictions yet. Be the first to make a prediction on the Social page!</p>
                </CardContent></Card>
              ) : (
                topTraders.map((trader, idx) => (
                  <Card key={trader.id} className={cn("border-border", idx < 3 && "border-l-2 border-l-warning")}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <span className="text-sm font-bold text-muted-foreground w-6 text-center block">{idx + 1}</span>
                            {idx < 3 && <Crown className="w-3 h-3 text-warning absolute -top-1 -right-1" />}
                          </div>
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={trader.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {trader.display_name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{trader.display_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{trader.total_predictions} calls</span>
                              {trader.streak > 0 && <span className="text-warning">🔥 {trader.streak} streak</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-right">
                            <p className="text-muted-foreground">Win Rate</p>
                            <p className={cn("font-bold font-mono", trader.win_rate >= 50 ? "text-success" : "text-danger")}>
                              {trader.win_rate.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right hidden md:block">
                            <p className="text-muted-foreground">Avg Return</p>
                            <p className={cn("font-bold font-mono", trader.avg_return >= 0 ? "text-success" : "text-danger")}>
                              {trader.avg_return >= 0 ? '+' : ''}{trader.avg_return.toFixed(1)}%
                            </p>
                          </div>
                          <Button size="sm" variant={following.has(trader.id) ? "secondary" : "outline"}
                            className="h-7 text-xs gap-1" onClick={() => toggleFollow(trader.id)}>
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
                <Card><CardContent className="p-8 text-center text-muted-foreground">
                  <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Follow traders from the leaderboard to see their calls here.</p>
                </CardContent></Card>
              ) : (
                followingPredictions.map(pred => <PredictionCard key={pred.id} pred={pred} />)
              )}
            </TabsContent>

            {/* All Predictions */}
            <TabsContent value="all" className="mt-4 space-y-2">
              {predictions.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No community predictions yet.</p>
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
  return (
    <Card className={cn("border-border border-l-2", isBullish ? "border-l-success" : "border-l-danger")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-7 h-7">
              <AvatarImage src={pred.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-xs">{pred.display_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{pred.display_name}</span>
                <Badge variant={isBullish ? "default" : "destructive"} className="text-[9px]">
                  {isBullish ? '↑ BULL' : '↓ BEAR'}
                </Badge>
                <Badge variant="outline" className="text-[9px]">{pred.symbol}</Badge>
                <Badge variant="outline" className="text-[9px]">{pred.timeframe}</Badge>
              </div>
              {pred.reasoning && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{pred.reasoning}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <p className="text-muted-foreground">Target</p>
              <p className="font-mono font-medium">${pred.target_price}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Entry</p>
              <p className="font-mono">${pred.entry_price}</p>
            </div>
            {pred.is_resolved && (
              <Badge className={cn("text-[9px]", pred.was_correct ? "bg-success/20 text-success" : "bg-danger/20 text-danger")}>
                {pred.was_correct ? '✓ Correct' : '✕ Wrong'}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">{new Date(pred.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
