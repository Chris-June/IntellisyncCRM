import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Milestone } from '@/types/project';
import { useProject } from '@/context/project-context';
import { PageHeader } from '@/components/layouts/PageHeader';
import { 
  Plus, 
  CheckCircle2, 
  CheckCircleIcon, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Flag, 
  RefreshCw, 
  FileText,
  LinkIcon,
  FileCheck2,
  CalendarIcon
} from 'lucide-react';

export default function MilestoneTracker() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { loadProject, currentProject, isLoading, addMilestone, updateMilestoneStatus } = useProject();
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdatingMilestone, setIsUpdatingMilestone] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    deliverables: [''],
    dependencies: ['']
  });

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  const handleMilestoneFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMilestoneForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliverableChange = (index: number, value: string) => {
    setMilestoneForm(prev => {
      const newDeliverables = [...prev.deliverables];
      newDeliverables[index] = value;
      return {
        ...prev,
        deliverables: newDeliverables
      };
    });
  };

  const addDeliverable = () => {
    setMilestoneForm(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const removeDeliverable = (index: number) => {
    setMilestoneForm(prev => {
      const newDeliverables = [...prev.deliverables];
      newDeliverables.splice(index, 1);
      return {
        ...prev,
        deliverables: newDeliverables.length ? newDeliverables : ['']
      };
    });
  };

  const handleDependencyChange = (index: number, value: string) => {
    setMilestoneForm(prev => {
      const newDependencies = [...prev.dependencies];
      newDependencies[index] = value;
      return {
        ...prev,
        dependencies: newDependencies
      };
    });
  };

  const addDependency = () => {
    setMilestoneForm(prev => ({
      ...prev,
      dependencies: [...prev.dependencies, '']
    }));
  };

  const removeDependency = (index: number) => {
    setMilestoneForm(prev => {
      const newDependencies = [...prev.dependencies];
      newDependencies.splice(index, 1);
      return {
        ...prev,
        dependencies: newDependencies.length ? newDependencies : ['']
      };
    });
  };

  const handleAddMilestone = async () => {
    if (!projectId || !milestoneForm.title || !milestoneForm.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsAddingMilestone(true);
    
    try {
      // Filter out empty deliverables and dependencies
      const deliverables = milestoneForm.deliverables.filter(d => d.trim() !== '');
      const dependencies = milestoneForm.dependencies.filter(d => d.trim() !== '');
      
      await addMilestone(projectId, {
        title: milestoneForm.title,
        description: milestoneForm.description,
        dueDate: new Date(milestoneForm.dueDate),
        deliverables: deliverables.length ? deliverables : ['Project Phase Completion'],
        dependencies: dependencies
      });
      
      // Reset form
      setMilestoneForm({
        title: '',
        description: '',
        dueDate: '',
        deliverables: [''],
        dependencies: ['']
      });
      
      setIsDialogOpen(false);
      toast.success('Milestone added successfully');
    } catch (error) {
      console.error('Failed to add milestone:', error);
      toast.error('Failed to add milestone');
    } finally {
      setIsAddingMilestone(false);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, status: 'pending' | 'completed' | 'at_risk') => {
    setIsUpdatingMilestone(true);
    try {
      await updateMilestoneStatus(milestoneId, status);
      if (selectedMilestone && selectedMilestone.id === milestoneId) {
        setSelectedMilestone(prev => {
          if (!prev) return null;
          return { ...prev, status };
        });
      }
      toast.success(`Milestone marked as ${status}`);
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast.error('Failed to update milestone status');
    } finally {
      setIsUpdatingMilestone(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  if (isLoading && !currentProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Milestone Tracker"
        description={`${currentProject.name} - Track and manage project milestones`}
        showBackButton={true}
        backButtonUrl={`/projects/${projectId}`}
      />

      {/* Milestone Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md mr-4">
                <Flag className="h-6 w-6 text-blue-800 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Milestones</p>
                <p className="text-2xl font-bold">{currentProject.milestones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-4">
                <CheckCircle2 className="h-6 w-6 text-green-800 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {currentProject.milestones.filter(m => m.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-md mr-4">
                <AlertTriangle className="h-6 w-6 text-amber-800 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">
                  {currentProject.milestones.filter(m => m.status === 'at_risk').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Milestones</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
              <DialogDescription>
                Create a new milestone for tracking project progress
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Milestone Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={milestoneForm.title}
                  onChange={handleMilestoneFormChange}
                  placeholder="Enter milestone title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={milestoneForm.description}
                  onChange={handleMilestoneFormChange}
                  placeholder="Describe the milestone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={handleMilestoneFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Deliverables</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addDeliverable}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {milestoneForm.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={deliverable} 
                      onChange={(e) => handleDeliverableChange(index, e.target.value)} 
                      placeholder="e.g., Documentation, Code, Design"
                    />
                    {milestoneForm.deliverables.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeDeliverable(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Dependencies (Optional)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addDependency}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {milestoneForm.dependencies.map((dependency, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={dependency} 
                      onChange={(e) => handleDependencyChange(index, e.target.value)} 
                      placeholder="e.g., Design approval, Previous milestone"
                    />
                    {milestoneForm.dependencies.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeDependency(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Leave empty if there are no dependencies
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddMilestone} disabled={isAddingMilestone}>
                {isAddingMilestone ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-6">
        {currentProject.milestones.length > 0 ? (
          currentProject.milestones
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map(milestone => (
              <Card 
                key={milestone.id}
                className={milestone.status === 'completed' ? 'border-green-200 dark:border-green-800' : 'border'}
                onClick={() => setSelectedMilestone(milestone)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      <CardTitle>{milestone.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className={getStatusColor(milestone.status)}>
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{milestone.description}</p>
                  
                  {milestone.deliverables.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Deliverables:
                      </h4>
                      <ul className="list-disc ml-5 space-y-1 text-sm text-muted-foreground">
                        {milestone.deliverables.map((deliverable, index) => (
                          <li key={index}>{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {milestone.dependencies.length > 0 && milestone.dependencies[0] !== '' && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        Dependencies:
                      </h4>
                      <ul className="list-disc ml-5 space-y-1 text-sm text-muted-foreground">
                        {milestone.dependencies.map((dependency, index) => (
                          <li key={index}>{dependency}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t py-3 flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled={milestone.status === 'at_risk' || isUpdatingMilestone}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateMilestoneStatus(milestone.id, 'at_risk');
                    }}
                  >
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    Mark At Risk
                  </Button>
                  <Button 
                    size="sm"
                    disabled={milestone.status === 'completed' || isUpdatingMilestone}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateMilestoneStatus(milestone.id, 'completed');
                    }}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Mark Complete
                  </Button>
                </CardFooter>
              </Card>
            ))
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-4 bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center">
                <Flag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No milestones yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Milestones help you track project progress and keep everyone aligned on key deliverables and deadlines.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Milestone
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Selected Milestone Details */}
      {selectedMilestone && (
        <Dialog open={!!selectedMilestone} onOpenChange={(open) => !open && setSelectedMilestone(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedMilestone.status)}
                <DialogTitle>{selectedMilestone.title}</DialogTitle>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(selectedMilestone.status)}>
                  {selectedMilestone.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {new Date(selectedMilestone.dueDate).toLocaleDateString()}
                </span>
              </div>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">{selectedMilestone.description}</p>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <FileCheck2 className="h-4 w-4" />
                  Deliverables
                </h4>
                <ul className="list-disc ml-5 space-y-1 text-sm text-muted-foreground">
                  {selectedMilestone.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
              
              {selectedMilestone.dependencies.length > 0 && selectedMilestone.dependencies[0] !== '' && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    Dependencies
                  </h4>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-muted-foreground">
                    {selectedMilestone.dependencies.map((dependency, index) => (
                      <li key={index}>{dependency}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Update Status</h4>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedMilestone.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateMilestoneStatus(selectedMilestone.id, 'pending')}
                    disabled={selectedMilestone.status === 'pending' || isUpdatingMilestone}
                  >
                    <Clock className="mr-1 h-4 w-4" />
                    Pending
                  </Button>
                  <Button 
                    variant={selectedMilestone.status === 'at_risk' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateMilestoneStatus(selectedMilestone.id, 'at_risk')}
                    disabled={selectedMilestone.status === 'at_risk' || isUpdatingMilestone}
                  >
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    At Risk
                  </Button>
                  <Button 
                    variant={selectedMilestone.status === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdateMilestoneStatus(selectedMilestone.id, 'completed')}
                    disabled={selectedMilestone.status === 'completed' || isUpdatingMilestone}
                  >
                    <CheckCircleIcon className="mr-1 h-4 w-4" />
                    Completed
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMilestone(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}