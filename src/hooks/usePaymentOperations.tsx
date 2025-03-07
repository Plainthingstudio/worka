
import { toast } from "sonner";
import { Project, Payment } from "@/types";
import { projects } from "@/mockData";

export const usePaymentOperations = (project: Project | null, setProject: (project: Project) => void) => {
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
      toast.success("Payment added successfully");
    }
  };

  const handleEditPayment = (data: any, currentPaymentId: string | null) => {
    if (!project || !currentPaymentId) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const paymentIndex = project.payments.findIndex((p) => p.id === currentPaymentId);
      if (paymentIndex !== -1) {
        const currentPayment = project.payments[paymentIndex];
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
        toast.success("Payment updated successfully");
      }
    }
  };

  const handleDeletePayment = (currentPaymentId: string | null) => {
    if (!project || !currentPaymentId) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedPayments = project.payments.filter(
        (payment) => payment.id !== currentPaymentId
      );
      
      const updatedProject = {
        ...project,
        payments: updatedPayments,
      };
      
      projects[projectIndex] = updatedProject;
      setProject(updatedProject);
      toast.success("Payment deleted successfully");
    }
  };

  return {
    handleAddPayment,
    handleEditPayment,
    handleDeletePayment
  };
};
