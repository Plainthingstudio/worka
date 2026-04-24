
import { useState } from 'react';
import { toast } from 'sonner';
import { account, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { Lead, LeadStage } from '@/types';

export const useFetchLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);

      // Get current user session
      try {
        await account.getSession('current');
      } catch {
        toast.error("You must be logged in to view leads");
        setIsLoading(false);
        return;
      }

      // Fetch leads ordered by creation date (newest first)
      const response = await databases.listDocuments(
        DATABASE_ID,
        'leads',
        [Query.orderDesc('$createdAt')]
      );

      // Transform data to match Lead type
      const transformedLeads = response.documents.map((lead: any) => ({
        id: lead.$id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        stage: lead.stage as LeadStage,
        notes: lead.notes,
        address: lead.address,
        createdAt: new Date(lead.$createdAt),
        updatedAt: new Date(lead.$updatedAt),
        createdBy: lead.user_id,
      }));

      setLeads(transformedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    leads,
    setLeads,
    isLoading,
    fetchLeads
  };
};
