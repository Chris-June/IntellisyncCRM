import { apiClient } from '@/lib/api';
import supabase from '@/lib/supabase';
import { Client, IntakeSession, IntakeResponse } from '@/types/client';

// Mock data for development when API isn't running or Supabase issues occur
const mockClients: Client[] = [
  {
    id: 'client-123',
    name: 'John Doe',
    email: 'john@acme.com',
    company: 'Acme Corporation',
    industry: 'technology',
    tags: ['enterprise', 'saas'],
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-02-20')
  },
  {
    id: 'client-456',
    name: 'Jane Smith',
    email: 'jane@globex.com',
    company: 'Globex Industries',
    industry: 'healthcare',
    tags: ['startup', 'ai'],
    status: 'active',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-03-10')
  },
  {
    id: 'client-789',
    name: 'Bob Johnson',
    email: 'bob@initech.com',
    company: 'Initech LLC',
    industry: 'finance',
    tags: ['enterprise', 'fintech'],
    status: 'pending',
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-03-01')
  }
];

// Client API Service - connects to both Supabase and MCP API
export const clientService = {
  // Create a new client
  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'status'>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          name: clientData.name,
          email: clientData.email,
          company: clientData.company,
          industry: clientData.industry,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    } catch (error) {
      // In development, return a mock client
      if (import.meta.env.DEV) {
        console.warn('Using mock data for createClient due to Supabase error:', error);
        // Generate a mock client
        const newClient: Client = {
          id: `client-${Math.floor(Math.random() * 1000)}`,
          name: clientData.name,
          email: clientData.email,
          company: clientData.company,
          industry: clientData.industry,
          tags: [],
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return newClient;
      }
      throw error;
    }
  },
  
  // Get all clients
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Client[];
    } catch (error) {
      // In development, return mock data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getClients due to Supabase error:', error);
        return mockClients;
      }
      throw error;
    }
  },
  
  // Get a client by ID
  async getClient(clientId: string): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      return data as Client;
    } catch (error) {
      // In development, return a mock client
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getClient due to Supabase error:', error);
        const client = mockClients.find(c => c.id === clientId);
        if (!client) throw new Error('Client not found');
        return client;
      }
      throw error;
    }
  },
  
  // Update a client
  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      return data as Client;
    } catch (error) {
      // In development, update a mock client
      if (import.meta.env.DEV) {
        console.warn('Using mock data for updateClient due to Supabase error:', error);
        const clientIndex = mockClients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) throw new Error('Client not found');
        
        const updatedClient = {
          ...mockClients[clientIndex],
          ...updates,
          updatedAt: new Date()
        };
        
        // In a real implementation, this would update the mock data array
        return updatedClient;
      }
      throw error;
    }
  },
  
  // Start intake session
  async startIntakeSession(clientId: string, initialResponses?: Record<string, any>): Promise<IntakeSession> {
    try {
      // First create session in Supabase
      const { data: sessionData, error: sessionError } = await supabase
        .from('intake_sessions')
        .insert([{ client_id: clientId }])
        .select()
        .single();
        
      if (sessionError) throw sessionError;
      
      // Then register with the MCP API
      if (sessionData) {
        const response = await apiClient.post<{ session_id: string, status: string }>('/intake/start', {
          client_id: clientId,
          responses: initialResponses || {}
        });
        
        return {
          id: sessionData.id,
          clientId,
          responses: [],
          summary: null,
          status: 'in_progress',
          createdAt: new Date(sessionData.created_at),
          updatedAt: new Date(sessionData.updated_at)
        };
      }
      
      throw new Error('Failed to create intake session');
    } catch (error) {
      // In development, return a mock intake session
      if (import.meta.env.DEV) {
        console.warn('Using mock data for startIntakeSession due to API/Supabase error:', error);
        return {
          id: `session-${Math.floor(Math.random() * 1000)}`,
          clientId,
          responses: [],
          summary: null,
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      throw error;
    }
  },
  
  // Update intake session with new responses
  async updateIntakeSession(
    sessionId: string, 
    responses: Record<string, any>
  ): Promise<{ status: string }> {
    try {
      // Send to MCP API
      const response = await apiClient.post<{ status: string }>(`/intake/update/${sessionId}`, responses);
      
      // Store responses in Supabase
      for (const [questionId, response] of Object.entries(responses)) {
        await supabase
          .from('intake_responses')
          .insert([{
            session_id: sessionId,
            question_id: questionId,
            response: response
          }]);
      }
      
      return response;
    } catch (error) {
      // In development, return mock status
      if (import.meta.env.DEV) {
        console.warn('Using mock data for updateIntakeSession due to API/Supabase error:', error);
        return { status: 'updated' };
      }
      throw error;
    }
  },
  
  // Get intake summary
  async getIntakeSummary(clientId: string): Promise<{ summary: string, status: string }> {
    try {
      const response = await apiClient.get<{ session_id: string, status: string, summary: string }>(`/intake/${clientId}`);
      return {
        summary: response.summary,
        status: response.status
      };
    } catch (error) {
      // In development, return mock summary
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getIntakeSummary due to API error:', error);
        return {
          summary: 'This is a mock intake summary for development purposes. It would normally contain AI-generated insights about the client based on their intake responses.',
          status: 'completed'
        };
      }
      throw error;
    }
  },
  
  // Analyze client intake data for opportunities
  async analyzeClientData(clientId: string, intakeData: Record<string, any>) {
    try {
      return await apiClient.post('/analyze', {
        client_id: clientId,
        intake_data: intakeData
      });
    } catch (error) {
      // In development, return mock analysis
      if (import.meta.env.DEV) {
        console.warn('Using mock data for analyzeClientData due to API error:', error);
        return {
          analysis_id: `analysis-${clientId}-${Date.now()}`,
          opportunities: [
            {
              title: 'AI-Driven Customer Service',
              description: 'Implement intelligent chatbot for 24/7 support',
              ai_fit_score: 0.85,
              potential_impact: 'high',
              relevant_solutions: ['GPT Integration', 'Custom Training']
            },
            {
              title: 'Sales Process Automation',
              description: 'Automate lead qualification and follow-up processes',
              ai_fit_score: 0.78,
              potential_impact: 'medium',
              relevant_solutions: ['Workflow Automation', 'CRM Integration']
            }
          ],
          business_goals: [
            {
              title: 'Improve Customer Response Time',
              description: 'Reduce average response time to under 1 hour',
              priority: 'high',
              timeline: 'Q2 2025'
            }
          ],
          challenges: [
            {
              title: 'Legacy System Integration',
              description: 'Current systems lack API capabilities',
              impact: 'high',
              urgency: 'medium'
            }
          ]
        };
      }
      throw error;
    }
  }
};