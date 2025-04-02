import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Building2, Mail, User, Briefcase, Lightbulb, ArrowRight, Target, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClient } from '@/context/client-context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  company: z.string().min(2, { message: 'Company name is required' }),
  industry: z.string().min(1, { message: 'Industry is required' }),
  needs: z.string().min(10, { message: 'Please provide more details about your business needs' }),
});

type FormValues = z.infer<typeof formSchema>;

export function IntakeForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { createClient, startIntakeSession } = useClient();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      industry: '',
      needs: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const newClient = await createClient({
        name: data.name,
        email: data.email,
        company: data.company,
        industry: data.industry,
      });
      
      await startIntakeSession(newClient.id, {
        businessNeeds: data.needs
      });
      
      setIsComplete(true);
      setIsSubmitting(false);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(`An error occurred: ${error.message}`);
      } else {
        console.error('An unexpected error occurred');
        toast.error('An unexpected error occurred while submitting the form.');
      }
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
    <Card className="w-full max-w-2xl">
      {isComplete ? (
        // Success state
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-6">
            Your information has been successfully submitted. Our team will review your details and get back to you shortly.
          </p>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Client Intake Form</CardTitle>
            <CardDescription>
              Please provide your information to get started with IntelliSync Solutions.
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="mt-4 flex items-center gap-2">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-9"
                        {...register('name')}
                      />
                    </div>
                    {formState.errors.name && (
                      <p className="text-sm text-destructive">{formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="pl-9"
                        {...register('email')}
                      />
                    </div>
                    {formState.errors.email && (
                      <p className="text-sm text-destructive">{formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="relative">
                      <Building2 className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Company Name"
                        className="pl-9"
                        {...register('company')}
                      />
                    </div>
                    {formState.errors.company && (
                      <p className="text-sm text-destructive">{formState.errors.company.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Select
                        onValueChange={(value) => setValue('industry', value)}
                        defaultValue={watch('industry')}
                      >
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="e.g., Technology, Healthcare, etc." />
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
                    {formState.errors.industry && (
                      <p className="text-sm text-destructive">{formState.errors.industry.message}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="needs">Business Needs & Goals</Label>
                    </div>
                    <Textarea
                      id="needs"
                      placeholder="Please describe your business needs and goals..."
                      className="min-h-[150px]"
                      {...register('needs')}
                    />
                    {formState.errors.needs && (
                      <p className="text-sm text-destructive">{formState.errors.needs.message}</p>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">What happens next?</h4>
                    </div>
                    <ul className="space-y-2 text-sm ml-7">
                      <li>Our team will review your information</li>
                      <li>We'll identify potential AI solutions for your business</li>
                      <li>You'll receive a preliminary analysis within 2 business days</li>
                      <li>We'll schedule a detailed consultation to discuss options</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {step === 1 ? (
                <div />
              ) : (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}
              
              {step === 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  );
}