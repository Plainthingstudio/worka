import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Project, Client, ProjectStatus, Currency, ProjectType, LeadSource, ProjectInvoicePayment } from "@/types";
import { client as appwriteClient, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { mapInvoiceDocumentToProjectPayment } from "@/utils/invoiceTypes";

interface ProjectDetailsData {
  project: Project;
  client: Client | null;
}

export const projectDetailsQueryKey = (projectId: string | undefined) =>
  ["projectDetails", projectId] as const;

const fetchProjectDetails = async (projectId: string): Promise<ProjectDetailsData> => {
  const projectData = await databases.getDocument(DATABASE_ID, "projects", projectId);

  let invoicePayments: ProjectInvoicePayment[] = [];
  try {
    const invoicesResponse = await databases.listDocuments(DATABASE_ID, "invoices", [
      Query.equal("project_id", projectId),
    ]);
    invoicePayments = invoicesResponse.documents
      .map(mapInvoiceDocumentToProjectPayment)
      .filter((payment): payment is ProjectInvoicePayment => Boolean(payment));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "");
    if (!message.includes("Unknown attribute")) {
      throw error;
    }
  }

  const project: Project = {
    id: projectData.$id,
    name: projectData.name,
    clientId: projectData.client_id,
    status: projectData.status as ProjectStatus,
    deadline: new Date(projectData.deadline),
    fee: projectData.fee,
    currency: projectData.currency as Currency,
    projectType: projectData.project_type as ProjectType,
    serviceIds: projectData.service_ids || [],
    subServiceIds: projectData.sub_service_ids || [],
    serviceQuantities: projectData.service_quantities || [],
    subServiceQuantities: projectData.sub_service_quantities || [],
    teamMembers: projectData.team_members || [],
    createdAt: new Date(projectData.$createdAt),
    payments: [],
    invoicePayments,
  };

  let clientData: Client | null = null;
  if (projectData.client_id) {
    try {
      const fetchedClient = await databases.getDocument(DATABASE_ID, "clients", projectData.client_id);
      clientData = {
        id: fetchedClient.$id,
        name: fetchedClient.name,
        email: fetchedClient.email,
        phone: fetchedClient.phone || "",
        address: fetchedClient.address || "",
        leadSource: (fetchedClient.lead_source as LeadSource) || "Website",
        createdAt: new Date(fetchedClient.$createdAt),
      };
    } catch {
      toast.error("Client information not available");
    }
  }

  return { project, client: clientData };
};

export const useProjectData = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const queryKey = projectDetailsQueryKey(projectId);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchProjectDetails(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (error) {
      toast.error("Project not found");
      navigate("/projects");
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!projectId) return;

    const channels = [
      `databases.${DATABASE_ID}.collections.projects.documents.${projectId}`,
      `databases.${DATABASE_ID}.collections.invoices.documents`,
      `databases.${DATABASE_ID}.collections.clients.documents`,
    ];

    const unsubscribe = appwriteClient.subscribe(channels, () => {
      queryClient.invalidateQueries({ queryKey });
    });

    return () => unsubscribe();
  }, [projectId, queryClient]);

  const setProject = (newProject: Project) => {
    queryClient.setQueryData<ProjectDetailsData>(queryKey, (prev) =>
      prev ? { ...prev, project: newProject } : { project: newProject, client: null }
    );
  };

  const refetchClient = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    project: data?.project ?? null,
    setProject,
    client: data?.client ?? null,
    isLoading,
    refetchClient,
  };
};
