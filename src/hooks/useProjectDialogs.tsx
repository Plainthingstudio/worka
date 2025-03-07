
import { useState } from "react";
import { Project } from "@/types";

export const useProjectDialogs = () => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const openAddProjectDialog = () => setIsAddingProject(true);
  const closeAddProjectDialog = () => setIsAddingProject(false);
  
  const openEditProjectDialog = (project: Project) => setEditingProject(project);
  const closeEditProjectDialog = () => setEditingProject(null);
  
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  return {
    isAddingProject,
    editingProject,
    isDeleting,
    openAddProjectDialog,
    closeAddProjectDialog,
    openEditProjectDialog,
    closeEditProjectDialog,
    openDeleteDialog,
    closeDeleteDialog
  };
};
