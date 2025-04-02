import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate necessary environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create the Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;