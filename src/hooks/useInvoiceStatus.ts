
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update invoice status.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update the invoice status
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Status Updated",
        description: `Invoice status updated to ${newStatus}`
      });
      
      // Refresh the invoices list
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
