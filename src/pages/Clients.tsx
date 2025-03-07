
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ClientForm from "@/components/ClientForm";
import { Client, LeadSource } from "@/types";
import ClientsFilter from "@/components/clients/ClientsFilter";
import ClientsTable from "@/components/clients/ClientsTable";
import DeleteConfirmationDialog from "@/components/clients/DeleteConfirmationDialog";
import { supabase } from "@/integrations/supabase/client";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clients from Supabase
  useEffect(() => {
    async function fetchClients() {
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
          leadSource: client.lead_source as LeadSource, // Cast to LeadSource type
          createdAt: new Date(client.created_at)
        }));
        
        setClients(transformedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchClients();
  }, []);

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
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    return () => observer.disconnect();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || 
                           client.email.toLowerCase().includes(search.toLowerCase()) || 
                           (client.phone && client.phone.toLowerCase().includes(search.toLowerCase()));
    const matchesSource = sourceFilter === "all" || client.leadSource === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const openAddClientDialog = () => setIsAddingClient(true);
  const closeAddClientDialog = () => setIsAddingClient(false);
  const openEditClientDialog = (client: Client) => setEditingClient(client);
  const closeEditClientDialog = () => setEditingClient(null);
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  const handleAddClient = async (data: any) => {
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
      setIsAddingClient(false);
      toast.success("Client created successfully");
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Failed to create client");
    }
  };

  const handleEditClient = async (data: any) => {
    if (!editingClient) return;
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to update a client");
        return;
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
        .eq('id', editingClient.id)
        .eq('user_id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedClients = clients.map(client => 
        client.id === editingClient.id ? {
          ...client,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          leadSource: data.leadSource as LeadSource
        } : client
      );
      
      setClients(updatedClients);
      setEditingClient(null);
      toast.success("Client updated successfully");
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error(error.message || "Failed to update client");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete a client");
        return;
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
      setIsDeleting(null);
      toast.success("Client deleted successfully");
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error(error.message || "Failed to delete client");
    }
  };

  const leadSources: LeadSource[] = ["Dribbble", "Website", "LinkedIn", "Behance", "Direct Email", "Other"];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
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
            <div className="overflow-x-auto p-4 py-[8px] px-[8px]">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">Loading clients...</p>
                </div>
              ) : (
                <ClientsTable 
                  clients={filteredClients} 
                  onEdit={openEditClientDialog} 
                  onDelete={openDeleteDialog} 
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Client Dialog */}
      {isAddingClient && (
        <Dialog open={isAddingClient} onOpenChange={closeAddClientDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm onSave={handleAddClient} onCancel={closeAddClientDialog} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Client Dialog */}
      {editingClient && (
        <Dialog open={!!editingClient} onOpenChange={closeEditClientDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm client={editingClient} onSave={handleEditClient} onCancel={closeEditClientDialog} />
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
