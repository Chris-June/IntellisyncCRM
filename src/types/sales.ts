export interface Lead {
  id: string;
  clientId: string;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed';
  status: 'active' | 'stalled' | 'won' | 'lost';
  value: number;
  probability: number;
  opportunities: Opportunity[];
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
}

export interface Opportunity {
  id: string;
  clientId: string;
  title: string;
  description: string;
  valuePotential: number | null;
  status: 'identified' | 'qualified' | 'verified' | 'implemented';
  score: number | null;
  aiFitScore?: number;
  potentialImpact?: string;
  relevantSolutions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'note' | 'email' | 'meeting' | 'task';
  description: string;
  createdAt: Date;
  createdBy: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  clientId: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  respondedAt?: Date;
}

export interface Contract {
  id: string;
  proposalId: string;
  clientId: string;
  type: 'service_agreement' | 'nda' | 'sow';
  status: 'draft' | 'pending_review' | 'final';
  content: string;
  version: string;
  metadata: {
    templateId: string;
    customClauses: string[];
    approvalRequired: boolean;
    lastModified: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DealRisk {
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  warningSignals: {
    type: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    detectedAt: Date;
  }[];
  recommendations: string[];
}

export interface Reminder {
  id: string;
  type: 'follow_up' | 'check_in' | 'milestone' | 'urgent';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  context: {
    clientId: string;
    leadId?: string;
    lastInteraction: Date;
    suggestedActions: string[];
  };
}