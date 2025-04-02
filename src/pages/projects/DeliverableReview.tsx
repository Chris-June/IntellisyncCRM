import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { DeliverableSubmission } from '@/types/project';
import { useProject } from '@/context/project-context';
import { projectService } from '@/services/project-service';
import { 
  Plus, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  Download,
  Send,
  Upload,
  FileCheck2
} from 'lucide-react';

export default function DeliverableReview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { loadProject, currentProject, isLoading } = useProject();
  const [deliverables, setDeliverables] = useState<DeliverableSubmission[]>([]);
  const [isLoadingDeliverables, setIsLoadingDeliverables] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableSubmission | null>(null);
  const [deliverableForm, setDeliverableForm] = useState({
    title: '',
    description: '',
    files: [] as File[],
    reviewers: [] as string[],
    reviewer: ''
  });
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
      fetchDeliverables();
    }
  }, [projectId, loadProject]);

  const fetchDeliverables = async () => {
    setIsLoadingDeliverables(true);
    try {
      // In a real implementation, we'd fetch from an API
      // For demo purposes, we'll create mock data
      setTimeout(() => {
        const mockDeliverables: DeliverableSubmission[] = [
          {
            id: 'deliv-1',
            projectId: projectId || '',
            clientId: currentProject?.clientId || '',
            title: 'Initial Design Mockups',
            description: 'First draft of the application UI design with key screens and user flows.',
            files: ['design_mockups.pdf', 'sitemap.png'],
            status: 'approved',
            submittedAt: new Date('2025-02-15'),
            reviewers: [
              { id: 'user-1', name: 'Sarah Chen', role: 'Design Lead', status: 'approved', comments: 'Great work! Approved with minor comments.' },
              { id: 'user-2', name: 'Michael Brown', role: 'Project Manager', status: 'approved', comments: 'Looks good to me.' }
            ]
          },
          {
            id: 'deliv-2',
            projectId: projectId || '',
            clientId: currentProject?.clientId || '',
            title: 'API Documentation',
            description: 'Complete API documentation including endpoints, parameters, and example responses.',
            files: ['api_docs.pdf', 'swagger.json'],
            status: 'pending',
            submittedAt: new Date('2025-03-01'),
            reviewers: [
              { id: 'user-3', name: 'James Wilson', role: 'Tech Lead', status: 'pending' },
              { id: 'user-4', name: 'Emily Davis', role: 'Backend Developer', status: 'pending' }
            ]
          },
          {
            id: 'deliv-3',
            projectId: projectId || '',
            clientId: currentProject?.clientId || '',
            title: 'Database Schema Design',
            description: 'Detailed database schema design with entity relationships and field definitions.',
            files: ['schema.pdf', 'er_diagram.png'],
            status: 'revision_requested',
            submittedAt: new Date('2025-02-20'),
            reviewers: [
              { id: 'user-3', name: 'James Wilson', role: 'Tech Lead', status: 'revision_requested', comments: 'Please add indexes for performance optimization.' },
              { id: 'user-5', name: 'Lisa Johnson', role: 'Data Architect', status: 'revision_requested', comments: 'Need to normalize the user preferences table.' }
            ]
          }
        ];
        
        setDeliverables(mockDeliverables);
        setIsLoadingDeliverables(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to load deliverables:', error);
      toast.error('Failed to load deliverables');
      setIsLoadingDeliverables(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliverableForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setDeliverableForm(prev => ({
      ...prev,
      files: [...Array.from(e.target.files || [])]
    }));
  };

  const addReviewer = () => {
    if (!deliverableForm.reviewer.trim()) return;
    
    setDeliverableForm(prev => ({
      ...prev,
      reviewers: [...prev.reviewers, prev.reviewer],
      reviewer: ''
    }));
  };

  const removeReviewer = (index: number) => {
    setDeliverableForm(prev => {
      const newReviewers = [...prev.reviewers];
      newReviewers.splice(index, 1);
      return {
        ...prev,
        reviewers: newReviewers
      };
    });
  };

  const handleSubmitDeliverable = async () => {
    if (!projectId || !deliverableForm.title || deliverableForm.files.length === 0 || deliverableForm.reviewers.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would upload files and create a submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Deliverable submitted for review');
      setIsDialogOpen(false);
      
      // Refresh the deliverables list
      fetchDeliverables();
      
      // Reset form
      setDeliverableForm({
        title: '',
        description: '',
        files: [],
        reviewers: [],
        reviewer: ''
      });
    } catch (error) {
      console.error('Failed to submit deliverable:', error);
      toast.error('Failed to submit deliverable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedDeliverable || !feedbackText.trim()) {
      toast.error('Please enter feedback');
      return;
    }
    
    try {
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Feedback submitted');
      setFeedbackText('');
      
      // In a real app, you'd refresh the data
      fetchDeliverables();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'revision_requested':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'pending':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'revision_requested':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!projectId) {
    return <div>Project ID not provided</div>;
  }

  if (isLoading && !currentProject) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deliverable Review</h1>
        <p className="text-muted-foreground mt-1">
          {currentProject?.name} - Manage and review project deliverables
        </p>
      </div>

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Deliverable
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Submit Deliverable for Review</DialogTitle>
              <DialogDescription>
                Share your work with clients or team members for feedback and approval
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Deliverable Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={deliverableForm.title}
                  onChange={handleFormChange}
                  placeholder="e.g., UI Design Mockups, API Documentation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={deliverableForm.description}
                  onChange={handleFormChange}
                  placeholder="Brief description of what you're submitting"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="files">Upload Files</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop files, or{' '}
                    <label className="text-primary cursor-pointer hover:underline">
                      browse
                      <Input 
                        id="files"
                        type="file" 
                        multiple 
                        className="sr-only" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 10MB per file
                  </p>
                </div>
                
                {deliverableForm.files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                    <ul className="text-sm space-y-1">
                      {Array.from(deliverableForm.files).map((file, index) => (
                        <li key={index} className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          {file.name}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Reviewers</Label>
                <div className="flex gap-2">
                  <Input 
                    name="reviewer"
                    value={deliverableForm.reviewer}
                    onChange={handleFormChange}
                    placeholder="Enter reviewer name or email"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={addReviewer}
                  >
                    Add
                  </Button>
                </div>
                
                {deliverableForm.reviewers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {deliverableForm.reviewers.map((reviewer, index) => (
                      <Badge 
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {reviewer}
                        <button 
                          onClick={() => removeReviewer(index)} 
                          className="ml-1 rounded-full hover:bg-muted p-1"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmitDeliverable} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Review
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Deliverables</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="revisions">Needs Revision</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <DeliverablesList 
            deliverables={deliverables}
            isLoading={isLoadingDeliverables}
            onSelect={setSelectedDeliverable}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <DeliverablesList 
            deliverables={deliverables.filter(d => d.status === 'pending')}
            isLoading={isLoadingDeliverables}
            onSelect={setSelectedDeliverable}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            emptyMessage="No deliverables pending review"
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <DeliverablesList 
            deliverables={deliverables.filter(d => d.status === 'approved')}
            isLoading={isLoadingDeliverables}
            onSelect={setSelectedDeliverable}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            emptyMessage="No approved deliverables yet"
          />
        </TabsContent>
        
        <TabsContent value="revisions">
          <DeliverablesList 
            deliverables={deliverables.filter(d => d.status === 'revision_requested')}
            isLoading={isLoadingDeliverables}
            onSelect={setSelectedDeliverable}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            emptyMessage="No deliverables requiring revisions"
          />
        </TabsContent>
      </Tabs>
      
      {/* Selected Deliverable Details */}
      {selectedDeliverable && (
        <Dialog open={!!selectedDeliverable} onOpenChange={(open) => !open && setSelectedDeliverable(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                <DialogTitle>{selectedDeliverable.title}</DialogTitle>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(selectedDeliverable.status)}>
                  {selectedDeliverable.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Submitted: {new Date(selectedDeliverable.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">{selectedDeliverable.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Files</h4>
                <div className="border rounded-md p-3 space-y-2">
                  {selectedDeliverable.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <span>{file}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Reviewers & Feedback</h4>
                <div className="border rounded-md p-3 space-y-4">
                  {selectedDeliverable.reviewers.map((reviewer, index) => (
                    <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{reviewer.name}</span>
                          <span className="text-xs text-muted-foreground">({reviewer.role})</span>
                        </div>
                        <Badge variant="outline" className={getStatusColor(reviewer.status)}>
                          {reviewer.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {reviewer.comments && (
                        <div className="bg-muted/30 p-2 rounded-md text-sm">
                          <p>{reviewer.comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Add Feedback</h4>
                <Textarea 
                  placeholder="Enter your comments or feedback..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // In a real implementation, this would update the status
                      toast.success('Deliverable approved');
                      setSelectedDeliverable(null);
                      fetchDeliverables();
                    }}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // In a real implementation, this would update the status
                      toast.error('Deliverable rejected');
                      setSelectedDeliverable(null);
                      fetchDeliverables();
                    }}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
                <Button onClick={handleSubmitFeedback} disabled={!feedbackText.trim()}>
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Submit Feedback
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface DeliverablesListProps {
  deliverables: DeliverableSubmission[];
  isLoading: boolean;
  onSelect: (deliverable: DeliverableSubmission) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  emptyMessage?: string;
}

function DeliverablesList({ 
  deliverables, 
  isLoading, 
  onSelect, 
  getStatusColor, 
  getStatusIcon,
  emptyMessage = "No deliverables found"
}: DeliverablesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (deliverables.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="mx-auto mb-4 bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Deliverables represent the tangible outputs of your project that clients can review and approve.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Submit Deliverable
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {deliverables.map((deliverable) => (
        <Card 
          key={deliverable.id}
          className="cursor-pointer hover:bg-accent/20 transition-colors"
          onClick={() => onSelect(deliverable)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                {deliverable.title}
              </CardTitle>
              <Badge variant="outline" className={getStatusColor(deliverable.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(deliverable.status)}
                  <span>{deliverable.status.replace('_', ' ')}</span>
                </div>
              </Badge>
            </div>
            <CardDescription>
              Submitted on {new Date(deliverable.submittedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {deliverable.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {deliverable.files.map((file, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {file}
                </Badge>
              ))}
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">Reviewers: </span>
                <span>{deliverable.reviewers.length}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="mr-1 h-4 w-4" />
                  Files
                </Button>
                <Button size="sm">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  Feedback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}