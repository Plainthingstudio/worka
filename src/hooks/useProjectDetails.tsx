
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Project, Payment, Client, ProjectStatus } from "@/types";
import { projects, clients } from "@/mockData";

export const useProjectDetails = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeletePaymentDialogOpen, setIsDeletePaymentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("In progress");

  useEffect(() => {
    if (projectId) {
      const foundProject = projects.find((p) => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        const foundClient = clients.find((c) => c.id === foundProject.clientId);
        if (foundClient) {
          setClient(foundClient);
        }
      } else {
        toast.error("Project not found");
        navigate("/projects");
      }
    }
  }, [projectId, navigate]);

  const handleEditProject = (data: any) => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, ...data };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setIsEditDialogOpen(false);
      toast.success("Project updated successfully");
    }
  };

  const handleDeleteProject = () => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      projects.splice(projectIndex, 1);
      setIsDeleteDialogOpen(false);
      toast.success("Project deleted successfully");
      navigate("/projects");
    }
  };

  const handleMarkAsCompleted = () => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, status: "Completed" as ProjectStatus };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      toast.success("Project marked as completed");
    }
  };

  const handleChangeStatus = () => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, status: selectedStatus };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setIsStatusDialogOpen(false);
      toast.success(`Project status changed to ${selectedStatus}`);
    }
  };

  const handleAddPayment = (data: any) => {
    if (!project) return;

    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      projectId: project.id,
      paymentType: data.paymentType,
      amount: data.amount,
      date: data.date,
      notes: data.notes,
    };

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { 
        ...project, 
        payments: [...project.payments, newPayment]
      };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setIsPaymentDialogOpen(false);
      toast.success("Payment added successfully");
    }
  };

  const handleEditPayment = (data: any) => {
    if (!project || !currentPayment) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const paymentIndex = project.payments.findIndex((p) => p.id === currentPayment.id);
      if (paymentIndex !== -1) {
        const updatedPayment = {
          ...currentPayment,
          paymentType: data.paymentType,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
        };

        const updatedPayments = [...project.payments];
        updatedPayments[paymentIndex] = updatedPayment;
        
        const updatedProject = {
          ...project,
          payments: updatedPayments,
        };
        
        projects[projectIndex] = updatedProject;
        
        setProject(updatedProject);
        setCurrentPayment(null);
        setIsEditPaymentDialogOpen(false);
        toast.success("Payment updated successfully");
      }
    }
  };

  const handleDeletePayment = () => {
    if (!project || !currentPayment) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedPayments = project.payments.filter(
        (payment) => payment.id !== currentPayment.id
      );
      
      const updatedProject = {
        ...project,
        payments: updatedPayments,
      };
      
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setCurrentPayment(null);
      setIsDeletePaymentDialogOpen(false);
      toast.success("Payment deleted successfully");
    }
  };

  const openEditPaymentDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsEditPaymentDialogOpen(true);
  };

  const openDeletePaymentDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsDeletePaymentDialogOpen(true);
  };

  return {
    project,
    client,
    currentPayment,
    selectedStatus,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    isPaymentDialogOpen,
    isEditPaymentDialogOpen,
    isDeletePaymentDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setIsPaymentDialogOpen,
    setSelectedStatus,
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus,
    handleAddPayment,
    handleEditPayment,
    handleDeletePayment,
    openEditPaymentDialog,
    openDeletePaymentDialog,
  };
};
