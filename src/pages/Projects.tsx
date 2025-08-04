
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProjectForm from "@/components/ProjectForm";
import ProjectsFilter from "@/components/projects/ProjectsFilter";
import ProjectsTable from "@/components/projects/ProjectsTable";
import ProjectsStats from "@/components/projects/ProjectsStats";
import DeleteConfirmationDialog from "@/components/projects/DeleteConfirmationDialog";
import ProjectsHeader from "@/components/projects/ProjectsHeader";
import ProjectsLoading from "@/components/projects/ProjectsLoading";
import { useProjects } from "@/hooks/useProjects";
import { useProjectDialogs } from "@/hooks/useProjectDialogs";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { LeadSource } from "@/types";

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { canViewProjects, isLoading: roleLoading } = useUserRole();
  
  // Redirect team members away from projects page (but only after role is loaded)
  if (!roleLoading && !canViewProjects) {
    return <Navigate to="/tasks" replace />;
  }

  const { 
    projects, 
    clients, 
    teamMembers, 
    isLoading, 
    handleAddProject, 
    handleEditProject, 
    handleDeleteProject 
  } = useProjects();

  const {
    isAddingProject,
    editingProject,
    isDeleting,
    openAddProjectDialog,
    closeAddProjectDialog,
    openEditProjectDialog,
    closeEditProjectDialog,
    openDeleteDialog,
    closeDeleteDialog
  } = useProjectDialogs();

  const { 
    search, 
    setSearch, 
    statusFilter, 
    setStatusFilter, 
    filteredProjects 
  } = useProjectFilters(projects);

  const { isSidebarExpanded } = useSidebarWidth();

  // Check for 'new=true' query parameter to auto-open create dialog
  useEffect(() => {
    if (searchParams.get('new') === 'true' && !isLoading && !roleLoading) {
      openAddProjectDialog();
      // Remove the query parameter from URL
      setSearchParams({});
    }
  }, [searchParams, isLoading, roleLoading, openAddProjectDialog, setSearchParams]);

  const handleAddProjectSubmit = async (data: any) => {
    const result = await handleAddProject(data);
    if (result) {
      closeAddProjectDialog();
    }
  };

  const handleEditProjectSubmit = async (data: any) => {
    if (editingProject) {
      const result = await handleEditProject(data, editingProject.id);
      if (result) {
        closeEditProjectDialog();
      }
    }
  };

  const handleDeleteProjectSubmit = async () => {
    if (isDeleting) {
      const result = await handleDeleteProject(isDeleting);
      if (result) {
        closeDeleteDialog();
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Projects" />
        <main className="container mx-auto p-6">
          <ProjectsHeader onCreateProject={openAddProjectDialog} />

          {isLoading ? (
            <ProjectsLoading />
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
                onSave={handleAddProjectSubmit} 
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
                onSave={handleEditProjectSubmit} 
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
          onConfirm={handleDeleteProjectSubmit} 
        />
      )}
    </div>
  );
};

export default Projects;
