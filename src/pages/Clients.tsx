
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ClientForm from "@/components/ClientForm";
import { Client, LeadSource } from "@/types";
import ClientsFilter from "@/components/clients/ClientsFilter";
import ClientsTable from "@/components/clients/ClientsTable";
import DeleteConfirmationDialog from "@/components/clients/DeleteConfirmationDialog";

// Import and modify the clients from mockData
import { clients as mockClients } from "@/mockData";

const Clients = () => {
  // Initialize state with the mockClients but allow it to be updated
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.toLowerCase().includes(search.toLowerCase());
    
    const matchesSource =
      sourceFilter === "all" || client.leadSource === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const openAddClientDialog = () => setIsAddingClient(true);
  const closeAddClientDialog = () => setIsAddingClient(false);
  
  const openEditClientDialog = (client: Client) => setEditingClient(client);
  const closeEditClientDialog = () => setEditingClient(null);
  
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  const handleAddClient = (data: any) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      leadSource: data.leadSource,
      createdAt: new Date(),
    };

    // Update both local state and the central mockData
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    
    // Update the original array to make it available globally
    mockClients.length = 0; // Clear the array
    mockClients.push(...updatedClients); // Add all clients back
    
    setIsAddingClient(false);
    toast.success("Client created successfully");
  };

  const handleEditClient = (data: any) => {
    if (!editingClient) return;

    const updatedClients = clients.map((client) =>
      client.id === editingClient.id
        ? { ...client, ...data }
        : client
    );
    
    // Update both local state and the central mockData
    setClients(updatedClients);
    
    // Update the original array to make it available globally
    mockClients.length = 0; 
    mockClients.push(...updatedClients);
    
    setEditingClient(null);
    toast.success("Client updated successfully");
  };

  const handleDeleteClient = (id: string) => {
    const updatedClients = clients.filter((client) => client.id !== id);
    
    // Update both local state and the central mockData
    setClients(updatedClients);
    
    // Update the original array to make it available globally
    mockClients.length = 0;
    mockClients.push(...updatedClients);
    
    setIsDeleting(null);
    toast.success("Client deleted successfully");
  };

  const leadSources: LeadSource[] = [
    "Dribbble",
    "Website",
    "LinkedIn",
    "Behance",
    "Direct Email",
    "Other",
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}
      >
        <Navbar title="Clients" />
        <main className="container mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Clients
              </h1>
              <p className="text-muted-foreground">
                Manage your client relationships.
              </p>
            </div>
            <Button onClick={openAddClientDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Client
            </Button>
          </div>

          <ClientsFilter 
            search={search}
            setSearch={setSearch}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            leadSources={leadSources}
          />

          <div className="glass-card rounded-xl border shadow-sm animate-fade-in">
            <div className="overflow-x-auto p-4">
              <ClientsTable 
                clients={filteredClients}
                onEdit={openEditClientDialog}
                onDelete={openDeleteDialog}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Add Client Dialog */}
      {isAddingClient && (
        <Dialog
          open={isAddingClient}
          onOpenChange={closeAddClientDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm
              onSave={handleAddClient}
              onCancel={closeAddClientDialog}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Client Dialog */}
      {editingClient && (
        <Dialog
          open={!!editingClient}
          onOpenChange={closeEditClientDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm
              client={editingClient}
              onSave={handleEditClient}
              onCancel={closeEditClientDialog}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleting && (
        <DeleteConfirmationDialog
          isOpen={!!isDeleting}
          onClose={closeDeleteDialog}
          onConfirm={() => isDeleting && handleDeleteClient(isDeleting)}
        />
      )}
    </div>
  );
};

export default Clients;
