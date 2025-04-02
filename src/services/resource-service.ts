import { apiClient } from '@/lib/api';

// Resource Management API Service - connects to MCP API
export const resourceService = {
  // File Management
  async uploadFile(
    file: File,
    projectId: string,
    category: string,
    description?: string,
    visibility: string = 'private',
    tags?: string,
    metadata?: string
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    formData.append('category', category);
    
    if (description) formData.append('description', description);
    formData.append('visibility', visibility);
    if (tags) formData.append('tags', tags);
    if (metadata) formData.append('metadata', metadata);
    
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response;
  },
  
  // List project files
  async listProjectFiles(projectId: string, category?: string, visibility?: string) {
    let endpoint = `/files/${projectId}`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (visibility) params.append('visibility', visibility);
    
    if (params.toString()) {
      endpoint = `${endpoint}?${params.toString()}`;
    }
    
    const response = await apiClient.get(endpoint);
    return response;
  },
  
  // Calendar operations
  async createEvent(eventData: {
    type: string,
    title: string,
    description?: string,
    start_time: Date,
    end_time: Date,
    timezone: string,
    priority?: string,
    client_id?: string,
    project_id?: string,
    attendees: Array<{ id: string, email: string, role: string, response_status?: string }>,
    location?: string
  }) {
    const response = await apiClient.post('/calendar/events', eventData);
    return response;
  },
  
  // Get client events
  async getClientEvents(clientId: string, startDate?: Date, endDate?: Date, eventType?: string) {
    let endpoint = `/calendar/events/${clientId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    if (eventType) params.append('event_type', eventType);
    
    if (params.toString()) {
      endpoint = `${endpoint}?${params.toString()}`;
    }
    
    const response = await apiClient.get(endpoint);
    return response;
  },
  
  // Meeting Notes
  async summarizeMeeting(meetingData: {
    meeting_type: string,
    date: Date,
    duration_minutes: number,
    attendees: Array<{ id: string, name: string, email: string, type: string, role?: string }>,
    transcript: string,
    client_id?: string,
    project_id?: string,
    title?: string
  }) {
    const response = await apiClient.post('/meeting-notes/summarize', meetingData);
    return response;
  },
  
  // Get meeting history
  async getClientMeetingHistory(
    clientId: string, 
    projectId?: string, 
    meetingType?: string,
    limit: number = 10, 
    offset: number = 0
  ) {
    let endpoint = `/meeting-notes/history/${clientId}`;
    const params = new URLSearchParams();
    
    if (projectId) params.append('project_id', projectId);
    if (meetingType) params.append('meeting_type', meetingType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    if (params.toString()) {
      endpoint = `${endpoint}?${params.toString()}`;
    }
    
    const response = await apiClient.get(endpoint);
    return response;
  },
  
  // Workflow Templates
  async getWorkflowTemplates(type?: string, status?: string) {
    let endpoint = '/templates';
    const params = new URLSearchParams();
    
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    if (params.toString()) {
      endpoint = `${endpoint}?${params.toString()}`;
    }
    
    const response = await apiClient.get(endpoint);
    return response;
  },
  
  // Get template by ID
  async getWorkflowTemplate(templateId: string) {
    const response = await apiClient.get(`/templates/${templateId}`);
    return response;
  },
  
  // Create workflow instance
  async createWorkflowInstance(
    templateId: string,
    context: Record<string, any>,
    clientId?: string,
    projectId?: string
  ) {
    const response = await apiClient.post(`/templates/${templateId}/instances`, {
      context,
      client_id: clientId,
      project_id: projectId
    });
    
    return response;
  }
};