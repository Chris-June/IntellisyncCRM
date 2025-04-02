import { apiClient } from '@/lib/api';
import supabase from '@/lib/supabase';
import { Lead, Opportunity, Proposal, Contract, Activity } from '@/types/sales';

// Mock data for development when API server isn't running
const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    clientId: 'client-123',
    stage: 'discovery',
    status: 'active',
    value: 50000,
    probability: 0.7,
    opportunities: [
      {
        id: 'opp-1',
        clientId: 'client-123',
        title: 'AI-Powered Customer Support Bot',
        description: 'Implementation of an intelligent chatbot to handle Tier-1 customer inquiries',
        valuePotential: 50000,
        status: 'qualified',
        score: 85,
        createdAt: new Date('2025-03-01'),
        updatedAt: new Date('2025-03-15')
      }
    ],
    activities: [
      {
        id: 'activity-1',
        leadId: 'lead-1',
        type: 'note',
        description: 'Initial discovery call completed. Client expressed interest in AI solutions.',
        createdAt: new Date('2025-03-01'),
        createdBy: 'John Doe'
      }
    ],
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-15')
  },
  {
    id: 'lead-2',
    clientId: 'client-456',
    stage: 'proposal',
    status: 'active',
    value: 75000,
    probability: 0.6,
    opportunities: [
      {
        id: 'opp-2',
        clientId: 'client-456',
        title: 'Data Analytics Dashboard',
        description: 'Custom analytics dashboard with AI-powered insights and predictions',
        valuePotential: 75000,
        status: 'qualified',
        score: 78,
        createdAt: new Date('2025-02-15'),
        updatedAt: new Date('2025-03-10')
      }
    ],
    activities: [
      {
        id: 'activity-2',
        leadId: 'lead-2',
        type: 'meeting',
        description: 'Proposal presentation meeting scheduled for next week.',
        createdAt: new Date('2025-03-05'),
        createdBy: 'Jane Smith'
      }
    ],
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-03-10')
  },
  {
    id: 'lead-3',
    clientId: 'client-789',
    stage: 'negotiation',
    status: 'active',
    value: 125000,
    probability: 0.85,
    opportunities: [
      {
        id: 'opp-3',
        clientId: 'client-789',
        title: 'Enterprise AI Integration',
        description: 'Full-scale AI integration with existing enterprise systems',
        valuePotential: 125000,
        status: 'verified',
        score: 92,
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-03-01')
      }
    ],
    activities: [
      {
        id: 'activity-3',
        leadId: 'lead-3',
        type: 'email',
        description: 'Contract terms negotiation in progress. Final revisions expected by end of week.',
        createdAt: new Date('2025-03-12'),
        createdBy: 'Mike Johnson'
      }
    ],
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-03-12')
  }
];

// Sales Funnel API Service - connects to both Supabase and MCP API
export const salesService = {
  // Get all leads
  async getLeads(stage?: string, status?: string): Promise<Lead[]> {
    try {
      let query = apiClient.get<{ leads: Lead[], total: number }>('/leads');
      
      if (stage || status) {
        const params = new URLSearchParams();
        if (stage) params.append('stage', stage);
        if (status) params.append('status', status);
        query = apiClient.get<{ leads: Lead[], total: number }>(`/leads?${params.toString()}`);
      }
      
      const response = await query;
      return response.leads;
    } catch (error) {
      // If API fails, return mock data in development environment
      console.warn('Using mock lead data due to API error:', error);
      if (import.meta.env.DEV) {
        // Filter mock data if stage is provided
        if (stage) {
          return mockLeads.filter(lead => lead.stage === stage);
        }
        return mockLeads;
      }
      throw error;
    }
  },
  
  // Create a new lead
  async createLead(
    clientId: string, 
    source: string, 
    initialValue: number,
    opportunityIds: string[]
  ): Promise<Lead> {
    try {
      const response = await apiClient.post<Lead>('/leads', {
        client_id: clientId,
        source,
        initial_value: initialValue,
        opportunity_ids: opportunityIds
      });
      
      return response;
    } catch (error) {
      // In development, return a mock lead
      if (import.meta.env.DEV) {
        console.warn('Using mock data for createLead due to API error:', error);
        return {
          id: `lead-${Math.floor(Math.random() * 1000)}`,
          clientId,
          stage: 'discovery',
          status: 'active',
          value: initialValue,
          probability: 0.5,
          opportunities: [],
          activities: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      throw error;
    }
  },
  
  // Update lead stage
  async updateLeadStage(
    leadId: string,
    stage: string,
    reason: string,
    nextActions: string[]
  ): Promise<Lead> {
    try {
      const response = await apiClient.put<Lead>(`/leads/${leadId}/stage`, {
        stage,
        reason,
        next_actions: nextActions
      });
      
      return response;
    } catch (error) {
      // In development, return a mock updated lead
      if (import.meta.env.DEV) {
        console.warn('Using mock data for updateLeadStage due to API error:', error);
        const lead = mockLeads.find(l => l.id === leadId);
        if (!lead) throw new Error('Lead not found');
        
        const updatedLead = {
          ...lead,
          stage: stage as any,
          updatedAt: new Date()
        };
        return updatedLead;
      }
      throw error;
    }
  },
  
  // Get lead details
  async getLeadDetails(leadId: string): Promise<Lead> {
    try {
      const response = await apiClient.get<Lead>(`/leads/${leadId}`);
      return response;
    } catch (error) {
      // In development, return a mock lead
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getLeadDetails due to API error:', error);
        const lead = mockLeads.find(l => l.id === leadId);
        if (!lead) throw new Error('Lead not found');
        return lead;
      }
      throw error;
    }
  },
  
  // Add lead activity
  async addLeadActivity(
    leadId: string,
    activityType: string,
    description: string
  ): Promise<Activity> {
    try {
      const response = await apiClient.post<Activity>(`/leads/${leadId}/activities`, {
        activity_type: activityType,
        description
      });
      
      return response;
    } catch (error) {
      // In development, return a mock activity
      if (import.meta.env.DEV) {
        console.warn('Using mock data for addLeadActivity due to API error:', error);
        return {
          id: `activity-${Math.floor(Math.random() * 1000)}`,
          leadId,
          type: activityType as any,
          description,
          createdAt: new Date(),
          createdBy: 'Current User'
        };
      }
      throw error;
    }
  },
  
  // Get opportunities for a client
  async getOpportunities(clientId: string): Promise<Opportunity[]> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('client_id', clientId);
        
      if (error) throw error;
      return data as Opportunity[];
    } catch (error) {
      // In development, return mock opportunities
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getOpportunities due to API error:', error);
        const opportunities = mockLeads
          .filter(l => l.clientId === clientId)
          .flatMap(l => l.opportunities);
        return opportunities;
      }
      throw error;
    }
  },
  
  // Score an opportunity
  async scoreOpportunity(
    opportunityId: string, 
    analysisData: Record<string, any>
  ) {
    try {
      const response = await apiClient.post('/score', {
        opportunity_id: opportunityId,
        analysis_data: analysisData
      });
      
      return response;
    } catch (error) {
      // In development, return mock scoring data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for scoreOpportunity due to API error:', error);
        return {
          score_id: `score-${Math.floor(Math.random() * 1000)}`,
          scores: {
            ai_fit: 0.85,
            business_impact: 0.75,
            implementation_complexity: 0.60,
            overall: 0.73
          },
          recommendations: {
            priority: 'high',
            suggested_approach: 'Phased Implementation',
            key_considerations: [
              'Start with MVP chatbot',
              'Integrate with existing systems',
              'Train on company data'
            ]
          }
        };
      }
      throw error;
    }
  },
  
  // Generate a contract
  async buildContract(
    proposalId: string,
    contractType: string,
    clientId: string,
    customizations: Record<string, any>
  ) {
    try {
      const response = await apiClient.post('/contracts/build', {
        proposal_id: proposalId,
        contract_type: contractType,
        client_id: clientId,
        customizations
      });
      
      return response;
    } catch (error) {
      // In development, return mock contract data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for buildContract due to API error:', error);
        return {
          contract_id: `contract-${Math.floor(Math.random() * 1000)}`,
          status: 'draft',
          document_url: '#',
          version: '1.0.0',
          generated_at: new Date().toISOString(),
          metadata: {
            template_used: contractType,
            custom_clauses: [],
            approval_required: true
          }
        };
      }
      throw error;
    }
  },
  
  // Get contract status
  async getContractStatus(contractId: string) {
    try {
      const response = await apiClient.get(`/contracts/${contractId}`);
      return response;
    } catch (error) {
      // In development, return mock contract status
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getContractStatus due to API error:', error);
        return {
          id: contractId,
          status: 'pending_review',
          version: '1.0.0',
          last_modified: new Date().toISOString(),
          reviewers: []
        };
      }
      throw error;
    }
  },
  
  // Get risk assessment for a lead
  async getDealRisks(leadId: string) {
    try {
      const response = await apiClient.get(`/risks/${leadId}`);
      return response;
    } catch (error) {
      // In development, return mock risk data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getDealRisks due to API error:', error);
        return {
          risk_assessment: {
            risk_score: 65.5,
            risk_level: 'medium',
            warning_signals: [
              {
                type: 'delayed_response',
                description: 'Client has not responded to latest proposal for 7 days',
                severity: 'warning',
                detected_at: new Date().toISOString()
              }
            ],
            recommendations: [
              'Schedule a follow-up call to address budget concerns',
              'Prepare alternative pricing options',
              'Involve executive sponsor for relationship reinforcement'
            ]
          },
          historical_data: {
            risk_trend: [
              { timestamp: new Date().toISOString(), score: 65.5 }
            ],
            key_events: [
              { 
                event_type: 'meeting',
                description: 'Initial proposal presentation',
                timestamp: new Date().toISOString()
              }
            ]
          }
        };
      }
      throw error;
    }
  },
  
  // Get reminders for a user
  async getUserReminders(userId: string) {
    try {
      const response = await apiClient.get(`/reminders/${userId}`);
      return response;
    } catch (error) {
      // In development, return mock reminders
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getUserReminders due to API error:', error);
        return {
          reminders: [
            {
              id: 'reminder-123',
              type: 'follow_up',
              priority: 'high',
              due_date: new Date(Date.now() + 86400000).toISOString(),
              context: {
                client_id: 'client-123',
                lead_id: 'lead-1',
                last_interaction: new Date(Date.now() - 432000000).toISOString(),
                suggested_actions: ['Review proposal feedback', 'Schedule next meeting']
              }
            }
          ],
          metadata: {
            total_count: 1,
            urgent_count: 1,
            overdue_count: 0
          }
        };
      }
      throw error;
    }
  },
  
  // Snooze a reminder
  async snoozeReminder(reminderId: string, duration: string, reason?: string) {
    try {
      const response = await apiClient.post('/reminders/snooze', {
        reminder_id: reminderId,
        duration,
        reason
      });
      
      return response;
    } catch (error) {
      // In development, return mock snooze response
      if (import.meta.env.DEV) {
        console.warn('Using mock data for snoozeReminder due to API error:', error);
        return {
          reminder_id: reminderId,
          original_due_date: new Date().toISOString(),
          new_due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
          reason: reason || 'Snoozed for later follow-up',
          snoozed_at: new Date().toISOString()
        };
      }
      throw error;
    }
  }
};