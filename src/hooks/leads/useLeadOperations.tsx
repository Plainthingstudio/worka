
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStage } from '@/types';
import { useLeadConversion } from './useLeadConversion';
import { AddLeadData } from './types';

export const useLeadOperations = (leads: Lead[], setLeads: React.Dispatch<React.SetStateAction<Lead[]>>) => {
  const { convertLeadToClient } = useLeadConversion();

  const addLead = async (data: AddLeadData) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to create a lead");
        return null;
      }
      
      // Insert new lead to Supabase
      const { data: leadData, error } = await supabase
        .from('leads')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          source: data.source,
          notes: data.notes,
          address: data.address,
          stage: data.stage || 'Leads',
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform Supabase data to match Lead type
      const newLead: Lead = {
        id: leadData.id,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        source: leadData.source,
        address: leadData.address,
        stage: leadData.stage as LeadStage,
        notes: leadData.notes,
        createdAt: new Date(leadData.created_at),
        updatedAt: new Date(leadData.updated_at)
      };
      
      // Update local state
      setLeads(prevLeads => [newLead, ...prevLeads]);
      
      // Check if we need to convert to client
      if (newLead.stage === 'Kickoff') {
        await convertLeadToClient(newLead);
      }
      
      toast.success("Lead created successfully");
      return newLead;
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(error.message || "Failed to create lead");
      return null;
    }
  };

  const updateLead = async (leadId: string, data: Partial<Lead>) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to update a lead");
        return false;
      }
      
      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.stage) updateData.stage = data.stage;
      
      // Update lead in Supabase
      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Get the updated lead for client conversion if needed
      const updatedLead = leads.find(lead => lead.id === leadId);
      const newStage = data.stage || (updatedLead?.stage || 'Leads');
      
      // Update local state
      setLeads(prevLeads => {
        return prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, ...data, updatedAt: new Date() } : lead
        );
      });
      
      // Check if we need to convert to client
      if (newStage === 'Kickoff') {
        const leadToConvert = leads.find(lead => lead.id === leadId);
        if (leadToConvert) {
          await convertLeadToClient({ ...leadToConvert, ...data });
        }
      }
      
      toast.success("Lead updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating lead:", error);
      toast.error(error.message || "Failed to update lead");
      return false;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete a lead");
        return false;
      }
      
      // Delete lead from Supabase
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
      toast.success("Lead deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting lead:", error);
      toast.error(error.message || "Failed to delete lead");
      return false;
    }
  };

  return {
    addLead,
    updateLead,
    deleteLead
  };
};
