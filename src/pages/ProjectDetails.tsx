
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProjectHeader from "@/components/project-details/ProjectHeader";
import ProjectInfo from "@/components/project-details/ProjectInfo";
import PaymentSummary from "@/components/project-details/PaymentSummary";
import PaymentHistory from "@/components/project-details/PaymentHistory";
import ProjectDialogs from "@/components/project-details/ProjectDialogs";
import { Project, Payment, Client, ProjectStatus } from "@/types";

// Import from the centralized mockData
import { projects, clients } from "@/mockData";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeletePaymentDialogOpen, setIsDeletePaymentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("In progress");

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

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

  if (!project || !client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}>
          <Navbar title="Project Details" />
          <main className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading project details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${
        isSidebarExpanded ? "ml-56" : "ml-14"
      }`}>
        <Navbar title="Project Details" />
        <main className="container mx-auto p-6">
          <ProjectHeader 
            project={project}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onMarkAsCompleted={handleMarkAsCompleted}
            onChangeStatus={() => {
              setSelectedStatus("In progress");
              setIsStatusDialogOpen(true);
            }}
          />

          <div className="grid gap-6 md:grid-cols-7">
            <ProjectInfo project={project} client={client} />

            <div className="col-span-7 md:col-span-2">
              <PaymentSummary 
                project={project} 
                onAddPayment={() => setIsPaymentDialogOpen(true)} 
              />
            </div>

            <div className="col-span-7">
              <PaymentHistory 
                project={project}
                onEditPayment={openEditPaymentDialog}
                onDeletePayment={openDeletePaymentDialog}
              />
            </div>
          </div>
        </main>
      </div>

      <ProjectDialogs
        project={project}
        clients={clients}
        currentPayment={currentPayment}
        selectedStatus={selectedStatus}
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isStatusDialogOpen={isStatusDialogOpen}
        isPaymentDialogOpen={isPaymentDialogOpen}
        isEditPaymentDialogOpen={isEditPaymentDialogOpen}
        isDeletePaymentDialogOpen={isDeletePaymentDialogOpen}
        onCloseEditDialog={() => setIsEditDialogOpen(false)}
        onCloseDeleteDialog={() => setIsDeleteDialogOpen(false)}
        onCloseStatusDialog={() => setIsStatusDialogOpen(false)}
        onClosePaymentDialog={() => setIsPaymentDialogOpen(false)}
        onCloseEditPaymentDialog={() => {
          setCurrentPayment(null);
          setIsEditPaymentDialogOpen(false);
        }}
        onCloseDeletePaymentDialog={() => {
          setCurrentPayment(null);
          setIsDeletePaymentDialogOpen(false);
        }}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onChangeStatus={handleChangeStatus}
        onStatusChange={(status) => setSelectedStatus(status)}
        onAddPayment={handleAddPayment}
        onEditPayment={handleEditPayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
};

export default ProjectDetails;
