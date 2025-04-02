export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string;
          industry: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company: string;
          industry: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string;
          industry?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      intake_sessions: {
        Row: {
          id: string;
          client_id: string;
          status: string;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          status?: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          status?: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      intake_responses: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          response: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          response: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          response?: string;
          created_at?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string;
          value_potential: number | null;
          status: string;
          score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description: string;
          value_potential?: number | null;
          status?: string;
          score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          description?: string;
          value_potential?: number | null;
          status?: string;
          score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      client_users: {
        Row: {
          id: string;
          client_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
      agent_tasks: {
        Row: {
          id: string;
          agent_id: string;
          task_type: string;
          status: string;
          input: Json | null;
          output: Json | null;
          error: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          task_type: string;
          status?: string;
          input?: Json | null;
          output?: Json | null;
          error?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          task_type?: string;
          status?: string;
          input?: Json | null;
          output?: Json | null;
          error?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}