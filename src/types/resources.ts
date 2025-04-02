export interface File {
  id: string;
  projectId: string;
  originalFilename: string;
  size: number;
  category: 'document' | 'image' | 'video' | 'audio' | 'code' | 'data' | 'other';
  description?: string;
  visibility: 'public' | 'private' | 'shared';
  tags: string[];
  uploadedAt: Date;
  downloadUrl: string;
}

export interface MeetingNote {
  id: string;
  title: string;
  meetingType: 'discovery' | 'sales' | 'project' | 'status' | 'internal' | 'client' | 'other';
  clientId?: string;
  projectId?: string;
  date: Date;
  durationMinutes: number;
  attendees: {
    id: string;
    name: string;
    email: string;
    type: 'internal' | 'client' | 'partner' | 'other';
    role?: string;
  }[];
  notes: string;
  actionItems: {
    id: string;
    description: string;
    assignedTo: string;
    dueDate?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    notes?: string;
  }[];
  keyPoints: string[];
  decisions: string[];
  topicsDiscussed: string[];
  followUpMeeting?: Date;
  recorded: boolean;
  recordingUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  type: 'meeting' | 'milestone' | 'deadline' | 'follow_up' | 'reminder';
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'high' | 'medium' | 'low';
  clientId?: string;
  projectId?: string;
  attendees: {
    id: string;
    email: string;
    role: string;
    responseStatus?: string;
  }[];
  location?: string;
  recurrence?: {
    frequency: string;
    interval: number;
    until?: Date;
    count?: number;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: 'intake' | 'sales' | 'project' | 'support' | 'custom';
  status: 'draft' | 'active' | 'archived';
  steps: {
    id: string;
    name: string;
    type: 'human' | 'agent' | 'approval' | 'notification' | 'integration' | 'condition';
    description: string;
    configuration: Record<string, any>;
    nextSteps: string[];
    conditionalLogic?: Record<string, any>;
    timeout?: number;
    retryPolicy?: Record<string, any>;
  }[];
  triggers: {
    type: string;
    description: string;
  }[];
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}