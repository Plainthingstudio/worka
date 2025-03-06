import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProjectForm from "@/components/ProjectForm";
import { Project, ProjectCategory } from "@/types";
import ProjectsFilter from "@/components/projects/ProjectsFilter";
import ProjectsTable from "@/components/projects/ProjectsTable";
import DeleteConfirmationDialog from "@/components/projects/DeleteConfirmationDialog";

// Import clients and projects from the centralized mockData
import { clients, projects as mockProjects } from "@/mockData";
const Projects = () => {
  // Initialize state with the mockProjects but keep track of the reference to mockProjects
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

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
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) || clients.find(c => c.id === project.clientId)?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const openAddProjectDialog = () => setIsAddingProject(true);
  const closeAddProjectDialog = () => setIsAddingProject(false);
  const openEditProjectDialog = (project: Project) => setEditingProject(project);
  const closeEditProjectDialog = () => setEditingProject(null);
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);
  const handleAddProject = (data: any) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: data.name,
      clientId: data.clientId,
      status: data.status,
      deadline: data.deadline,
      fee: data.fee,
      currency: data.currency,
      projectType: data.projectType,
      categories: data.categories || [],
      payments: [],
      createdAt: new Date()
    };

    // Update both local state and the central mockData
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);

    // Update the original array to make it available globally
    mockProjects.length = 0; // Clear the array
    mockProjects.push(...updatedProjects); // Add all projects back

    setIsAddingProject(false);
    toast.success("Project created successfully");
  };
  const handleEditProject = (data: any) => {
    if (!editingProject) return;
    const updatedProjects = projects.map(project => project.id === editingProject.id ? {
      ...project,
      ...data
    } : project);

    // Update both local state and the central mockData
    setProjects(updatedProjects);

    // Update the original array to make it available globally
    mockProjects.length = 0;
    mockProjects.push(...updatedProjects);
    setEditingProject(null);
    toast.success("Project updated successfully");
  };
  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);

    // Update both local state and the central mockData
    setProjects(updatedProjects);

    // Update the original array to make it available globally
    mockProjects.length = 0;
    mockProjects.push(...updatedProjects);
    setIsDeleting(null);
    toast.success("Project deleted successfully");
  };
  return <div className="flex min-h-screen bg-background">
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

          <ProjectsFilter search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

          <div className="glass-card rounded-xl border shadow-sm animate-fade-in">
            <div className="overflow-x-auto p-4 py-[8px] px-[8px]">
              <ProjectsTable projects={filteredProjects} clients={clients} onEdit={openEditProjectDialog} onDelete={openDeleteDialog} />
            </div>
          </div>
        </main>
      </div>

      {/* Add Project Dialog */}
      {isAddingProject && <Dialog open={isAddingProject} onOpenChange={closeAddProjectDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <ProjectForm clients={clients} onSave={handleAddProject} onCancel={closeAddProjectDialog} />
          </DialogContent>
        </Dialog>}

      {/* Edit Project Dialog */}
      {editingProject && <Dialog open={!!editingProject} onOpenChange={closeEditProjectDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <ProjectForm project={editingProject} clients={clients} onSave={handleEditProject} onCancel={closeEditProjectDialog} />
          </DialogContent>
        </Dialog>}

      {/* Delete Confirmation Dialog */}
      {isDeleting && <DeleteConfirmationDialog isOpen={!!isDeleting} onClose={closeDeleteDialog} onConfirm={() => isDeleting && handleDeleteProject(isDeleting)} />}
    </div>;
};
export default Projects;
