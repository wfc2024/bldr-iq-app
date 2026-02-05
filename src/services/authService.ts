import { User } from "../types/user";
import { supabase } from "../lib/supabase";

/**
 * Authentication Service with Supabase Integration
 * 
 * Handles user authentication using Supabase Auth
 * and manages user profiles in the database.
 */

class AuthService {
  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('🔍 Getting current user...');
      
      // Add timeout to prevent hanging on mobile
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => {
          reject(new Error('getCurrentUser timed out after 8 seconds'));
        }, 8000);
      });

      const fetchUserPromise = async () => {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error || !authUser) {
          console.log('❌ No auth user found:', error?.message);
          return null;
        }

        console.log('✅ Auth user found:', authUser.email);

        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error("❌ Error loading user profile:", profileError);
          console.error("Profile error details:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          return null;
        }

        if (!profile) {
          console.error("❌ No profile found for user:", authUser.id);
          return null;
        }

        console.log('✅ Profile loaded successfully:', profile.email);

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.created_at,
        };
      };

      // Race between fetch and timeout
      return await Promise.race([fetchUserPromise(), timeoutPromise]);
      
    } catch (error) {
      console.error("❌ Error getting current user:", error);
      return null;
    }
  }

  /**
   * Sign up a new user
   */
  async signup(email: string, password: string, name: string): Promise<User> {
    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Profile is automatically created by database trigger
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the created profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Failed to create user profile");
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        createdAt: profile.created_at,
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(error.message || "Failed to sign up");
    }
  }

  /**
   * Log in an existing user
   */
  async login(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Starting login for:', email);
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 SignIn response:', { 
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

      console.log('🔐 Auth successful, fetching profile for user:', authData.user.id);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('🔐 Profile fetch result:', { 
        hasProfile: !!profile, 
        hasError: !!profileError,
        errorMessage: profileError?.message,
        errorCode: profileError?.code,
        errorDetails: profileError?.details 
      });

      if (profileError || !profile) {
        console.error('🔐 Profile fetch failed:', profileError);
        throw new Error("Failed to load user profile");
      }

      console.log('✅ Login complete! Profile:', profile.email);

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        createdAt: profile.created_at,
      };
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw new Error(error.message || "Invalid email or password");
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!profile) {
        throw new Error("Failed to update profile");
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        createdAt: profile.created_at,
      };
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
