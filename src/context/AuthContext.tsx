import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signInWithEmail,
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
} from "@/src/services/authService";

const AUTH_STORAGE_KEY = "@auth_user";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted auth state on mount
  useEffect(() => {
    const loadPersistedAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          // Note: We can't fully restore the User object from storage,
          // but Firebase's onAuthStateChanged will handle this
          // This is mainly for quick initial state
        }
      } catch (error) {
        console.error("Error loading persisted auth:", error);
      }
    };

    void loadPersistedAuth();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);

      // Persist auth state
      try {
        if (firebaseUser) {
          // Store minimal user info (uid, email) for quick reference
          await AsyncStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            }),
          );
        } else {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error persisting auth state:", error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        await signInWithEmail(email, password);
        // User state will be updated via onAuthStateChanged
      } catch (error) {
        console.error("Error signing in with email:", error);
        throw error;
      }
    },
    [],
  );

  const handleSignInWithGoogle = useCallback(async () => {
    try {
      await signInWithGoogle();
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      // User state will be updated via onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    signInWithEmail: handleSignInWithEmail,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
