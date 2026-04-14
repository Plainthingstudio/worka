
import { toast } from 'sonner';
import { account, databases, DATABASE_ID, ID } from '@/integrations/appwrite/client';
import { Lead, LeadSource } from '@/types';

export const useLeadConversion = () => {
  const convertLeadToClient = async (lead: Lead) => {
    try {
      // Get current user session
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to convert lead to client");
        return null;
      }

      if (!session) {
        toast.error("You must be logged in to convert lead to client");
        return null;
      }

      const clientData = await databases.createDocument(DATABASE_ID, 'clients', ID.unique(), {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        lead_source: lead.source as LeadSource || 'Other',
        address: lead.address || '',
        user_id: session.userId
      });

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
