import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CalendarIcon,
  Pencil,
  Trash,
  CheckCircle,
  DollarSign,
  Plus,
  X,
  Tag,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProjectForm from "@/components/ProjectForm";
import PaymentForm from "@/components/PaymentForm";
import { Project, Payment, Client, ProjectStatus, ProjectType } from "@/types";

// Import from the centralized mockData
import { projects, clients } from "@/mockData";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [isDeletePaymentDialogOpen, setIsDeletePaymentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>("In progress");

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (projectId) {
      const foundProject = projects.find((p) => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        const foundClient = clients.find((c) => c.id === foundProject.clientId);
        if (foundClient) {
          setClient(foundClient);
        }
      } else {
        toast.error("Project not found");
        navigate("/projects");
      }
    }
  }, [projectId, navigate]);

  const handleEditProject = (data: any) => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, ...data };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setIsEditDialogOpen(false);
      toast.success("Project updated successfully");
    }
  };

  const handleDeleteProject = () => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      projects.splice(projectIndex, 1);
      setIsDeleteDialogOpen(false);
      toast.success("Project deleted successfully");
      navigate("/projects");
    }
  };

  const handleMarkAsCompleted = () => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, status: "Completed" as ProjectStatus };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      toast.success("Project marked as completed");
    }
  };

  const handleChangeStatus = () => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, status: selectedStatus };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setIsStatusDialogOpen(false);
      toast.success(`Project status changed to ${selectedStatus}`);
    }
  };

  const handleAddPayment = (data: any) => {
    if (!project) return;

    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      projectId: project.id,
      paymentType: data.paymentType,
      amount: data.amount,
      date: data.date,
      notes: data.notes,
    };

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { 
        ...project, 
        payments: [...project.payments, newPayment]
      };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setIsPaymentDialogOpen(false);
      toast.success("Payment added successfully");
    }
  };

  const handleEditPayment = (data: any) => {
    if (!project || !currentPayment) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const paymentIndex = project.payments.findIndex((p) => p.id === currentPayment.id);
      if (paymentIndex !== -1) {
        const updatedPayment = {
          ...currentPayment,
          paymentType: data.paymentType,
          amount: data.amount,
          date: data.date,
          notes: data.notes,
        };

        const updatedPayments = [...project.payments];
        updatedPayments[paymentIndex] = updatedPayment;
        
        const updatedProject = {
          ...project,
          payments: updatedPayments,
        };
        
        projects[projectIndex] = updatedProject;
        
        setProject(updatedProject);
        setCurrentPayment(null);
        setIsEditPaymentDialogOpen(false);
        toast.success("Payment updated successfully");
      }
    }
  };

  const handleDeletePayment = () => {
    if (!project || !currentPayment) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedPayments = project.payments.filter(
        (payment) => payment.id !== currentPayment.id
      );
      
      const updatedProject = {
        ...project,
        payments: updatedPayments,
      };
      
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      setCurrentPayment(null);
      setIsDeletePaymentDialogOpen(false);
      toast.success("Payment deleted successfully");
    }
  };

  const openEditPaymentDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsEditPaymentDialogOpen(true);
  };

  const openDeletePaymentDialog = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsDeletePaymentDialogOpen(true);
  };

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "In progress":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "Paused":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  const getProjectTypeBadgeClass = (type: ProjectType) => {
    switch (type) {
      case "Project Based":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "Monthly Retainer":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "Monthly Pay as you go":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  if (!project || !client) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}>
          <Navbar title="Project Details" />
          <main className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading project details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${
        isSidebarExpanded ? "ml-56" : "ml-14"
      }`}>
        <Navbar title="Project Details" />
        <main className="container mx-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/projects")}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Back to Projects
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4" /> Delete
              </Button>
              {project.status !== "Completed" ? (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleMarkAsCompleted}
                >
                  <CheckCircle className="h-4 w-4" /> Mark as Completed
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setSelectedStatus("In progress");
                    setIsStatusDialogOpen(true);
                  }}
                >
                  <RotateCcw className="h-4 w-4" /> Change Status
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            <div className="glass-card col-span-7 md:col-span-5 rounded-xl border shadow-sm">
              <div className="p-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {project.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge className={getStatusBadgeClass(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge className={`flex items-center gap-1 ${getProjectTypeBadgeClass(project.projectType)}`}>
                      <Tag className="h-3 w-3" />
                      <span>{project.projectType}</span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold">Client Information</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Name:</span>{" "}
                          {client.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Email:</span>{" "}
                          {client.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Phone:</span>{" "}
                          {client.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Lead Source:
                          </span>{" "}
                          {client.leadSource}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Project Details</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Deadline:
                          </span>{" "}
                          {format(new Date(project.deadline), "MMMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Fee:</span>{" "}
                          {project.fee.toLocaleString()} {project.currency}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Created At:
                          </span>{" "}
                          {format(new Date(project.createdAt), "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-7 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Track all payments for this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Fee:</span>
                      <span className="text-sm font-bold">{project.fee.toLocaleString()} {project.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Paid Amount:</span>
                      <span className="text-sm">
                        {project.payments
                          .reduce((sum, payment) => sum + payment.amount, 0)
                          .toLocaleString()}{" "}
                        {project.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Remaining:</span>
                      <span className="text-sm">
                        {(
                          project.fee -
                          project.payments.reduce(
                            (sum, payment) => sum + payment.amount,
                            0
                          )
                        ).toLocaleString()}{" "}
                        {project.currency}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Payment Count:</span>
                      <span className="text-sm">{project.payments.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" onClick={() => setIsPaymentDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Add Payment
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="col-span-7">
              <Card>
                <CardHeader className="px-6">
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All recorded payments for this project</CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                  {project.payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">No payments yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click the "Add Payment" button to record a payment for this project.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.payments
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-medium">
                                {payment.paymentType}
                              </TableCell>
                              <TableCell>
                                {payment.amount.toLocaleString()} {project.currency}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                  {format(new Date(payment.date), "MMM dd, yyyy")}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {payment.notes || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openEditPaymentDialog(payment)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => openDeletePaymentDialog(payment)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to the project details.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={project}
            clients={clients}
            onSave={handleEditProject}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={handleDeleteProject}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Project Status</DialogTitle>
            <DialogDescription>
              Select a new status for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select 
              value={selectedStatus} 
              onValueChange={(value) => setSelectedStatus(value as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In progress">In progress</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeStatus}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for this project.
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            projectId={project.id}
            currency={project.currency}
            onSave={handleAddPayment}
            onCancel={() => setIsPaymentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment details.
            </DialogDescription>
          </DialogHeader>
          {currentPayment && (
            <PaymentForm
              projectId={project.id}
              currency={project.currency}
              payment={currentPayment}
              onSave={handleEditPayment}
              onCancel={() => {
                setCurrentPayment(null);
                setIsEditPaymentDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeletePaymentDialogOpen} onOpenChange={setIsDeletePaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Payment Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={handleDeletePayment}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPayment(null);
                setIsDeletePaymentDialogOpen(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;
