import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, TrendingUp, TrendingDown, Plus, Loader2, Target, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Prediction {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  prediction_type: string;
  target_price: number;
  entry_price: number;
  timeframe: string;
  reasoning: string | null;
  is_resolved: boolean;
  was_correct: boolean | null;
  created_at: string;
  profiles?: { display_name: string; avatar_url: string } | null;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string;
  total: number;
  correct: number;
  accuracy: number;
}

function SocialContent() {
  const { user, profile } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("feed");

  const [formSymbol, setFormSymbol] = useState("");
  const [formType, setFormType] = useState<"bullish" | "bearish">("bullish");
  const [formTarget, setFormTarget] = useState("");
  const [formEntry, setFormEntry] = useState("");
  const [formTimeframe, setFormTimeframe] = useState("24h");
  const [formReasoning, setFormReasoning] = useState("");

  const fetchPredictions = useCallback(async () => {
    const { data } = await supabase
      .from("user_predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setPredictions((data as any[]) || []);
    setLoading(false);
  }, []);

  const buildLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("user_predictions")
      .select("user_id, is_resolved, was_correct")
      .eq("is_resolved", true);

    if (!data) return;
    const map = new Map<string, { correct: number; total: number }>();
    data.forEach((p: any) => {
      const entry = map.get(p.user_id) || { correct: 0, total: 0 };
      entry.total++;
      if (p.was_correct) entry.correct++;
      map.set(p.user_id, entry);
    });

    // Fetch profiles for leaderboard users
    const userIds = Array.from(map.keys());
    const { data: profiles } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds);

    const board: LeaderboardEntry[] = Array.from(map.entries()).map(([uid, stats]) => {
      const prof = profiles?.find((p: any) => p.id === uid) as any;
      return {
        user_id: uid,
        display_name: prof?.display_name || "Anon",
        avatar_url: prof?.avatar_url || "",
        total: stats.total,
        correct: stats.correct,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      };
    });
    board.sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);
    setLeaderboard(board.slice(0, 20));
  }, []);

  useEffect(() => {
    fetchPredictions();
    buildLeaderboard();
  }, [fetchPredictions, buildLeaderboard]);

  const submitPrediction = async () => {
    if (!user || !formSymbol || !formTarget || !formEntry) {
      toast.error("Fill in all required fields");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("user_predictions").insert({
      user_id: user.id,
      coin_id: formSymbol.toLowerCase(),
      symbol: formSymbol.toUpperCase(),
      prediction_type: formType,
      target_price: parseFloat(formTarget),
      entry_price: parseFloat(formEntry),
      timeframe: formTimeframe,
      reasoning: formReasoning || null,
    });
    if (error) {
      toast.error("Failed to submit prediction");
    } else {
      toast.success("Prediction shared!");
      setShowForm(false);
      setFormSymbol("");
      setFormTarget("");
      setFormEntry("");
      setFormReasoning("");
      fetchPredictions();
    }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Social & Leaderboard</h1>
              <p className="text-sm text-muted-foreground">Share predictions, compete on accuracy</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" /> Share Prediction
          </Button>
        </div>

        {/* New prediction form */}
        {showForm && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Share Your Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Input placeholder="Symbol (BTC)" value={formSymbol} onChange={(e) => setFormSymbol(e.target.value)} />
                <Input placeholder="Entry Price ($)" type="number" value={formEntry} onChange={(e) => setFormEntry(e.target.value)} />
                <Input placeholder="Target Price ($)" type="number" value={formTarget} onChange={(e) => setFormTarget(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={formType === "bullish" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormType("bullish")}
                  className={formType === "bullish" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <TrendingUp className="w-3 h-3 mr-1" /> Bullish
                </Button>
                <Button
                  variant={formType === "bearish" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormType("bearish")}
                  className={formType === "bearish" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <TrendingDown className="w-3 h-3 mr-1" /> Bearish
                </Button>
                {["1h", "4h", "24h", "7d", "30d"].map((tf) => (
                  <Button
                    key={tf}
                    variant={formTimeframe === tf ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setFormTimeframe(tf)}
                    className="text-xs"
                  >
                    {tf}
                  </Button>
                ))}
              </div>
              <Input placeholder="Why? (optional reasoning)" value={formReasoning} onChange={(e) => setFormReasoning(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={submitPrediction} disabled={saving} size="sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Target className="w-4 h-4 mr-1" />}
                  Submit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="mine">My Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-3 mt-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : predictions.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No predictions yet. Be the first!</p></CardContent></Card>
            ) : (
              predictions.map((p) => (
                <PredictionCard key={p.id} prediction={p} isOwn={p.user_id === user?.id} />
              ))
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Top Predictors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No resolved predictions yet</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, i) => (
                      <div key={entry.user_id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className={cn("w-6 text-center font-bold text-sm", i < 3 ? "text-yellow-500" : "text-muted-foreground")}>#{i + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {entry.display_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground text-sm">{entry.display_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px]">{entry.correct}/{entry.total}</Badge>
                          <span className={cn("font-bold text-sm", entry.accuracy >= 60 ? "text-emerald-500" : "text-muted-foreground")}>
                            {entry.accuracy.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mine" className="space-y-3 mt-4">
            {predictions.filter((p) => p.user_id === user?.id).length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">You haven't shared any predictions yet</p></CardContent></Card>
            ) : (
              predictions
                .filter((p) => p.user_id === user?.id)
                .map((p) => <PredictionCard key={p.id} prediction={p} isOwn />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function PredictionCard({ prediction: p, isOwn }: { prediction: Prediction; isOwn?: boolean }) {
  const isBullish = p.prediction_type === "bullish";
  return (
    <Card className={cn("border", isBullish ? "border-emerald-500/20" : "border-red-500/20")}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{p.symbol.slice(0, 2)}</div>
            <span className="font-semibold text-foreground text-sm">{p.symbol}</span>
            <Badge className={cn("text-[10px]", isBullish ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")} variant="outline">
              {isBullish ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {p.prediction_type}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{p.timeframe}</Badge>
          </div>
          <div className="flex items-center gap-1">
            {p.is_resolved ? (
              p.was_correct ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]" variant="outline">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Correct
                </Badge>
              ) : (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]" variant="outline">
                  <XCircle className="w-3 h-3 mr-1" /> Wrong
                </Badge>
              )
            ) : (
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]" variant="outline">
                <Clock className="w-3 h-3 mr-1" /> Pending
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <span>Entry: ${p.entry_price.toLocaleString()}</span>
          <span>Target: ${p.target_price.toLocaleString()}</span>
          <span>{new Date(p.created_at).toLocaleDateString()}</span>
        </div>
        {p.reasoning && <p className="text-sm text-muted-foreground">{p.reasoning}</p>}
      </CardContent>
    </Card>
  );
}

export default function MySocial() {
  return (
    <ProtectedRoute>
      <SocialContent />
    </ProtectedRoute>
  );
}
