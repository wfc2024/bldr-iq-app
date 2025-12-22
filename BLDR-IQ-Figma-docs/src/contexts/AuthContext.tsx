import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState } from "../types/user";
import { authService } from "../services/authService";

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

  // Initialize auth state on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    setAuthState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Login error:", error);
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
      const guestUser = authService.getCurrentUser();
      setAuthState({
        user: guestUser,
        isAuthenticated: !!guestUser,
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
