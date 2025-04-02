import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Project } from '@/types/project';
import { projectService } from '@/services/project-service';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle,
  ClipboardList,
  ChevronRight,
  Users
} from 'lucide-react';

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [healthFilter, setHealthFilter] = useState<string | null>(null);

  // In a real implementation, we would load all projects for all clients the user has access to
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // This is a simplification - in a real app you'd fetch based on user permissions
        // You might also need to make multiple calls to get projects for different clients
        
        // Mocked data for demonstration
        setTimeout(() => {
          const mockProjects: Project[] = [
            {
              id: '1',
              clientId: '101',
              name: 'Website Redesign',
              status: 'active',
              progress: 65,
              health: 'green',
              startDate: new Date('2025-01-15'),
              endDate: new Date('2025-04-15'),
              tasks: [],
              milestones: [],
              resources: [],
              createdAt: new Date('2025-01-10'),
              updatedAt: new Date('2025-03-05')
            },
            {
              id: '2',
              clientId: '102',
              name: 'AI Chatbot Implementation',
              status: 'active',
              progress: 45,
              health: 'yellow',
              startDate: new Date('2025-02-01'),
              endDate: new Date('2025-05-30'),
              tasks: [],
              milestones: [],
              resources: [],
              createdAt: new Date('2025-01-25'),
              updatedAt: new Date('2025-03-10')
            },
            {
              id: '3',
              clientId: '103',
              name: 'E-commerce Platform Migration',
              status: 'planning',
              progress: 15,
              health: 'green',
              startDate: new Date('2025-03-15'),
              endDate: new Date('2025-08-15'),
              tasks: [],
              milestones: [],
              resources: [],
              createdAt: new Date('2025-03-01'),
              updatedAt: new Date('2025-03-12')
            },
            {
              id: '4',
              clientId: '102',
              name: 'Data Analytics Dashboard',
              status: 'paused',
              progress: 50,
              health: 'red',
              startDate: new Date('2025-01-01'),
              endDate: new Date('2025-03-31'),
              tasks: [],
              milestones: [],
              resources: [],
              createdAt: new Date('2024-12-15'),
              updatedAt: new Date('2025-02-28')
            },
            {
              id: '5',
              clientId: '104',
              name: 'Mobile App Development',
              status: 'completed',
              progress: 100,
              health: 'green',
              startDate: new Date('2024-10-01'),
              endDate: new Date('2025-02-28'),
              tasks: [],
              milestones: [],
              resources: [],
              createdAt: new Date('2024-09-15'),
              updatedAt: new Date('2025-03-01')
            }
          ];
          
          setProjects(mockProjects);
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast.error('Failed to load projects');
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter projects based on search query, status and health filters
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = searchQuery.trim() === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesHealth = !healthFilter || project.health === healthFilter;
      
      return matchesSearch && matchesStatus && matchesHealth;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const getStatusBadgeVariant = (status: string) => {
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

  const getHealthIndicator = (health: string) => {
    switch (health) {
      case 'green':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'yellow':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'red':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track your project portfolio.</p>
        </div>
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-[180px]">
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)} defaultValue="all">
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full md:w-[180px]">
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select onValueChange={(value) => setHealthFilter(value === 'all' ? null : value)} defaultValue="all">
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="green">On Track</SelectItem>
                <SelectItem value="yellow">At Risk</SelectItem>
                <SelectItem value="red">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex gap-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-muted/30 border-t">
                <Skeleton className="h-5 w-full" />
              </div>
            </Card>
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="text-lg font-medium hover:underline"
                  >
                    {project.name}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate(`/projects/${project.id}/tasks`)}
                      >
                        Manage tasks
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate(`/projects/${project.id}/milestones`)}
                      >
                        View milestones
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          const newStatus = project.status === 'paused' ? 'active' : 'paused';
                          // In a real app, you'd call an API to update the project
                          toast.success(`Project ${newStatus === 'paused' ? 'paused' : 'activated'}`);
                        }}
                      >
                        {project.status === 'paused' ? 'Activate' : 'Pause'} project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-3 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getStatusBadgeVariant(project.status)}>
                    {project.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    {getHealthIndicator(project.health)}
                    <span>{getHealthText(project.health)}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarClock className="mr-1 h-4 w-4" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString()} - {' '}
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ClipboardList className="mr-1 h-4 w-4" />
                    <span>Tasks: {project.tasks?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-muted/30 border-t flex justify-between items-center">
                <div className="flex items-center text-sm">
                  <Users className="mr-1 h-4 w-4" />
                  <span>Client: {project.clientId}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Details <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2">
            <Card>
              <CardContent className="py-10 text-center">
                <div className="mx-auto mb-4 bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-6">
                  {(searchQuery || statusFilter || healthFilter)
                    ? "Try adjusting your search filters to find what you're looking for."
                    : "You don't have any projects yet. Create your first project to get started."}
                </p>
                <Button onClick={() => navigate('/projects/new')}>
                  <Plus className="mr-2 h-4 w-4" /> Create New Project
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}