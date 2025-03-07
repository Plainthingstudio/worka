import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Project, ProjectStatus, Currency, ProjectType, ProjectCategory, LeadSource } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to view projects");
        setIsLoading(false);
        return;
      }
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');
      
      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        throw clientsError;
      }
      
      const transformedClients = clientsData.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        leadSource: client.lead_source as LeadSource,
        createdAt: new Date(client.created_at)
      }));
      
      setClients(transformedClients);
      
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*');
      
      if (teamError && teamError.code !== 'PGRST116') {
        console.error("Error fetching team members:", teamError);
      }
      
      if (teamData) {
        const transformedTeamMembers = teamData.map((member: any) => ({
          id: member.id,
          name: member.name,
          position: member.position,
          startDate: new Date(member.start_date),
          skills: member.skills || [],
          createdAt: new Date(member.created_at)
        }));
        
        setTeamMembers(transformedTeamMembers);
      }
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*, payments(*)');
      
      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        throw projectsError;
      }
      
      const transformedProjects = projectsData.map((project: any) => {
        const payments = Array.isArray(project.payments) ? project.payments.map((payment: any) => ({
          id: payment.id,
          projectId: payment.project_id,
          paymentType: payment.payment_type,
          amount: payment.amount,
          date: new Date(payment.date),
          notes: payment.notes
        })) : [];
        
        return {
          id: project.id,
          name: project.name,
          clientId: project.client_id,
          status: project.status as ProjectStatus,
          deadline: new Date(project.deadline),
          fee: project.fee,
          currency: project.currency as Currency,
          projectType: project.project_type as ProjectType,
          categories: project.categories as ProjectCategory[],
          teamMembers: project.team_members || [],
          createdAt: new Date(project.created_at),
          payments: payments
        };
      });
      
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to create a project");
        return;
      }
      
      const status = data.status as ProjectStatus;
      const currency = data.currency as Currency;
      const projectType = data.projectType as ProjectType;
      const categories = data.categories as ProjectCategory[];
      
      const { data: projectData, error } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          client_id: data.clientId,
          status: status,
          deadline: data.deadline.toISOString(),
          fee: data.fee,
          currency: currency,
          project_type: projectType,
          categories: categories,
          team_members: data.teamMembers || [],
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const newProject: Project = {
        id: projectData.id,
        name: projectData.name,
        clientId: projectData.client_id,
        status: projectData.status as ProjectStatus,
        deadline: new Date(projectData.deadline),
        fee: projectData.fee,
        currency: projectData.currency as Currency,
        projectType: projectData.project_type as ProjectType,
        categories: projectData.categories as ProjectCategory[],
        teamMembers: projectData.team_members || [],
        createdAt: new Date(projectData.created_at),
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to update a project");
        return null;
      }
      
      const status = data.status as ProjectStatus;
      const currency = data.currency as Currency;
      const projectType = data.projectType as ProjectType;
      const categories = data.categories as ProjectCategory[];
      
      const { error } = await supabase
        .from('projects')
        .update({
          name: data.name,
          client_id: data.clientId,
          status: status,
          deadline: data.deadline.toISOString(),
          fee: data.fee,
          currency: currency,
          project_type: projectType,
          categories: categories,
          team_members: data.teamMembers || []
        })
        .eq('id', projectId)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete a project");
        return false;
      }
      
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('project_id', id)
        .eq('user_id', session.user.id);
      
      if (paymentsError) {
        throw paymentsError;
      }
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
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
