
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Pencil,
  Trash,
  Mail,
  Phone,
  User,
  EyeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ClientForm from "@/components/ClientForm";
import { Client, LeadSource } from "@/types";

// Mock data for initial clients (will be replaced with real data from API in production)
const initialClients: Client[] = [
  {
    id: "client-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1 (555) 123-4567",
    leadSource: "LinkedIn",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "client-2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1 (555) 987-6543",
    leadSource: "Website",
    createdAt: new Date("2023-02-20"),
  },
  {
    id: "client-3",
    name: "Carol Davis",
    email: "carol@example.com",
    phone: "+1 (555) 456-7890",
    leadSource: "Dribbble",
    createdAt: new Date("2023-03-10"),
  },
];

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.toLowerCase().includes(search.toLowerCase());
    
    const matchesSource =
      sourceFilter === "all" || client.leadSource === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  // These functions are separated to improve readability and maintainability
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

    setClients((prev) => [newClient, ...prev]);
    setIsAddingClient(false);
    toast.success("Client created successfully");
  };

  const handleEditClient = (data: any) => {
    if (!editingClient) return;

    setClients((prev) =>
      prev.map((client) =>
        client.id === editingClient.id
          ? { ...client, ...data }
          : client
      )
    );
    setEditingClient(null);
    toast.success("Client updated successfully");
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
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
      <div className="flex-1 pl-64">
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

          <div className="glass-card mb-6 rounded-xl border shadow-sm animate-fade-in">
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={sourceFilter}
                  onValueChange={setSourceFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {leadSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto p-4 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Lead Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No clients found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{client.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {client.leadSource}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(client.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditClientDialog(client)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Client</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => openDeleteDialog(client.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Client</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
        <Dialog
          open={!!isDeleting}
          onOpenChange={closeDeleteDialog}
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
                onClick={() => isDeleting && handleDeleteClient(isDeleting)}
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
