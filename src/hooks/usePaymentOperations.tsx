
import { toast } from "sonner";
import { Project, Payment, PaymentType } from "@/types";
import { account, databases, DATABASE_ID, ID } from "@/integrations/appwrite/client";

export const usePaymentOperations = (
  project: Project | null,
  setProject: (project: Project) => void,
  onSuccess?: () => void
) => {
  const handleAddPayment = async (data: any) => {
    if (!project) return;

    try {
      let user;
      try {
        user = await account.get();
      } catch {
        toast.error("Failed to add payment");
        return;
      }

      const paymentData = await databases.createDocument(DATABASE_ID, 'payments', ID.unique(), {
        project_id: project.id,
        amount: data.amount,
        date: data.date.toISOString(),
        payment_type: data.paymentType,
        notes: data.notes || null,
        user_id: user?.$id,
      });

      const newPayment: Payment = {
        id: paymentData.$id,
        projectId: paymentData.project_id,
        paymentType: paymentData.payment_type as PaymentType,
        amount: paymentData.amount,
        date: new Date(paymentData.date),
        notes: paymentData.notes || "",
      };

      const updatedProject = {
        ...project,
        payments: [...project.payments, newPayment]
      };

      setProject(updatedProject);
      toast.success("Payment added successfully");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error in handleAddPayment:", error);
      toast.error("Failed to add payment");
    }
  };

  const handleEditPayment = async (data: any, currentPaymentId: string | null) => {
    if (!project || !currentPaymentId) return;

    try {
      await databases.updateDocument(DATABASE_ID, 'payments', currentPaymentId, {
        amount: data.amount,
        date: data.date.toISOString(),
        payment_type: data.paymentType,
        notes: data.notes || null,
      });

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
      await databases.deleteDocument(DATABASE_ID, 'payments', currentPaymentId);

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
