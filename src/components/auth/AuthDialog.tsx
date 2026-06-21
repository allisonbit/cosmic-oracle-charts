import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock, Sparkles, TrendingUp, Bell, Star } from "lucide-react";
import { toast } from "sonner";

/**
 * Email sign-up / sign-in. On success Supabase fires onAuthStateChange (see
 * useAuth), which creates the real session that every /my feature reads — this is
 * the fix for the previously-dead hub (wallet connect created no Supabase session).
 * A wallet is auto-provisioned server-side on first sign-in (see provision-wallet).
 */
export function AuthDialog({
  children,
  defaultTab = "signin",
  open: controlledOpen,
  onOpenChange,
}: {
  children?: ReactNode;
  defaultTab?: "signin" | "signup";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Could not sign in");
      return;
    }
    toast.success("Welcome back!");
    setOpen(false);
    reset();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() || email.split("@")[0] },
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Could not create account");
      return;
    }
    // If email confirmation is on, there's no session yet.
    if (!data.session) {
      toast.success("Account created — check your email to confirm, then sign in.");
      setTab("signin");
      return;
    }
    toast.success("Account created! Your wallet is being set up.");
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Your crypto command center
          </DialogTitle>
          <DialogDescription>
            Free account — watchlist, price alerts, portfolio &amp; AI signals. A wallet is created for
            you automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 py-1 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1"><Star className="w-4 h-4 text-primary" />Watchlist</div>
          <div className="flex flex-col items-center gap-1"><Bell className="w-4 h-4 text-primary" />Alerts</div>
          <div className="flex flex-col items-center gap-1"><TrendingUp className="w-4 h-4 text-primary" />Portfolio</div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-3 pt-2">
              <EmailField email={email} setEmail={setEmail} />
              <PasswordField password={password} setPassword={setPassword} autoComplete="current-password" />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="auth-name">Display name</Label>
                <Input id="auth-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Satoshi" autoComplete="nickname" />
              </div>
              <EmailField email={email} setEmail={setEmail} />
              <PasswordField password={password} setPassword={setPassword} autoComplete="new-password" hint="At least 8 characters" />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create free account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="auth-email">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input id="auth-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" className="pl-9" />
      </div>
    </div>
  );
}

function PasswordField({
  password,
  setPassword,
  autoComplete,
  hint,
}: {
  password: string;
  setPassword: (v: string) => void;
  autoComplete: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="auth-password">Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input id="auth-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={autoComplete} className="pl-9" />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
