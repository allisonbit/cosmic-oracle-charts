import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, useReadContract } from "wagmi";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  watchlist: string[];
  preferences: Record<string, unknown>;
  is_premium: boolean;
  email_notifications: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Contract data for is_premium check
  const { data: userHasPaid } = useReadContract({
    address: '0x3ACA071D6cA66462612d04eB6f31Ab7924F86FF0',
    abi: [{ name: 'hasPaid', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'bool' }] }] as const,
    functionName: 'hasPaid',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      setProfile({
        id: data.id,
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        email: data.email,
        watchlist: (data.watchlist as string[]) || [],
        preferences: (data.preferences as Record<string, unknown>) || {},
        is_premium: (data as any).is_premium ?? !!userHasPaid,
        email_notifications: (data as any).email_notifications ?? true,
      });
    } catch (e) {
      console.error("Profile fetch failed:", e);
      // Fallback for wallet connected users without a Supabase profile yet
      if (isConnected && address) {
        setProfile({
          id: address,
          display_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          avatar_url: null,
          email: `${address.toLowerCase()}@wallet.local`,
          watchlist: [],
          preferences: {},
          is_premium: !!userHasPaid,
          email_notifications: false,
        });
      }
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // If wallet connects but no user, initialize a "wallet profile"
    if (isConnected && address && !user) {
      setProfile({
        id: address,
        display_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        avatar_url: null,
        email: `${address.toLowerCase()}@wallet.local`,
        watchlist: [],
        preferences: {},
        is_premium: !!userHasPaid,
        email_notifications: false,
      });
      setLoading(false);
    }
  }, [isConnected, address, userHasPaid]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(() => fetchProfile(currentSession.user.id), 0);
        } else if (!isConnected) {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      } else if (!isConnected) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isConnected]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
