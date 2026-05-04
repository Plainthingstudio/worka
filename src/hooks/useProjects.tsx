import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Project, ProjectStatus, Currency, ProjectType, ProjectCategory, LeadSource } from "@/types";
import { account, client, databases, DATABASE_ID, ID } from "@/integrations/appwrite/client";

interface ProjectsData {
  projects: Project[];
  clients: any[];
  teamMembers: any[];
}

const PROJECTS_REALTIME_COLLECTIONS = [
  "projects",
  "payments",
  "clients",
  "team_members",
];

export const projectsQueryKey = ["projects"] as const;

const fetchProjectsData = async (): Promise<ProjectsData> => {
  const [clientsResponse, teamResponse, projectsResponse, paymentsResponse] = await Promise.all([
    databases.listDocuments(DATABASE_ID, "clients"),
    databases.listDocuments(DATABASE_ID, "team_members"),
    databases.listDocuments(DATABASE_ID, "projects"),
    databases.listDocuments(DATABASE_ID, "payments"),
  ]);

  const clients = clientsResponse.documents.map((c: any) => ({
    id: c.$id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    leadSource: c.lead_source as LeadSource,
    createdAt: new Date(c.$createdAt),
  }));

  const teamMembers = teamResponse.documents.map((member: any) => ({
    id: member.$id,
    name: member.name,
    position: member.position,
    startDate: new Date(member.start_date),
    skills: member.skills || [],
    createdAt: new Date(member.$createdAt),
  }));

  const paymentsByProject = new Map<string, any[]>();
  paymentsResponse.documents.forEach((payment: any) => {
    const list = paymentsByProject.get(payment.project_id) || [];
    list.push({
      id: payment.$id,
      projectId: payment.project_id,
      paymentType: payment.payment_type,
      amount: payment.amount,
      date: new Date(payment.date),
      notes: payment.notes,
    });
    paymentsByProject.set(payment.project_id, list);
  });

  const projects: Project[] = projectsResponse.documents.map((project: any) => ({
    id: project.$id,
    name: project.name,
    clientId: project.client_id,
    status: project.status as ProjectStatus,
    deadline: new Date(project.deadline),
    fee: project.fee,
    currency: project.currency as Currency,
    projectType: project.project_type as ProjectType,
    categories: project.categories as ProjectCategory[],
    teamMembers: project.team_members || [],
    createdAt: new Date(project.$createdAt),
    payments: paymentsByProject.get(project.$id) || [],
  }));

  return { projects, clients, teamMembers };
};

export const useProjects = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjectsData,
  });

  const projects = data?.projects ?? [];
  const clients = data?.clients ?? [];
  const teamMembers = data?.teamMembers ?? [];

  useEffect(() => {
    const channels = PROJECTS_REALTIME_COLLECTIONS.map(
      (collection) => `databases.${DATABASE_ID}.collections.${collection}.documents`
    );

    const unsubscribe = client.subscribe(channels, () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    });

    return () => unsubscribe();
  }, [queryClient]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: projectsQueryKey });

  const handleAddProject = async (data: any) => {
    try {
      const session = await account.getSession("current");
      if (!session) {
        toast.error("You must be logged in to create a project");
        return null;
      }

      const projectData = await databases.createDocument(DATABASE_ID, "projects", ID.unique(), {
        name: data.name,
        client_id: data.clientId,
        status: data.status,
        deadline: data.deadline.toISOString(),
        fee: data.fee,
        currency: data.currency,
        project_type: data.projectType,
        categories: data.categories,
        team_members: data.teamMembers || [],
        user_id: session.userId,
      });

      toast.success("Project created successfully");
      invalidate();

      return {
        id: projectData.$id,
        name: projectData.name,
        clientId: projectData.client_id,
        status: projectData.status as ProjectStatus,
        deadline: new Date(projectData.deadline),
        fee: projectData.fee,
        currency: projectData.currency as Currency,
        projectType: projectData.project_type as ProjectType,
        categories: projectData.categories as ProjectCategory[],
        teamMembers: projectData.team_members || [],
        createdAt: new Date(projectData.$createdAt),
        payments: [],
      } satisfies Project;
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
      return null;
    }
  };

  const handleEditProject = async (data: any, projectId: string) => {
    try {
      await databases.updateDocument(DATABASE_ID, "projects", projectId, {
        name: data.name,
        client_id: data.clientId,
        status: data.status,
        deadline: data.deadline.toISOString(),
        fee: data.fee,
        currency: data.currency,
        project_type: data.projectType,
        categories: data.categories,
        team_members: data.teamMembers || [],
      });

      toast.success("Project updated successfully");
      invalidate();
      return projects.find((p) => p.id === projectId) || null;
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast.error(error.message || "Failed to update project");
      return null;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const paymentsResponse = await databases.listDocuments(DATABASE_ID, "payments", []);
      const relatedPayments = paymentsResponse.documents.filter(
        (p: any) => p.project_id === id
      );

      await Promise.all(
        relatedPayments.map((payment: any) =>
          databases.deleteDocument(DATABASE_ID, "payments", payment.$id)
        )
      );

      await databases.deleteDocument(DATABASE_ID, "projects", id);

      toast.success("Project deleted successfully");
      invalidate();
      return true;
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
      return false;
    }
  };

  const handleInlineUpdate = async (
    projectId: string,
    fields: {
      name?: string;
      clientId?: string;
      status?: ProjectStatus;
      deadline?: Date;
      fee?: number;
      currency?: Currency;
      projectType?: ProjectType;
      categories?: ProjectCategory[];
      teamMembers?: string[];
    }
  ) => {
    try {
      const updateData: Record<string, any> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.clientId !== undefined) updateData.client_id = fields.clientId;
      if (fields.status !== undefined) updateData.status = fields.status;
      if (fields.deadline !== undefined) updateData.deadline = fields.deadline.toISOString();
      if (fields.fee !== undefined) updateData.fee = fields.fee;
      if (fields.currency !== undefined) updateData.currency = fields.currency;
      if (fields.projectType !== undefined) updateData.project_type = fields.projectType;
      if (fields.categories !== undefined) updateData.categories = fields.categories;
      if (fields.teamMembers !== undefined) updateData.team_members = fields.teamMembers;

      queryClient.setQueryData<ProjectsData>(projectsQueryKey, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === projectId ? { ...p, ...fields } : p
          ),
        };
      });

      await databases.updateDocument(DATABASE_ID, "projects", projectId, updateData);
      invalidate();
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast.error(error.message || "Failed to update project");
      invalidate();
    }
  };

  return {
    projects,
    clients,
    teamMembers,
    isLoading,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    handleInlineUpdate,
  };
};
