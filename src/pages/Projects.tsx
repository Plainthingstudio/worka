import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  Search,
  Pencil,
  Trash,
  EyeIcon,
  DollarSign,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import ProjectForm from "@/components/ProjectForm";
import { Client, Project, ProjectStatus } from "@/types";

// Import clients and projects from the centralized mockData
import { clients, projects as mockProjects } from "@/mockData";

const Projects = () => {
  const navigate = useNavigate();
  // Initialize state with the mockProjects but keep track of the reference to mockProjects
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      clients.find((c) => c.id === project.clientId)?.name
        .toLowerCase()
        .includes(search.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openAddProjectDialog = () => setIsAddingProject(true);
  const closeAddProjectDialog = () => setIsAddingProject(false);
  
  const openEditProjectDialog = (project: Project) => setEditingProject(project);
  const closeEditProjectDialog = () => setEditingProject(null);
  
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  const handleAddProject = (data: any) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: data.name,
      clientId: data.clientId,
      status: data.status,
      deadline: data.deadline,
      fee: data.fee,
      currency: data.currency,
      projectType: data.projectType,
      payments: [],
      createdAt: new Date(),
    };

    // Update both local state and the central mockData
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    
    // Update the original array to make it available globally
    mockProjects.length = 0; // Clear the array
    mockProjects.push(...updatedProjects); // Add all projects back
    
    setIsAddingProject(false);
    toast.success("Project created successfully");
  };

  const handleEditProject = (data: any) => {
    if (!editingProject) return;

    const updatedProjects = projects.map((project) =>
      project.id === editingProject.id
        ? { ...project, ...data }
        : project
    );
    
    // Update both local state and the central mockData
    setProjects(updatedProjects);
    
    // Update the original array to make it available globally
    mockProjects.length = 0;
    mockProjects.push(...updatedProjects);
    
    setEditingProject(null);
    toast.success("Project updated successfully");
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    
    // Update both local state and the central mockData
    setProjects(updatedProjects);
    
    // Update the original array to make it available globally
    mockProjects.length = 0;
    mockProjects.push(...updatedProjects);
    
    setIsDeleting(null);
    toast.success("Project deleted successfully");
  };

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case "Planning":
        return "status-badge status-planning";
      case "In progress":
        return "status-badge status-in-progress";
      case "Completed":
        return "status-badge status-completed";
      case "Paused":
        return "status-badge status-paused";
      case "Cancelled":
        return "status-badge status-cancelled";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}
      >
        <Navbar title="Projects" />
        <main className="container mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Projects
              </h1>
              <p className="text-muted-foreground">
                Track and manage all your client projects.
              </p>
            </div>
            <Button onClick={openAddProjectDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>

          <div className="glass-card mb-6 rounded-xl border shadow-sm animate-fade-in">
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto p-4 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No projects found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => {
                      const client = clients.find(c => c.id === project.clientId);
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>
                            {client?.name || "Unknown Client"}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadgeClass(project.status)}>
                              {project.status}
                            </span>
                          </TableCell>
                          <TableCell className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {format(new Date(project.deadline), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                              {project.fee.toLocaleString()} {project.currency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {project.projectType}
                            </span>
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
                                      onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                      <span className="sr-only">View</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEditProjectDialog(project)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit Project</p>
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
                                      onClick={() => openDeleteDialog(project.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete Project</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Project Dialog */}
      {isAddingProject && (
        <Dialog
          open={isAddingProject}
          onOpenChange={closeAddProjectDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <ProjectForm
              clients={clients}
              onSave={handleAddProject}
              onCancel={closeAddProjectDialog}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog
          open={!!editingProject}
          onOpenChange={closeEditProjectDialog}
        >
          <DialogContent className="sm:max-w-[600px]">
            <ProjectForm
              project={editingProject}
              clients={clients}
              onSave={handleEditProject}
              onCancel={closeEditProjectDialog}
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
                Are you sure you want to delete this project? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={() => isDeleting && handleDeleteProject(isDeleting)}
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

export default Projects;
