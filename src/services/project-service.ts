import { apiClient } from '@/lib/api';
import { Project, Task, Milestone, Resource } from '@/types/project';

// Mock data for development when API server isn't running
const mockProjects: Project[] = [
  {
    id: '1',
    clientId: 'client-123',
    name: 'Website Redesign',
    status: 'active',
    progress: 65,
    health: 'green',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-04-15'),
    tasks: [
      {
        id: 'task-1',
        projectId: '1',
        title: 'Design Homepage',
        description: 'Create responsive design for the homepage',
        status: 'completed',
        priority: 'high',
        assignedTo: 'John Doe',
        deadline: new Date('2025-02-01'),
        dependencies: [],
        progress: 100,
        estimatedHours: 20,
        actualHours: 18
      },
      {
        id: 'task-2',
        projectId: '1',
        title: 'Implement User Authentication',
        description: 'Set up user authentication system',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Jane Smith',
        deadline: new Date('2025-02-15'),
        dependencies: [],
        progress: 60,
        estimatedHours: 30,
        actualHours: 18
      }
    ],
    milestones: [
      {
        id: 'milestone-1',
        projectId: '1',
        title: 'Design Approval',
        description: 'Get client approval on all designs',
        dueDate: new Date('2025-02-10'),
        status: 'completed',
        deliverables: ['Homepage Design', 'Inner Pages Design'],
        dependencies: []
      },
      {
        id: 'milestone-2',
        projectId: '1',
        title: 'Beta Launch',
        description: 'Launch beta version for testing',
        dueDate: new Date('2025-03-15'),
        status: 'pending',
        deliverables: ['Functional Website', 'Testing Report'],
        dependencies: ['milestone-1']
      }
    ],
    resources: [
      {
        id: 'resource-1',
        type: 'human',
        name: 'John Doe',
        skills: ['UI Design', 'UX Design'],
        availability: 0.8,
        allocatedHours: 60,
        costRate: 75
      },
      {
        id: 'resource-2',
        type: 'human',
        name: 'Jane Smith',
        skills: ['Frontend', 'Backend'],
        availability: 1.0,
        allocatedHours: 80,
        costRate: 85
      }
    ],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-03-05')
  },
  {
    id: '2',
    clientId: 'client-456',
    name: 'Mobile App Development',
    status: 'active',
    progress: 30,
    health: 'yellow',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-06-30'),
    tasks: [],
    milestones: [
      {
        id: 'milestone-3',
        projectId: '2',
        title: 'Requirements Gathering',
        description: 'Complete all requirements documentation',
        dueDate: new Date('2025-02-15'),
        status: 'completed',
        deliverables: ['Requirements Document', 'User Stories'],
        dependencies: []
      }
    ],
    resources: [],
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-02-20')
  },
  {
    id: '3',
    clientId: 'client-789',
    name: 'AI Chatbot Implementation',
    status: 'planning',
    progress: 10,
    health: 'green',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    tasks: [],
    milestones: [
      {
        id: 'milestone-4',
        projectId: '3',
        title: 'Project Kickoff',
        description: 'Initial kickoff meeting with client',
        dueDate: new Date('2025-03-10'),
        status: 'pending',
        deliverables: ['Project Plan', 'Communication Protocol'],
        dependencies: []
      }
    ],
    resources: [],
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-02-15')
  }
];

// Project Management API Service - connects to MCP API
export const projectService = {
  // Create a new project from an opportunity
  async createProject(
    clientId: string,
    opportunityId: string,
    name: string,
    scope: {
      objectives: string[],
      deliverables: string[],
      timeline: {
        start_date: Date,
        end_date: Date
      },
      resources: {
        team_size: number,
        budget: number,
        skill_requirements: string[]
      }
    }
  ): Promise<Project> {
    try {
      const response = await apiClient.post<Project>('/projects', {
        client_id: clientId,
        opportunity_id: opportunityId,
        name,
        scope
      });
      
      return response;
    } catch (error) {
      // In development, return a mock project
      if (import.meta.env.DEV) {
        console.warn('Using mock data for createProject due to API error:', error);
        return {
          id: `project-${Math.floor(Math.random() * 1000)}`,
          clientId,
          name,
          status: 'planning',
          progress: 0,
          health: 'green',
          startDate: scope.timeline.start_date,
          endDate: scope.timeline.end_date,
          tasks: [],
          milestones: [],
          resources: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      throw error;
    }
  },
  
  // Get all projects for a client
  async getClientProjects(clientId: string): Promise<Project[]> {
    try {
      const response = await apiClient.get<{ projects: Project[], metadata: any }>(`/projects/${clientId}`);
      return response.projects;
    } catch (error) {
      // In development, return mock projects
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getClientProjects due to API error:', error);
        return mockProjects.filter(p => p.clientId === clientId);
      }
      throw error;
    }
  },
  
  // Get project details
  async getProjectDetails(projectId: string): Promise<Project> {
    try {
      const response = await apiClient.get<Project>(`/projects/${projectId}`);
      return response;
    } catch (error) {
      // In development, return a mock project
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getProjectDetails due to API error:', error);
        const project = mockProjects.find(p => p.id === projectId);
        if (!project) throw new Error('Project not found');
        return project;
      }
      throw error;
    }
  },
  
  // Update project
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const response = await apiClient.put<Project>(`/projects/${projectId}`, updates);
      return response;
    } catch (error) {
      // In development, update a mock project
      if (import.meta.env.DEV) {
        console.warn('Using mock data for updateProject due to API error:', error);
        const projectIndex = mockProjects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) throw new Error('Project not found');
        
        const updatedProject = {
          ...mockProjects[projectIndex],
          ...updates,
          updatedAt: new Date()
        };
        
        // In a real implementation, this would update the actual state
        return updatedProject;
      }
      throw error;
    }
  },
  
  // Add a task to a project
  async addProjectTask(
    projectId: string,
    title: string,
    description: string,
    assignedTo: string,
    deadline: Date,
    priority: string,
    estimatedHours: number,
    dependencies?: string[]
  ): Promise<Task> {
    try {
      const response = await apiClient.post<Task>(`/projects/${projectId}/tasks`, {
        title,
        description,
        assigned_to: assignedTo,
        deadline,
        priority,
        estimated_hours: estimatedHours,
        dependencies
      });
      
      return response;
    } catch (error) {
      // In development, return a mock task
      if (import.meta.env.DEV) {
        console.warn('Using mock data for addProjectTask due to API error:', error);
        const newTask: Task = {
          id: `task-${Math.floor(Math.random() * 1000)}`,
          projectId,
          title,
          description,
          status: 'pending',
          priority: priority as 'high' | 'medium' | 'low',
          assignedTo,
          deadline,
          dependencies: dependencies || [],
          progress: 0,
          estimatedHours,
          actualHours: 0
        };
        return newTask;
      }
      throw error;
    }
  },
  
  // Update task status
  async updateTaskStatus(
    taskId: string,
    status: string,
    progress?: number,
    actualHours?: number
  ): Promise<Task> {
    try {
      const response = await apiClient.put<Task>(`/tasks/${taskId}`, {
        status,
        progress,
        actual_hours: actualHours
      });
      
      return response;
    } catch (error) {
      // In development, return an updated mock task
      if (import.meta.env.DEV) {
        console.warn('Using mock data for updateTaskStatus due to API error:', error);
        // Find the task in mock projects
        for (const project of mockProjects) {
          const taskIndex = project.tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            const updatedTask = {
              ...project.tasks[taskIndex],
              status: status as 'pending' | 'in_progress' | 'completed' | 'blocked',
              progress: progress !== undefined ? progress : project.tasks[taskIndex].progress,
              actualHours: actualHours !== undefined ? actualHours : project.tasks[taskIndex].actualHours
            };
            return updatedTask;
          }
        }
        throw new Error('Task not found');
      }
      throw error;
    }
  },
  
  // Add a milestone to a project
  async addProjectMilestone(
    projectId: string,
    title: string,
    description: string,
    dueDate: Date,
    deliverables: string[],
    dependencies?: string[]
  ): Promise<Milestone> {
    try {
      const response = await apiClient.post<Milestone>(`/projects/${projectId}/milestones`, {
        title,
        description,
        due_date: dueDate,
        deliverables,
        dependencies
      });
      
      return response;
    } catch (error) {
      // In development, return a mock milestone
      if (import.meta.env.DEV) {
        console.warn('Using mock data for addProjectMilestone due to API error:', error);
        const newMilestone: Milestone = {
          id: `milestone-${Math.floor(Math.random() * 1000)}`,
          projectId,
          title,
          description,
          dueDate,
          status: 'pending',
          deliverables,
          dependencies: dependencies || []
        };
        return newMilestone;
      }
      throw error;
    }
  },
  
  // Update milestone status
  async updateMilestoneStatus(
    milestoneId: string,
    status: string
  ): Promise<Milestone> {
    try {
      const response = await apiClient.put<Milestone>(`/milestones/${milestoneId}`, {
        status
      });
      
      return response;
    } catch (error) {
      // In development, return an updated mock milestone
      if (import.meta.env.DEV) {
        console.warn('Using mock data for updateMilestoneStatus due to API error:', error);
        // Find the milestone in mock projects
        for (const project of mockProjects) {
          const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
          if (milestoneIndex !== -1) {
            const updatedMilestone = {
              ...project.milestones[milestoneIndex],
              status: status as 'pending' | 'completed' | 'at_risk'
            };
            return updatedMilestone;
          }
        }
        throw new Error('Milestone not found');
      }
      throw error;
    }
  },
  
  // Decompose project into tasks
  async decomposeProject(
    projectId: string,
    scope: {
      description: string,
      objectives: string[],
      deliverables: string[],
      constraints: Record<string, any>
    }
  ) {
    try {
      const response = await apiClient.post('/decompose', {
        project_id: projectId,
        scope
      });
      
      return response;
    } catch (error) {
      // In development, return mock decomposition data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for decomposeProject due to API error:', error);
        return {
          decomposition_id: `decomp-${Math.floor(Math.random() * 1000)}`,
          tasks: [
            {
              id: `task-${Math.floor(Math.random() * 1000)}`,
              title: 'Initial Project Setup',
              description: 'Set up project infrastructure and environments',
              estimated_duration: '2d',
              complexity: 'medium',
              dependencies: [],
              suggested_assignee_type: 'human',
              required_skills: ['devops', 'cloud'],
              estimated_effort_hours: 16.0,
              priority: 'high'
            }
          ],
          task_groups: [
            {
              id: 'group-1',
              name: 'Setup Phase',
              tasks: ['task-1'],
              parallel_execution: false,
              estimated_completion_time: '2d'
            }
          ],
          critical_path: ['task-1'],
          resource_allocation: {
            human_hours_required: 40.0,
            ai_agent_hours_required: 0.0,
            skill_distribution: {'devops': 16.0, 'cloud': 16.0, 'frontend': 8.0}
          }
        };
      }
      throw error;
    }
  },
  
  // Get project analytics
  async getProjectAnalytics(projectId: string) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/analytics`);
      return response;
    } catch (error) {
      // In development, return mock analytics data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getProjectAnalytics due to API error:', error);
        return {
          timeline_metrics: {
            planned_duration: "45 days",
            current_duration: "50 days",
            variance: "+5 days",
            completion_trend: "Delayed by 1 week"
          },
          resource_metrics: {
            budget_consumed: 65.0,
            budget_remaining: 35.0,
            resource_utilization: 78.5,
            top_contributors: [
              {name: "Jane Doe", tasks_completed: 8},
              {name: "John Smith", tasks_completed: 6}
            ]
          },
          quality_metrics: {
            defect_count: 3,
            defect_density: 0.15,
            test_coverage: 85.0,
            client_satisfaction: 4.5
          },
          risk_assessment: {
            overall_risk: "Low",
            top_risks: [
              {description: "Integration complexity", impact: "Medium", likelihood: "Low"},
              {description: "Resource availability", impact: "High", likelihood: "Low"}
            ]
          }
        };
      }
      throw error;
    }
  },
  
  // Submit deliverable for approval
  async submitForApproval(request: {
    project_id: string,
    client_id: string,
    deliverable_type: string,
    title: string,
    description: string,
    files: string[],
    due_by?: Date,
    reviewers: string[]
  }) {
    try {
      const response = await apiClient.post('/approvals/submit', request);
      return response;
    } catch (error) {
      // In development, return mock approval data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for submitForApproval due to API error:', error);
        return {
          submission_id: `submission-${Math.floor(Math.random() * 1000)}`,
          project_id: request.project_id,
          client_id: request.client_id,
          status: 'pending',
          created_at: new Date().toISOString(),
          expires_at: request.due_by ? request.due_by.toISOString() : null,
          approval_url: `https://example.com/approve/submission-123`
        };
      }
      throw error;
    }
  },
  
  // Get approval status
  async getClientApprovals(clientId: string, status?: string, projectId?: string) {
    try {
      let endpoint = `/approvals/${clientId}`;
      const params = new URLSearchParams();
      
      if (status) params.append('status', status);
      if (projectId) params.append('project_id', projectId);
      
      if (params.toString()) {
        endpoint = `${endpoint}?${params.toString()}`;
      }
      
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      // In development, return mock approvals data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for getClientApprovals due to API error:', error);
        return {
          submissions: [
            {
              id: 'submission-123',
              project_id: projectId || 'project-456',
              title: 'Website Design Mockup',
              deliverable_type: 'design',
              status: 'pending',
              submitted_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          total: 1,
          limit: 10,
          offset: 0
        };
      }
      throw error;
    }
  },
  
  // Run project retrospective
  async runRetrospective(
    projectId: string,
    type: string,
    periodStart: Date,
    periodEnd: Date,
    participants: string[],
    customQuestions?: string[],
    additionalContext?: Record<string, any>
  ) {
    try {
      const response = await apiClient.post('/retrospective', {
        project_id: projectId,
        type,
        period_start: periodStart,
        period_end: periodEnd,
        participants,
        custom_questions: customQuestions,
        additional_context: additionalContext
      });
      
      return response;
    } catch (error) {
      // In development, return mock retrospective data
      if (import.meta.env.DEV) {
        console.warn('Using mock data for runRetrospective due to API error:', error);
        return {
          retrospective_id: `retro-${Math.floor(Math.random() * 1000)}`,
          project_id: projectId,
          type,
          analyzed_at: new Date().toISOString(),
          went_well: [
            {
              category: 'process',
              type: 'went_well',
              description: 'Daily standups helped maintain team alignment',
              impact: 'high',
              actionable: true,
              action_items: ['Continue daily standups in future projects']
            }
          ],
          needs_improvement: [
            {
              category: 'client',
              type: 'needs_improvement',
              description: 'Requirement changes were not documented consistently',
              impact: 'medium',
              actionable: true,
              action_items: ['Implement formal change request process', 'Train team on documentation procedures']
            }
          ],
          action_plan: [
            {
              action: 'Implement formal change request process',
              owner: 'Project Manager',
              due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              status: 'pending'
            }
          ]
        };
      }
      throw error;
    }
  }
};