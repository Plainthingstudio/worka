
import React, { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Client } from "@/types";

// Import our components
import ClientsHeader from "@/components/clients/ClientsHeader";
import ClientSearch from "@/components/clients/ClientSearch";
import ClientList from "@/components/clients/ClientList";
import ClientForm from "@/components/ClientForm";

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Mock data
import { clients as initialClients } from "@/mockData";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  
  // Dialog states - following Projects page pattern
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Add client functions
  const openAddDialog = () => setIsAddingClient(true);
  const closeAddDialog = () => setIsAddingClient(false);
  
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
  const openEditDialog = (client: Client) => setEditingClient(client);
  const closeEditDialog = () => setEditingClient(null);
  
  const handleEditClient = (data: any) => {
    if (!editingClient) return;

    setClients((prev) =>
      prev.map((client) =>
        client.id === editingClient.id
          ? { ...client, ...data }
          : client
      )
    );
    closeEditDialog();
    toast.success("Client updated successfully");
  };

  // Delete client functions
  const openDeleteDialog = (clientId: string) => setIsDeleting(clientId);
  const closeDeleteDialog = () => setIsDeleting(null);
  
  const handleDeleteClient = () => {
    if (!isDeleting) return;
    
    setClients((prev) => prev.filter((client) => client.id !== isDeleting));
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
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
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

      {/* Add Client Dialog - follows Projects page pattern */}
      {isAddingClient && (
        <Dialog
          open={isAddingClient}
          onOpenChange={(open) => !open && closeAddDialog()}
        >
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm
              onSave={handleAddClient}
              onCancel={closeAddDialog}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Client Dialog - follows Projects page pattern */}
      {editingClient && (
        <Dialog
          open={!!editingClient}
          onOpenChange={(open) => !open && closeEditDialog()}
        >
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm
              client={editingClient}
              onSave={handleEditClient}
              onCancel={closeEditDialog}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog - follows Projects page pattern */}
      {isDeleting && (
        <Dialog
          open={!!isDeleting}
          onOpenChange={(open) => !open && closeDeleteDialog()}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this client? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteClient}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Clients;
