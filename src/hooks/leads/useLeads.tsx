import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { account, client, databases, DATABASE_ID, ID, Query } from '@/integrations/appwrite/client';
import { Lead, LeadStage } from '@/types';
import { AddLeadData, UseLeadsReturn } from './types';

export const leadsQueryKey = ['leads'] as const;

const fetchLeadsFromAppwrite = async (): Promise<Lead[]> => {
  const response = await databases.listDocuments(DATABASE_ID, 'leads', [
    Query.orderDesc('$createdAt'),
  ]);

  return response.documents.map((lead: any) => ({
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
};

export const useLeads = (): UseLeadsReturn => {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: leadsQueryKey,
    queryFn: fetchLeadsFromAppwrite,
  });

  useEffect(() => {
    const channel = `databases.${DATABASE_ID}.collections.leads.documents`;
    const unsubscribe = client.subscribe(channel, () => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKey });
    });
    return () => unsubscribe();
  }, [queryClient]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: leadsQueryKey });

  const addLead = async (data: AddLeadData): Promise<Lead | null> => {
    try {
      const user = await account.get();

      const inserted = await databases.createDocument(DATABASE_ID, 'leads', ID.unique(), {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        source: data.source || '',
        notes: data.notes || '',
        stage: data.stage || 'Leads',
        address: data.address || '',
        user_id: user?.$id,
      });

      toast.success('Lead added successfully');
      invalidate();

      return {
        id: inserted.$id,
        name: inserted.name,
        email: inserted.email,
        phone: inserted.phone,
        source: inserted.source,
        notes: inserted.notes,
        stage: inserted.stage as LeadStage,
        address: inserted.address || '',
        createdAt: new Date(inserted.$createdAt),
        updatedAt: new Date(inserted.$updatedAt),
      };
    } catch (error: any) {
      console.error('Error adding lead:', error);
      toast.error(error.message || 'Failed to add lead');
      return null;
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>): Promise<boolean> => {
    try {
      queryClient.setQueryData<Lead[]>(leadsQueryKey, (prev) =>
        prev
          ? prev.map((lead) =>
              lead.id === id ? { ...lead, ...data, updatedAt: new Date() } : lead
            )
          : prev
      );

      await databases.updateDocument(DATABASE_ID, 'leads', id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        notes: data.notes,
        stage: data.stage,
        address: data.address,
        updated_at: new Date().toISOString(),
      });

      toast.success('Lead updated successfully');
      invalidate();
      return true;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast.error(error.message || 'Failed to update lead');
      invalidate();
      return false;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    if (!id) {
      toast.error('Failed to delete: Invalid lead');
      return false;
    }

    const previousLeads = queryClient.getQueryData<Lead[]>(leadsQueryKey);

    queryClient.setQueryData<Lead[]>(leadsQueryKey, (prev) =>
      prev ? prev.filter((lead) => lead.id !== id) : prev
    );

    try {
      await databases.deleteDocument(DATABASE_ID, 'leads', id);
      toast.success('Lead deleted successfully');
      invalidate();
      return true;
    } catch (error: any) {
      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(leadsQueryKey, previousLeads);
      }
      console.error('Error deleting lead:', error);
      toast.error(error.message || 'Failed to delete lead');
      return false;
    }
  };

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    fetchLeads: async () => {
      await refetch();
    },
  };
};
