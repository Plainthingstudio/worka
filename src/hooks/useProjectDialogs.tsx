
import { useState } from "react";
import { Project, ProjectStatus } from "@/types";

export const useProjectDialogs = () => {
  // Current dialog states
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Project detail page dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("In progress");

  // Project list page dialog handlers
  const openAddProjectDialog = () => setIsAddingProject(true);
  const closeAddProjectDialog = () => setIsAddingProject(false);
  
  const openEditProjectDialog = (project: Project) => setEditingProject(project);
  const closeEditProjectDialog = () => setEditingProject(null);
  
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);
  
  return {
    // Project list page dialog states and handlers
    isAddingProject,
    editingProject,
    isDeleting,
    openAddProjectDialog,
    closeAddProjectDialog,
    openEditProjectDialog,
    closeEditProjectDialog,
    openDeleteDialog,
    closeDeleteDialog,
    
    // Project detail page dialog states and handlers
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    selectedStatus,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setSelectedStatus,
  };
};
