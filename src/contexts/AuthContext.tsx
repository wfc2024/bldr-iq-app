import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState } from "../types/user";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state on mount and listen for auth changes
  useEffect(() => {
    // Get initial user state
    const initAuth = async () => {
      const user = await authService.getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🚀 AuthContext: Starting login...');
      
      // DON'T await - just fire it and let it persist in background
      supabase.auth.signInWithPassword({
        email,
        password,
      }).then(({ data, error }) => {
        if (error) {
          console.error('❌ Background login error:', error);
        } else {
          console.log('✅ Background login succeeded:', !!data.user);
        }
      });

      // Give Supabase a moment to write to localStorage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the session from Supabase's own storage
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🚀 Retrieved session:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionKeys: session ? Object.keys(session) : [],
        userEmail: session?.user?.email,
        error: sessionError?.message
      });

      if (sessionError) {
        throw new Error(sessionError.message);
      }
      
      if (!session) {
        throw new Error("No session found after login");
      }
      
      if (!session.user) {
        console.error('❌ Session exists but no user:', session);
        throw new Error("Session has no user data");
      }

      console.log('✅ AuthContext: Login successful!');
      
      // Set auth state from session
      setAuthState({
        user: {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || '',
          subscription_tier: session.user.user_metadata?.subscription_tier || 'free',
          subscription_status: session.user.user_metadata?.subscription_status || 'active',
          trial_ends_at: session.user.user_metadata?.trial_ends_at,
          created_at: session.user.created_at || new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      });
      
    } catch (error) {
      console.error("❌ AuthContext: Login error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const user = await authService.signup(email, password, name);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) {
      throw new Error("No user logged in");
    }

    try {
      const updatedUser = await authService.updateProfile(authState.user.id, updates);
      setAuthState({
        ...authState,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
