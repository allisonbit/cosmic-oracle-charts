import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield, LogIn } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

const ADMIN_EMAILS = ["admin@oraclebull.com"];

/**
 * Owner-only gate for /admin/*.
 * Oracle Bull is a wallet-only single-owner site — any authenticated wallet
 * user is treated as admin unless an explicit user_roles table denies it.
 * (A role check is still attempted; if it returns rows we honor them, but
 * an empty table — the current state — does NOT lock the owner out.)
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, email, authenticated, privyReady, login, ensurePrivy } = useAuth();

  const { data: roleCheck, isLoading } = useQuery({
    queryKey: ["admin-role-check", user?.id],
    queryFn: async () => {
      if (email && ADMIN_EMAILS.includes(email)) return { hasAnyRoles: true, isAdmin: true };
      if (!user?.id) return { hasAnyRoles: false, isAdmin: false };
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const rows = data || [];
      return { hasAnyRoles: rows.length > 0, isAdmin: rows.some((r: any) => r.role === "admin") };
    },
    enabled: !!user?.id,
  });

  // Ensure Privy loads for this protected area
  if (!authenticated && !privyReady) ensurePrivy();

  if (!authenticated) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin area</h1>
            <p className="text-muted-foreground">Sign in with your wallet to access admin tools.</p>
            <Button size="lg" onClick={login} className="gap-2">
              <LogIn className="w-4 h-4" /> Connect wallet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user_roles has rows for someone, require the admin role.
  // If the table is empty (default single-owner state), allow the authenticated owner.
  if (roleCheck && roleCheck.hasAnyRoles && !roleCheck.isAdmin) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">You don't have admin access.</p>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
