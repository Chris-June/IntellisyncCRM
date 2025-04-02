import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Send, Download, Sparkles, RefreshCw, Settings } from 'lucide-react';

const proposalSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  clientName: z.string().min(2, { message: 'Client name is required' }),
  projectScope: z.string().min(10, { message: 'Project scope is required' }),
  deliverables: z.string().min(10, { message: 'Deliverables are required' }),
  timeline: z.string().min(5, { message: 'Timeline is required' }),
  pricing: z.string().min(1, { message: 'Pricing is required' }),
  termsAndConditions: z.boolean()
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function ProposalGenerator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  
  // Get lead ID from URL query parameters if available
  const searchParams = new URLSearchParams(location.search);
  const leadId = searchParams.get('lead');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: `${leadId ? 'Proposal for Lead #' + leadId : 'New Business Proposal'}`,
      clientName: '',
      projectScope: '',
      deliverables: '',
      timeline: '',
      pricing: '',
      termsAndConditions: false
    }
  });

  const onSubmit = async (data: ProposalFormValues) => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the API to generate a proposal
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate generated content
      const mockGeneratedContent = `
# ${data.title}
## Prepared for ${data.clientName}
### IntelliSync Solutions
#### ${new Date().toLocaleDateString()}

## Project Scope
${data.projectScope}

## Deliverables
${data.deliverables}

## Timeline
${data.timeline}

## Investment
${data.pricing}

## Terms and Conditions
- Payment schedule: 50% upfront, 50% upon completion
- Revisions: Up to 3 rounds of revisions included
- Additional work: Billed at hourly rate of $150/hour
- Cancellation: 50% fee if project is cancelled after commencement
      `;
      
      setGeneratedContent(mockGeneratedContent);
      setIsGenerated(true);
      toast.success('Proposal generated successfully');
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;
    
    // In a real implementation, this would download the proposal as a PDF
    toast.success('Proposal downloaded as PDF');
  };

  const handleSend = () => {
    if (!generatedContent) return;
    
    // In a real implementation, this would send the proposal to the client
    toast.success('Proposal sent to client');
    navigate(`/sales/leads/${leadId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proposal Generator</h1>
        <p className="text-muted-foreground mt-1">
          Create professional client proposals with AI assistance
        </p>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Proposal Editor</TabsTrigger>
          <TabsTrigger value="preview" disabled={!isGenerated}>Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Proposal Information</CardTitle>
                <CardDescription>
                  Enter the details for your proposal. Our AI will help generate professional content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">Template:</div>
                  <Select 
                    defaultValue={selectedTemplate} 
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Proposal</SelectItem>
                      <SelectItem value="detailed">Detailed Project Proposal</SelectItem>
                      <SelectItem value="simple">Simple One-Pager</SelectItem>
                      <SelectItem value="technical">Technical Solution Proposal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator className="my-4" />
                
                <form id="proposalForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Proposal Title</Label>
                    <Input 
                      id="title" 
                      {...register('title')} 
                      placeholder="e.g., Web Development Proposal for Acme Inc."
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input 
                      id="clientName" 
                      {...register('clientName')} 
                      placeholder="Enter client name"
                    />
                    {errors.clientName && (
                      <p className="text-sm text-destructive">{errors.clientName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="projectScope">Project Scope</Label>
                    <Textarea 
                      id="projectScope" 
                      {...register('projectScope')} 
                      placeholder="Describe the project scope and objectives..."
                      className="min-h-[100px]"
                    />
                    {errors.projectScope && (
                      <p className="text-sm text-destructive">{errors.projectScope.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliverables">Deliverables</Label>
                    <Textarea 
                      id="deliverables" 
                      {...register('deliverables')} 
                      placeholder="List the deliverables for this project..."
                      className="min-h-[100px]"
                    />
                    {errors.deliverables && (
                      <p className="text-sm text-destructive">{errors.deliverables.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Textarea 
                      id="timeline" 
                      {...register('timeline')} 
                      placeholder="Outline the project timeline and milestones..."
                    />
                    {errors.timeline && (
                      <p className="text-sm text-destructive">{errors.timeline.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pricing">Pricing</Label>
                    <Textarea 
                      id="pricing" 
                      {...register('pricing')} 
                      placeholder="Outline the pricing structure and payment terms..."
                    />
                    {errors.pricing && (
                      <p className="text-sm text-destructive">{errors.pricing.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="termsAndConditions" 
                      onCheckedChange={(checked) => {
                        setValue('termsAndConditions', checked as boolean);
                      }}
                    />
                    <label
                      htmlFor="termsAndConditions"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Include standard terms and conditions
                    </label>
                  </div>
                  
                  {errors.termsAndConditions && (
                    <p className="text-sm text-destructive">{errors.termsAndConditions.message}</p>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline" 
                  onClick={() => {
                    // In a real implementation, this would use AI to suggest content
                    toast.success('AI suggestions applied');
                    setValue('projectScope', 'Our team will implement a complete solution to address your business needs, including initial requirements gathering, design, development, testing, and deployment phases.');
                    setValue('deliverables', '1. Complete working software solution\n2. User documentation and training materials\n3. Source code and technical documentation\n4. 30 days of post-launch support');
                    setValue('timeline', 'The project is estimated to take 12 weeks from kickoff to completion, with key milestones at weeks 4, 8, and 12.');
                    setValue('pricing', 'Total Project Fee: $45,000\n\nPayment Schedule:\n- 50% upon contract signing\n- 25% at midpoint review\n- 25% upon project completion');
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest Content with AI
                </Button>
                <Button 
                  type="submit" 
                  form="proposalForm"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Proposal
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Preview</CardTitle>
              <CardDescription>
                Preview and finalize your generated proposal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 min-h-[500px] mb-6">
                {generatedContent && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {generatedContent.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-bold mt-3 mb-2">{line.substring(4)}</h3>;
                      } else if (line.startsWith('#### ')) {
                        return <h4 key={index} className="text-base font-bold mt-3 mb-2">{line.substring(5)}</h4>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-6">{line.substring(2)}</li>;
                      } else if (line === '') {
                        return <br key={index} />;
                      } else {
                        return <p key={index} className="my-2">{line}</p>;
                      }
                    })}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsGenerated(false)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Edit Proposal
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Client
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Settings</CardTitle>
              <CardDescription>
                Customize your proposal generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  defaultValue="IntelliSync Solutions" 
                  placeholder="Your company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <Input id="logo" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 300x100px, max 2MB
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="primaryColor" 
                    defaultValue="#4F46E5" 
                    className="w-[100px]" 
                  />
                  <div 
                    className="h-9 w-9 rounded-md border" 
                    style={{ backgroundColor: '#4F46E5' }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Include Sections</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeCompanyIntro" defaultChecked />
                    <label htmlFor="includeCompanyIntro" className="text-sm">Company Introduction</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeTestimonials" defaultChecked />
                    <label htmlFor="includeTestimonials" className="text-sm">Testimonials</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includePortfolio" defaultChecked />
                    <label htmlFor="includePortfolio" className="text-sm">Portfolio Samples</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeTeam" defaultChecked />
                    <label htmlFor="includeTeam" className="text-sm">Team Member Bios</label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultFooterText">Default Footer Text</Label>
                <Textarea 
                  id="defaultFooterText" 
                  defaultValue="Thank you for considering IntelliSync Solutions. We look forward to the opportunity to work with you." 
                  placeholder="Enter default footer text"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}