
import React, { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Client } from "@/types";

// Import our new components
import ClientsHeader from "@/components/clients/ClientsHeader";
import ClientSearch from "@/components/clients/ClientSearch";
import ClientList from "@/components/clients/ClientList";
import AddClientDialog from "@/components/clients/AddClientDialog";
import EditClientDialog from "@/components/clients/EditClientDialog";
import DeleteClientDialog from "@/components/clients/DeleteClientDialog";

// Mock data
import { clients as initialClients } from "@/mockData";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Client data states
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [clientIdToDelete, setClientIdToDelete] = useState<string | null>(null);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Clear dialog states when closing dialogs
  const clearDialogStates = () => {
    setCurrentClient(null);
    setClientIdToDelete(null);
  };

  // Add client functions
  const openAddDialog = () => setIsAddDialogOpen(true);
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    clearDialogStates();
  };
  
  const handleAddClient = (data: any) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      leadSource: data.leadSource,
      createdAt: new Date(),
    };

    setClients((prev) => [newClient, ...prev]);
    closeAddDialog();
    toast.success("Client created successfully");
  };

  // Edit client functions
  const openEditDialog = (client: Client) => {
    setCurrentClient(client);
    setIsEditDialogOpen(true);
  };
  
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    clearDialogStates();
  };
  
  const handleEditClient = (data: any) => {
    if (!currentClient) return;

    setClients((prev) =>
      prev.map((client) =>
        client.id === currentClient.id
          ? { ...client, ...data }
          : client
      )
    );
    closeEditDialog();
    toast.success("Client updated successfully");
  };

  // Delete client functions
  const openDeleteDialog = (clientId: string) => {
    setClientIdToDelete(clientId);
    setIsDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    clearDialogStates();
  };
  
  const handleDeleteClient = () => {
    if (!clientIdToDelete) return;
    
    setClients((prev) => prev.filter((client) => client.id !== clientIdToDelete));
    closeDeleteDialog();
    toast.success("Client deleted successfully");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Navbar title="Clients" />
        <main className="container mx-auto p-6">
          <ClientsHeader onAddClient={openAddDialog} />

          <div className="glass-card mb-6 rounded-xl border shadow-sm animate-fade-in">
            <div className="p-4">
              <ClientSearch search={search} setSearch={setSearch} />
            </div>
            <ClientList 
              clients={filteredClients} 
              onEdit={openEditDialog} 
              onDelete={openDeleteDialog} 
            />
          </div>
        </main>
      </div>

      {/* Dialog Components */}
      <AddClientDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddClient}
        onCancel={closeAddDialog}
      />

      <EditClientDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        client={currentClient}
        onSave={handleEditClient}
        onCancel={closeEditDialog}
      />

      <DeleteClientDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteClient}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
};

export default Clients;
