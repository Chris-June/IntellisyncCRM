import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  FileText, 
  Check, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  Search, 
  Filter,
  Send,
  Download,
  Copy,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash,
  X
} from 'lucide-react';
import { resourceService } from '@/services/resource-service';
import { Skeleton } from '@/components/ui/skeleton';
import { MeetingNote } from '@/types/resources';

export default function MeetingNotes() {
  const navigate = useNavigate();
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    meetingType: 'client',
    clientId: 'client-123',
    projectId: 'project-456',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    attendees: [{ name: '', email: '', type: 'internal', role: '' }],
    transcript: '',
    summary: true
  });

  useEffect(() => {
    // Fetch meeting notes on component mount
    fetchMeetingNotes();
  }, []);

  const fetchMeetingNotes = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // For demo purposes, we'll create mock data with a delay
      setTimeout(() => {
        const mockMeetingNotes: MeetingNote[] = [
          {
            id: 'note-1',
            title: 'Initial Client Discovery Call',
            meetingType: 'discovery',
            clientId: 'client-123',
            projectId: 'project-456',
            date: new Date('2025-03-15T10:00:00'),
            durationMinutes: 60,
            attendees: [
              { 
                id: 'user-1', 
                name: 'John Doe', 
                email: 'john@example.com', 
                type: 'internal',
                role: 'Project Manager' 
              },
              { 
                id: 'user-2', 
                name: 'Jane Smith', 
                email: 'jane@example.com', 
                type: 'internal',
                role: 'Sales Manager' 
              },
              { 
                id: 'client-1', 
                name: 'Alice Brown', 
                email: 'alice@clientcompany.com', 
                type: 'client',
                role: 'Product Owner' 
              }
            ],
            notes: `Discovery call with client discussing project requirements and goals. Client is looking for an AI-driven solution to improve customer service response times.

Key points:
- Currently handling ~500 customer inquiries per day
- Average response time is 24 hours, target is 2 hours
- Looking for AI solution that can integrate with existing Zendesk implementation
- Budget range: $50K-75K
- Timeline: want to implement in Q3`,
            actionItems: [
              {
                id: 'action-1',
                description: 'Send follow-up email with AI solution options',
                assignedTo: 'user-1',
                dueDate: new Date('2025-03-22'),
                status: 'pending',
              },
              {
                id: 'action-2',
                description: 'Schedule technical assessment call',
                assignedTo: 'user-2',
                dueDate: new Date('2025-03-25'),
                status: 'pending',
              }
            ],
            keyPoints: [
              'Client needs faster customer service response',
              'Integration with existing tools required',
              'Q3 implementation timeline',
              'Ready for AI-powered solution'
            ],
            decisions: [
              'Proceed with proposal for AI customer service solution',
              'Schedule technical assessment within two weeks'
            ],
            topicsDiscussed: [
              'Current customer service workflow',
              'Pain points and bottlenecks',
              'Integration requirements',
              'Budget and timeline constraints'
            ],
            followUpMeeting: new Date('2025-03-29'),
            recorded: false,
            recordingUrl: '',
            createdBy: 'user-1',
            createdAt: new Date('2025-03-15'),
            updatedAt: new Date('2025-03-15')
          },
          {
            id: 'note-2',
            title: 'Weekly Project Status Update',
            meetingType: 'status',
            clientId: 'client-456',
            projectId: 'project-789',
            date: new Date('2025-03-10T14:00:00'),
            durationMinutes: 30,
            attendees: [
              { 
                id: 'user-1', 
                name: 'John Doe', 
                email: 'john@example.com',

                type: 'internal',
                role: 'Project Manager' 
              },
              { 
                id: 'user-3', 
                name: 'Bob Wilson', 
                email: 'bob@example.com', 
                type: 'internal',
                role: 'Developer' 
              },
              { 
                id: 'client-2', 
                name: 'Charlie Davis', 
                email: 'charlie@acmecorp.com', 
                type: 'client',
                role: 'CTO' 
              }
            ],
            notes: `Weekly status update for the AI chatbot implementation project.

Current Status:
- Development on track for milestone 1
- Initial integration with knowledge base completed
- UX design review completed with minor changes requested
- Team is addressing feedback from user testing session

Blockers:
- Waiting for client to provide test data for training the model
- API access to legacy system still pending IT approval`,
            actionItems: [
              {
                id: 'action-3',
                description: 'Follow up on API access approval',
                assignedTo: 'client-2',
                dueDate: new Date('2025-03-12'),
                status: 'pending'
              },
              {
                id: 'action-4',
                description: 'Implement UX feedback changes',
                assignedTo: 'user-3',
                dueDate: new Date('2025-03-15'),
                status: 'in_progress'
              }
            ],
            keyPoints: [
              'Development on track for milestone 1',
              'UX feedback addressed',
              'Waiting for test data and API access',
              'No change to timeline yet'
            ],
            decisions: [
              'Continue development while waiting for test data',
              'Schedule additional user testing for next release'
            ],
            topicsDiscussed: [
              'Development progress',
              'Integration status',
              'UX feedback',
              'Blockers and dependencies'
            ],
            recorded: false,
            createdBy: 'user-1',
            createdAt: new Date('2025-03-10'),
            updatedAt: new Date('2025-03-10')
          }
        ];
        
        setMeetingNotes(mockMeetingNotes);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to fetch meeting notes:', error);
      toast.error('Failed to fetch meeting notes');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedAttendees = [...prev.attendees];
      updatedAttendees[index] = {
        ...updatedAttendees[index],
        [field]: value
      };
      return {
        ...prev,
        attendees: updatedAttendees
      };
    });
  };

  const addAttendee = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', email: '', type: 'internal', role: '' }]
    }));
  };

  const removeAttendee = (index: number) => {
    if (formData.attendees.length === 1) return;
    
    setFormData(prev => {
      const updatedAttendees = [...prev.attendees];
      updatedAttendees.splice(index, 1);
      return {
        ...prev,
        attendees: updatedAttendees
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.transcript) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate duration from start and end time
      const startTime = new Date(`${formData.date}T${formData.startTime}`);
      const endTime = new Date(`${formData.date}T${formData.endTime}`);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      
      if (durationMinutes <= 0) {
        throw new Error('End time must be after start time');
      }
      
      // Format attendees
      const attendees = formData.attendees.filter(a => a.name && a.email).map(a => ({
        id: `attendee-${Math.floor(Math.random() * 1000)}`,
        name: a.name,
        email: a.email,
        type: a.type,
        role: a.role
      }));
      
      if (attendees.length === 0) {
        throw new Error('At least one attendee is required');
      }
      
      // Prepare data for API call
      const meetingData = {
        meeting_type: formData.meetingType,
        date: new Date(formData.date),
        duration_minutes: durationMinutes,
        attendees,
        transcript: formData.transcript,
        client_id: formData.clientId,
        project_id: formData.projectId,
        title: formData.title
      };
      
      // In a real implementation, this would call the API
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock response
      const mockResponse = {
        notes_id: `notes-${Math.floor(Math.random() * 1000)}`,
        title: formData.title,
        key_points: [
          'Automatically extracted key point 1',
          'Automatically extracted key point 2',
          'Automatically extracted key point 3'
        ],
        action_items: [
          {
            id: `action-${Math.floor(Math.random() * 1000)}`,
            description: 'Automatically identified action item 1',
            assigned_to: attendees[0].id,
            status: 'pending'
          },
          {
            id: `action-${Math.floor(Math.random() * 1000)}`,
            description: 'Automatically identified action item 2',
            assigned_to: attendees[0].id,
            status: 'pending'
          }
        ],
        decisions: [
          'Automatically identified decision 1',
          'Automatically identified decision 2'
        ],
        topics_discussed: [
          'Topic 1',
          'Topic 2',
          'Topic 3'
        ],
        summary: 'This is an AI-generated summary of the meeting based on the transcript. It highlights key points, identifies action items, and captures decisions made.'
      };
      
      // Handle success
      toast.success('Meeting notes created successfully');
      setIsDialogOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        meetingType: 'client',
        clientId: 'client-123',
        projectId: 'project-456',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        attendees: [{ name: '', email: '', type: 'internal', role: '' }],
        transcript: '',
        summary: true
      });
      
      // Refresh meeting notes list
      fetchMeetingNotes();
    } catch (error) {
      console.error('Failed to create meeting notes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create meeting notes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterMeetingNotes = (notes: MeetingNote[]) => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.notes.toLowerCase().includes(query) ||
      note.keyPoints.some(point => point.toLowerCase().includes(query)) ||
      note.actionItems.some(item => item.description.toLowerCase().includes(query)) ||
      note.attendees.some(attendee => attendee.name.toLowerCase().includes(query))
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meeting Notes</h1>
        <p className="text-muted-foreground mt-1">
          Store and manage meeting notes and summaries
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meeting notes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="status">Status Update</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Meeting Notes</DialogTitle>
              <DialogDescription>
                Create notes from a meeting transcript. Our AI will summarize key points and extract action items.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input 
                  id="title" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title for this meeting" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="meetingType">Meeting Type</Label>
                  <Select 
                    value={formData.meetingType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, meetingType: value }))}
                  >
                    <SelectTrigger id="meetingType">
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="client">Client Meeting</SelectItem>
                      <SelectItem value="internal">Internal Meeting</SelectItem>
                      <SelectItem value="status">Status Update</SelectItem>
                      <SelectItem value="project">Project Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date">Meeting Date</Label>
                  <Input 
                    id="date" 
                    name="date"
                    type="date" 
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input 
                    id="startTime" 
                    name="startTime"
                    type="time" 
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input 
                    id="endTime" 
                    name="endTime"
                    type="time" 
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientId">Client</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client-123">Acme Corporation</SelectItem>
                      <SelectItem value="client-456">Globex Industries</SelectItem>
                      <SelectItem value="client-789">Initech LLC</SelectItem>
                      <SelectItem value="none">No Client (Internal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="projectId">Project</Label>
                  <Select 
                    value={formData.projectId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                  >
                    <SelectTrigger id="projectId">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project-123">Website Redesign</SelectItem>
                      <SelectItem value="project-456">Mobile App Development</SelectItem>
                      <SelectItem value="project-789">AI Chatbot Implementation</SelectItem>
                      <SelectItem value="none">No Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Attendees</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAttendee}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {formData.attendees.map((attendee, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <Input 
                          placeholder="Name" 
                          value={attendee.name}
                          onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input 
                          placeholder="Email" 
                          value={attendee.email}
                          onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Select 
                          value={attendee.type} 
                          onValueChange={(value) => handleAttendeeChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeAttendee(index)}
                          disabled={formData.attendees.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="transcript">Meeting Transcript</Label>
                <Textarea 
                  id="transcript" 
                  name="transcript"
                  value={formData.transcript}
                  onChange={handleInputChange}
                  placeholder="Paste the meeting transcript or notes here..." 
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Our AI will analyze this text to extract key points, action items, and generate a summary.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={formData.summary}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, summary: checked as boolean }))
                  }
                />
                <label
                  htmlFor="summary"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Generate AI summary and extract action items
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> 
                    Create Notes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="client">Client Meetings</TabsTrigger>
          <TabsTrigger value="internal">Internal Meetings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filterMeetingNotes(meetingNotes).length > 0 ? (
            <div className="space-y-4">
              {filterMeetingNotes(meetingNotes).map((note) => (
                <Card key={note.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setSelectedNote(note)}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{note.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {note.meetingType === 'discovery' ? 'Discovery' : 
                             note.meetingType === 'client' ? 'Client Meeting' :
                             note.meetingType === 'internal' ? 'Internal Meeting' :
                             note.meetingType === 'status' ? 'Status Update' : 
                             note.meetingType === 'project' ? 'Project Meeting' : 
                             'Other'}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(note.date).toLocaleDateString()}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(note.durationMinutes)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="flex items-center" variant="secondary">
                          <User className="h-3 w-3 mr-1" />
                          {note.attendees.length} Attendees
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{note.notes}</p>
                    
                    {note.actionItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Action Items
                        </h4>
                        <div className="flex flex-col gap-1">
                          {note.actionItems.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <ChevronRight className="h-3 w-3" />
                              <span>{item.description}</span>
                            </div>
                          ))}
                          {note.actionItems.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              + {note.actionItems.length - 2} more action items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="mx-auto mb-4 bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No meeting notes found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery ? 
                    "No meeting notes match your search criteria. Try adjusting your search query." : 
                    "You haven't created any meeting notes yet. Create your first note to get started."}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Note
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-4">
              {meetingNotes
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((note) => (
                  <Card key={note.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setSelectedNote(note)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{note.title}</CardTitle>
                          <CardDescription>
                            {new Date(note.date).toLocaleDateString()} • {formatDuration(note.durationMinutes)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {note.meetingType === 'discovery' ? 'Discovery' : 
                           note.meetingType === 'client' ? 'Client Meeting' :
                           note.meetingType === 'internal' ? 'Internal Meeting' :
                           note.meetingType === 'status' ? 'Status Update' : 
                           note.meetingType === 'project' ? 'Project Meeting' : 
                           'Other'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">{note.notes}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="client">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-4">
              {meetingNotes
                .filter(note => note.meetingType === 'client' || note.meetingType === 'discovery')
                .map((note) => (
                  <Card key={note.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setSelectedNote(note)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{note.title}</CardTitle>
                          <CardDescription>
                            {new Date(note.date).toLocaleDateString()} • {formatDuration(note.durationMinutes)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {note.meetingType === 'discovery' ? 'Discovery' : 'Client Meeting'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">{note.notes}</p>
                    </CardContent>
                  </Card>
                ))}
                
              {meetingNotes.filter(note => note.meetingType === 'client' || note.meetingType === 'discovery').length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No client meeting notes found.
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="internal">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-4">
              {meetingNotes
                .filter(note => note.meetingType === 'internal')
                .map((note) => (
                  <Card key={note.id} className="cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setSelectedNote(note)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{note.title}</CardTitle>
                          <CardDescription>
                            {new Date(note.date).toLocaleDateString()} • {formatDuration(note.durationMinutes)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Internal Meeting</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">{note.notes}</p>
                    </CardContent>
                  </Card>
                ))}
                
              {meetingNotes.filter(note => note.meetingType === 'internal').length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No internal meeting notes found.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Note Details Dialog */}
      {selectedNote && (
        <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">{selectedNote.title}</DialogTitle>
                <Badge variant="outline">
                  {selectedNote.meetingType === 'discovery' ? 'Discovery' : 
                   selectedNote.meetingType === 'client' ? 'Client Meeting' :
                   selectedNote.meetingType === 'internal' ? 'Internal Meeting' :
                   selectedNote.meetingType === 'status' ? 'Status Update' : 
                   selectedNote.meetingType === 'project' ? 'Project Meeting' : 
                   'Other'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {new Date(selectedNote.date).toLocaleDateString()}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {formatDuration(selectedNote.durationMinutes)}
                </Badge>
                {selectedNote.clientId && (
                  <Badge variant="outline">
                    <Building className="h-3.5 w-3.5 mr-1" />
                    Client: {selectedNote.clientId}
                  </Badge>
                )}
                {selectedNote.projectId && (
                  <Badge variant="outline">
                    <FolderIcon className="h-3.5 w-3.5 mr-1" />
                    Project: {selectedNote.projectId}
                  </Badge>
                )}
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Attendees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedNote.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attendee.role} • {attendee.type === 'internal' ? 'Internal' : attendee.type === 'client' ? 'Client' : attendee.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Notes</h3>
                <div className="whitespace-pre-line text-sm border rounded-md p-4 max-h-[200px] overflow-y-auto">
                  {selectedNote.notes}
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard.writeText(selectedNote.notes);
                    toast.success('Notes copied to clipboard');
                  }}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy Text
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Key Points</h3>
                  <ul className="space-y-1 text-sm">
                    {selectedNote.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Decisions</h3>
                  <ul className="space-y-1 text-sm">
                    {selectedNote.decisions.map((decision, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Action Items</h3>
                <div className="space-y-2">
                  {selectedNote.actionItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 border rounded-md p-3">
                      <div className={`p-1 rounded-md ${
                        item.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 
                        item.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900' : 
                        item.status === 'blocked' ? 'bg-red-100 dark:bg-red-900' : 
                        'bg-amber-100 dark:bg-amber-900'
                      }`}>
                        <Check className={`h-4 w-4 ${
                          item.status === 'completed' ? 'text-green-500' : 
                          item.status === 'in_progress' ? 'text-blue-500' : 
                          item.status === 'blocked' ? 'text-red-500' : 
                          'text-amber-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span>Assigned to: {selectedNote.attendees.find(a => a.id === item.assignedTo)?.name || item.assignedTo}</span>
                          {item.dueDate && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {item.status === 'completed' ? 'Completed' : 
                         item.status === 'in_progress' ? 'In Progress' :
                         item.status === 'blocked' ? 'Blocked' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                  
                  {selectedNote.actionItems.length === 0 && (
                    <p className="text-sm text-muted-foreground">No action items recorded for this meeting.</p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    // In a real app, this would download the notes as a file
                    toast.success('Notes downloaded');
                  }}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    // In a real app, this would clone and edit the notes
                    toast.success('Created editable copy of notes');
                  }}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedNote(null)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Building({ className, ...props }: React.ComponentProps<typeof User>) {
  return <User className={className} {...props} />;
}

function FolderIcon({ className, ...props }: React.ComponentProps<typeof User>) {
  return <User className={className} {...props} />;
}