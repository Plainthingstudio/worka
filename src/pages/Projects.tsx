
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProjectForm from "@/components/ProjectForm";
import { Project, TeamMember, Client, ProjectStatus, Currency, ProjectType, ProjectCategory } from "@/types";
import ProjectsFilter from "@/components/projects/ProjectsFilter";
import ProjectsTable from "@/components/projects/ProjectsTable";
import ProjectsStats from "@/components/projects/ProjectsStats";
import DeleteConfirmationDialog from "@/components/projects/DeleteConfirmationDialog";
import { supabase } from "@/integrations/supabase/client";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("You must be logged in to view projects");
          setIsLoading(false);
          return;
        }
        
        // Fetch clients first
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*');
        
        if (clientsError) {
          console.error("Error fetching clients:", clientsError);
          throw clientsError;
        }
        
        // Transform clients data
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
        
        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*');
        
        if (teamError && teamError.code !== 'PGRST116') { // Ignore "relation does not exist" error
          console.error("Error fetching team members:", teamError);
        }
        
        if (teamData) {
          // Transform team members data
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
        
        // Fetch projects with payments
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*, payments(*)');
        
        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          throw projectsError;
        }
        
        // Transform projects data
        const transformedProjects = projectsData.map((project: any) => {
          // Transform payments
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
    }
    
    fetchData();
  }, []);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    return () => observer.disconnect();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) || 
                           clients.find(c => c.id === project.clientId)?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddProjectDialog = () => setIsAddingProject(true);
  const closeAddProjectDialog = () => setIsAddingProject(false);
  const openEditProjectDialog = (project: Project) => setEditingProject(project);
  const closeEditProjectDialog = () => setEditingProject(null);
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  const handleAddProject = async (data: any) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to create a project");
        return;
      }
      
      // Ensure types match what's expected
      const status = data.status as ProjectStatus;
      const currency = data.currency as Currency;
      const projectType = data.projectType as ProjectType;
      const categories = data.categories as ProjectCategory[];
      
      // Insert new project to Supabase
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
      
      // Create a new project object
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
      
      // Update local state
      setProjects([newProject, ...projects]);
      setIsAddingProject(false);
      toast.success("Project created successfully");
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
    }
  };

  const handleEditProject = async (data: any) => {
    if (!editingProject) return;
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to update a project");
        return;
      }
      
      // Ensure types match what's expected
      const status = data.status as ProjectStatus;
      const currency = data.currency as Currency;
      const projectType = data.projectType as ProjectType;
      const categories = data.categories as ProjectCategory[];
      
      // Update project in Supabase
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
        .eq('id', editingProject.id)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedProjects = projects.map(project => 
        project.id === editingProject.id ? {
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
      setEditingProject(null);
      toast.success("Project updated successfully");
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast.error(error.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete a project");
        return;
      }
      
      // First delete all payments associated with this project
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('project_id', id)
        .eq('user_id', session.user.id);
      
      if (paymentsError) {
        throw paymentsError;
      }
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      setIsDeleting(null);
      toast.success("Project deleted successfully");
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error(error.message || "Failed to delete project");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Projects" />
        <main className="container mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Projects
              </h1>
              <p className="text-muted-foreground">
                Track and manage all your client projects.
              </p>
            </div>
            <Button onClick={openAddProjectDialog} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            <>
              <ProjectsStats projects={projects} />

              <ProjectsFilter 
                search={search} 
                setSearch={setSearch} 
                statusFilter={statusFilter} 
                setStatusFilter={setStatusFilter} 
              />

              <div className="glass-card rounded-xl border shadow-sm animate-fade-in">
                <div className="overflow-x-auto p-4 py-[8px] px-[8px]">
                  <ProjectsTable 
                    projects={filteredProjects} 
                    clients={clients} 
                    onEdit={openEditProjectDialog} 
                    onDelete={openDeleteDialog} 
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {isAddingProject && (
        <Dialog open={isAddingProject} onOpenChange={closeAddProjectDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new project.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <ProjectForm 
                clients={clients} 
                teamMembers={teamMembers} 
                onSave={handleAddProject} 
                onCancel={closeAddProjectDialog} 
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={closeEditProjectDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Make changes to the project details.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <ProjectForm 
                project={editingProject} 
                clients={clients} 
                teamMembers={teamMembers} 
                onSave={handleEditProject} 
                onCancel={closeEditProjectDialog} 
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isDeleting && (
        <DeleteConfirmationDialog 
          isOpen={!!isDeleting} 
          onClose={closeDeleteDialog} 
          onConfirm={() => isDeleting && handleDeleteProject(isDeleting)} 
        />
      )}
    </div>
  );
};

export default Projects;
