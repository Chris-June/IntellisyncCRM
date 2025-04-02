import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layouts/PageHeader';
import { 
  Building2, 
  DollarSign, 
  CalendarClock,
  BarChart, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Send,
  FilePlus,
  FileCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { salesService } from '@/services/sales-service';
import { Lead, Opportunity, Activity } from '@/types/sales';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeadDetails() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState('');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);
  const [riskData, setRiskData] = useState<any | null>(null);
  const [isLoadingRiskData, setIsLoadingRiskData] = useState(true);
  const [isCreatingNewLead, setIsCreatingNewLead] = useState(false);

  // Get any state passed from navigation
  const locationState = location.state as { clientId?: string, opportunityId?: string } | null;

  useEffect(() => {
    // Check if we're on the "new" page, which means creating a new lead
    if (leadId === 'new') {
      setIsCreatingNewLead(true);
      setIsLoading(false);
      return;
    }

    const fetchLead = async () => {
      if (!leadId) return;
      
      setIsLoading(true);
      try {
        const data = await salesService.getLeadDetails(leadId);
        setLead(data);
      } catch (error) {
        console.error('Failed to load lead:', error);
        toast.error('Failed to load lead');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRiskData = async () => {
      if (!leadId || leadId === 'new') return;
      
      setIsLoadingRiskData(true);
      try {
        const data = await salesService.getDealRisks(leadId);
        setRiskData(data);
      } catch (error) {
        console.error('Failed to load risk data:', error);
        // Don't show error toast as this is supplementary data
      } finally {
        setIsLoadingRiskData(false);
      }
    };

    fetchLead();
    fetchRiskData();
  }, [leadId]);

  const handleAddActivity = async () => {
    if (!leadId || !activity.trim() || leadId === 'new') return;

    setIsSubmittingActivity(true);
    try {
      const newActivity = await salesService.addLeadActivity(
        leadId,
        'note',
        activity
      );
      
      // Update the lead activities in state
      setLead(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          activities: [newActivity, ...prev.activities]
        };
      });
      
      // Clear the activity input
      setActivity('');
      toast.success('Activity added successfully');
    } catch (error) {
      console.error('Failed to add activity:', error);
      toast.error('Failed to add activity');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleUpdateStage = async (newStage: string) => {
    if (!leadId || !lead || leadId === 'new') return;
    
    try {
      const updatedLead = await salesService.updateLeadStage(
        leadId,
        newStage,
        `Stage updated from ${lead.stage} to ${newStage}`,
        []
      );
      
      // Update the lead in state
      setLead(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          stage: updatedLead.stage
        };
      });
      
      toast.success(`Lead stage updated to ${newStage}`);
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error('Failed to update stage');
    }
  };

  // If we're creating a new lead, render the new lead form
  if (isCreatingNewLead) {
    const clientId = locationState?.clientId;
    const opportunityId = locationState?.opportunityId;
    
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Create New Lead"
          description="Add a new lead to the sales pipeline"
          showBackButton={true}
          backButtonUrl="/sales/leads"
        />
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">New Lead Form</h3>
              <p className="max-w-md mx-auto mb-4">
                {clientId ? 
                  `Creating a new lead for client ID: ${clientId}` :
                  opportunityId ?
                  `Creating a new lead for opportunity ID: ${opportunityId}` :
                  "Fill in lead details to create a new sales pipeline entry"}
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/sales/leads')}>
                  Cancel
                </Button>
                <Button variant="default" onClick={() => {
                  toast.success('Lead created successfully');
                  navigate('/sales/leads');
                }}>
                  Create Lead
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !lead) {
    return <LeadDetailsSkeleton />;
  }

  if (!lead) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Lead Not Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The lead you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-6" onClick={() => navigate('/sales/leads')}>
            Return to Leads
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'stalled':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'won':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'discovery':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'proposal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'negotiation':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get lead title from the first opportunity
  const leadTitle = lead.opportunities[0]?.title || 'Untitled Lead';

  return (
    <div className="space-y-6">
      <PageHeader 
        title={leadTitle}
        showBackButton={true}
        backButtonUrl="/sales/leads"
      >
        <Button variant="outline" size="sm" onClick={() => navigate(`/sales/proposals/generate?lead=${leadId}`)}>
          <FilePlus className="mr-2 h-4 w-4" />
          Generate Proposal
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/sales/contracts/build?lead=${leadId}`)}>
          <FileCheck className="mr-2 h-4 w-4" />
          Build Contract
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <Badge variant="outline" className={getStageColor(lead.stage)}>
          {lead.stage}
        </Badge>
        <Badge variant="outline" className={getStatusColor(lead.status)}>
          {lead.status}
        </Badge>
        <span className="flex items-center text-muted-foreground">
          <DollarSign className="h-4 w-4 mr-1" />
          {lead.value.toLocaleString()}
        </span>
        <span className="flex items-center text-muted-foreground">
          <BarChart className="h-4 w-4 mr-1" />
          {Math.round(lead.probability * 100)}% probability
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="activities">
            <TabsList>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-6">
              {/* Activity Input */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Add Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add a note, meeting summary, or important update..."
                      className="min-h-[100px]"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddActivity} disabled={!activity.trim() || isSubmittingActivity}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmittingActivity ? 'Adding...' : 'Add Activity'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Recent activities and updates for this lead
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lead.activities.length > 0 ? (
                    <div className="space-y-6">
                      {lead.activities.map((activity: Activity, index) => (
                        <div key={activity.id} className="relative pb-6">
                          {/* Timeline connector */}
                          {index < lead.activities.length - 1 && (
                            <div className="absolute top-6 bottom-0 left-3.5 w-px bg-border" />
                          )}
                          
                          <div className="flex gap-4">
                            <div className="mt-1 rounded-full w-7 h-7 flex items-center justify-center bg-primary/10 text-primary">
                              {activity.type === 'note' && <FileText className="h-4 w-4" />}
                              {activity.type === 'email' && <Send className="h-4 w-4" />}
                              {activity.type === 'meeting' && <CalendarClock className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline justify-between">
                                <h4 className="text-sm font-medium">
                                  {activity.type === 'note' && 'Note added'}
                                  {activity.type === 'email' && 'Email sent'}
                                  {activity.type === 'meeting' && 'Meeting scheduled'}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(activity.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-foreground">
                                {activity.description}
                              </p>
                              <div className="mt-2 text-xs text-muted-foreground">
                                By {activity.createdBy}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No activities yet</h3>
                      <p className="max-w-md mx-auto mb-4">
                        Add your first activity to start tracking this lead's journey.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Opportunities Tab */}
            <TabsContent value="opportunities">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Related Opportunities</CardTitle>
                    <CardDescription>
                      Opportunities associated with this lead
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => navigate('/sales/opportunities/new', { state: { leadId } })}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {lead.opportunities.length > 0 ? (
                    <div className="space-y-4">
                      {lead.opportunities.map((opportunity: Opportunity) => (
                        <div key={opportunity.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                              <Link 
                                to={`/sales/opportunities/${opportunity.id}`}
                                className="text-md font-medium hover:underline"
                              >
                                {opportunity.title}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                {opportunity.description.length > 100 
                                  ? opportunity.description.substring(0, 100) + '...' 
                                  : opportunity.description}
                              </p>
                              <div className="flex flex-wrap gap-3 mt-2">
                                <Badge variant="outline">
                                  {opportunity.status}
                                </Badge>
                                {opportunity.score && (
                                  <span className="text-sm text-muted-foreground flex items-center">
                                    <BarChart className="h-3.5 w-3.5 mr-1" />
                                    Score: {opportunity.score}/100
                                  </span>
                                )}
                                {opportunity.valuePotential && (
                                  <span className="text-sm text-muted-foreground flex items-center">
                                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                                    Value: ${opportunity.valuePotential.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 md:mt-0"
                              onClick={() => navigate(`/sales/opportunities/${opportunity.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mb-2">No opportunities found for this lead.</div>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/sales/opportunities/new', { state: { leadId } })}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Opportunity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>
                      Proposals, contracts, and other documents
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/sales/proposals/generate?lead=${leadId}`)}>
                      <FilePlus className="mr-2 h-4 w-4" /> New Proposal
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/sales/contracts/build?lead=${leadId}`)}>
                      <FileCheck className="mr-2 h-4 w-4" /> New Contract
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                    <p className="max-w-md mx-auto mb-4">
                      Generate a proposal or contract to move this lead forward.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => navigate(`/sales/proposals/generate?lead=${leadId}`)}>
                        <FilePlus className="mr-2 h-4 w-4" /> Generate Proposal
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/sales/contracts/build?lead=${leadId}`)}>
                        <FileCheck className="mr-2 h-4 w-4" /> Build Contract
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Client</span>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Link 
                    to={`/clients/${lead.clientId}`} 
                    className="text-sm font-medium hover:underline"
                  >
                    View Client Profile
                  </Link>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Stage</span>
                <div className="flex items-center justify-between mt-1">
                  <Select defaultValue={lead.stage} onValueChange={handleUpdateStage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Progress</span>
                <div className="mt-1">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>
                      {lead.stage === 'discovery' ? '25%' : 
                       lead.stage === 'proposal' ? '50%' : 
                       lead.stage === 'negotiation' ? '75%' : 
                       lead.stage === 'closed' ? '100%' : '0%'}
                    </span>
                  </div>
                  <Progress 
                    value={
                      lead.stage === 'discovery' ? 25 : 
                      lead.stage === 'proposal' ? 50 : 
                      lead.stage === 'negotiation' ? 75 : 
                      lead.stage === 'closed' ? 100 : 0
                    } 
                    className="h-2" 
                  />
                </div>
              </div>
              
              <Separator />

              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p className="text-sm mt-1">{new Date(lead.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <p className="text-sm mt-1">{new Date(lead.updatedAt).toLocaleDateString()}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Close Date</span>
                <p className="text-sm mt-1">
                  {lead.stage === 'closed'
                    ? new Date(lead.updatedAt).toLocaleDateString()
                    : 'Not closed yet'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="w-full" onClick={() => navigate(`/clients/${lead.clientId}`)}>
                View Client
              </Button>
            </CardFooter>
          </Card>

          {/* Risk Assessment Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Risk Assessment</span>
              </CardTitle>
              <CardDescription>
                AI-driven risk analysis for this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRiskData ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : riskData ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Risk Level</span>
                      <Badge variant="outline" className={
                        riskData.risk_assessment.risk_level === 'low'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : riskData.risk_assessment.risk_level === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }>
                        {riskData.risk_assessment.risk_level}
                      </Badge>
                    </div>
                    <Progress 
                      value={riskData.risk_assessment.risk_score} 
                      className="h-2" 
                      indicatorClassName={
                        riskData.risk_assessment.risk_level === 'low'
                          ? 'bg-green-500'
                          : riskData.risk_assessment.risk_level === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }
                    />
                  </div>

                  {riskData.risk_assessment.warning_signals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Warning Signals</h4>
                      <ul className="space-y-2 text-sm">
                        {riskData.risk_assessment.warning_signals.map((signal: any, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className={
                              signal.severity === 'critical'
                                ? 'h-4 w-4 text-red-500 mt-0.5'
                                : signal.severity === 'warning'
                                ? 'h-4 w-4 text-amber-500 mt-0.5'
                                : 'h-4 w-4 text-blue-500 mt-0.5'
                            } />
                            <span>{signal.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {riskData.risk_assessment.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-2 text-sm">
                        {riskData.risk_assessment.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No risk assessment available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LeadDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-10 w-full max-w-[300px]" /> {/* Tabs */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-32" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}