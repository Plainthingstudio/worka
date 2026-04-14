
import { useState } from 'react';
import { account, databases, DATABASE_ID, ID } from '@/integrations/appwrite/client';
import { Lead } from '@/types';
import { AddLeadData } from './types';
import { toast } from 'sonner';

export const useLeadOperations = (leads: Lead[], setLeads: React.Dispatch<React.SetStateAction<Lead[]>>) => {
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  const addLead = async (data: AddLeadData): Promise<Lead | null> => {
    setIsAddingLead(true);
    try {
      let user;
      try {
        user = await account.get();
      } catch (e: any) {
        throw e;
      }

      const newLeadData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        source: data.source || '',
        notes: data.notes || '',
        stage: data.stage || 'Leads',
        address: data.address || '',
        user_id: user?.$id
      };

      const insertedData = await databases.createDocument(
        DATABASE_ID,
        'leads',
        ID.unique(),
        newLeadData
      );

      const formattedLead: Lead = {
        id: insertedData.$id,
        name: insertedData.name,
        email: insertedData.email,
        phone: insertedData.phone,
        source: insertedData.source,
        notes: insertedData.notes,
        stage: insertedData.stage as any,
        address: insertedData.address || '',
        createdAt: new Date(insertedData.$createdAt),
        updatedAt: new Date(insertedData.$updatedAt)
      };

      // Add new lead to the beginning of the array
      setLeads(prev => [formattedLead, ...prev]);
      toast.success('Lead added successfully');
      return formattedLead;
    } catch (error: any) {
      console.error('Error adding lead:', error);
      toast.error(error.message || 'Failed to add lead');
      return null;
    } finally {
      setIsAddingLead(false);
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>): Promise<boolean> => {
    setIsUpdatingLead(true);
    try {
      await databases.updateDocument(DATABASE_ID, 'leads', id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        notes: data.notes,
        stage: data.stage,
        address: data.address,
        updated_at: new Date().toISOString()
      });

      // Update local state
      setLeads(prev => prev.map(lead =>
        lead.id === id
          ? { ...lead, ...data, updatedAt: new Date() }
          : lead
      ));

      toast.success('Lead updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast.error(error.message || 'Failed to update lead');
      return false;
    } finally {
      setIsUpdatingLead(false);
    }
  };

  // Completely rewritten deletion function with true optimistic updates
  const deleteLead = async (id: string): Promise<boolean> => {
    if (!id) {
      console.error('No lead ID provided for deletion');
      toast.error('Failed to delete: Invalid lead');
      return false;
    }

    const leadToDelete = leads.find(lead => lead.id === id);
    if (!leadToDelete) {
      console.error(`Could not find lead with id ${id} for deletion`);
      return false;
    }

    // Optimistic UI update
    setLeads(prev => prev.filter(lead => lead.id !== id));

    setIsDeletingLead(true);

    try {
      await databases.deleteDocument(DATABASE_ID, 'leads', id);

      toast.success('Lead deleted successfully');
      return true;
    } catch (error: any) {
      // Restore the deleted lead on failure
      setLeads(prev => [...prev, leadToDelete]);
      console.error('Error deleting lead:', error);
      toast.error(error.message || 'Failed to delete lead');
      return false;
    } finally {
      setIsDeletingLead(false);
    }
  };

  return {
    addLead,
    updateLead,
    deleteLead,
    isAddingLead,
    isUpdatingLead,
    isDeletingLead
  };
};
