import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useClient } from '@/context/client-context';
import { Building2, Mail, User, Briefcase, Lightbulb, Target, AlertTriangle } from 'lucide-react';

const clientIntakeSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  company: z.string().min(2, { message: 'Company name is required' }),
  industry: z.string().min(1, { message: 'Industry is required' }),
  businessNeeds: z.string().min(10, { message: 'Please provide more details about your business needs' }),
  currentChallenges: z.string().optional(),
  goals: z.string().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
});

type ClientIntakeFormValues = z.infer<typeof clientIntakeSchema>;

export default function ClientIntake() {
  const { createClient, startIntakeSession } = useClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientIntakeFormValues>({
    resolver: zodResolver(clientIntakeSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      industry: '',
      businessNeeds: '',
      currentChallenges: '',
      goals: '',
      timeline: '',
      budget: '',
    },
  });

  const onSubmit = async (data: ClientIntakeFormValues) => {
    setIsSubmitting(true);
    try {
      // Create the client first
      const newClient = await createClient({
        name: data.name,
        email: data.email,
        company: data.company,
        industry: data.industry,
      });
      
      // Start an intake session with additional responses
      const responses = {
        businessNeeds: data.businessNeeds,
        currentChallenges: data.currentChallenges,
        goals: data.goals,
        timeline: data.timeline,
        budget: data.budget,
      };
      
      await startIntakeSession(newClient.id, responses);
      
      toast.success('Client intake completed successfully');
      navigate(`/clients/${newClient.id}`);
    } catch (error) {
      toast.error('Failed to complete client intake');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Client Intake</h1>
        <p className="text-muted-foreground mt-2">
          Gather essential information to onboard a new client and identify business opportunities.
        </p>

        {/* Progress indicator */}
        <div className="mt-6 flex items-center gap-2">
          <div className={`h-2 rounded-full w-1/3 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 rounded-full w-1/3 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 rounded-full w-1/3 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Let's start with some basic information about the client.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Company Name"
                    className="pl-10"
                    {...register('company')}
                  />
                </div>
                {errors.company && (
                  <p className="text-sm text-destructive">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    onValueChange={(value) => setValue('industry', value)}
                    defaultValue={watch('industry')}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Business Needs */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Needs</CardTitle>
              <CardDescription>
                Tell us about your business needs and goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessNeeds" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <span>Business Needs & Objectives</span>
                </Label>
                <Textarea
                  id="businessNeeds"
                  placeholder="Describe the primary business needs and objectives you're looking to address..."
                  className="min-h-[100px]"
                  {...register('businessNeeds')}
                />
                {errors.businessNeeds && (
                  <p className="text-sm text-destructive">{errors.businessNeeds.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentChallenges" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span>Current Challenges</span>
                </Label>
                <Textarea
                  id="currentChallenges"
                  placeholder="What challenges or pain points are you currently facing?"
                  className="min-h-[100px]"
                  {...register('currentChallenges')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals" className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Key Goals & Desired Outcomes</span>
                </Label>
                <Textarea
                  id="goals"
                  placeholder="What specific outcomes or goals are you hoping to achieve?"
                  className="min-h-[100px]"
                  {...register('goals')}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={prevStep}>
                Previous Step
              </Button>
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Project Details */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Additional details to help us understand your project requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeline">Preferred Timeline</Label>
                <Select
                  onValueChange={(value) => setValue('timeline', value)}
                  defaultValue={watch('timeline')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (1-2 weeks)</SelectItem>
                    <SelectItem value="short">Short Term (1-2 months)</SelectItem>
                    <SelectItem value="medium">Medium Term (3-6 months)</SelectItem>
                    <SelectItem value="long">Long Term (6+ months)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select
                  onValueChange={(value) => setValue('budget', value)}
                  defaultValue={watch('budget')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_10k">Under $10,000</SelectItem>
                    <SelectItem value="10k_50k">$10,000 - $50,000</SelectItem>
                    <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k_250k">$100,000 - $250,000</SelectItem>
                    <SelectItem value="over_250k">Over $250,000</SelectItem>
                    <SelectItem value="not_specified">Not specified / Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-md">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                  <li>Our team will review your intake information</li>
                  <li>We'll analyze potential opportunities and solutions</li>
                  <li>A discovery call will be scheduled to discuss details</li>
                  <li>You'll receive a tailored proposal for your needs</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={prevStep}>
                Previous Step
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Intake Form'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}