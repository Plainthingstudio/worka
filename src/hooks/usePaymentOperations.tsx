
import { toast } from "sonner";
import { Project, Payment, PaymentType } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentOperations = (project: Project | null, setProject: (project: Project) => void) => {
  const handleAddPayment = async (data: any) => {
    if (!project) return;

    try {
      // Insert the payment into Supabase
      const { data: paymentData, error } = await supabase
        .from('payments')
        .insert({
          project_id: project.id,
          amount: data.amount,
          date: data.date.toISOString(),
          payment_type: data.paymentType,
          notes: data.notes || null,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding payment:", error);
        toast.error("Failed to add payment");
        return;
      }

      // Create a new payment object from the returned data
      const newPayment: Payment = {
        id: paymentData.id,
        projectId: paymentData.project_id,
        paymentType: paymentData.payment_type as PaymentType,
        amount: paymentData.amount,
        date: new Date(paymentData.date),
        notes: paymentData.notes || "",
      };

      // Update the local project state with the new payment
      const updatedProject = { 
        ...project, 
        payments: [...project.payments, newPayment]
      };
      
      setProject(updatedProject);
      toast.success("Payment added successfully");
    } catch (error) {
      console.error("Error in handleAddPayment:", error);
      toast.error("Failed to add payment");
    }
  };

  const handleEditPayment = async (data: any, currentPaymentId: string | null) => {
    if (!project || !currentPaymentId) return;

    try {
      // Update the payment in Supabase
      const { error } = await supabase
        .from('payments')
        .update({
          amount: data.amount,
          date: data.date.toISOString(),
          payment_type: data.paymentType,
          notes: data.notes || null,
        })
        .eq('id', currentPaymentId);

      if (error) {
        console.error("Error updating payment:", error);
        toast.error("Failed to update payment");
        return;
      }

      // Update the payment in the local state
      const paymentIndex = project.payments.findIndex((p) => p.id === currentPaymentId);
      if (paymentIndex !== -1) {
        const currentPayment = project.payments[paymentIndex];
        const updatedPayment = {
          ...currentPayment,
          paymentType: data.paymentType,
          amount: data.amount,
          date: data.date,
          notes: data.notes || "",
        };

        const updatedPayments = [...project.payments];
        updatedPayments[paymentIndex] = updatedPayment;
        
        const updatedProject = {
          ...project,
          payments: updatedPayments,
        };
        
        setProject(updatedProject);
        toast.success("Payment updated successfully");
      }
    } catch (error) {
      console.error("Error in handleEditPayment:", error);
      toast.error("Failed to update payment");
    }
  };

  const handleDeletePayment = async (currentPaymentId: string | null) => {
    if (!project || !currentPaymentId) return;

    try {
      // Delete the payment from Supabase
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', currentPaymentId);

      if (error) {
        console.error("Error deleting payment:", error);
        toast.error("Failed to delete payment");
        return;
      }

      // Remove the payment from the local state
      const updatedPayments = project.payments.filter(
        (payment) => payment.id !== currentPaymentId
      );
      
      const updatedProject = {
        ...project,
        payments: updatedPayments,
      };
      
      setProject(updatedProject);
      toast.success("Payment deleted successfully");
    } catch (error) {
      console.error("Error in handleDeletePayment:", error);
      toast.error("Failed to delete payment");
    }
  };

  return {
    handleAddPayment,
    handleEditPayment,
    handleDeletePayment
  };
};
