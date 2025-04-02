export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  status: 'active' | 'inactive' | 'pending';
}

export interface IntakeSession {
  id: string;
  clientId: string;
  responses: IntakeResponse[];
  summary: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

export interface IntakeResponse {
  questionId: string;
  response: string;
  timestamp: Date;
}