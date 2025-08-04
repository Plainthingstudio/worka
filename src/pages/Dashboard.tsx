
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Users, Briefcase, DollarSign, Activity, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import TeamDashboard from "@/components/dashboard/TeamDashboard";
import { Client, Project, ProjectType, Lead } from "@/types";
import { TaskWithRelations } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    newProjectsThisMonth: 0,
    totalEarnings: 0,
    activeProjects: 0,
    newLeadsThisMonth: 0,
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data from Supabase - only for owners/administrators
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Don't fetch admin data for team members
        if (userRole === 'team') {
          setIsLoading(false);
          return;
        }
        
        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (clientsError) {
          console.error("Error fetching clients:", clientsError);
          throw clientsError;
        }
        
        // Transform clients data
        const transformedClients = clientsData.map((client: any) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          leadSource: client.lead_source,
          createdAt: new Date(client.created_at)
        }));
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*, payments(*)');
        
        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          throw projectsError;
        }
        
        // Transform projects data
        const transformedProjects = projectsData.map((project: any) => {
          // Transform payments
          const payments = project.payments.map((payment: any) => ({
            id: payment.id,
            projectId: payment.project_id,
            paymentType: payment.payment_type,
            amount: payment.amount,
            date: new Date(payment.date),
            notes: payment.notes
          }));
          
          return {
            id: project.id,
            name: project.name,
            clientId: project.client_id,
            status: project.status,
            deadline: new Date(project.deadline),
            fee: project.fee,
            currency: project.currency,
            projectType: project.project_type,
            categories: project.categories,
            teamMembers: project.team_members || [],
            createdAt: new Date(project.created_at),
            payments: payments
          };
        });
        
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            task_comments(*),
            task_attachments(*),
            task_activities(*)
          `)
          .order('created_at', { ascending: false });
        
        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
          throw tasksError;
        }
        
        // Transform tasks data
        const transformedTasks = tasksData.map((task: any) => ({
          id: task.id,
          project_id: task.project_id,
          user_id: task.user_id,
          title: task.title,
          description: task.description,
          status: task.status,
          due_date: task.due_date ? new Date(task.due_date) : undefined,
          priority: task.priority,
          task_type: task.task_type,
          assignees: task.assignees || [],
          parent_task_id: task.parent_task_id,
          completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
          brief_id: task.brief_id,
          brief_type: task.brief_type,
          comments: task.task_comments || [],
          attachments: task.task_attachments || [],
          activities: task.task_activities || []
        }));
        
        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (leadsError) {
          console.error("Error fetching leads:", leadsError);
          throw leadsError;
        }
        
        // Transform leads data
        const transformedLeads = leadsData.map((lead: any) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          stage: lead.stage,
          notes: lead.notes,
          address: lead.address,
          createdAt: new Date(lead.created_at),
          updatedAt: new Date(lead.updated_at)
        }));
        
        // Calculate stats
        const activeProjects = transformedProjects.filter(p => p.status === "In progress").length;
        const totalEarnings = transformedProjects.reduce((sum, project) => {
          return sum + project.payments.reduce((total, payment) => total + payment.amount, 0);
        }, 0);
        
        // Calculate new leads this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newLeadsThisMonth = transformedLeads.filter(lead => 
          lead.createdAt >= startOfMonth
        ).length;
        
        // Calculate new projects this month
        const newProjectsThisMonth = transformedProjects.filter(project => 
          project.createdAt >= startOfMonth
        ).length;
        
        setClients(transformedClients);
        setProjects(transformedProjects);
        setTasks(transformedTasks);
        setLeads(transformedLeads);
        setStats({
          totalClients: transformedClients.length,
          newProjectsThisMonth,
          totalEarnings,
          activeProjects,
          newLeadsThisMonth,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [navigate, userRole]);

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

  const recentClients = [...clients]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const activeProjects = projects
    .filter(p => p.status === "In progress")
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5);

  const getProjectTypeBadgeClass = (type: ProjectType) => {
    switch (type) {
      case "Project Based":
        return "bg-blue-50 text-blue-700 ring-blue-700/10";
      case "Monthly Retainer":
        return "bg-purple-50 text-purple-700 ring-purple-700/10";
      case "Monthly Pay as you go":
        return "bg-yellow-50 text-yellow-800 ring-yellow-600/20";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-500/10";
    }
  };

  const getClientById = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  if (isLoading || roleLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
          <Navbar title="Dashboard" />
          <main className="container mx-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-lg text-muted-foreground">Loading dashboard data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Dashboard" />
        <main className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {userRole === 'team' ? 'My Dashboard' : 'Dashboard Overview'}
            </h1>
          </div>

          {userRole === 'team' ? (
            <TeamDashboard />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="New Leads"
                  value={stats.newLeadsThisMonth}
                  icon={Users}
                  className="bg-white shadow-sm border border-border"
                />
                <StatCard
                  title="New Projects"
                  value={stats.newProjectsThisMonth}
                  icon={Briefcase}
                  className="bg-white shadow-sm border border-border"
                />
                <StatCard
                  title="Total Earnings"
                  value={`$${stats.totalEarnings.toLocaleString()}`}
                  icon={DollarSign}
                  className="bg-white shadow-sm border border-border"
                />
                <StatCard
                  title="Active Projects"
                  value={stats.activeProjects}
                  icon={Activity}
                  className="bg-white shadow-sm border border-border"
                />
              </div>

              {/* Deadline Card */}
              <div className="mb-8">
                <DeadlineCard projects={projects} tasks={tasks} getClientById={getClientById} />
              </div>

              {/* Recent Clients */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Clients</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="glass-card rounded-xl border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No clients found. Add your first client to get started!
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {client.leadSource}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Active Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Active Projects</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="glass-card rounded-xl border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeProjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No active projects found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeProjects.map((project) => (
                          <TableRow key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer hover:bg-accent/50">
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>{getClientById(project.clientId)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(project.deadline), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Badge className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getProjectTypeBadgeClass(project.projectType)}`}>
                                <Tag className="mr-1 h-3 w-3" />
                                {project.projectType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {project.currency} {project.fee.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
