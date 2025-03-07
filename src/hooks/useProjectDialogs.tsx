
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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeletePaymentDialogOpen, setIsDeletePaymentDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("In progress");

  // Project list page dialog handlers
  const openAddProjectDialog = () => setIsAddingProject(true);
  const closeAddProjectDialog = () => setIsAddingProject(false);
  
  const openEditProjectDialog = (project: Project) => setEditingProject(project);
  const closeEditProjectDialog = () => setEditingProject(null);
  
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);
  
  // Project detail page dialog handlers
  const openEditPaymentDialog = (payment: any) => {
    setCurrentPayment(payment);
    setIsEditPaymentDialogOpen(true);
  };
  
  const openDeletePaymentDialog = (payment: any) => {
    setCurrentPayment(payment);
    setIsDeletePaymentDialogOpen(true);
  };

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
    isPaymentDialogOpen,
    isEditPaymentDialogOpen,
    isDeletePaymentDialogOpen,
    currentPayment,
    selectedStatus,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setIsPaymentDialogOpen,
    setIsEditPaymentDialogOpen,
    setIsDeletePaymentDialogOpen,
    setSelectedStatus,
    setCurrentPayment,
    openEditPaymentDialog,
    openDeletePaymentDialog
  };
};
