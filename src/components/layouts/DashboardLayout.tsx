import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Header } from '../navigation/Header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        toggleSidebar={toggleSidebar} 
        toggleMobileSidebar={toggleMobileSidebar}
        sidebarOpen={sidebarOpen}
        user={user}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div 
          className={cn(
            "hidden md:block transition-all duration-300 ease-in-out bg-card border-r",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <Sidebar collapsed={!sidebarOpen} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div 
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-card z-50 transition-transform duration-300 ease-in-out transform md:hidden",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <h2 className="text-lg font-bold">IntelliSync CMS</h2>
            <button onClick={() => setMobileSidebarOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <Sidebar collapsed={false} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-background">
          <ScrollArea className="h-full">
            <main className="container py-6">
              <Outlet />
            </main>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}