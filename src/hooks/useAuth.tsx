import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount } from "wagmi";

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
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      setProfile({
        id: address,
        display_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        avatar_url: null,
        email: null,
        watchlist: [],
        preferences: {},
        is_premium: true, // Everything is free
        email_notifications: false,
      });
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [isConnected, address]);

  const user = isConnected && address ? { id: address } : null;

  const signOut = async () => {
    setProfile(null);
  };

  const refreshProfile = async () => {};

  return (
    <AuthContext.Provider value={{ user, session: null, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
