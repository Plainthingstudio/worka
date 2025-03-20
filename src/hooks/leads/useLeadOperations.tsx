
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const newLead = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        source: data.source || '',
        notes: data.notes || '',
        stage: data.stage || 'Leads',
        address: data.address || '',
        user_id: userData.user?.id
      };

      const { data: insertedData, error } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single();

      if (error) throw error;

      const formattedLead: Lead = {
        id: insertedData.id,
        name: insertedData.name,
        email: insertedData.email,
        phone: insertedData.phone,
        source: insertedData.source,
        notes: insertedData.notes,
        stage: insertedData.stage as any,
        address: insertedData.address || '',
        createdAt: new Date(insertedData.created_at),
        updatedAt: new Date(insertedData.updated_at)
      };

      // Add new lead to the beginning of the array instead of the end
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
      const { error } = await supabase
        .from('leads')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          source: data.source,
          notes: data.notes,
          stage: data.stage,
          address: data.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

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
    // Validate input
    if (!id) {
      console.error('No lead ID provided for deletion');
      toast.error('Failed to delete: Invalid lead');
      return false;
    }
    
    // Store the lead before removing it from state (for potential recovery)
    const leadToDelete = leads.find(lead => lead.id === id);
    if (!leadToDelete) {
      console.error(`Could not find lead with id ${id} for deletion`);
      return false;
    }
    
    // UI update happens immediately (optimistic) - no setState in deletion flow
    setLeads(prev => prev.filter(lead => lead.id !== id));
    
    // Set loading state
    setIsDeletingLead(true);
    
    try {
      // Make database request after UI is updated
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        // If the database operation fails, restore the deleted lead
        setLeads(prev => [...prev, leadToDelete]);
        throw error;
      }
      
      // Only show success toast if DB operation succeeds
      toast.success('Lead deleted successfully');
      return true;
    } catch (error: any) {
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
