
import { useState } from "react";
import { Client } from "@/types";

export const useClientDialogs = () => {
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const openAddClientDialog = () => setIsAddingClient(true);
  const closeAddClientDialog = () => setIsAddingClient(false);
  
  const openEditClientDialog = (client: Client) => setEditingClient(client);
  const closeEditClientDialog = () => setEditingClient(null);
  
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  return {
    isAddingClient,
    editingClient,
    isDeleting,
    openAddClientDialog,
    closeAddClientDialog,
    openEditClientDialog,
    closeEditClientDialog,
    openDeleteDialog,
    closeDeleteDialog
  };
};
