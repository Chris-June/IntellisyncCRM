import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Project, Task, Milestone } from '@/types/project';
import { useProject } from '@/context/project-context';
import { PageHeader } from '@/components/layouts/PageHeader';
import { 
  Building2, 
  CalendarClock, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Users,
  BarChart,
  FileText,
  Plus,
  LayoutGrid,
  ListTodo,
  Milestone as MilestoneIcon
} from 'lucide-react';

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { loadProject, currentProject, isLoading } = useProject();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
      
      // In a real implementation, we would fetch analytics data
      const fetchAnalytics = async () => {
        setIsAnalyticsLoading(true);
        try {
          // Mocked analytics data
          setTimeout(() => {
            setAnalytics({
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
            });
            setIsAnalyticsLoading(false);
          }, 1500);
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
          setIsAnalyticsLoading(false);
        }
      };
      
      fetchAnalytics();
    }
  }, [projectId, loadProject]);

  if (isLoading && !currentProject) {
    return <ProjectDetailsSkeleton />;
  }

  if (!projectId || !currentProject) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Project Not Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-6" onClick={() => navigate('/projects')}>
            Return to Projects
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getHealthIndicator = (health: string) => {
    switch (health) {
      case 'green':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'yellow':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'red':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'green':
        return 'On Track';
      case 'yellow':
        return 'At Risk';
      case 'red':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'planning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'paused':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'at_risk':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'pending':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={currentProject.name}
        description="Project details and management"
        showBackButton={true}
        backButtonUrl="/projects"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/tasks`)}>
            <ListTodo className="mr-2 h-4 w-4" />
            Tasks
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/milestones`)}>
            <MilestoneIcon className="mr-2 h-4 w-4" />
            Milestones
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <Badge variant="outline" className={getStatusColor(currentProject.status)}>
          {currentProject.status}
        </Badge>
        <div className="flex items-center gap-1">
          {getHealthIndicator(currentProject.health)}
          <span>{getHealthText(currentProject.health)}</span>
        </div>
        <span className="flex items-center text-muted-foreground">
          <Building2 className="h-4 w-4 mr-1" />
          Client: <Link to={`/clients/${currentProject.clientId}`} className="hover:underline ml-1">
            {currentProject.clientId}
          </Link>
        </span>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Project Progress</h3>
            <span className="text-sm font-medium">{currentProject.progress}%</span>
          </div>
          <Progress value={currentProject.progress} className="h-2" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Timeline</span>
              <span className="mt-1 text-sm">
                {new Date(currentProject.startDate).toLocaleDateString()} - {new Date(currentProject.endDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Tasks</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-medium">{currentProject.tasks.filter(t => t.status === 'completed').length}/{currentProject.tasks.length} completed</span>
                {currentProject.tasks.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(currentProject.tasks.filter(t => t.status === 'completed').length / currentProject.tasks.length * 100)}%)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Milestones</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-medium">{currentProject.milestones.filter(m => m.status === 'completed').length}/{currentProject.milestones.length} completed</span>
                {currentProject.milestones.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(currentProject.milestones.filter(m => m.status === 'completed').length / currentProject.milestones.length * 100)}%)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Resources</span>
              <span className="mt-1 text-sm">{currentProject.resources.length} assigned</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for project details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Tasks */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Tasks</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${projectId}/tasks`)}
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>Latest tasks and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {currentProject.tasks.length > 0 ? (
                  <div className="space-y-4">
                    {currentProject.tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              task.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : task.status === 'blocked'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : task.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-base font-medium mt-1">{task.title}</p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-muted-foreground">Assigned to</span>
                          <span className="text-sm font-medium">{task.assignedTo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="mb-2">No tasks added to this project yet.</div>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/projects/${projectId}/tasks`)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Tasks
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Milestones */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Milestones</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${projectId}/milestones`)}
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>Next project milestones</CardDescription>
              </CardHeader>
              <CardContent>
                {currentProject.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {currentProject.milestones
                      .filter(m => m.status !== 'completed')
                      .slice(0, 3)
                      .map((milestone) => (
                        <div key={milestone.id} className="pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className={getMilestoneColor(milestone.status)}>
                              {milestone.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="mb-2">No milestones defined.</div>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/projects/${projectId}/milestones`)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Milestone
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>People assigned to this project</CardDescription>
              </CardHeader>
              <CardContent>
                {currentProject.resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentProject.resources.map((resource) => (
                      <div key={resource.id} className="flex items-start space-x-4 border p-4 rounded-md">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{resource.name}</p>
                          <Badge variant="outline">
                            {resource.type === 'human' ? 'Team Member' : 'AI Agent'}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            <p>Skills: {resource.skills.join(', ')}</p>
                            <p>Allocated: {resource.allocatedHours} hours</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="mb-2">No team members assigned to this project.</div>
                    <Button 
                      variant="outline"
                      onClick={() => {}}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Assign Team Members
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(currentProject.status)}>
                      {currentProject.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Timeline</span>
                  <p className="text-sm mt-1">
                    {new Date(currentProject.startDate).toLocaleDateString()} - {new Date(currentProject.endDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Created</span>
                  <p className="text-sm mt-1">{new Date(currentProject.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <p className="text-sm mt-1">{new Date(currentProject.updatedAt).toLocaleDateString()}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate(`/projects/${projectId}/deliverables`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Deliverables
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Tasks</CardTitle>
                <Button onClick={() => navigate(`/projects/${projectId}/tasks`)}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Task Board
                </Button>
              </div>
              <CardDescription>
                All tasks for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentProject.tasks.length > 0 ? (
                <div className="space-y-4">
                  {currentProject.tasks.map((task) => (
                    <div key={task.id} className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                      <div className="col-span-6 md:col-span-5">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : task.status === 'blocked'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                      </div>
                      
                      <div className="col-span-3 md:col-span-2">
                        <span className="text-sm text-muted-foreground">Assigned to</span>
                        <p className="text-sm">{task.assignedTo}</p>
                      </div>
                      
                      <div className="col-span-3 md:col-span-2">
                        <span className="text-sm text-muted-foreground">Due Date</span>
                        <p className="text-sm">{new Date(task.deadline).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="hidden md:block md:col-span-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={task.progress} className="h-2 flex-1" />
                          <span className="text-xs">{task.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="col-span-12 md:col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {}}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="mb-2">No tasks added to this project yet.</div>
                  <Button onClick={() => {}}>
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Milestones</CardTitle>
                <Button onClick={() => navigate(`/projects/${projectId}/milestones`)}>
                  <MilestoneIcon className="mr-2 h-4 w-4" />
                  Milestone Tracker
                </Button>
              </div>
              <CardDescription>
                Key milestones and project phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentProject.milestones.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-muted space-y-8">
                  {currentProject.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative">
                      {/* Milestone indicator */}
                      <div className="absolute -left-[25px] p-1 rounded-full bg-background border-2 border-muted">
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : milestone.status === 'at_risk' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getMilestoneColor(milestone.status)}>
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-medium">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        
                        {milestone.deliverables.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground font-medium">Deliverables:</span>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                              {milestone.deliverables.map((deliverable, idx) => (
                                <li key={idx}>{deliverable}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="mb-2">No milestones defined for this project.</div>
                  <Button onClick={() => {}}>
                    <Plus className="mr-2 h-4 w-4" /> Add Milestone
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline Metrics</CardTitle>
                <CardDescription>Project schedule performance</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyticsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Planned Duration</span>
                        <p className="text-base font-medium">{analytics.timeline_metrics.planned_duration}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Current Duration</span>
                        <p className="text-base font-medium">{analytics.timeline_metrics.current_duration}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Variance</span>
                        <p className={`text-base font-medium ${analytics.timeline_metrics.variance.startsWith('+') ? 'text-amber-500' : 'text-green-500'}`}>
                          {analytics.timeline_metrics.variance}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Completion Trend</span>
                        <p className="text-base font-medium">{analytics.timeline_metrics.completion_trend}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No timeline data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Resource Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Metrics</CardTitle>
                <CardDescription>Budget and resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyticsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Budget Utilization</span>
                        <span className="text-sm font-medium">{analytics.resource_metrics.budget_consumed}%</span>
                      </div>
                      <Progress value={analytics.resource_metrics.budget_consumed} className="h-2" />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Consumed</span>
                        <span className="text-xs text-muted-foreground">Remaining: {analytics.resource_metrics.budget_remaining}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Resource Utilization</span>
                        <span className="text-sm font-medium">{analytics.resource_metrics.resource_utilization}%</span>
                      </div>
                      <Progress value={analytics.resource_metrics.resource_utilization} className="h-2" />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Contributors</h4>
                      <div className="space-y-2">
                        {analytics.resource_metrics.top_contributors.map((contributor: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{contributor.name}</span>
                            <Badge variant="outline">
                              {contributor.tasks_completed} tasks
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No resource data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Project quality and performance</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyticsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Defect Count</span>
                        <p className="text-base font-medium">{analytics.quality_metrics.defect_count}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Defect Density</span>
                        <p className="text-base font-medium">{analytics.quality_metrics.defect_density}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Test Coverage</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={analytics.quality_metrics.test_coverage} className="h-2 flex-1" />
                          <span className="text-xs">{analytics.quality_metrics.test_coverage}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Client Satisfaction</span>
                        <p className="text-base font-medium">{analytics.quality_metrics.client_satisfaction}/5</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No quality metrics available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Project risks and mitigation</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyticsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Overall Risk</span>
                      <Badge variant="outline" className={
                        analytics.risk_assessment.overall_risk === 'Low' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : analytics.risk_assessment.overall_risk === 'Medium' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }>
                        {analytics.risk_assessment.overall_risk}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Risks</h4>
                      {analytics.risk_assessment.top_risks.length > 0 ? (
                        <div className="space-y-4">
                          {analytics.risk_assessment.top_risks.map((risk: any, index: number) => (
                            <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={
                                  risk.impact === 'High' 
                                    ? 'text-red-500 h-4 w-4' 
                                    : risk.impact === 'Medium'
                                    ? 'text-amber-500 h-4 w-4' 
                                    : 'text-blue-500 h-4 w-4'
                                } />
                                <p className="font-medium">{risk.description}</p>
                              </div>
                              <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                <span>Impact: {risk.impact}</span>
                                <span>Likelihood: {risk.likelihood}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No significant risks identified.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No risk assessment available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectDetailsSkeleton() {
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
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-2 w-full mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-10 w-[300px]" /> {/* Tabs */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between border-b pb-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-12 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2 pb-4 border-b">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}