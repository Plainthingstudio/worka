
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
} from "@/components/ui/dialog";

// Mock data
import { clients as initialClients } from "@/mockData";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  
  // Single dialog state with mode
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "add" | "edit" | "delete" | null;
    client?: Client;
  }>({
    open: false,
    mode: null
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Dialog handlers
  const openAddDialog = () => {
    setDialog({ open: true, mode: "add" });
  };

  const openEditDialog = (client: Client) => {
    setDialog({ open: true, mode: "edit", client });
  };

  const openDeleteDialog = (client: Client) => {
    setDialog({ open: true, mode: "delete", client });
  };

  const closeDialog = () => {
    setDialog({ open: false, mode: null });
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
    closeDialog();
    toast.success("Client created successfully");
  };

  const handleEditClient = (data: any) => {
    if (!dialog.client) return;

    setClients((prev) =>
      prev.map((client) =>
        client.id === dialog.client?.id
          ? { ...client, ...data }
          : client
      )
    );
    closeDialog();
    toast.success("Client updated successfully");
  };

  const handleDeleteClient = () => {
    if (!dialog.client) return;
    
    setClients((prev) => prev.filter((client) => client.id !== dialog.client?.id));
    closeDialog();
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

      {/* Unified Dialog with conditional content */}
      <Dialog
        open={dialog.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          {dialog.mode === "add" && (
            <ClientForm
              onSave={handleAddClient}
              onCancel={closeDialog}
            />
          )}
          {dialog.mode === "edit" && dialog.client && (
            <ClientForm
              client={dialog.client}
              onSave={handleEditClient}
              onCancel={closeDialog}
            />
          )}
          {dialog.mode === "delete" && dialog.client && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Confirm Deletion</h2>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this client? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  className="px-4 py-2 border rounded-md hover:bg-muted"
                  onClick={closeDialog}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                  onClick={handleDeleteClient}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
