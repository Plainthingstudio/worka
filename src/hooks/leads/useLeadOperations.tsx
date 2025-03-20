
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

  const deleteLead = async (id: string): Promise<boolean> => {
    setIsDeletingLead(true);
    try {
      // First make the database request
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
      // Only update UI state if the database operation was successful
      setLeads(prev => prev.filter(lead => lead.id !== id));
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
