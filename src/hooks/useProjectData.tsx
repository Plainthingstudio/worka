
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Project, Client, ProjectStatus, Currency, ProjectType, LeadSource } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useProjectData = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientData = useCallback(async (clientId: string) => {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        console.error("Error fetching client:", clientError);
        toast.error("Client information not available");
        return;
      }
      
      if (clientData) {
        const transformedClient: Client = {
          id: clientData.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone || "",
          address: clientData.address || "",
          leadSource: clientData.lead_source as LeadSource || "Website",
          createdAt: new Date(clientData.created_at),
        };
        setClient(transformedClient);
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*, payments(*)')
          .eq('id', projectId)
          .single();
        
        if (projectError) {
          console.error("Error fetching project:", projectError);
          toast.error("Project not found");
          navigate("/projects");
          return;
        }
        
        if (!projectData) {
          toast.error("Project not found");
          navigate("/projects");
          return;
        }
        
        // Transform project data
        const transformedProject: Project = {
          id: projectData.id,
          name: projectData.name,
          clientId: projectData.client_id,
          status: projectData.status as ProjectStatus,
          deadline: new Date(projectData.deadline),
          fee: projectData.fee,
          currency: projectData.currency as Currency,
          projectType: projectData.project_type as ProjectType,
          categories: projectData.categories || [],
          teamMembers: projectData.team_members || [],
          createdAt: new Date(projectData.created_at),
          payments: projectData.payments.map((payment: any) => ({
            id: payment.id,
            projectId: payment.project_id,
            amount: payment.amount,
            date: new Date(payment.date),
            paymentType: payment.payment_type,
            notes: payment.notes || "",
          })),
        };
        
        setProject(transformedProject);
        
        // Fetch client data
        if (projectData.client_id) {
          await fetchClientData(projectData.client_id);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast.error("Failed to load project details");
        navigate("/projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, navigate, fetchClientData]);

  return { 
    project, 
    setProject, 
    client, 
    isLoading,
    refetchClient: () => project?.clientId ? fetchClientData(project.clientId) : null 
  };
};
