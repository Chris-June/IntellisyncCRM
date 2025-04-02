import React, { createContext, useContext, useState } from 'react';
import { Project, Task, Milestone } from '@/types/project';
import { toast } from 'sonner';
import { projectService } from '@/services/project-service';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  loadProjects: (clientId: string) => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createProject: (
    clientId: string,
    opportunityId: string,
    name: string,
    scope: any
  ) => Promise<Project>;
  updateProject: (
    projectId: string, 
    updates: Partial<Project>
  ) => Promise<Project>;
  addTask: (
    projectId: string,
    taskData: {
      title: string;
      description: string;
      assignedTo: string;
      deadline: Date;
      priority: string;
      estimatedHours: number;
      dependencies?: string[];
    }
  ) => Promise<Task>;
  updateTaskStatus: (
    taskId: string,
    status: string,
    progress?: number,
    actualHours?: number
  ) => Promise<Task>;
  addMilestone: (
    projectId: string,
    milestoneData: {
      title: string;
      description: string;
      dueDate: Date;
      deliverables: string[];
      dependencies?: string[];
    }
  ) => Promise<Milestone>;
  updateMilestoneStatus: (
    milestoneId: string,
    status: string
  ) => Promise<Milestone>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load all projects for a client
  const loadProjects = async (clientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getClientProjects(clientId);
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
      toast.error(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Load a specific project
  const loadProject = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjectDetails(projectId);
      setCurrentProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
      toast.error(err.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new project
  const createProject = async (
    clientId: string,
    opportunityId: string,
    name: string,
    scope: any
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const newProject = await projectService.createProject(
        clientId,
        opportunityId,
        name,
        scope
      );
      setProjects((prev) => [...prev, newProject]);
      toast.success('Project created successfully');
      return newProject;
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      toast.error(err.message || 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a project
  const updateProject = async (
    projectId: string,
    updates: Partial<Project>
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedProject = await projectService.updateProject(projectId, updates);
      
      // Update projects list
      setProjects((prev) => 
        prev.map((project) => (project.id === projectId ? updatedProject : project))
      );
      
      // Update currentProject if it's the one being updated
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Project updated successfully');
      return updatedProject;
    } catch (err: any) {
      setError(err.message || 'Failed to update project');
      toast.error(err.message || 'Failed to update project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a task to a project
  const addTask = async (
    projectId: string,
    taskData: {
      title: string;
      description: string;
      assignedTo: string;
      deadline: Date;
      priority: string;
      estimatedHours: number;
      dependencies?: string[];
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await projectService.addProjectTask(
        projectId,
        taskData.title,
        taskData.description,
        taskData.assignedTo,
        taskData.deadline,
        taskData.priority,
        taskData.estimatedHours,
        taskData.dependencies
      );
      
      // Update current project if it's the right one
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          tasks: [...currentProject.tasks, newTask]
        });
      }
      
      toast.success('Task added successfully');
      return newTask;
    } catch (err: any) {
      setError(err.message || 'Failed to add task');
      toast.error(err.message || 'Failed to add task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (
    taskId: string,
    status: string,
    progress?: number,
    actualHours?: number
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await projectService.updateTaskStatus(
        taskId,
        status,
        progress,
        actualHours
      );
      
      // Update current project if we have it loaded
      if (currentProject) {
        setCurrentProject({
          ...currentProject,
          tasks: currentProject.tasks.map((task) => 
            task.id === taskId ? updatedTask : task
          )
        });
      }
      
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      toast.error(err.message || 'Failed to update task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a milestone to a project
  const addMilestone = async (
    projectId: string,
    milestoneData: {
      title: string;
      description: string;
      dueDate: Date;
      deliverables: string[];
      dependencies?: string[];
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMilestone = await projectService.addProjectMilestone(
        projectId,
        milestoneData.title,
        milestoneData.description,
        milestoneData.dueDate,
        milestoneData.deliverables,
        milestoneData.dependencies
      );
      
      // Update current project if it's the right one
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          milestones: [...currentProject.milestones, newMilestone]
        });
      }
      
      toast.success('Milestone added successfully');
      return newMilestone;
    } catch (err: any) {
      setError(err.message || 'Failed to add milestone');
      toast.error(err.message || 'Failed to add milestone');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update milestone status
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedMilestone = await projectService.updateMilestoneStatus(
        milestoneId,
        status
      );
      
      // Update current project if we have it loaded
      if (currentProject) {
        setCurrentProject({
          ...currentProject,
          milestones: currentProject.milestones.map((milestone) => 
            milestone.id === milestoneId ? updatedMilestone : milestone
          )
        });
      }
      
      toast.success('Milestone updated successfully');
      return updatedMilestone;
    } catch (err: any) {
      setError(err.message || 'Failed to update milestone');
      toast.error(err.message || 'Failed to update milestone');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    projects,
    currentProject,
    isLoading,
    error,
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    addTask,
    updateTaskStatus,
    addMilestone,
    updateMilestoneStatus,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}