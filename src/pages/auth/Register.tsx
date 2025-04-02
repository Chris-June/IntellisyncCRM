import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Registration form schema
const registrationSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { 
    message: 'Password must be at least 8 characters' 
  }).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
  ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const Register: React.FC = () => {
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await signUp(data.email, data.password, {
        full_name: data.fullName,
      });
      toast.success('Account created successfully! Check your email for verification instructions.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit(onSubmit)} className="register-form">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            {...register('fullName')}
            type="text" 
            id="fullName"
            placeholder="Your full name"
          />
          {errors.fullName && <p className="text-red-500">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            {...register('email')}
            type="email" 
            id="email"
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input 
            {...register('password')}
            type="password" 
            id="password"
            placeholder="Choose a strong password"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            {...register('confirmPassword')}
            type="password" 
            id="confirmPassword"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
        <div>
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;