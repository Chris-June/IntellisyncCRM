import React, { createContext, useContext, useState } from 'react';
import { Client } from '@/types/client';
import { toast } from 'sonner';
import { clientService } from '@/services/client-service';

interface ClientContextType {
  clients: Client[];
  currentClient: Client | null;
  isLoading: boolean;
  error: string | null;
  loadClients: () => Promise<void>;
  loadClient: (clientId: string) => Promise<void>;
  createClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'status'>) => Promise<Client>;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<Client>;
  startIntakeSession: (clientId: string, initialResponses?: Record<string, any>) => Promise<any>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load all clients
  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
      toast.error(err.message || 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  // Load a specific client
  const loadClient = async (clientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.getClient(clientId);
      setCurrentClient(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load client');
      toast.error(err.message || 'Failed to load client');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new client
  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'tags' | 'status'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newClient = await clientService.createClient(clientData);
      setClients((prev) => [...prev, newClient]);
      toast.success('Client created successfully');
      return newClient;
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
      toast.error(err.message || 'Failed to create client');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a client
  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedClient = await clientService.updateClient(clientId, updates);
      
      // Update the clients list
      setClients((prev) => 
        prev.map((client) => (client.id === clientId ? updatedClient : client))
      );
      
      // Update currentClient if it's the one being updated
      if (currentClient && currentClient.id === clientId) {
        setCurrentClient(updatedClient);
      }
      
      toast.success('Client updated successfully');
      return updatedClient;
    } catch (err: any) {
      setError(err.message || 'Failed to update client');
      toast.error(err.message || 'Failed to update client');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Start an intake session
  const startIntakeSession = async (clientId: string, initialResponses?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await clientService.startIntakeSession(clientId, initialResponses);
      toast.success('Intake session started');
      return session;
    } catch (err: any) {
      setError(err.message || 'Failed to start intake session');
      toast.error(err.message || 'Failed to start intake session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    clients,
    currentClient,
    isLoading,
    error,
    loadClients,
    loadClient,
    createClient,
    updateClient,
    startIntakeSession,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}