
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    handleDeleteProject,
    handleInlineUpdate
  } = useProjects();

  const {
    isAddingProject,
    editingProject,
    isDeleting,
    openAddProjectDialog,
    closeAddProjectDialog,
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

  

  const isCaptureMode = searchParams.get('capture') === '1';

  // Check for 'new=true' query parameter to auto-open create dialog
  useEffect(() => {
    if (searchParams.get('new') === 'true' && !isLoading && !roleLoading) {
      openAddProjectDialog();
      // Remove the query parameter from URL — but keep capture param if present
      setSearchParams(isCaptureMode ? { capture: '1' } : {});
    }
  }, [searchParams, isLoading, roleLoading, openAddProjectDialog, setSearchParams, isCaptureMode]);

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
    <>
      <main className="w-full p-6">
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

            <div className="rounded-xl animate-fade-in">
              <div className="overflow-x-auto">
                <ProjectsTable
                  projects={filteredProjects}
                  clients={clients}
                  allTeamMembers={teamMembers}
                  onDelete={openDeleteDialog}
                  onInlineUpdate={handleInlineUpdate}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {isAddingProject && (
        <Dialog open={isAddingProject} onOpenChange={isCaptureMode ? undefined : closeAddProjectDialog}>
          <DialogContent
            className="sm:max-w-[600px]"
            onInteractOutside={isCaptureMode ? (e) => e.preventDefault() : undefined}
            onEscapeKeyDown={isCaptureMode ? (e) => e.preventDefault() : undefined}
          >
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
    </>
  );
};

export default Projects;
