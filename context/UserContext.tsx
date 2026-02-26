import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, supabase } from "../services/supabaseClient";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  streak: number;
  points: number;
  avatar_url?: string;
  created_at?: string;
  isNewUser?: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  isNewUser: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const fetchUserProfile = async (retryCount = 0) => {
    try {
      const session = await authService.getSession();
      console.log("Session:", session);

      if (!session?.user) {
        console.log("No session found");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log(`Fetching user profile for ID: ${session.user.id}`);

      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Use session metadata if profile missing
        const sessionUser: UserProfile = {
          id: session.user.id,
          name: session.user.user_metadata?.name || "User",
          email: session.user.email || "",
          role: session.user.user_metadata?.role === "MENTOR" ? "RECOVERED_MENTOR" : "RECOVERING_USER",
          streak: 0,
          points: 0,
          isNewUser: true
        };
        setUser(sessionUser);
        setIsNewUser(true);
      } else if (error) {
        console.error("Database error:", error);
      } else if (profile) {
        setUser(profile);
      }

    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (!error) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        fetchUserProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsNewUser(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isNewUser,
        refreshUser: fetchUserProfile,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
