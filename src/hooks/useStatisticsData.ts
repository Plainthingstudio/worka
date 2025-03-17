
import { useState, useEffect } from 'react';
import { Client, Project } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStatisticsData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (clientsError) {
        throw new Error(`Error fetching clients: ${clientsError.message}`);
      }
      
      // Transform client data to match our Client type
      const transformedClients: Client[] = (clientsData || []).map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        address: client.address || '',
        leadSource: client.lead_source as any || 'Website',
        createdAt: new Date(client.created_at)
      }));
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*, payments(*)');
      
      if (projectsError) {
        throw new Error(`Error fetching projects: ${projectsError.message}`);
      }
      
      // Transform projects data to match our Project type
      const transformedProjects: Project[] = (projectsData || []).map(project => {
        // Transform payments
        const payments = project.payments ? project.payments.map((payment: any) => ({
          id: payment.id,
          projectId: payment.project_id,
          paymentType: payment.payment_type as any,
          amount: payment.amount,
          date: new Date(payment.date),
          notes: payment.notes || ''
        })) : [];
        
        return {
          id: project.id,
          name: project.name,
          clientId: project.client_id,
          status: project.status as any,
          deadline: new Date(project.deadline),
          fee: project.fee,
          currency: project.currency as any,
          projectType: project.project_type as any,
          categories: project.categories || ['Other'],
          createdAt: new Date(project.created_at),
          payments: payments
        };
      });
      
      setClients(transformedClients);
      setProjects(transformedProjects);
    } catch (error: any) {
      console.error("Error fetching statistics data:", error);
      setError(error.message);
      toast.error("Failed to load statistics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    clients,
    projects,
    isLoading,
    error,
    fetchData
  };
};
