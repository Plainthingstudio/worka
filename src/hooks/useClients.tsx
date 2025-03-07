
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Client, LeadSource } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clients from Supabase
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to view clients");
        setIsLoading(false);
        return;
      }
      
      // Fetch clients from Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
        setIsLoading(false);
        return;
      }
      
      // Transform Supabase data to match Client type
      const transformedClients = data.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        leadSource: client.lead_source as LeadSource,
        createdAt: new Date(client.created_at)
      }));
      
      setClients(transformedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new client
  const addClient = async (data: any) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to create a client");
        return;
      }
      
      // Validate leadSource to ensure it's one of the allowed values
      const leadSource = data.leadSource as LeadSource;
      
      // Insert new client to Supabase
      const { data: clientData, error } = await supabase
        .from('clients')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          lead_source: leadSource,
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform Supabase data to match Client type
      const newClient: Client = {
        id: clientData.id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        leadSource: clientData.lead_source as LeadSource,
        createdAt: new Date(clientData.created_at)
      };
      
      // Update local state
      setClients([newClient, ...clients]);
      toast.success("Client created successfully");
      return true;
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Failed to create client");
      return false;
    }
  };

  // Update an existing client
  const updateClient = async (clientId: string, data: any) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to update a client");
        return false;
      }
      
      // Validate leadSource to ensure it's one of the allowed values
      const leadSource = data.leadSource as LeadSource;
      
      // Update client in Supabase
      const { error } = await supabase
        .from('clients')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          lead_source: leadSource
        })
        .eq('id', clientId)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedClients = clients.map(client => 
        client.id === clientId ? {
          ...client,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          leadSource: data.leadSource as LeadSource
        } : client
      );
      
      setClients(updatedClients);
      toast.success("Client updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error(error.message || "Failed to update client");
      return false;
    }
  };

  // Delete a client
  const deleteClient = async (id: string) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete a client");
        return false;
      }
      
      // Delete client from Supabase
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      toast.success("Client deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error(error.message || "Failed to delete client");
      return false;
    }
  };

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient
  };
};
