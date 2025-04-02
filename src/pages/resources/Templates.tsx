import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { WorkflowTemplate } from '@/types/resources';
import { resourceService } from '@/services/resource-service';
import { 
  Plus, 
  Search, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Pencil, 
  MoreVertical, 
  Play, 
  Archive,
  Activity,
  FileDown,
  FileUp,
  User
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, we'd call the API
      // For demo purposes, we'll create mock data
      setTimeout(() => {
        const mockTemplates: WorkflowTemplate[] = [
          {
            id: 'template-1',
            name: 'Standard Client Onboarding',
            description: 'Complete client onboarding workflow with intake forms, discovery, and opportunity analysis',
            type: 'intake',
            status: 'active',
            steps: [
              {
                id: 'step-1',
                name: 'Client Information Collection',
                type: 'human',
                description: 'Collect basic client information via intake form',
                configuration: {
                  form_id: 'client-intake-form',
                  required_fields: ['name', 'email', 'company', 'industry', 'needs']
                },
                nextSteps: ['step-2'],
                conditionalLogic: null,
                timeout: 604800, // 1 week
                retryPolicy: null
              },
              {
                id: 'step-2',
                name: 'Discovery Analysis',
                type: 'agent',
                description: 'AI analysis of client needs to identify opportunities',
                configuration: {
                  agent_id: 'discovery-analysis',
                  input_mapping: {
                    client_data: '$.step-1.responses'
                  }
                },
                nextSteps: ['step-3'],
                conditionalLogic: null,
                timeout: 86400, // 1 day
                retryPolicy: {
                  max_retries: 3,
                  backoff: 'exponential'
                }
              },
              {
                id: 'step-3',
                name: 'Opportunity Review',
                type: 'approval',
                description: 'Review and approval of identified opportunities',
                configuration: {
                  approvers: ['sales_manager'],
                  min_approvals: 1,
                  expiration: 259200 // 3 days
                },
                nextSteps: ['step-4'],
                conditionalLogic: null,
                timeout: 259200, // 3 days
                retryPolicy: null
              },
              {
                id: 'step-4',
                name: 'Lead Creation',
                type: 'agent',
                description: 'Create sales leads from approved opportunities',
                configuration: {
                  agent_id: 'lead-creator',
                  input_mapping: {
                    opportunities: '$.step-2.opportunities',
                    approvals: '$.step-3.approvals'
                  }
                },
                nextSteps: [],
                conditionalLogic: null,
                timeout: 3600, // 1 hour
                retryPolicy: {
                  max_retries: 3,
                  backoff: 'linear'
                }
              }
            ],
            triggers: [
              {
                type: 'manual',
                description: 'Manually triggered for new clients'
              },
              {
                type: 'form_submission',
                description: 'Triggered when website intake form is submitted'
              }
            ],
            version: '1.0.0',
            createdBy: 'John Smith',
            createdAt: new Date('2025-01-15'),
            updatedAt: new Date('2025-02-10')
          },
          {
            id: 'template-2',
            name: 'Proposal Generation Workflow',
            description: 'End-to-end workflow for creating, reviewing, and delivering client proposals',
            type: 'sales',
            status: 'active',
            steps: [
              {
                id: 'step-1',
                name: 'Opportunity Data Collection',
                type: 'human',
                description: 'Gather key opportunity data for proposal',
                configuration: {
                  form_id: 'opportunity-data-form',
                  required_fields: ['client_id', 'opportunity_id', 'project_scope', 'timeline', 'budget']
                },
                nextSteps: ['step-2'],
                conditionalLogic: null,
                timeout: 259200, // 3 days
                retryPolicy: null
              },
              {
                id: 'step-2',
                name: 'Proposal Generation',
                type: 'agent',
                description: 'AI-assisted generation of proposal document',
                configuration: {
                  agent_id: 'proposal-generator',
                  input_mapping: {
                    opportunity_data: '$.step-1.responses'
                  }
                },
                nextSteps: ['step-3'],
                conditionalLogic: null,
                timeout: 86400, // 1 day
                retryPolicy: {
                  max_retries: 2,
                  backoff: 'fixed'
                }
              },
              {
                id: 'step-3',
                name: 'Internal Review',
                type: 'approval',
                description: 'Team review and approval of proposal',
                configuration: {
                  approvers: ['sales_manager', 'account_executive'],
                  min_approvals: 1,
                  expiration: 172800 // 2 days
                },
                nextSteps: ['step-4'],
                conditionalLogic: null,
                timeout: 172800, // 2 days
                retryPolicy: null
              },
              {
                id: 'step-4',
                name: 'Client Delivery',
                type: 'notification',
                description: 'Send proposal to client',
                configuration: {
                  channels: ['email', 'portal'],
                  templates: {
                    email: 'proposal-delivery-email',
                    portal: 'proposal-delivery-notification'
                  }
                },
                nextSteps: [],
                conditionalLogic: null,
                timeout: 3600, // 1 hour
                retryPolicy: {
                  max_retries: 3,
                  backoff: 'exponential'
                }
              }
            ],
            triggers: [
              {
                type: 'manual',
                description: 'Manually triggered for new proposals'
              }
            ],
            version: '1.2.0',
            createdBy: 'Sarah Chen',
            createdAt: new Date('2025-01-20'),
            updatedAt: new Date('2025-03-05')
          },
          {
            id: 'template-3',
            name: 'Project Kickoff',
            description: 'Standard project kickoff workflow for new clients',
            type: 'project',
            status: 'active',
            steps: [
              {
                id: 'step-1',
                name: 'Project Setup',
                type: 'human',
                description: 'Create project structure and initial planning',
                configuration: {
                  form_id: 'project-setup-form',
                  required_fields: ['client_id', 'project_name', 'start_date', 'objectives']
                },
                nextSteps: ['step-2'],
                conditionalLogic: null,
                timeout: 259200, // 3 days
                retryPolicy: null
              },
              {
                id: 'step-2',
                name: 'Task Decomposition',
                type: 'agent',
                description: 'Break down project into tasks and milestones',
                configuration: {
                  agent_id: 'task-decomposer',
                  input_mapping: {
                    project_data: '$.step-1.responses'
                  }
                },
                nextSteps: ['step-3', 'step-4'],
                conditionalLogic: null,
                timeout: 86400, // 1 day
                retryPolicy: {
                  max_retries: 2,
                  backoff: 'fixed'
                }
              },
              {
                id: 'step-3',
                name: 'Kickoff Meeting Scheduling',
                type: 'integration',
                description: 'Schedule kickoff meeting with client',
                configuration: {
                  integration_id: 'calendar',
                  operation: 'create_event',
                  input_mapping: {
                    attendees: '$.step-1.responses.team_members',
                    client_contacts: '$.step-1.responses.client_contacts'
                  }
                },
                nextSteps: [],
                conditionalLogic: null,
                timeout: 43200, // 12 hours
                retryPolicy: {
                  max_retries: 3,
                  backoff: 'linear'
                }
              },
              {
                id: 'step-4',
                name: 'Client Welcome',
                type: 'notification',
                description: 'Send welcome email to client',
                configuration: {
                  channels: ['email'],
                  templates: {
                    email: 'project-welcome-email'
                  }
                },
                nextSteps: [],
                conditionalLogic: null,
                timeout: 3600, // 1 hour
                retryPolicy: {
                  max_retries: 3,
                  backoff: 'exponential'
                }
              }
            ],
            triggers: [
              {
                type: 'manual',
                description: 'Manually triggered for new projects'
              },
              {
                type: 'deal_closed',
                description: 'Triggered when a deal is marked as won'
              }
            ],
            version: '1.0.0',
            createdBy: 'Michael Johnson',
            createdAt: new Date('2025-02-05'),
            updatedAt: new Date('2025-02-05')
          },
          {
            id: 'template-4',
            name: 'Support Request Handling',
            description: 'Workflow for managing client support requests',
            type: 'support',
            status: 'draft',
            steps: [
              {
                id: 'step-1',
                name: 'Support Request Intake',
                type: 'human',
                description: 'Log support request details',
                configuration: {
                  form_id: 'support-request-form',
                  required_fields: ['client_id', 'project_id', 'issue_description', 'priority']
                },
                nextSteps: ['step-2'],
                conditionalLogic: null,
                timeout: 86400, // 1 day
                retryPolicy: null
              },
              {
                id: 'step-2',
                name: 'Priority Assessment',
                type: 'condition',
                description: 'Route request based on priority',
                configuration: {
                  conditions: {
                    high: {
                      field: '$.step-1.responses.priority',
                      operator: 'equals',
                      value: 'high',
                      next_step: 'step-3'
                    },
                    low_medium: {
                      field: '$.step-1.responses.priority',
                      operator: 'in',
                      value: ['low', 'medium'],
                      next_step: 'step-4'
                    }
                  }
                },
                nextSteps: ['step-3', 'step-4'],
                conditionalLogic: {
                  default_step: 'step-4'
                },
                timeout: 300, // 5 minutes
                retryPolicy: null
              },
              {
                id: 'step-3',
                name: 'Urgent Response',
                type: 'notification',
                description: 'Notify support team of urgent request',
                configuration: {
                  channels: ['email', 'slack', 'sms'],
                  templates: {
                    email: 'urgent-support-email',
                    slack: 'urgent-support-slack',
                    sms: 'urgent-support-sms'
                  }
                },
                nextSteps: [],
                conditionalLogic: null,
                timeout: 1800, // 30 minutes
                retryPolicy: {
                  max_retries: 3,
                  backoff: 'exponential'
                }
              },
              {
                id: 'step-4',
                name: 'Standard Response',
                type: 'agent',
                description: 'Generate initial support response',
                configuration: {
                  agent_id: 'support-assistant',
                  input_mapping: {
                    request_data: '$.step-1.responses'
                  }
                },
                nextSteps: [],
                conditionalLogic: null,
                timeout: 3600, // 1 hour
                retryPolicy: {
                  max_retries: 2,
                  backoff: 'fixed'
                }
              }
            ],
            triggers: [
              {
                type: 'manual',
                description: 'Manually triggered for support requests'
              },
              {
                type: 'email',
                description: 'Triggered when email is sent to support@intellisync.example'
              },
              {
                type: 'form_submission',
                description: 'Triggered when support form is submitted on the website'
              }
            ],
            version: '0.9.0',
            createdBy: 'Emma Wilson',
            createdAt: new Date('2025-03-10'),
            updatedAt: new Date('2025-03-12')
          }
        ];
        
        setTemplates(mockTemplates);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
      setIsLoading(false);
    }
  };
  
  // Filter templates based on search and type filter
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery.trim() === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || template.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'intake':
        return 'Client Intake';
      case 'sales':
        return 'Sales Process';
      case 'project':
        return 'Project Management';
      case 'support':
        return 'Client Support';
      case 'custom':
        return 'Custom Workflow';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'intake':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'sales':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'project':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'support':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'custom':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'human':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'agent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'approval':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'notification':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'integration':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'condition':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflow Templates</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage reusable workflow templates
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={typeFilter || ''}
            onValueChange={(value) => setTypeFilter(value === '' ? null : value)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="intake">Client Intake</SelectItem>
              <SelectItem value="sales">Sales Process</SelectItem>
              <SelectItem value="project">Project Management</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-32 rounded-md" />
                      <Skeleton className="h-8 w-32 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setSelectedTemplate(template)}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Version {template.version} • Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getTypeColor(template.type)}>
                          {getTypeLabel(template.type)}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(template.status)}>
                          {getStatusLabel(template.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{template.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Activity className="h-4 w-4 text-primary" />
                      <span>{template.steps.length} steps</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{template.triggers.length} triggers</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {template.steps.slice(0, 3).map((step, index) => (
                        <Badge key={index} variant="outline" className={getStepTypeColor(step.type)}>
                          {step.type}
                        </Badge>
                      ))}
                      {template.steps.length > 3 && (
                        <Badge variant="outline">
                          +{template.steps.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        <span>Created by: {template.createdBy}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Created instance of ${template.name}`);
                        }}>
                          <Play className="mr-1 h-4 w-4" />
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Duplicated ${template.name}`);
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Editing ${template.name}`);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <div className="mx-auto mb-4 bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery || typeFilter 
                      ? "No templates match your search criteria. Try adjusting your filters."
                      : "You haven't created any workflow templates yet. Create your first template to get started."}
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active">
          <div className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              templates
                .filter(template => template.status === 'active')
                .filter(template => 
                  searchQuery.trim() === '' || 
                  template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  template.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .filter(template => !typeFilter || template.type === typeFilter)
                .map(template => (
                  <Card key={template.id} className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setSelectedTemplate(template)}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <CardTitle>{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            Version {template.version} • Active template
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={getTypeColor(template.type)}>
                          {getTypeLabel(template.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{template.description}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm">Ready to use</span>
                        </div>
                        <Button size="sm" onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Created instance of ${template.name}`);
                        }}>
                          <Play className="mr-2 h-4 w-4" />
                          Use Template
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
            )}
            {!isLoading && templates.filter(t => t.status === 'active').length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No active templates found
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="draft">
          <div className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              templates
                .filter(template => template.status === 'draft')
                .filter(template => 
                  searchQuery.trim() === '' || 
                  template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  template.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .filter(template => !typeFilter || template.type === typeFilter)
                .map(template => (
                  <Card key={template.id} className="cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => setSelectedTemplate(template)}>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <CardTitle>{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            Version {template.version} • Draft template
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={getTypeColor(template.type)}>
                          {getTypeLabel(template.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{template.description}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-sm">Draft - Not yet active</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`Continuing to edit ${template.name}`);
                          }}>
                            <Pencil className="mr-1 h-4 w-4" />
                            Continue Editing
                          </Button>
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`Activated ${template.name}`);
                          }}>
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Activate
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))
            )}
            {!isLoading && templates.filter(t => t.status === 'draft').length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No draft templates found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Template Detail Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">{selectedTemplate.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(selectedTemplate.type)}>
                    {getTypeLabel(selectedTemplate.type)}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedTemplate.status)}>
                    {getStatusLabel(selectedTemplate.status)}
                  </Badge>
                </div>
              </div>
              <DialogDescription>
                Version {selectedTemplate.version} • Last updated {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
              
              <div className="space-y-2">
                <h3 className="text-base font-medium">Workflow Steps</h3>
                <div className="relative pl-6 border-l-2 border-muted space-y-8">
                  {selectedTemplate.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Step indicator */}
                      <div className="absolute -left-[25px] bg-background border-2 border-muted rounded-full h-12 w-12 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h4 className="font-medium">{step.name}</h4>
                          <Badge variant="outline" className={getStepTypeColor(step.type)}>
                            {step.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          {step.nextSteps.length > 0 ? (
                            <div className="flex items-center">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Next: Step {selectedTemplate.steps.findIndex(s => s.id === step.nextSteps[0]) + 1}
                              {step.nextSteps.length > 1 && ` + ${step.nextSteps.length - 1} more`}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Final step
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-base font-medium">Triggers</h3>
                <div className="space-y-2">
                  {selectedTemplate.triggers.map((trigger, index) => (
                    <div key={index} className="flex items-center gap-2 border rounded-md p-3">
                      <div className="bg-primary/10 p-1 rounded-md">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{trigger.type}</p>
                        <p className="text-xs text-muted-foreground">{trigger.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex sm:justify-between items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-3 w-3 mr-1" />
                <span>Created by {selectedTemplate.createdBy}</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  toast.success(`Duplicated ${selectedTemplate.name}`);
                }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  toast.success(`Exporting ${selectedTemplate.name}`);
                }}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={() => {
                  toast.success(`Created instance of ${selectedTemplate.name}`);
                  setSelectedTemplate(null);
                }}>
                  <Play className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Create Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Workflow Template</DialogTitle>
            <DialogDescription>
              Create a reusable workflow template for common processes
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input id="name" placeholder="e.g., Client Onboarding, Project Kickoff" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the purpose and use case of this workflow template"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake">Client Intake</SelectItem>
                  <SelectItem value="sales">Sales Process</SelectItem>
                  <SelectItem value="project">Project Management</SelectItem>
                  <SelectItem value="support">Client Support</SelectItem>
                  <SelectItem value="custom">Custom Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 bg-muted/20 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Starting Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3 flex flex-col items-center text-center cursor-pointer hover:bg-accent/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Start from Scratch</h4>
                  <p className="text-xs text-muted-foreground">
                    Build a custom workflow with full control over each step
                  </p>
                </div>
                <div className="border rounded-md p-3 flex flex-col items-center text-center cursor-pointer hover:bg-accent/20 transition-colors">
                  <Copy className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Duplicate Existing</h4>
                  <p className="text-xs text-muted-foreground">
                    Copy an existing template as your starting point
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="import">Or Import Template</Label>
              <div className="flex gap-2">
                <Input id="import" placeholder="No file selected" disabled className="flex-1" />
                <Button variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Browse
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Import a workflow template from a JSON or YAML file
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Continuing to template editor');
              setIsDialogOpen(false);
              // In a real implementation, this would navigate to a template editor
              // navigate('/resources/templates/editor');
            }}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}