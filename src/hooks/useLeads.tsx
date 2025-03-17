
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStage, LeadSource } from '@/types';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to view leads");
        setIsLoading(false);
        return;
      }
      
      // Fetch leads from Supabase
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching leads:", error);
        toast.error("Failed to load leads");
        setIsLoading(false);
        return;
      }
      
      // Transform Supabase data to match Lead type
      const transformedLeads = data.map((lead: any) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        stage: lead.stage as LeadStage,
        notes: lead.notes,
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at)
      }));
      
      setLeads(transformedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const addLead = async (data: { 
    name: string; 
    email: string; 
    phone?: string; 
    source?: string; 
    notes?: string;
    stage?: LeadStage;
  }) => {
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

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    fetchLeads
  };
};
