import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Task } from '@/types/project';
import { useProject } from '@/context/project-context';
import { 
  Plus, 
  Users, 
  ArrowUpRight, 
  Clock, 
  BarChart, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  CalendarClock
} from 'lucide-react';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export default function TaskBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { loadProject, currentProject, isLoading, addTask, updateTaskStatus } = useProject();
  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, Task[]>>({
    pending: [],
    in_progress: [],
    completed: [],
    blocked: []
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    deadline: '',
    estimatedHours: 0
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Record<TaskStatus, Task[]>>(tasksByStatus);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  useEffect(() => {
    if (currentProject) {
      // Organize tasks by status
      const grouped: Record<TaskStatus, Task[]> = {
        pending: [],
        in_progress: [],
        completed: [],
        blocked: []
      };
      
      currentProject.tasks.forEach(task => {
        grouped[task.status as TaskStatus].push(task);
      });
      
      setTasksByStatus(grouped);
    }
  }, [currentProject]);

  useEffect(() => {
    // Apply search filter
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasksByStatus);
    } else {
      const filtered: Record<TaskStatus, Task[]> = {
        pending: [],
        in_progress: [],
        completed: [],
        blocked: []
      };
      
      Object.keys(tasksByStatus).forEach((status) => {
        filtered[status as TaskStatus] = tasksByStatus[status as TaskStatus].filter(task => 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      
      setFilteredTasks(filtered);
    }
  }, [tasksByStatus, searchQuery]);

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: name === 'estimatedHours' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddTask = async () => {
    if (!projectId || !newTask.title || !newTask.assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsAddingTask(true);
    
    try {
      await addTask(
        projectId,
        {
          title: newTask.title,
          description: newTask.description,
          assignedTo: newTask.assignedTo,
          deadline: new Date(newTask.deadline),
          priority: newTask.priority,
          estimatedHours: newTask.estimatedHours,
        }
      );
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        deadline: '',
        estimatedHours: 0
      });
      
      setIsDialogOpen(false);
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!taskId) return;
    
    setIsUpdatingTask(true);
    
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // In a real implementation, you might navigate to task details or open a modal
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  if (!projectId) {
    return <div>Project ID not provided</div>;
  }

  if (isLoading && !currentProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
        <p className="text-muted-foreground mt-1">
          {currentProject ? currentProject.name : 'Project'} - Task management and tracking
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-96">
          <Input 
            placeholder="Search tasks..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for this project. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newTask.title}
                  onChange={handleNewTaskChange}
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  placeholder="Describe the task"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    name="assignedTo"
                    value={newTask.assignedTo}
                    onChange={handleNewTaskChange}
                    placeholder="Enter name or email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    defaultValue={newTask.priority}
                    onValueChange={(value) => setNewTask(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={newTask.deadline}
                    onChange={handleNewTaskChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    name="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTask.estimatedHours.toString()}
                    onChange={handleNewTaskChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddTask} disabled={isAddingTask}>
                {isAddingTask ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Column */}
        <TaskColumn 
          title="To Do" 
          tasks={filteredTasks.pending}
          onTaskClick={handleTaskClick}
          onStatusChange={handleUpdateTaskStatus}
          getPriorityColor={getPriorityColor}
        />
        
        {/* In Progress Column */}
        <TaskColumn 
          title="In Progress" 
          tasks={filteredTasks.in_progress}
          onTaskClick={handleTaskClick}
          onStatusChange={handleUpdateTaskStatus}
          getPriorityColor={getPriorityColor}
        />
        
        {/* Completed Column */}
        <TaskColumn 
          title="Completed" 
          tasks={filteredTasks.completed}
          onTaskClick={handleTaskClick}
          onStatusChange={handleUpdateTaskStatus}
          getPriorityColor={getPriorityColor}
        />
        
        {/* Blocked Column */}
        <TaskColumn 
          title="Blocked" 
          tasks={filteredTasks.blocked}
          onTaskClick={handleTaskClick}
          onStatusChange={handleUpdateTaskStatus}
          getPriorityColor={getPriorityColor}
        />
      </div>
      
      {/* Selected Task Details */}
      {selectedTask && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Task Details</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                  {selectedTask.priority}
                </Badge>
                <Badge variant="outline" className={
                  selectedTask.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : selectedTask.status === 'blocked'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    : selectedTask.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }>
                  {selectedTask.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-medium">{selectedTask.title}</h3>
            <p className="text-muted-foreground">{selectedTask.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Assigned To</span>
                <p className="text-sm font-medium">{selectedTask.assignedTo}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Deadline</span>
                <p className="text-sm font-medium">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Estimated Hours</span>
                <p className="text-sm font-medium">{selectedTask.estimatedHours}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Actual Hours</span>
                <p className="text-sm font-medium">{selectedTask.actualHours}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <span className="text-sm text-muted-foreground">Change Status</span>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant={selectedTask.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleUpdateTaskStatus(selectedTask.id, 'pending')}
                  disabled={selectedTask.status === 'pending' || isUpdatingTask}
                >
                  To Do
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedTask.status === 'in_progress' ? 'default' : 'outline'}
                  onClick={() => handleUpdateTaskStatus(selectedTask.id, 'in_progress')}
                  disabled={selectedTask.status === 'in_progress' || isUpdatingTask}
                >
                  In Progress
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedTask.status === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleUpdateTaskStatus(selectedTask.id, 'completed')}
                  disabled={selectedTask.status === 'completed' || isUpdatingTask}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Complete
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedTask.status === 'blocked' ? 'default' : 'outline'}
                  onClick={() => handleUpdateTaskStatus(selectedTask.id, 'blocked')}
                  disabled={selectedTask.status === 'blocked' || isUpdatingTask}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Blocked
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => setSelectedTask(null)}>Close</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
  getPriorityColor: (priority: string) => string;
}

function TaskColumn({ title, tasks, onTaskClick, onStatusChange, getPriorityColor }: TaskColumnProps) {
  const getColumnColor = () => {
    switch (title) {
      case 'To Do':
        return 'border-gray-200 dark:border-gray-800';
      case 'In Progress':
        return 'border-blue-200 dark:border-blue-800';
      case 'Completed':
        return 'border-green-200 dark:border-green-800';
      case 'Blocked':
        return 'border-red-200 dark:border-red-800';
      default:
        return 'border-gray-200 dark:border-gray-800';
    }
  };
  
  const getStatusFromTitle = (): TaskStatus => {
    switch (title) {
      case 'To Do':
        return 'pending';
      case 'In Progress':
        return 'in_progress';
      case 'Completed':
        return 'completed';
      case 'Blocked':
        return 'blocked';
      default:
        return 'pending';
    }
  };
  
  const getStatusIcon = () => {
    switch (title) {
      case 'To Do':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'In Progress':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Blocked':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`rounded-md border ${getColumnColor()} bg-card`}>
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="font-medium">{title}</h3>
          <Badge variant="outline">{tasks.length}</Badge>
        </div>
      </div>
      <div className="p-3 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onTaskClick(task)}
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      onTaskClick(task);
                    }}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="font-medium line-clamp-2">{task.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex items-center justify-center h-24 text-center text-xs text-muted-foreground">
            No tasks in this status
          </div>
        )}
      </div>
    </div>
  );
}