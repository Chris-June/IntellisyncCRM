import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Checkbox,
  CheckboxItem,
  CheckboxIndicator 
} from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  FileText, 
  Save, 
  Send, 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  RefreshCw, 
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { salesService } from '@/services/sales-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContractBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('service_agreement');
  const [showPreview, setShowPreview] = useState(false);

  // Get lead ID from URL query parameters if available
  const searchParams = new URLSearchParams(location.search);
  const leadId = searchParams.get('lead');
  const proposalId = searchParams.get('proposal');

  const [formData, setFormData] = useState({
    contractType: 'service_agreement',
    clientName: '',
    companyName: 'IntelliSync Solutions',
    effectiveDate: new Date().toISOString().split('T')[0],
    projectName: '',
    paymentTerms: '50% upfront, 50% upon completion',
    deliverySchedule: '12 weeks from project start date',
    specialConditions: [],
    includedServices: [
      'Requirements Analysis',
      'Design and Development',
      'Testing and Quality Assurance',
      'Deployment and Integration',
      'Post-Launch Support (30 days)'
    ],
    exclusions: [
      'Hosting fees and services',
      'Third-party software licenses',
      'Content creation and copywriting',
      'Ongoing maintenance beyond support period'
    ],
    deliverables: [],
    ipTerms: 'Client will own all intellectual property rights to the final deliverables upon final payment.',
    governingLawState: 'California',
    companySignatoryName: 'Jane Smith',
    companySignatoryTitle: 'CEO',
    clientSignatoryName: '',
    clientSignatoryTitle: '',
  });

  const [generatedContract, setGeneratedContract] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (name: string, index: number, value: string) => {
    setFormData(prev => {
      const newList = [...(prev[name as keyof typeof prev] as string[])];
      newList[index] = value;
      return { ...prev, [name]: newList };
    });
  };

  const addListItem = (name: string) => {
    setFormData(prev => {
      const newList = [...(prev[name as keyof typeof prev] as string[]), ''];
      return { ...prev, [name]: newList };
    });
  };

  const removeListItem = (name: string, index: number) => {
    setFormData(prev => {
      const newList = [...(prev[name as keyof typeof prev] as string[])];
      newList.splice(index, 1);
      return { ...prev, [name]: newList };
    });
  };

  const suggestWithAI = () => {
    // In a real implementation, this would call an API to get AI suggestions
    toast.success('AI suggestions applied');
    setFormData(prev => ({
      ...prev,
      specialConditions: [
        'Expedited timeline with bonus for early completion',
        'Bi-weekly review meetings required',
        'Client-provided assets must be delivered by project week 3'
      ],
      deliverables: [
        'Working software with source code',
        'User documentation and training',
        'Technical documentation',
        'Deployment guide'
      ]
    }));
  };

  const handleGenerateContract = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, you would call the contract builder API
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a simple contract preview
      const mockContract = `
# SERVICE AGREEMENT

This Service Agreement ("Agreement") is made effective as of ${formData.effectiveDate} by and between ${formData.companyName} ("Company") and ${formData.clientName} ("Client").

## 1. SERVICES

The Company agrees to provide the following services to Client ("Services"):

${formData.includedServices.map(service => `- ${service}`).join('\n')}

## 2. PAYMENT TERMS

${formData.paymentTerms}

Total Project Fee: $${Math.floor(Math.random() * 50000) + 10000}

## 3. TERM AND TERMINATION

This Agreement shall commence on ${formData.effectiveDate} and continue until project completion, unless terminated earlier as provided in this Agreement.

## 4. CONFIDENTIALITY

Both parties acknowledge that they may receive confidential information from the other party during the term of this Agreement. Both parties agree to keep all such information confidential and not to disclose such information to any third party without the prior written consent of the other party.

## 5. INTELLECTUAL PROPERTY

${formData.ipTerms}

## 6. LIMITATION OF LIABILITY

IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER PARTY FOR ANY INDIRECT, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS OR BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

## 7. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of ${formData.governingLawState}.

## 8. SPECIAL CONDITIONS

${formData.specialConditions.map(condition => `- ${condition}`).join('\n')}

## 9. DELIVERABLES

${formData.deliverables.map(deliverable => `- ${deliverable}`).join('\n')}

## 10. SIGNATURES

Client: ________________________________    Date: ________________
Print Name: ${formData.clientSignatoryName}
Title: ${formData.clientSignatoryTitle}

Company: ________________________________    Date: ________________
Print Name: ${formData.companySignatoryName}
Title: ${formData.companySignatoryTitle}
`;
      
      setGeneratedContract(mockContract);
      setIsGenerated(true);
      toast.success('Contract generated successfully');
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Failed to generate contract');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContract = () => {
    // In a real implementation, this would save the contract to the database
    toast.success('Contract saved successfully');
  };

  const handleDownloadContract = () => {
    // In a real implementation, this would download the contract as a PDF
    toast.success('Contract downloaded as PDF');
  };

  const handleSendContract = () => {
    // In a real implementation, this would send the contract to the client
    toast.success('Contract sent to client for signature');
    navigate(`/sales/leads/${leadId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contract Builder</h1>
        <p className="text-muted-foreground mt-1">
          Create legally sound contracts from customizable templates
        </p>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Contract Builder</TabsTrigger>
          <TabsTrigger value="preview" disabled={!isGenerated}>Preview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        {/* Builder Tab */}
        <TabsContent value="builder">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Template</CardTitle>
                <CardDescription>
                  Select a template as the basis for your contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  defaultValue={selectedTemplate} 
                  onValueChange={(value) => setSelectedTemplate(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_agreement">Service Agreement</SelectItem>
                    <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                    <SelectItem value="sow">Statement of Work</SelectItem>
                    <SelectItem value="master_services">Master Services Agreement</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium">Template Details</h3>
                  <div className="rounded-md bg-muted p-4 text-sm space-y-2">
                    <p><strong>Template:</strong> {
                      selectedTemplate === 'service_agreement' ? 'Service Agreement' :
                      selectedTemplate === 'nda' ? 'Non-Disclosure Agreement' :
                      selectedTemplate === 'sow' ? 'Statement of Work' : 
                      'Master Services Agreement'
                    }</p>
                    <p><strong>Last Updated:</strong> March 15, 2025</p>
                    <p><strong>Description:</strong> {
                      selectedTemplate === 'service_agreement' ? 'Standard agreement for professional services with customizable terms.' :
                      selectedTemplate === 'nda' ? 'Confidentiality agreement to protect sensitive information shared between parties.' :
                      selectedTemplate === 'sow' ? 'Detailed outline of work to be performed, deliverables, and success criteria.' : 
                      'Comprehensive agreement governing ongoing client relationship and multiple projects.'
                    }</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core details for your contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select 
                    defaultValue={formData.contractType} 
                    onValueChange={(value) => handleSelectChange('contractType', value)}
                  >
                    <SelectTrigger id="contractType">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_agreement">Service Agreement</SelectItem>
                      <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                      <SelectItem value="sow">Statement of Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input 
                    id="clientName" 
                    name="clientName" 
                    value={formData.clientName} 
                    onChange={handleInputChange} 
                    placeholder="Enter client name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input 
                    id="projectName" 
                    name="projectName" 
                    value={formData.projectName} 
                    onChange={handleInputChange} 
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input 
                    id="effectiveDate" 
                    name="effectiveDate" 
                    type="date" 
                    value={formData.effectiveDate} 
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contract Terms */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Contract Terms</CardTitle>
                <CardDescription>
                  Define the specific terms and conditions for this contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="payment">
                    <AccordionTrigger>Payment Terms</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Textarea 
                          id="paymentTerms" 
                          name="paymentTerms" 
                          value={formData.paymentTerms} 
                          onChange={handleInputChange} 
                          placeholder="Describe payment schedule, amounts, and methods"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="delivery">
                    <AccordionTrigger>Delivery Schedule</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliverySchedule">Delivery Schedule</Label>
                        <Textarea 
                          id="deliverySchedule" 
                          name="deliverySchedule" 
                          value={formData.deliverySchedule} 
                          onChange={handleInputChange} 
                          placeholder="Outline the project timeline and key milestones"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="special">
                    <AccordionTrigger>Special Conditions</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Special Conditions</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addListItem('specialConditions')}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                        {formData.specialConditions.map((condition, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={condition} 
                              onChange={(e) => handleListChange('specialConditions', index, e.target.value)} 
                              placeholder={`Condition ${index + 1}`}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeListItem('specialConditions', index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {formData.specialConditions.length === 0 && (
                          <p className="text-sm text-muted-foreground">No special conditions added.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="scope">
                    <AccordionTrigger>Project Scope</AccordionTrigger>
                    <AccordionContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Included Services</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addListItem('includedServices')}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                        {formData.includedServices.map((service, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={service} 
                              onChange={(e) => handleListChange('includedServices', index, e.target.value)} 
                              placeholder={`Service ${index + 1}`}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeListItem('includedServices', index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Exclusions</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addListItem('exclusions')}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                        {formData.exclusions.map((exclusion, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={exclusion} 
                              onChange={(e) => handleListChange('exclusions', index, e.target.value)} 
                              placeholder={`Exclusion ${index + 1}`}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeListItem('exclusions', index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Deliverables</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addListItem('deliverables')}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                        {formData.deliverables.map((deliverable, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={deliverable} 
                              onChange={(e) => handleListChange('deliverables', index, e.target.value)} 
                              placeholder={`Deliverable ${index + 1}`}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeListItem('deliverables', index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {formData.deliverables.length === 0 && (
                          <p className="text-sm text-muted-foreground">No deliverables added.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="legal">
                    <AccordionTrigger>Legal Terms</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ipTerms">Intellectual Property Terms</Label>
                        <Textarea 
                          id="ipTerms" 
                          name="ipTerms" 
                          value={formData.ipTerms} 
                          onChange={handleInputChange} 
                          placeholder="Define intellectual property ownership and rights"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="governingLawState">Governing Law State</Label>
                        <Select 
                          defaultValue={formData.governingLawState} 
                          onValueChange={(value) => handleSelectChange('governingLawState', value)}
                        >
                          <SelectTrigger id="governingLawState">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="California">California</SelectItem>
                            <SelectItem value="New York">New York</SelectItem>
                            <SelectItem value="Texas">Texas</SelectItem>
                            <SelectItem value="Florida">Florida</SelectItem>
                            <SelectItem value="Illinois">Illinois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="signatures">
                    <AccordionTrigger>Signatures</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Company Signatory</Label>
                          <Input 
                            name="companySignatoryName" 
                            value={formData.companySignatoryName} 
                            onChange={handleInputChange} 
                            placeholder="Full Name"
                          />
                          <Input 
                            name="companySignatoryTitle" 
                            value={formData.companySignatoryTitle} 
                            onChange={handleInputChange} 
                            placeholder="Title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Client Signatory</Label>
                          <Input 
                            name="clientSignatoryName" 
                            value={formData.clientSignatoryName} 
                            onChange={handleInputChange} 
                            placeholder="Full Name"
                          />
                          <Input 
                            name="clientSignatoryTitle" 
                            value={formData.clientSignatoryTitle} 
                            onChange={handleInputChange} 
                            placeholder="Title"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={suggestWithAI}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest with AI
                </Button>
                <Button 
                  onClick={handleGenerateContract}
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
                      Generate Contract
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Contract Preview</CardTitle>
              <CardDescription>
                Review and finalize your generated contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 min-h-[600px] mb-6 overflow-auto">
                {generatedContract && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {generatedContract.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
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
                Edit Contract
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveContract}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button variant="outline" onClick={handleDownloadContract}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={handleSendContract}>
                  <Send className="mr-2 h-4 w-4" />
                  Send for Signature
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Contract Templates</CardTitle>
              <CardDescription>
                Browse and manage your contract templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Service Agreement */}
                <div className="flex items-start space-x-4 border-b pb-6">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-medium">Service Agreement</h3>
                    <p className="text-sm text-muted-foreground">Standard agreement for professional services with customizable terms.</p>
                    <div className="flex items-center text-sm mt-2">
                      <CheckCircle2 className="text-green-500 h-4 w-4 mr-1" />
                      <span className="text-muted-foreground">Last updated: March 15, 2025</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTemplate('service_agreement')}>
                    <Eye className="h-4 w-4 mr-1" />
                    Use
                  </Button>
                </div>

                {/* Non-Disclosure Agreement */}
                <div className="flex items-start space-x-4 border-b pb-6">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-medium">Non-Disclosure Agreement</h3>
                    <p className="text-sm text-muted-foreground">Protect confidential information shared between parties.</p>
                    <div className="flex items-center text-sm mt-2">
                      <CheckCircle2 className="text-green-500 h-4 w-4 mr-1" />
                      <span className="text-muted-foreground">Last updated: February 22, 2025</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTemplate('nda')}>
                    <Eye className="h-4 w-4 mr-1" />
                    Use
                  </Button>
                </div>

                {/* Statement of Work */}
                <div className="flex items-start space-x-4 border-b pb-6">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-medium">Statement of Work</h3>
                    <p className="text-sm text-muted-foreground">Detailed outline of project scope, deliverables, timeline, and success criteria.</p>
                    <div className="flex items-center text-sm mt-2">
                      <AlertTriangle className="text-amber-500 h-4 w-4 mr-1" />
                      <span className="text-muted-foreground">Review needed: Updated April 1, 2025</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTemplate('sow')}>
                    <Eye className="h-4 w-4 mr-1" />
                    Use
                  </Button>
                </div>

                {/* Master Services Agreement */}
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-medium">Master Services Agreement</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive agreement for ongoing service relationships.</p>
                    <div className="flex items-center text-sm mt-2">
                      <CheckCircle2 className="text-green-500 h-4 w-4 mr-1" />
                      <span className="text-muted-foreground">Last updated: January 10, 2025</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTemplate('master_services')}>
                    <Eye className="h-4 w-4 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create New Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}