
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ClientForm from "@/components/ClientForm";
import { LeadSource } from "@/types";
import ClientsFilter from "@/components/clients/ClientsFilter";
import ClientsTable from "@/components/clients/ClientsTable";
import ClientsHeader from "@/components/clients/ClientsHeader";
import ClientsLoading from "@/components/clients/ClientsLoading";
import DeleteConfirmationDialog from "@/components/clients/DeleteConfirmationDialog";
import { useClients } from "@/hooks/useClients";
import { useClientDialogs } from "@/hooks/useClientDialogs";
import { useClientFilters } from "@/hooks/useClientFilters";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";

const Clients = () => {
  // Custom hooks for data and state management
  const { clients, isLoading, addClient, updateClient, deleteClient } = useClients();
  const { 
    isAddingClient, 
    editingClient, 
    isDeleting, 
    openAddClientDialog, 
    closeAddClientDialog, 
    openEditClientDialog, 
    closeEditClientDialog, 
    openDeleteDialog, 
    closeDeleteDialog 
  } = useClientDialogs();
  const { search, setSearch, sourceFilter, setSourceFilter, filteredClients } = useClientFilters(clients);
  const { isSidebarExpanded } = useSidebarWidth();

  // Handle client form submissions
  const handleAddClient = async (data: any) => {
    const success = await addClient(data);
    if (success) closeAddClientDialog();
  };

  const handleEditClient = async (data: any) => {
    if (!editingClient) return;
    const success = await updateClient(editingClient.id, data);
    if (success) closeEditClientDialog();
  };

  const handleDeleteClient = async (id: string) => {
    const success = await deleteClient(id);
    if (success) closeDeleteDialog();
  };

  const leadSources: LeadSource[] = ["Dribbble", "Website", "LinkedIn", "Behance", "Direct Email", "Other"];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Clients" />
        <main className="container mx-auto p-6">
          <ClientsHeader onCreateClient={openAddClientDialog} />

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
                <ClientsLoading />
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
