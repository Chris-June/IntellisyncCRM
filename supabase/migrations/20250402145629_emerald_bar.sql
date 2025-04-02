/*
  # Client Users Table Check

  1. Purpose
    - Ensures client and client_users tables exist
    - Skips policy creation to avoid duplicate policy error
    - Safe to run even if tables already exist

  2. Changes
    - Checks if clients table exists
    - Checks if client_users table exists
    - Doesn't attempt to recreate policies
*/

-- Create clients table if it doesn't exist (idempotent operation)
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  company text NOT NULL,
  industry text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_users junction table if it doesn't exist (idempotent operation)
CREATE TABLE IF NOT EXISTS client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- Enable Row Level Security if not already enabled
DO $$ 
BEGIN
  -- This is a safe operation that only applies if RLS isn't already enabled
  ALTER TABLE IF EXISTS client_users ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN OTHERS THEN
  -- Do nothing if there's an error (like if RLS is already enabled)
  NULL;
END $$;

-- DO NOT create the policy since it already exists
-- The previous migration has already created the policy:
-- "Users can view their own client associations"