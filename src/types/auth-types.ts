import { Session, User } from '@supabase/supabase-js';

// Define a more specific type for user data
export interface UserData {
  [key: string]: string | number | boolean | null | undefined;
}

// Define a type for profile update data
export interface ProfileUpdateData {
  full_name?: string;
  avatar_url?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Define a type for sign up return data
export interface SignUpResult {
  user: User | null;
  session: Session | null;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: UserData) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: ProfileUpdateData) => Promise<void>;
}
