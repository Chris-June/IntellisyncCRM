/*
  # Create Client Management Tables

  1. New Tables
    - `clients`: Core client information
    - `client_users`: Junction table for client-user relationships
    - `intake_sessions`: Client intake process tracking
    - `intake_responses`: Individual responses during intake
    - `opportunities`: Business opportunities identified
    - `tags`: Client categorization and metadata

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create clients table
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

-- Create client_users junction table FIRST (before it's referenced in policies)
CREATE TABLE IF NOT EXISTS client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- Create intake_sessions table
CREATE TABLE IF NOT EXISTS intake_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create intake_responses table
CREATE TABLE IF NOT EXISTS intake_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES intake_sessions(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  value_potential decimal,
  status text NOT NULL DEFAULT 'identified',
  score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own client data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM client_users WHERE client_id = id
  ));

-- Create policy for client_users table
CREATE POLICY "Users can view their own client associations"
  ON client_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own intake sessions"
  ON intake_sessions
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT client_id FROM client_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own intake responses"
  ON intake_responses
  FOR SELECT
  TO authenticated
  USING (session_id IN (
    SELECT id FROM intake_sessions WHERE client_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can view their own opportunities"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT client_id FROM client_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own tags"
  ON tags
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT client_id FROM client_users WHERE user_id = auth.uid()
  ));