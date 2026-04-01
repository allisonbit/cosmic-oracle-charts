import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ADMIN_EMAILS = [
  // Add emails here if needed
];

const ADMIN_WALLETS = [
  "0x3ACA071D6cA66462612d04eB6f31Ab7924F86FF0", // Example admin wallet
  // Add other admin wallets here
];

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { address, isConnected } = useAccount();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin-check", user?.id, address],
    queryFn: async () => {
      // 1. Check hardcoded wallet list
      if (address && ADMIN_WALLETS.includes(address)) return true;
      
      // 2. Check hardcoded email list (skipped for wallet-only auth)

      // 3. Fallback to Supabase roles
      if (!user?.id) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id || !!address,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
