import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layouts/PageHeader';
import { 
  DollarSign, 
  BarChart, 
  Building2, 
  CalendarClock, 
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  FileText,
  LightbulbIcon,
  TagIcon
} from 'lucide-react';
import { Opportunity } from '@/types/sales';
import { salesService } from '@/services/sales-service';

export default function OpportunityView() {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scoringResult, setScoringResult] = useState<any | null>(null);
  const [isScoringLoading, setIsScoringLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) return;

    const fetchOpportunity = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from API
        // This is mocked for demonstration purposes
        setTimeout(() => {
          const mockOpportunity: Opportunity = {
            id: opportunityId,
            clientId: 'client-123',
            title: 'AI-Powered Customer Service Chatbot',
            description: 'Implementation of an intelligent chatbot to handle Tier-1 customer service inquiries, reducing response times and improving customer satisfaction. The solution will integrate with existing knowledge base and ticket management systems.',
            valuePotential: 65000,
            status: 'qualified',
            score: 82,
            aiFitScore: 0.85,
            potentialImpact: 'high',
            relevantSolutions: [
              'Custom GPT-4 Implementation',
              'Knowledge Base Integration',
              'Ticket System Automation',
              'Analytics Dashboard'
            ],
            createdAt: new Date('2025-02-15'),
            updatedAt: new Date('2025-03-01')
          };
          
          setOpportunity(mockOpportunity);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load opportunity:', error);
        toast.error('Failed to load opportunity details');
        setIsLoading(false);
      }
    };

    const fetchScoringResult = async () => {
      setIsScoringLoading(true);
      try {
        // In a real app, you would fetch from API
        // This is mocked for demonstration purposes
        setTimeout(() => {
          const mockScoringResult = {
            score_id: 'score-123',
            scores: {
              ai_fit: 0.85,
              business_impact: 0.75,
              implementation_complexity: 0.60,
              overall: 0.73
            },
            recommendations: {
              priority: 'high',
              suggested_approach: 'Phased Implementation',
              key_considerations: [
                'Start with MVP chatbot',
                'Integrate with existing systems',
                'Train on company data'
              ]
            },
            implementation: {
              approach: 'Agile, 3-month sprints',
              timeline: '6 months',
              complexity: 'medium',
              required_resources: [
                {
                  type: 'ai_engineer',
                  hours: 160,
                  skills: ['LLM', 'NLP', 'Python']
                },
                {
                  type: 'developer',
                  hours: 120,
                  skills: ['API', 'Integration', 'Cloud']
                }
              ],
              estimated_cost: 75000
            },
            created_at: new Date().toISOString()
          };
          
          setScoringResult(mockScoringResult);
          setIsScoringLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to load scoring data:', error);
        setIsScoringLoading(false);
      }
    };

    fetchOpportunity();
    fetchScoringResult();
  }, [opportunityId]);

  if (isLoading && !opportunity) {
    return <OpportunityViewSkeleton />;
  }

  if (!opportunity) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Opportunity Not Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The opportunity you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-6" onClick={() => navigate('/sales/leads')}>
            Return to Sales Pipeline
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'qualified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'implemented':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={opportunity.title}
        showBackButton={true}
        backButtonUrl={`/clients/${opportunity.clientId}`}
      >
        <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${opportunity.clientId}`)}>
          <Building2 className="mr-2 h-4 w-4" />
          View Client
        </Button>
        <Button size="sm" onClick={() => navigate(`/sales/leads/new?opportunity=${opportunityId}`)}>
          Create Lead
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <Badge variant="outline" className={getStatusColor(opportunity.status)}>
          {opportunity.status}
        </Badge>
        {opportunity.score && (
          <span className={`flex items-center font-medium ${getScoreColor(opportunity.score)}`}>
            <BarChart className="h-4 w-4 mr-1" />
            Score: {opportunity.score}/100
          </span>
        )}
        {opportunity.valuePotential && (
          <span className="flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            ${opportunity.valuePotential.toLocaleString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Opportunity Details */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
              <CardDescription>
                Full description and analysis of this business opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {opportunity.description}
                </p>
              </div>
              
              {opportunity.relevantSolutions && opportunity.relevantSolutions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Relevant Solutions</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {opportunity.relevantSolutions.map((solution, index) => (
                      <li key={index}>{solution}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {isScoringLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : scoringResult ? (
                <div>
                  <h3 className="font-medium mb-2">AI Analysis</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/30 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                          <LightbulbIcon className="h-4 w-4 text-amber-500" />
                          <span>AI Fit</span>
                        </div>
                        <Progress 
                          value={scoringResult.scores.ai_fit * 100} 
                          className="h-2 mb-1" 
                        />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(scoringResult.scores.ai_fit * 100)}% match with AI capabilities
                        </p>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                          <BarChart className="h-4 w-4 text-blue-500" />
                          <span>Business Impact</span>
                        </div>
                        <Progress 
                          value={scoringResult.scores.business_impact * 100} 
                          className="h-2 mb-1" 
                        />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(scoringResult.scores.business_impact * 100)}% potential business impact
                        </p>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>Complexity</span>
                        </div>
                        <Progress 
                          value={scoringResult.scores.implementation_complexity * 100} 
                          className="h-2 mb-1" 
                        />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(scoringResult.scores.implementation_complexity * 100)}% implementation complexity
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommended Approach</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {scoringResult.recommendations.suggested_approach}
                      </p>
                      
                      <h4 className="text-sm font-medium mb-2">Key Considerations</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {scoringResult.recommendations.key_considerations.map((consideration: string, index: number) => (
                          <li key={index}>{consideration}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          
          {/* Implementation Plan */}
          {!isScoringLoading && scoringResult && (
            <Card>
              <CardHeader>
                <CardTitle>Implementation Plan</CardTitle>
                <CardDescription>
                  Suggested implementation approach for this opportunity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-3">
                    <h3 className="text-sm font-medium mb-1">Approach</h3>
                    <p className="text-sm text-muted-foreground">
                      {scoringResult.implementation.approach}
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h3 className="text-sm font-medium mb-1">Timeline</h3>
                    <p className="text-sm text-muted-foreground">
                      {scoringResult.implementation.timeline}
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <h3 className="text-sm font-medium mb-1">Estimated Cost</h3>
                    <p className="text-sm font-medium">
                      ${scoringResult.implementation.estimated_cost.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Required Resources</h3>
                  <div className="space-y-3">
                    {scoringResult.implementation.required_resources.map((resource: any, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="bg-primary/10 p-1 rounded-md">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{resource.type.replace('_', ' ')}</p>
                          <p className="text-muted-foreground">{resource.hours} hours</p>
                          <p className="text-xs text-muted-foreground">
                            Skills: {resource.skills.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-end">
                <Button onClick={() => navigate(`/sales/leads/new?opportunity=${opportunityId}`)}>
                  Create Lead from Opportunity
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Client</span>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Link 
                    to={`/clients/${opportunity.clientId}`} 
                    className="text-sm font-medium hover:underline"
                  >
                    View Client Profile
                  </Link>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Value Potential</span>
                <p className="text-base font-medium mt-1">
                  ${opportunity.valuePotential?.toLocaleString() || 'Not estimated'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Opportunity Score</span>
                <div className="flex items-center mt-1">
                  <BarChart className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className={opportunity.score ? getScoreColor(opportunity.score) : ''}>
                    {opportunity.score ? `${opportunity.score}/100` : 'Not scored'}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="mt-1">
                  <Badge variant="outline" className={getStatusColor(opportunity.status)}>
                    {opportunity.status}
                  </Badge>
                </div>
              </div>
              
              <Separator />

              <div>
                <span className="text-sm text-muted-foreground">Identified</span>
                <p className="text-sm mt-1">{new Date(opportunity.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <p className="text-sm mt-1">{new Date(opportunity.updatedAt).toLocaleDateString()}</p>
              </div>

              {opportunity.potentialImpact && (
                <div>
                  <span className="text-sm text-muted-foreground">Potential Impact</span>
                  <p className="text-sm mt-1 capitalize">{opportunity.potentialImpact}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex flex-col gap-2">
              <Button className="w-full" onClick={() => navigate(`/sales/leads/new?opportunity=${opportunityId}`)}>
                Create Lead
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/clients/${opportunity.clientId}`)}>
                View Client
              </Button>
            </CardFooter>
          </Card>

          {/* Related Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Related Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm mb-4">No related documents found</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => {}}>
                  Add Document
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-muted-foreground" />
                <span>Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">AI</Badge>
                <Badge variant="secondary">Chatbot</Badge>
                <Badge variant="secondary">Customer Service</Badge>
                <Badge variant="secondary">Automation</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OpportunityViewSkeleton() {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Skeleton className="h-9 w-48 ml-auto" />
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}