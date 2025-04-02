/*
  # Create Client Users Junction Table

  1. New Tables
    - `client_users`: Junction table for client-user relationships
    - Enables many-to-many relationship between clients and users
    - Supports role-based access control

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create client_users junction table
CREATE TABLE IF NOT EXISTS client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own client associations"
  ON client_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());