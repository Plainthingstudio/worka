import { useEffect, useMemo, useState } from "react";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { Client, Invoice, Lead, Project, TeamMember } from "@/types";
import { TaskWithRelations, isTaskClosedStatus, isTaskWorkingStatus } from "@/types/task";
import { format } from "date-fns";

export interface OwnerDashboardStats {
  monthLabel: string;
  monthlyNewLeads: number;
  monthlyNewProjects: number;
  monthlyEarnings: number;
  activeProjects: number;
  monthlyNewLeadsDelta: number;
  monthlyNewProjectsDelta: number;
  monthlyEarningsDelta: number;
}

export interface AvailableTeamMemberSummary extends TeamMember {
  openItemsCount: number;
  awaitingFeedbackCount: number;
}

export const useOwnerDashboard = (enabled: boolean) => {
  const [isLoading, setIsLoading] = useState(enabled);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        await account.getSession("current");

        const [
          clientsResponse,
          projectsResponse,
          paymentsResponse,
          tasksResponse,
          leadsResponse,
          teamResponse,
          profilesResponse,
          invoicesResponse,
        ] = await Promise.all([
          databases.listDocuments(DATABASE_ID, "clients", [Query.orderDesc("$createdAt")]),
          databases.listDocuments(DATABASE_ID, "projects"),
          databases.listDocuments(DATABASE_ID, "payments"),
          databases.listDocuments(DATABASE_ID, "tasks", [Query.orderDesc("$createdAt")]),
          databases.listDocuments(DATABASE_ID, "leads", [Query.orderDesc("$createdAt")]),
          databases.listDocuments(DATABASE_ID, "team_members", [Query.orderDesc("$createdAt")]),
          databases.listDocuments(DATABASE_ID, "profiles"),
          databases.listDocuments(DATABASE_ID, "invoices", [Query.orderDesc("$createdAt")]),
        ]);

        const profilesMap = new Map<string, any>();
        profilesResponse.documents.forEach((profile: any) => {
          profilesMap.set(profile.$id, profile);
        });

        const transformedClients: Client[] = clientsResponse.documents.map((client: any) => ({
          id: client.$id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          leadSource: client.lead_source,
          createdAt: new Date(client.$createdAt),
        }));

        const paymentsByProject = new Map<string, any[]>();
        paymentsResponse.documents.forEach((payment: any) => {
          const paymentList = paymentsByProject.get(payment.project_id) || [];
          paymentList.push(payment);
          paymentsByProject.set(payment.project_id, paymentList);
        });

        const transformedProjects: Project[] = projectsResponse.documents.map((project: any) => ({
          id: project.$id,
          name: project.name,
          clientId: project.client_id,
          status: project.status,
          deadline: new Date(project.deadline),
          fee: project.fee,
          currency: project.currency,
          projectType: project.project_type,
          categories: project.categories || [],
          teamMembers: project.team_members || [],
          createdAt: new Date(project.$createdAt),
          payments: (paymentsByProject.get(project.$id) || []).map((payment: any) => ({
            id: payment.$id,
            projectId: payment.project_id,
            paymentType: payment.payment_type,
            amount: payment.amount,
            date: new Date(payment.date),
            notes: payment.notes,
          })),
        }));

        const transformedTasks: TaskWithRelations[] = tasksResponse.documents.map((task: any) => ({
          id: task.$id,
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
          created_at: new Date(task.$createdAt),
          updated_at: new Date(task.$updatedAt),
          brief_id: task.brief_id,
          brief_type: task.brief_type,
        }));

        const transformedLeads: Lead[] = leadsResponse.documents.map((lead: any) => ({
          id: lead.$id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          stage: lead.stage,
          notes: lead.notes,
          address: lead.address,
          createdAt: new Date(lead.$createdAt),
          updatedAt: new Date(lead.$updatedAt),
        }));

        const transformedTeamMembers: TeamMember[] = teamResponse.documents.map((member: any) => ({
          id: member.$id,
          user_id: member.user_id,
          name: member.name,
          position: member.position,
          skills: member.skills || [],
          startDate: new Date(member.start_date),
          createdAt: new Date(member.$createdAt),
          email: profilesMap.get(member.user_id)?.email || "",
        }));

        const clientsById = new Map(transformedClients.map((client) => [client.id, client]));
        const transformedInvoices: Invoice[] = invoicesResponse.documents.map((invoice: any) => ({
          id: invoice.$id,
          invoiceNumber: invoice.invoice_number,
          clientId: invoice.client_id,
          clientName: clientsById.get(invoice.client_id)?.name || "Unknown Client",
          date: new Date(invoice.date),
          dueDate: new Date(invoice.due_date),
          paymentTerms: invoice.payment_terms,
          items: [],
          subtotal: invoice.subtotal,
          taxPercentage: invoice.tax_percentage || 0,
          taxAmount: invoice.tax_amount || 0,
          discountPercentage: invoice.discount_percentage || 0,
          discountAmount: invoice.discount_amount || 0,
          total: invoice.total,
          notes: invoice.notes || "",
          termsAndConditions: invoice.terms_and_conditions || "",
          createdAt: new Date(invoice.$createdAt),
          status: invoice.status,
          paymentType: invoice.payment_type || "Milestone Payment",
        }));

        setClients(transformedClients);
        setProjects(transformedProjects);
        setTasks(transformedTasks);
        setLeads(transformedLeads);
        setTeamMembers(transformedTeamMembers);
        setInvoices(transformedInvoices);
      } catch (error) {
        console.error("Error fetching owner dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enabled]);

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients]
  );

  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const previousMonthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }, []);

  const stats = useMemo<OwnerDashboardStats>(() => {
    const activeProjects = projects.filter(
      (project) => !["Completed", "Cancelled"].includes(project.status)
    ).length;

    const previousMonthEnd = new Date(monthStart.getTime() - 1);

    const currentMonthLeads = leads.filter((lead) => lead.createdAt >= monthStart).length;
    const previousMonthLeads = leads.filter(
      (lead) => lead.createdAt >= previousMonthStart && lead.createdAt <= previousMonthEnd
    ).length;

    const currentMonthProjects = projects.filter((project) => project.createdAt >= monthStart).length;
    const previousMonthProjects = projects.filter(
      (project) => project.createdAt >= previousMonthStart && project.createdAt <= previousMonthEnd
    ).length;

    const monthlyEarnings = projects.reduce((sum, project) => {
      return (
        sum +
        project.payments.reduce((paymentSum, payment) => {
          return payment.date >= monthStart ? paymentSum + payment.amount : paymentSum;
        }, 0)
      );
    }, 0);

    const previousMonthEarnings = projects.reduce((sum, project) => {
      return (
        sum +
        project.payments.reduce((paymentSum, payment) => {
          return payment.date >= previousMonthStart && payment.date <= previousMonthEnd
            ? paymentSum + payment.amount
            : paymentSum;
        }, 0)
      );
    }, 0);

    const getDelta = (currentValue: number, previousValue: number) => {
      if (previousValue === 0) return currentValue > 0 ? 100 : 0;
      return Math.round(((currentValue - previousValue) / previousValue) * 100);
    };

    return {
      monthLabel: format(monthStart, "MMMM"),
      monthlyNewLeads: currentMonthLeads,
      monthlyNewProjects: currentMonthProjects,
      monthlyEarnings,
      activeProjects,
      monthlyNewLeadsDelta: getDelta(currentMonthLeads, previousMonthLeads),
      monthlyNewProjectsDelta: getDelta(currentMonthProjects, previousMonthProjects),
      monthlyEarningsDelta: getDelta(monthlyEarnings, previousMonthEarnings),
    };
  }, [leads, monthStart, previousMonthStart, projects]);

  const activeProjects = useMemo(
    () =>
      projects
        .filter((project) => !["Completed", "Cancelled"].includes(project.status))
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime()),
    [projects]
  );

  const overdueInvoices = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status === "Overdue")
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    [invoices]
  );

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.parent_task_id && !isTaskClosedStatus(task.status))
        .sort((a, b) => {
          if (a.due_date && b.due_date) return a.due_date.getTime() - b.due_date.getTime();
          if (a.due_date) return -1;
          if (b.due_date) return 1;
          return a.created_at.getTime() - b.created_at.getTime();
        }),
    [tasks]
  );

  const availableTeamMembers = useMemo<AvailableTeamMemberSummary[]>(() => {
    return teamMembers
      .map((member) => {
        const openAssignedItems = tasks.filter((task) => {
          const isAssigned =
            task.assignees.includes(member.user_id) || task.assignees.includes(member.id);
          return isAssigned && !isTaskClosedStatus(task.status);
        });

        const awaitingFeedbackCount = openAssignedItems.filter(
          (task) => task.status === "Awaiting Feedback"
        ).length;

        const hasWorkingItems = openAssignedItems.some((task) => isTaskWorkingStatus(task.status));
        const isAvailable = !hasWorkingItems;

        return {
          ...member,
          openItemsCount: openAssignedItems.length,
          awaitingFeedbackCount,
          isAvailable,
        };
      })
      .filter((member) => member.isAvailable)
      .map(({ isAvailable: _isAvailable, ...member }) => member)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, teamMembers]);

  return {
    isLoading,
    stats,
    activeProjects,
    activeTasks,
    tasks,
    overdueInvoices,
    availableTeamMembers,
    getClientName: (clientId: string) => clientMap.get(clientId) || "Unknown Client",
    getTeamMemberNames: (assigneeIds: string[]) =>
      assigneeIds
        .map((assigneeId) =>
          teamMembers.find(
            (member) => member.user_id === assigneeId || member.id === assigneeId
          )?.name
        )
        .filter((name): name is string => Boolean(name)),
  };
};
