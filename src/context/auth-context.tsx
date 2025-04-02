import React, { createContext, useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { 
  AuthContextType, 
  UserData, 
  ProfileUpdateData, 
  SignUpResult 
} from '@/types/auth-types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check if there is an active session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setIsAuthenticated(false);
        } else if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Unexpected error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      // Log the authentication state change event for debugging
      console.log(`Authentication state changed: ${event}`);

      // Handle different authentication events
      switch (event) {
        case 'SIGNED_IN':
          toast.success('Successfully signed in');
          break;
        case 'SIGNED_OUT':
          toast.info('You have been signed out');
          break;
        case 'PASSWORD_RECOVERY':
          toast.info('Password recovery initiated');
          break;
        case 'TOKEN_REFRESHED':
          console.log('Authentication token refreshed');
          break;
      }

      setSession(session);
      setUser(session?.user || null);
      setIsAuthenticated(!!session);
    });

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Successfully signed in');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData?: UserData): Promise<SignUpResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Account created successfully');
      
      // Ensure we return an object matching SignUpResult
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (userData: ProfileUpdateData) => {
    try {
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}