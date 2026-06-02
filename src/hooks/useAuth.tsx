import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";

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
  user: { id: string } | null;
  session: null;
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
  const { user: privyUser, ready, authenticated, logout, getAccessToken } = usePrivy();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Sync the Privy access token to the global scope for Supabase to use
  useEffect(() => {
    const syncToken = async () => {
      if (authenticated) {
        try {
          const token = await getAccessToken();
          globalThis.__privyAccessToken = token;
        } catch (error) {
          console.error("Failed to get Privy access token:", error);
          globalThis.__privyAccessToken = null;
        }
      } else {
        globalThis.__privyAccessToken = null;
      }
    };
    syncToken();
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      setProfile({
        id: privyUser.id,
        display_name: privyUser.email ? privyUser.email.address.split('@')[0] : `User-${privyUser.id.slice(-4)}`,
        avatar_url: null,
        email: privyUser.email?.address || null,
        watchlist: [],
        preferences: {},
        is_premium: true, // Everything is free
        email_notifications: false,
      });
    } else if (ready && !authenticated) {
      setProfile(null);
    }
  }, [ready, authenticated, privyUser]);

  const user = authenticated && privyUser ? { id: privyUser.id } : null;

  const signOut = async () => {
    await logout();
    setProfile(null);
  };

  const refreshProfile = async () => {};

  return (
    <AuthContext.Provider value={{ user, session: null, profile, loading: !ready, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
