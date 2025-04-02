/*
  # Create MCP Server Tables

  1. New Tables
    - `agent_tasks`: Track agent task execution and status
    - `agent_memory`: Store agent memory and context
    - `workflow_templates`: Reusable workflow definitions
    - `agent_logs`: Audit trail of agent actions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create agent_tasks table
CREATE TABLE IF NOT EXISTS agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  task_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  input jsonb,
  output jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_memory table
CREATE TABLE IF NOT EXISTS agent_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  memory_type text NOT NULL,
  context jsonb NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create workflow_templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view agent tasks"
  ON agent_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view agent memory"
  ON agent_memory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view workflow templates"
  ON workflow_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view agent logs"
  ON agent_logs
  FOR SELECT
  TO authenticated
  USING (true);