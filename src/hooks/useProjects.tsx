import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Project, ProjectStatus, Currency, ProjectType, ProjectCategory, LeadSource } from "@/types";
import { account, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to view projects");
        setIsLoading(false);
        return;
      }

      if (!session) {
        toast.error("You must be logged in to view projects");
        setIsLoading(false);
        return;
      }

      // Fetch clients
      const clientsResponse = await databases.listDocuments(DATABASE_ID, 'clients');
      const transformedClients = clientsResponse.documents.map((client: any) => ({
        id: client.$id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        leadSource: client.lead_source as LeadSource,
        createdAt: new Date(client.$createdAt)
      }));
      setClients(transformedClients);

      // Fetch team members
      try {
        const teamResponse = await databases.listDocuments(DATABASE_ID, 'team_members');
        const transformedTeamMembers = teamResponse.documents.map((member: any) => ({
          id: member.$id,
          name: member.name,
          position: member.position,
          startDate: new Date(member.start_date),
          skills: member.skills || [],
          createdAt: new Date(member.$createdAt)
        }));
        setTeamMembers(transformedTeamMembers);
      } catch (teamError) {
        console.error("Error fetching team members:", teamError);
      }

      // Fetch projects
      const projectsResponse = await databases.listDocuments(DATABASE_ID, 'projects');

      // For each project, fetch its payments
      const transformedProjects = await Promise.all(
        projectsResponse.documents.map(async (project: any) => {
          let payments: any[] = [];
          try {
            const paymentsResponse = await databases.listDocuments(
              DATABASE_ID,
              'payments',
              [Query.equal('project_id', project.$id)]
            );
            payments = paymentsResponse.documents.map((payment: any) => ({
              id: payment.$id,
              projectId: payment.project_id,
              paymentType: payment.payment_type,
              amount: payment.amount,
              date: new Date(payment.date),
              notes: payment.notes
            }));
          } catch {
            // No payments found, keep empty
          }

          return {
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
            payments: payments
          };
        })
      );

      setProjects(transformedProjects);
    } catch (error) {
      console.error("Error fetching projects data:", error);
      toast.error("Failed to load projects data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (data: any) => {
    try {
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to create a project");
        return;
      }

      if (!session) {
        toast.error("You must be logged in to create a project");
        return;
      }

      const status = data.status as ProjectStatus;
      const currency = data.currency as Currency;
      const projectType = data.projectType as ProjectType;
      const categories = data.categories as ProjectCategory[];

      const projectData = await databases.createDocument(DATABASE_ID, 'projects', ID.unique(), {
        name: data.name,
        client_id: data.clientId,
        status: status,
        deadline: data.deadline.toISOString(),
        fee: data.fee,
        currency: currency,
        project_type: projectType,
        categories: categories,
        team_members: data.teamMembers || [],
        user_id: session.userId
      });

      const newProject: Project = {
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
        payments: []
      };

      setProjects([newProject, ...projects]);
      toast.success("Project created successfully");
      return newProject;
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
      return null;
    }
  };

  const handleEditProject = async (data: any, projectId: string) => {
    try {
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to update a project");
        return null;
      }

      if (!session) {
        toast.error("You must be logged in to update a project");
        return null;
      }

      const status = data.status as ProjectStatus;
      const currency = data.currency as Currency;
      const projectType = data.projectType as ProjectType;
      const categories = data.categories as ProjectCategory[];

      await databases.updateDocument(DATABASE_ID, 'projects', projectId, {
        name: data.name,
        client_id: data.clientId,
        status: status,
        deadline: data.deadline.toISOString(),
        fee: data.fee,
        currency: currency,
        project_type: projectType,
        categories: categories,
        team_members: data.teamMembers || []
      });

      const updatedProjects = projects.map(project =>
        project.id === projectId ? {
          ...project,
          name: data.name,
          clientId: data.clientId,
          status: data.status as ProjectStatus,
          deadline: data.deadline,
          fee: data.fee,
          currency: data.currency as Currency,
          projectType: data.projectType as ProjectType,
          categories: data.categories as ProjectCategory[],
          teamMembers: data.teamMembers || []
        } : project
      );

      setProjects(updatedProjects);
      toast.success("Project updated successfully");
      return updatedProjects.find(p => p.id === projectId) || null;
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast.error(error.message || "Failed to update project");
      return null;
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to delete a project");
        return false;
      }

      if (!session) {
        toast.error("You must be logged in to delete a project");
        return false;
      }

      // Delete related payments first
      try {
        const paymentsResponse = await databases.listDocuments(
          DATABASE_ID,
          'payments',
          [Query.equal('project_id', id)]
        );
        await Promise.all(
          paymentsResponse.documents.map((payment: any) =>
            databases.deleteDocument(DATABASE_ID, 'payments', payment.$id)
          )
        );
      } catch (paymentsError) {
        console.error("Error deleting payments:", paymentsError);
        throw paymentsError;
      }

      await databases.deleteDocument(DATABASE_ID, 'projects', id);

      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      toast.success("Project deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
      return false;
    }
  };

  return {
    projects,
    clients,
    teamMembers,
    isLoading,
    handleAddProject,
    handleEditProject,
    handleDeleteProject
  };
};
