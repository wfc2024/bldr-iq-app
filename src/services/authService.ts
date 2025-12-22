import { User } from "../types/user";

/**
 * Mock Authentication Service
 * 
 * This is a placeholder service that simulates user authentication.
 * When ready to integrate with a real backend (like Supabase), replace
 * the implementation of these methods with actual API calls.
 * 
 * SECURITY NOTE: This is for development/demo only. Do not use in production
 * for real user data or PII.
 */

const CURRENT_USER_KEY = "bldriq_current_user";
const USERS_KEY = "bldriq_users";

// Mock user for development (guest mode)
const GUEST_USER: User = {
  id: "guest-user-1",
  email: "guest@bldriq.com",
  name: "Guest User",
  createdAt: new Date().toISOString(),
};

class AuthService {
  /**
   * Get the currently authenticated user
   * TODO: Replace with Supabase auth.getUser() or similar
   */
  getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem(CURRENT_USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      // For now, auto-login as guest
      this.setCurrentUser(GUEST_USER);
      return GUEST_USER;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Sign up a new user
   * TODO: Replace with Supabase auth.signUp() or similar
   */
  async signup(email: string, password: string, name: string): Promise<User> {
    // Mock implementation - stores in localStorage
    // In production, this would call your backend API
    
    const users = this.getAllUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.setCurrentUser(newUser);
    
    return newUser;
  }

  /**
   * Log in an existing user
   * TODO: Replace with Supabase auth.signInWithPassword() or similar
   */
  async login(email: string, password: string): Promise<User> {
    // Mock implementation
    // In production, this would verify credentials with your backend
    
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    this.setCurrentUser(user);
    return user;
  }

  /**
   * Log out the current user
   * TODO: Replace with Supabase auth.signOut() or similar
   */
  async logout(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
    // Auto-login as guest after logout
    this.setCurrentUser(GUEST_USER);
  }

  /**
   * Update user profile
   * TODO: Replace with Supabase database update or similar
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.id !== userId) {
      throw new Error("Unauthorized");
    }

    const updatedUser = { ...currentUser, ...updates };
    this.setCurrentUser(updatedUser);

    // Also update in users list
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    return updatedUser;
  }

  // Helper methods
  private setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  private getAllUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch {
      return [];
    }
  }
}

export const authService = new AuthService();
