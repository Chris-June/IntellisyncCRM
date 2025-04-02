import { Outlet } from 'react-router-dom';
import { CircuitBoard } from 'lucide-react';
import { Toaster } from 'sonner';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <CircuitBoard size={32} />
        <h1 className="text-2xl font-bold">IntelliSync CMS</h1>
      </div>
      
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} IntelliSync Solutions. All rights reserved.</p>
      </div>
      
      <Toaster position="top-center" />
    </div>
  );
}