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
      
      // Just do the login - let onAuthStateChange handle the state update
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🚀 AuthContext: signInWithPassword response:', {
        hasUser: !!authData.user,
        hasError: !!signInError,
        errorMessage: signInError?.message
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to log in");
      }

      console.log('✅ AuthContext: Login successful, waiting for onAuthStateChange...');
      
      // Don't manually set state - onAuthStateChange will handle it
      // This prevents race conditions
      
    } catch (error) {
      console.error("❌ AuthContext: Login error:", error);
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
