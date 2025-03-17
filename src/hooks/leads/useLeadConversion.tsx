
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadSource } from '@/types';

export const useLeadConversion = () => {
  const convertLeadToClient = async (lead: Lead) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to convert lead to client");
        return null;
      }
      
      // Insert new client to Supabase
      const { data: clientData, error } = await supabase
        .from('clients')
        .insert({
          name: lead.name,
          email: lead.email,
          phone: lead.phone || '',
          lead_source: lead.source as LeadSource || 'Other',
          address: lead.address || '',
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success(`${lead.name} has been converted to a client`);
      return clientData;
    } catch (error: any) {
      console.error("Error converting lead to client:", error);
      toast.error(error.message || "Failed to convert lead to client");
      return null;
    }
  };

  return { convertLeadToClient };
};
