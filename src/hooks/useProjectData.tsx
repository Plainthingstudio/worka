
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Project, Client, ProjectStatus, Currency, ProjectType, LeadSource } from "@/types";
import { databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";

export const useProjectData = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientData = useCallback(async (clientId: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'clients',
        [Query.equal('$id', clientId), Query.limit(1)]
      );
      const clientData = response.documents[0] ?? null;

      if (!clientData) {
        toast.error("Client information not available");
        return;
      }

      const transformedClient: Client = {
        id: clientData.$id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone || "",
        address: clientData.address || "",
        leadSource: clientData.lead_source as LeadSource || "Website",
        createdAt: new Date(clientData.$createdAt),
      };
      setClient(transformedClient);
    } catch (error) {
      console.error("Error fetching client details:", error);
      toast.error("Client information not available");
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

        // Fetch project
        let projectData: any = null;
        try {
          projectData = await databases.getDocument(DATABASE_ID, 'projects', projectId);
        } catch (e) {
          toast.error("Project not found");
          navigate("/projects");
          return;
        }

        if (!projectData) {
          toast.error("Project not found");
          navigate("/projects");
          return;
        }

        // Fetch payments for this project
        let payments: any[] = [];
        try {
          const paymentsResponse = await databases.listDocuments(
            DATABASE_ID,
            'payments',
            [Query.equal('project_id', projectId)]
          );
          payments = paymentsResponse.documents.map((payment: any) => ({
            id: payment.$id,
            projectId: payment.project_id,
            amount: payment.amount,
            date: new Date(payment.date),
            paymentType: payment.payment_type,
            notes: payment.notes || "",
          }));
        } catch (e) {
          // no payments
        }

        // Transform project data
        const transformedProject: Project = {
          id: projectData.$id,
          name: projectData.name,
          clientId: projectData.client_id,
          status: projectData.status as ProjectStatus,
          deadline: new Date(projectData.deadline),
          fee: projectData.fee,
          currency: projectData.currency as Currency,
          projectType: projectData.project_type as ProjectType,
          categories: projectData.categories || [],
          teamMembers: projectData.team_members || [],
          createdAt: new Date(projectData.$createdAt),
          payments: payments,
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
