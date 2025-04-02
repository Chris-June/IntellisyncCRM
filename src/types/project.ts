export interface Project {
  id: string;
  clientId: string;
  name: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  progress: number;
  health: 'green' | 'yellow' | 'red';
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  milestones: Milestone[];
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  deadline: Date;
  dependencies: string[];
  progress: number;
  estimatedHours: number;
  actualHours: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'at_risk';
  deliverables: string[];
  dependencies: string[];
}

export interface Resource {
  id: string;
  type: 'human' | 'ai_agent';
  name: string;
  skills: string[];
  availability: number;
  allocatedHours: number;
  costRate: number;
}

export interface DeliverableSubmission {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string;
  files: string[];
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  submittedAt: Date;
  reviewers: {
    id: string;
    name: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
  }[];
}

export interface RetrospectiveItem {
  category: 'process' | 'technical' | 'team' | 'client' | 'tools' | 'other';
  type: 'went_well' | 'needs_improvement';
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionItems?: string[];
}

export interface Retrospective {
  id: string;
  projectId: string;
  type: 'project' | 'sprint' | 'milestone' | 'quarterly';
  analyzedAt: Date;
  wentWell: RetrospectiveItem[];
  needsImprovement: RetrospectiveItem[];
  actionPlan: {
    action: string;
    owner: string;
    dueDate: Date;
    priority: string;
    status: string;
  }[];
  insights: {
    title: string;
    description: string;
    supportingData: Record<string, any>;
    confidenceScore: number;
    recommendedActions: string[];
  }[];
}