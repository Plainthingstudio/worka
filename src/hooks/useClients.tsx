import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Client, LeadSource } from "@/types";
import { account, client, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";

export const clientsQueryKey = ["clients"] as const;

const fetchClients = async (): Promise<Client[]> => {
  const response = await databases.listDocuments(DATABASE_ID, "clients", [
    Query.orderDesc("$createdAt"),
  ]);

  return response.documents.map((doc: any) => ({
    id: doc.$id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    leadSource: doc.lead_source as LeadSource,
    createdAt: new Date(doc.$createdAt),
    createdBy: doc.user_id,
  }));
};

export const useClients = () => {
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: clientsQueryKey,
    queryFn: fetchClients,
  });

  useEffect(() => {
    const channel = `databases.${DATABASE_ID}.collections.clients.documents`;
    const unsubscribe = client.subscribe(channel, () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKey });
    });
    return () => unsubscribe();
  }, [queryClient]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: clientsQueryKey });

  const addClient = async (data: any) => {
    try {
      const user = await account.get();
      const leadSource = data.leadSource as LeadSource;

      await databases.createDocument(DATABASE_ID, "clients", ID.unique(), {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        lead_source: leadSource,
        user_id: user.$id,
      });

      toast.success("Client created successfully");
      invalidate();
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

      toast.success("Client updated successfully");
      invalidate();
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
      toast.success("Client deleted successfully");
      invalidate();
      return true;
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error(error.message || "Failed to delete client");
      return false;
    }
  };

  const inlineUpdateClient = async (
    clientId: string,
    fields: Partial<Pick<Client, "name" | "email" | "phone" | "address" | "leadSource">>
  ) => {
    try {
      const updateData: Record<string, any> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.email !== undefined) updateData.email = fields.email;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.address !== undefined) updateData.address = fields.address;
      if (fields.leadSource !== undefined) updateData.lead_source = fields.leadSource;

      queryClient.setQueryData<Client[]>(clientsQueryKey, (prev) =>
        prev ? prev.map((c) => (c.id === clientId ? { ...c, ...fields } : c)) : prev
      );

      await databases.updateDocument(DATABASE_ID, "clients", clientId, updateData);
      invalidate();
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error(error.message || "Failed to update client");
      invalidate();
    }
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    inlineUpdateClient,
  };
};
