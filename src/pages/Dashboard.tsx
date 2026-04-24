import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Briefcase,
  ChevronDown,
  DollarSign,
  FileText,
  ListChecks,
  ScrollText,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import MeetingScheduleCard from "@/components/dashboard/MeetingScheduleCard";
import TeamDashboard from "@/components/dashboard/TeamDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { useOwnerDashboard } from "@/hooks/useOwnerDashboard";
import { TaskWithRelations } from "@/types/task";

const shellCardClass =
  "rounded-[12px] border border-[#E2E8F0] bg-white p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";
const headerIconClass =
  "flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E2E8F0] text-[#0080FF]";
const tableShellClass =
  "overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.95)]";
const tableHeaderCellClass =
  "flex items-center bg-[#F1F5F9] px-4 py-3 text-[14px] font-medium leading-5 text-[#64748B]";
const tableBodyCellClass = "flex items-center border-b border-[#E2E8F0] px-4 py-[18px]";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatShortDate = (date?: Date) => {
  if (!date) return "No deadline";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const AssigneePills = ({ names }: { names: string[] }) => {
  if (!names.length) {
    return <span className="text-xs text-[#64748B]">Unassigned</span>;
  }

  return (
    <div className="flex items-center">
      {names.slice(0, 3).map((name, index) => (
        <div
          key={`${name}-${index}`}
          className="-ml-1 first:ml-0 flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-white bg-[#EFF6FF] text-[10px] font-semibold leading-5 text-[#1D4ED8]"
          title={name}
        >
          {getInitials(name)}
        </div>
      ))}
      {names.length > 3 ? (
        <div className="-ml-1 flex h-6 min-w-6 items-center justify-center rounded-full border-[1.5px] border-white bg-[#F1F5F9] px-1 text-[10px] font-semibold text-[#475569]">
          +{names.length - 3}
        </div>
      ) : null}
    </div>
  );
};

const EmptyTableState = ({ message }: { message: string }) => (
  <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5 text-sm text-[#64748B]">
    {message}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const {
    isLoading,
    stats,
    activeProjects,
    activeTasks,
    tasks,
    overdueInvoices,
    availableTeamMembers,
    getClientName,
    getTeamMemberNames,
  } = useOwnerDashboard(!roleLoading && userRole !== "team");

  const projectRows = useMemo(() => {
    return activeProjects.slice(0, 5).map((project) => {
      const relatedTasks = tasks.filter((task) => task.project_id === project.id);
      const completedCount = relatedTasks.filter((task) => task.status === "Completed").length;
      const progress = relatedTasks.length
        ? Math.round((completedCount / relatedTasks.length) * 100)
        : 0;

      const taskAssigneeIds = Array.from(new Set(relatedTasks.flatMap((task) => task.assignees)));
      const names = getTeamMemberNames(taskAssigneeIds);
      const fallbackNames =
        names.length === 0 ? getTeamMemberNames(project.teamMembers || []) : names;

      return {
        ...project,
        progress,
        assigneeNames: fallbackNames,
      };
    });
  }, [activeProjects, getTeamMemberNames, tasks]);

  const activeTaskRows = useMemo(() => activeTasks.slice(0, 5), [activeTasks]);

  if (roleLoading || (!userRole || (userRole !== "team" && isLoading))) {
    return (
      <div className="container mx-auto flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (userRole === "team") {
    return <TeamDashboard />;
  }

  const renderSectionHeader = (
    icon: typeof Briefcase,
    title: string,
    description: string
  ) => (
    <div className="flex items-center gap-2">
      <div className={headerIconClass}>
        {(() => {
          const Icon = icon;
          return <Icon className="h-4 w-4" strokeWidth={1.75} />;
        })()}
      </div>
      <div>
        <p className="text-[14px] font-semibold leading-[120%] tracking-[-0.03em] text-[#020817]">
          {title}
        </p>
        <p className="mt-1 text-[11px] leading-[100%] tracking-[-0.02em] text-[#64748B]">
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <main className="bg-white px-6 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#020817]">
            Dashboard Overview
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-9 gap-2 self-start rounded-[7px] bg-[#3762FB] px-3 text-sm font-medium text-[#F8FAFC] shadow-[0px_1px_2px_rgba(14,18,27,0.239216),0px_0px_0px_1px_#3762FB] hover:bg-[#2f56e6] md:self-auto"
              >
                Create
                <ChevronDown className="h-4 w-4 text-inherit" strokeWidth={1.67} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border bg-white shadow-lg">
              <DropdownMenuItem
                onClick={() => navigate("/projects?new=true")}
                className="cursor-pointer hover:bg-accent"
              >
                <ListChecks className="mr-2 h-4 w-4" />
                Create Project
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/tasks?new=true")}
                className="cursor-pointer hover:bg-accent"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Create Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/invoices/new")}
                className="cursor-pointer hover:bg-accent"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            title="New Leads"
            value={String(stats.monthlyNewLeads)}
            icon={Users}
            change={stats.monthlyNewLeadsDelta}
            changeLabel="from last month"
          />
          <DashboardStatCard
            title={`${stats.monthLabel} New Projects`}
            value={String(stats.monthlyNewProjects)}
            icon={Briefcase}
            change={stats.monthlyNewProjectsDelta}
            changeLabel="from last month"
          />
          <DashboardStatCard
            title={`${stats.monthLabel} Earnings`}
            value={formatCurrency(stats.monthlyEarnings)}
            icon={DollarSign}
            change={stats.monthlyEarningsDelta}
            changeLabel="from last month"
          />
          <DashboardStatCard
            title="Active Projects"
            value={String(stats.activeProjects)}
            icon={Activity}
            changeLabel="Across all active work"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,427px)]">
          <section className={`${shellCardClass} min-h-[428px]`}>
            <div className="flex items-center justify-between gap-3">
              {renderSectionHeader(
                Briefcase,
                "Active Projects",
                "View project with upcoming deadlines"
              )}
            </div>

            <div className="mt-3">
              {projectRows.length === 0 ? (
                <EmptyTableState message="No active projects right now." />
              ) : (
                <div className={tableShellClass}>
                  <div className="flex h-9 rounded-[8px]">
                    <div className={`${tableHeaderCellClass} w-[147.75px] flex-1 rounded-l-[8px]`}>
                      Project Name
                    </div>
                    <div className={`${tableHeaderCellClass} w-[147.75px] flex-1`}>
                      Client
                    </div>
                    <div className={`${tableHeaderCellClass} w-[147.75px] flex-1`}>
                      Deadline
                    </div>
                    <div className={`${tableHeaderCellClass} w-[147.75px] flex-1`}>
                      Progress
                    </div>
                    <div className={`${tableHeaderCellClass} w-[110px] rounded-r-[8px]`}>
                      Assignees
                    </div>
                  </div>

                  {projectRows.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="flex h-[60px] w-full text-left"
                    >
                      <div className={`${tableBodyCellClass} w-[147.75px] flex-1 text-[14px] font-medium leading-5 text-[#020817]`}>
                        {project.name}
                      </div>
                      <div className={`${tableBodyCellClass} w-[147.75px] flex-1 text-[14px] leading-5 text-[#475569]`}>
                        {getClientName(project.clientId)}
                      </div>
                      <div className={`${tableBodyCellClass} w-[147.75px] flex-1 text-[14px] leading-5 text-[#475569]`}>
                        {formatShortDate(project.deadline)}
                      </div>
                      <div className={`${tableBodyCellClass} w-[147.75px] flex-1 gap-3 text-[14px] leading-5 text-[#475569]`}>
                        <span>{project.progress}%</span>
                        <div className="h-1.5 w-[93px] rounded-full bg-[#F1F5F9]">
                          <div
                            className="h-1.5 rounded-full bg-[#0080FF]"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className={`${tableBodyCellClass} w-[110px]`}>
                        <AssigneePills names={project.assigneeNames} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <MeetingScheduleCard />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_281px]">
          <section className={`${shellCardClass} min-h-[406px]`}>
            <div className="flex items-center justify-between gap-3">
              {renderSectionHeader(
                ScrollText,
                "Active Task",
                "View upcoming deadlines"
              )}
            </div>

            <div className="mt-3">
              {activeTaskRows.length === 0 ? (
                <EmptyTableState message="No active tasks available." />
              ) : (
                <div className={tableShellClass}>
                  <div className="flex h-9 rounded-[8px]">
                    <div className={`${tableHeaderCellClass} w-[149.75px] flex-1 rounded-l-[8px]`}>
                      Task
                    </div>
                    <div className={`${tableHeaderCellClass} w-[149.75px] flex-1`}>
                      Deadline
                    </div>
                    <div className={`${tableHeaderCellClass} w-[102px] rounded-r-[8px]`}>
                      Assignees
                    </div>
                  </div>

                  {activeTaskRows.map((task: TaskWithRelations) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => navigate("/tasks")}
                      className="flex h-[60px] w-full text-left"
                    >
                      <div className={`${tableBodyCellClass} w-[149.75px] min-w-0 flex-1 text-[14px] font-medium leading-5 text-[#020817]`}>
                        <span className="truncate">{task.title}</span>
                      </div>
                      <div className={`${tableBodyCellClass} w-[149.75px] flex-1 text-[14px] leading-5 text-[#475569]`}>
                        {formatShortDate(task.due_date)}
                      </div>
                      <div className={`${tableBodyCellClass} w-[102px]`}>
                        <AssigneePills names={getTeamMemberNames(task.assignees)} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={`${shellCardClass} min-h-[395px]`}>
            <div className="flex items-center justify-between gap-3">
              {renderSectionHeader(
                FileText,
                "Outstanding Invoices",
                "View upcoming deadlines"
              )}
            </div>

            <div className="mt-3">
              {overdueInvoices.length === 0 ? (
                <EmptyTableState message="No overdue invoices at the moment." />
              ) : (
                <div className={tableShellClass}>
                  <div className="flex h-9 rounded-[8px]">
                    <div className={`${tableHeaderCellClass} w-[133.83px] flex-1 rounded-l-[8px]`}>
                      No
                    </div>
                    <div className={`${tableHeaderCellClass} w-[133.83px] flex-1`}>
                      Client
                    </div>
                    <div className={`${tableHeaderCellClass} w-[133.83px] flex-1 rounded-r-[8px]`}>
                      Amount
                    </div>
                  </div>

                  {overdueInvoices.slice(0, 5).map((invoice) => (
                    <button
                      key={invoice.id}
                      type="button"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="flex h-[57.5px] w-full text-left"
                    >
                      <div className={`${tableBodyCellClass} w-[133.83px] flex-1 text-[14px] font-medium leading-5 text-[#020817]`}>
                        {invoice.invoiceNumber}
                      </div>
                      <div className={`${tableBodyCellClass} w-[133.83px] flex-1 text-[14px] font-medium leading-5 text-[#020817]`}>
                        {invoice.clientName}
                      </div>
                      <div className={`${tableBodyCellClass} w-[133.83px] flex-1 text-[14px] font-medium leading-5 text-[#020817]`}>
                        {formatCurrency(invoice.total)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={`${shellCardClass} min-h-[395px]`}>
            <div className="flex items-center justify-between gap-3">
              {renderSectionHeader(
                Users,
                "Available Team Members",
                "View upcoming deadlines"
              )}
            </div>

            <div className="mt-3">
              {availableTeamMembers.length === 0 ? (
                <EmptyTableState message="No team members are currently waiting on feedback only." />
              ) : (
                <div className={tableShellClass}>
                  <div className="flex h-9 rounded-[8px]">
                    <div className={`${tableHeaderCellClass} w-[92px] rounded-l-[8px]`}>
                      Name
                    </div>
                    <div className={`${tableHeaderCellClass} w-[163px] flex-1 rounded-r-[8px]`}>
                      Position
                    </div>
                  </div>

                  {availableTeamMembers.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex h-[57.5px]">
                      <div className={`${tableBodyCellClass} w-[92px] text-[14px] font-medium leading-5 text-[#020817]`}>
                        {member.name}
                      </div>
                      <div className={`${tableBodyCellClass} w-[163px] flex-1 text-[14px] leading-5 text-[#020817]`}>
                        {member.position}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
