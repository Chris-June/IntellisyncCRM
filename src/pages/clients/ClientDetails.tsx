import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useClient } from '@/context/client-context';
import { useProject } from '@/context/project-context';
import { salesService } from '@/services/sales-service';
import { Opportunity, Lead } from '@/types/sales';
import { PageHeader } from '@/components/layouts/PageHeader';
import { 
  Plus, 
  Users, 
  Mail, 
  Building2, 
  Briefcase, 
  CalendarClock,
  ClipboardList, 
  LineChart, 
  FileText, 
  Edit, 
  MoreHorizontal,
  MessageSquare,
  Phone,
  ArrowRight,
  AlertCircle,
  FolderKanban
} from 'lucide-react';

export default function ClientDetails() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { loadClient, currentClient, isLoading: isClientLoading } = useClient();
  const { loadProjects, projects, isLoading: isProjectLoading } = useProject();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isOpportunityLoading, setIsOpportunityLoading] = useState(false);
  const [isLeadLoading, setIsLeadLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadClient(clientId);
      loadProjects(clientId);

      // Load opportunities
      const fetchOpportunities = async () => {
        setIsOpportunityLoading(true);
        try {
          const data = await salesService.getOpportunities(clientId);
          setOpportunities(data);
        } catch (error) {
          console.error('Failed to load opportunities:', error);
          toast.error('Failed to load opportunities');
        } finally {
          setIsOpportunityLoading(false);
        }
      };

      // Load leads (this is just a placeholder as the real endpoint would filter by client)
      const fetchLeads = async () => {
        setIsLeadLoading(true);
        try {
          // In a real implementation, you would fetch leads filtered by client ID
          // For now, we'll fetch all leads and filter on the client side
          const data = await salesService.getLeads();
          const clientLeads = data.filter(lead => lead.clientId === clientId);
          setLeads(clientLeads);
        } catch (error) {
          console.error('Failed to load leads:', error);
          toast.error('Failed to load leads');
        } finally {
          setIsLeadLoading(false);
        }
      };

      fetchOpportunities();
      fetchLeads();
    }
  }, [clientId, loadClient, loadProjects]);

  if (!clientId) {
    return <div>Client ID not provided</div>;
  }

  if (isClientLoading && !currentClient) {
    return <ClientDetailsSkeleton />;
  }

  if (!currentClient) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Client Not Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The client you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-6" onClick={() => navigate('/clients')}>
            Return to Clients
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={currentClient.name}
        description={
          <span className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            {currentClient.company}
          </span>
        }
        showBackButton={true}
        backButtonUrl="/clients"
      >
        <Button variant="outline" size="sm">
          <Phone className="mr-2 h-4 w-4" />
          Call
        </Button>
        <Button variant="outline" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </Button>
        <Button size="sm" onClick={() => navigate(`/clients/${clientId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </PageHeader>

      {/* Client Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{currentClient.email}</p>
                <p className="text-sm text-muted-foreground">Email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{currentClient.company}</p>
                <p className="text-sm text-muted-foreground">Company</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium capitalize">{currentClient.industry}</p>
                <p className="text-sm text-muted-foreground">Industry</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                Client since {new Date(currentClient.createdAt).toLocaleDateString()}
              </div>
              <Badge variant="outline" className={
                currentClient.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : currentClient.status === 'pending'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }>
                {currentClient.status}
              </Badge>
            </div>
          </CardFooter>
        </Card>

        {/* Client Stats Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Client Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <LineChart className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Active Leads</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{opportunities.length}</p>
                <p className="text-sm text-muted-foreground">Opportunities</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FolderKanban className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" onClick={() => navigate(`/clients/${clientId}/reports`)}>
              View Reports
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="justify-between" onClick={() => navigate('/sales/leads/new', { state: { clientId } })}>
              <span>Create New Lead</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="justify-between" onClick={() => navigate(`/projects/new?client=${clientId}`)}>
              <span>Create Project</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="justify-between" onClick={() => navigate(`/calendar/new?client=${clientId}`)}>
              <span>Schedule Meeting</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="justify-between" onClick={() => navigate('/resources/meeting-notes/new', { state: { clientId } })}>
              <span>Add Meeting Notes</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for client-related data */}
      <Tabs defaultValue="opportunities">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Identified Opportunities</CardTitle>
                <Button size="sm" onClick={() => navigate('/sales/opportunities/new', { state: { clientId } })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Opportunity
                </Button>
              </div>
              <CardDescription>
                Business opportunities identified during discovery and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOpportunityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-4">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : opportunities.length > 0 ? (
                <div className="space-y-4">
                  {opportunities.map((opportunity) => (
                    <div 
                      key={opportunity.id} 
                      className="flex flex-col md:flex-row md:justify-between md:items-start border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <Link 
                          to={`/sales/opportunities/${opportunity.id}`} 
                          className="font-medium hover:underline"
                        >
                          {opportunity.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.description.length > 100 
                            ? `${opportunity.description.substring(0, 100)}...` 
                            : opportunity.description}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="outline">
                            {opportunity.status}
                          </Badge>
                          {opportunity.score && (
                            <span className="text-muted-foreground">
                              Score: {opportunity.score}
                            </span>
                          )}
                          {opportunity.valuePotential && (
                            <span className="text-muted-foreground">
                              Value: ${opportunity.valuePotential.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/sales/leads/new?opportunity=${opportunity.id}`)}
                        >
                          Create Lead
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/sales/opportunities/${opportunity.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="mb-2">No opportunities found for this client.</div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/sales/opportunities/new', { state: { clientId } })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Opportunity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <Button size="sm" onClick={() => navigate('/projects/new', { state: { clientId } })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
              </div>
              <CardDescription>
                Client projects and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProjectLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-4">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div 
                      key={project.id} 
                      className="flex flex-col md:flex-row md:justify-between md:items-start border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <Link 
                          to={`/projects/${project.id}`} 
                          className="font-medium hover:underline"
                        >
                          {project.name}
                        </Link>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={
                            project.health === 'green' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : project.health === 'yellow'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }>
                            {project.health === 'green' ? 'On Track' : project.health === 'yellow' ? 'At Risk' : 'Delayed'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {project.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <CalendarClock className="h-3 w-3" />
                          <span>
                            {new Date(project.startDate).toLocaleDateString()} - {' '}
                            {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          View Project
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="mb-2">No projects found for this client.</div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/projects/new', { state: { clientId } })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Leads</CardTitle>
                <Button size="sm" onClick={() => navigate('/sales/leads/new', { state: { clientId } })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Lead
                </Button>
              </div>
              <CardDescription>
                Active sales leads and pipeline stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLeadLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-4">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="flex flex-col md:flex-row md:justify-between md:items-start border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <Link 
                          to={`/sales/leads/${lead.id}`} 
                          className="font-medium hover:underline"
                        >
                          Lead: {lead.opportunities[0]?.title || 'Untitled Lead'}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="outline" className={
                            lead.stage === 'proposal' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : lead.stage === 'negotiation'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : lead.stage === 'closed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          }>
                            {lead.stage}
                          </Badge>
                          <Badge variant="outline" className={
                            lead.status === 'won' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : lead.status === 'lost'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : lead.status === 'stalled'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }>
                            {lead.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${lead.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Probability: {Math.round(lead.probability * 100)}%
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/sales/leads/${lead.id}`)}
                        >
                          View Lead
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="mb-2">No leads found for this client.</div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/sales/leads/new', { state: { clientId } })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Lead
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Notes</CardTitle>
                <Button size="sm" onClick={() => {}}>
                  <Plus className="mr-2 h-4 w-4" /> Add Note
                </Button>
              </div>
              <CardDescription>
                Important notes and documentation for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p className="max-w-md mx-auto mb-4">
                  Notes help you keep track of important client information and conversations.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClientDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Skeleton className="h-5 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}