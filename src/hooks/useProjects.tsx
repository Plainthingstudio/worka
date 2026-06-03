import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Project, ProjectStatus, Currency, ProjectType, LeadSource } from "@/types";
import { account, client, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";
import { getAvatarUrl } from "@/lib/avatars";
import {
  getCurrentUserId,
  notifyProjectAssigneeChanges,
  notifyProjectFollowers,
} from "@/services/notificationService";

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

const APPWRITE_PAGE_SIZE = 100;

const fetchAllDocuments = async (collectionId: string, queries: string[] = []) => {
  const documents: any[] = [];
  let offset = 0;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      ...queries,
      Query.limit(APPWRITE_PAGE_SIZE),
      Query.offset(offset),
    ]);

    documents.push(...response.documents);

    if (response.documents.length < APPWRITE_PAGE_SIZE) {
      return documents;
    }

    offset += APPWRITE_PAGE_SIZE;
  }
};

const fetchProjectsData = async (): Promise<ProjectsData> => {
  const [clientDocuments, teamDocuments, projectDocuments, paymentDocuments, profileDocuments] = await Promise.all([
    fetchAllDocuments("clients"),
    fetchAllDocuments("team_members"),
    fetchAllDocuments("projects"),
    fetchAllDocuments("payments"),
    fetchAllDocuments("profiles"),
  ]);

  const profilesMap = new Map<string, any>();
  profileDocuments.forEach((profile: any) => {
    profilesMap.set(profile.$id, profile);
  });

  const clients = clientDocuments.map((c: any) => ({
    id: c.$id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    leadSource: c.lead_source as LeadSource,
    createdAt: new Date(c.$createdAt),
  }));

  const teamMembers = teamDocuments.map((member: any) => {
    const profile = profilesMap.get(member.user_id);

    return {
      id: member.$id,
      user_id: member.user_id,
      name: member.name,
      position: member.position,
      startDate: new Date(member.start_date),
      skills: member.skills || [],
      createdAt: new Date(member.$createdAt),
      email: profile?.email || undefined,
      avatarFileId: profile?.avatar_file_id || undefined,
      avatarUpdatedAt: profile?.avatar_updated_at || undefined,
      avatarUrl: getAvatarUrl(profile?.avatar_file_id, profile?.avatar_updated_at),
    };
  });

  const paymentsByProject = new Map<string, any[]>();
  paymentDocuments.forEach((payment: any) => {
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

  const projects: Project[] = projectDocuments.map((project: any) => ({
    id: project.$id,
    user_id: project.user_id,
    name: project.name,
    clientId: project.client_id,
    status: project.status as ProjectStatus,
    deadline: new Date(project.deadline),
    fee: project.fee,
    currency: project.currency as Currency,
    projectType: project.project_type as ProjectType,
    serviceIds: project.service_ids || [],
    subServiceIds: project.sub_service_ids || [],
    serviceQuantities: project.service_quantities || [],
    subServiceQuantities: project.sub_service_quantities || [],
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
        service_ids: data.serviceIds || [],
        sub_service_ids: data.subServiceIds || [],
        service_quantities: data.serviceQuantities || [],
        sub_service_quantities: data.subServiceQuantities || [],
        team_members: data.teamMembers || [],
        user_id: session.userId,
      });
      await notifyProjectAssigneeChanges({
        project: projectData,
        addedTeamMemberIds: data.teamMembers || [],
        removedTeamMemberIds: [],
        actorId: session.userId,
      });

      toast.success("Project created successfully");
      invalidate();

      return {
        id: projectData.$id,
        user_id: projectData.user_id,
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
      } satisfies Project;
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
      return null;
    }
  };

  const handleEditProject = async (data: any, projectId: string) => {
    try {
      const currentProject = projects.find((p) => p.id === projectId);
      const actorId = await getCurrentUserId();
      await databases.updateDocument(DATABASE_ID, "projects", projectId, {
        name: data.name,
        client_id: data.clientId,
        status: data.status,
        deadline: data.deadline.toISOString(),
        fee: data.fee,
        currency: data.currency,
        project_type: data.projectType,
        service_ids: data.serviceIds || [],
        sub_service_ids: data.subServiceIds || [],
        service_quantities: data.serviceQuantities || [],
        sub_service_quantities: data.subServiceQuantities || [],
        team_members: data.teamMembers || [],
      });
      if (currentProject) {
        const oldTeamMembers = currentProject.teamMembers || [];
        const newTeamMembers = data.teamMembers || [];
        await notifyProjectAssigneeChanges({
          project: projectId,
          addedTeamMemberIds: newTeamMembers.filter((id: string) => !oldTeamMembers.includes(id)),
          removedTeamMemberIds: oldTeamMembers.filter((id: string) => !newTeamMembers.includes(id)),
          actorId,
        });

        if (data.status !== currentProject.status) {
          await notifyProjectFollowers({
            project: projectId,
            type: "project_status_changed",
            title: "Project status updated",
            message: `Project "${currentProject.name}" status changed to ${data.status}`,
            actorId,
            data: { old_status: currentProject.status, new_status: data.status },
          });
        }

        if (data.deadline?.getTime?.() !== currentProject.deadline?.getTime?.()) {
          await notifyProjectFollowers({
            project: projectId,
            type: "project_deadline_changed",
            title: "Project deadline updated",
            message: `Project "${currentProject.name}" deadline was updated`,
            actorId,
            data: {
              old_deadline: currentProject.deadline?.toISOString?.(),
              new_deadline: data.deadline?.toISOString?.(),
            },
          });
        }
      }

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
      const paymentDocuments = await fetchAllDocuments("payments");
      const relatedPayments = paymentDocuments.filter(
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
      serviceIds?: string[];
      subServiceIds?: string[];
      serviceQuantities?: number[];
      subServiceQuantities?: number[];
      teamMembers?: string[];
    }
  ) => {
    try {
      const currentProject = projects.find((p) => p.id === projectId);
      const actorId = await getCurrentUserId();
      const updateData: Record<string, any> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.clientId !== undefined) updateData.client_id = fields.clientId;
      if (fields.status !== undefined) updateData.status = fields.status;
      if (fields.deadline !== undefined) updateData.deadline = fields.deadline.toISOString();
      if (fields.fee !== undefined) updateData.fee = fields.fee;
      if (fields.currency !== undefined) updateData.currency = fields.currency;
      if (fields.projectType !== undefined) updateData.project_type = fields.projectType;
      if (fields.serviceIds !== undefined) updateData.service_ids = fields.serviceIds;
      if (fields.subServiceIds !== undefined) updateData.sub_service_ids = fields.subServiceIds;
      if (fields.serviceQuantities !== undefined) updateData.service_quantities = fields.serviceQuantities;
      if (fields.subServiceQuantities !== undefined) updateData.sub_service_quantities = fields.subServiceQuantities;
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
      if (currentProject) {
        if (fields.teamMembers !== undefined) {
          const oldTeamMembers = currentProject.teamMembers || [];
          const newTeamMembers = fields.teamMembers || [];
          await notifyProjectAssigneeChanges({
            project: projectId,
            addedTeamMemberIds: newTeamMembers.filter((id) => !oldTeamMembers.includes(id)),
            removedTeamMemberIds: oldTeamMembers.filter((id) => !newTeamMembers.includes(id)),
            actorId,
          });
        }

        if (fields.status !== undefined && fields.status !== currentProject.status) {
          await notifyProjectFollowers({
            project: projectId,
            type: "project_status_changed",
            title: "Project status updated",
            message: `Project "${currentProject.name}" status changed to ${fields.status}`,
            actorId,
            data: { old_status: currentProject.status, new_status: fields.status },
          });
        }

        if (fields.deadline !== undefined && fields.deadline.getTime() !== currentProject.deadline.getTime()) {
          await notifyProjectFollowers({
            project: projectId,
            type: "project_deadline_changed",
            title: "Project deadline updated",
            message: `Project "${currentProject.name}" deadline was updated`,
            actorId,
            data: {
              old_deadline: currentProject.deadline.toISOString(),
              new_deadline: fields.deadline.toISOString(),
            },
          });
        }
      }
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
