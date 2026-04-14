
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Client, LeadSource } from "@/types";
import { account, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setIsLoading(true);

      const response = await databases.listDocuments(DATABASE_ID, "clients", [
        Query.orderDesc("$createdAt"),
      ]);

      const transformedClients = response.documents.map((client: any) => ({
        id: client.$id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        leadSource: client.lead_source as LeadSource,
        createdAt: new Date(client.$createdAt),
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const addClient = async (data: any) => {
    try {
      const user = await account.get();
      const leadSource = data.leadSource as LeadSource;

      const clientData = await databases.createDocument(DATABASE_ID, "clients", ID.unique(), {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        lead_source: leadSource,
        user_id: user.$id,
      });

      const newClient: Client = {
        id: clientData.$id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        leadSource: clientData.lead_source as LeadSource,
        createdAt: new Date(clientData.$createdAt),
      };

      setClients([newClient, ...clients]);
      toast.success("Client created successfully");
      return true;
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Failed to create client");
      return false;
    }
  };

  const updateClient = async (clientId: string, data: any) => {
    try {
      const leadSource = data.leadSource as LeadSource;

      await databases.updateDocument(DATABASE_ID, "clients", clientId, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        lead_source: leadSource,
      });

      const updatedClients = clients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              name: data.name,
              email: data.email,
              phone: data.phone,
              address: data.address,
              leadSource: data.leadSource as LeadSource,
            }
          : client
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

  const deleteClient = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, "clients", id);
      setClients(clients.filter((client) => client.id !== id));
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
