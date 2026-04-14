
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { account, databases, DATABASE_ID } from '@/integrations/appwrite/client';

export const useInvoiceStatus = (fetchInvoices: () => Promise<void>) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateInvoiceStatus = async (
    invoiceId: string,
    newStatus: "Draft" | "Sent" | "Paid" | "Overdue"
  ) => {
    try {
      setIsUpdating(true);

      // Get current user session
      try {
        await account.getSession('current');
      } catch {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update invoice status.",
          variant: "destructive"
        });
        return false;
      }

      await databases.updateDocument(DATABASE_ID, 'invoices', invoiceId, {
        status: newStatus
      });

      toast({
        title: "Status Updated",
        description: `Invoice status updated to ${newStatus}`
      });

      await fetchInvoices();
      return true;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateInvoiceStatus
  };
};
