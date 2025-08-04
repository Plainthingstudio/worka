
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { useUserRole } from "@/hooks/useUserRole";

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
  const { canManageProjects, userRole } = useUserRole();

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
    <>
      <main className="container mx-auto p-6">
        <ClientsHeader 
          onCreateClient={canManageProjects() ? openAddClientDialog : undefined}
          userRole={userRole}
        />

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
                onEdit={canManageProjects() ? openEditClientDialog : undefined} 
                onDelete={canManageProjects() ? openDeleteDialog : undefined} 
              />
            )}
          </div>
        </div>
      </main>

      {/* Add Client Dialog */}
      {canManageProjects() && isAddingClient && (
        <Dialog open={isAddingClient} onOpenChange={closeAddClientDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm onSave={handleAddClient} onCancel={closeAddClientDialog} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Client Dialog */}
      {canManageProjects() && editingClient && (
        <Dialog open={!!editingClient} onOpenChange={closeEditClientDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <ClientForm client={editingClient} onSave={handleEditClient} onCancel={closeEditClientDialog} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {canManageProjects() && isDeleting && (
        <DeleteConfirmationDialog 
          isOpen={!!isDeleting} 
          onClose={closeDeleteDialog} 
          onConfirm={() => isDeleting && handleDeleteClient(isDeleting)} 
        />
      )}
    </>
  );
};

export default Clients;
