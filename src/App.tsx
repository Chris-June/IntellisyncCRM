import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/auth-context';
import { ClientProvider } from './context/client-context';
import { ProjectProvider } from './context/project-context';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientDetails from './pages/clients/ClientDetails';
import ClientIntake from './pages/clients/ClientIntake';
import LeadList from './pages/sales/LeadList';
import LeadDetails from './pages/sales/LeadDetails';
import OpportunityView from './pages/sales/OpportunityView';
import ProposalGenerator from './pages/sales/ProposalGenerator';
import ContractBuilder from './pages/sales/ContractBuilder';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetails from './pages/projects/ProjectDetails';
import TaskBoard from './pages/projects/TaskBoard';
import MilestoneTracker from './pages/projects/MilestoneTracker';
import DeliverableReview from './pages/projects/DeliverableReview';
import FileManager from './pages/resources/FileManager';
import MeetingNotes from './pages/resources/MeetingNotes';
import Templates from './pages/resources/Templates';
import Settings from './pages/settings/Settings';

// Error Pages
import NotFound from './pages/error/NotFound';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="intellisync-theme">
      <AuthProvider>
        <ClientProvider>
          <ProjectProvider>
            <Router>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
                
                {/* Dashboard Routes */}
                <Route 
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  
                  {/* Client Routes */}
                  <Route path="clients" element={<ClientList />} />
                  <Route path="clients/:clientId" element={<ClientDetails />} />
                  <Route path="clients/intake" element={<ClientIntake />} />
                  
                  {/* Sales Routes */}
                  <Route path="sales/leads" element={<LeadList />} />
                  <Route path="sales/leads/:leadId" element={<LeadDetails />} />
                  <Route path="sales/opportunities/:opportunityId" element={<OpportunityView />} />
                  <Route path="sales/proposals/generate" element={<ProposalGenerator />} />
                  <Route path="sales/contracts/build" element={<ContractBuilder />} />
                  
                  {/* Project Routes */}
                  <Route path="projects" element={<ProjectList />} />
                  <Route path="projects/:projectId" element={<ProjectDetails />} />
                  <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
                  <Route path="projects/:projectId/milestones" element={<MilestoneTracker />} />
                  <Route path="projects/:projectId/deliverables" element={<DeliverableReview />} />
                  
                  {/* Resource Routes */}
                  <Route path="resources/files" element={<FileManager />} />
                  <Route path="resources/meeting-notes" element={<MeetingNotes />} />
                  <Route path="resources/templates" element={<Templates />} />
                  
                  {/* Settings Route */}
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster position="top-right" />
          </ProjectProvider>
        </ClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;