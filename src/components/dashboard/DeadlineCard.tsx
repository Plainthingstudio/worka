import React from "react";
import { format } from "date-fns";
import { Project } from "@/types";
import { TeamMember } from "@/types";
import { TaskWithRelations } from "@/types/task";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeadlineCardProps {
  projects: Project[];
  tasks: TaskWithRelations[];
  teamMembers: TeamMember[];
  getClientById: (clientId: string) => string;
}

const AssigneeList = ({ names }: { names: string[] }) => {
  if (names.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const visible = names.slice(0, 2);
  const remaining = names.length - visible.length;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex items-center shrink-0">
        {visible.map((name, idx) => {
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div
              key={idx}
              className="flex items-center justify-center bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
              title={name}
              style={{
                width: 24,
                height: 24,
                borderRadius: 9999,
                border: "1.5px solid hsl(var(--card))",
                marginLeft: idx === 0 ? 0 : -6,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 10,
                flexShrink: 0,
              }}
            >
              {initials || "?"}
            </div>
          );
        })}
      </div>
      <span className="truncate text-foreground" style={{ fontSize: 14 }}>
        {visible.join(", ")}
        {remaining > 0 && (
          <span className="text-muted-foreground"> +{remaining}</span>
        )}
      </span>
    </div>
  );
};

const DeadlineCard: React.FC<DeadlineCardProps> = ({
  projects,
  tasks,
  teamMembers,
  getClientById,
}) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfThirdDay = new Date(startOfToday);
  endOfThirdDay.setDate(startOfToday.getDate() + 3);
  endOfThirdDay.setHours(23, 59, 59, 999);

  const resolveNames = (ids: string[] | undefined): string[] => {
    if (!ids || ids.length === 0) return [];
    return ids
      .map((id) => {
        const match = teamMembers.find(
          (m) => m.id === id || m.user_id === id
        );
        return match?.name || "";
      })
      .filter(Boolean);
  };

  type Row = {
    key: string;
    name: string;
    client: string;
    deadline: Date;
    assignees: string[];
  };

  const projectRows: Row[] = projects
    .filter((p) => {
      const d = new Date(p.deadline);
      return d >= startOfToday && d <= endOfThirdDay;
    })
    .map((p) => ({
      key: `project-${p.id}`,
      name: p.name,
      client: getClientById(p.clientId),
      deadline: new Date(p.deadline),
      assignees: resolveNames(p.teamMembers),
    }));

  const taskRows: Row[] = tasks
    .filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return d >= startOfToday && d <= endOfThirdDay;
    })
    .map((t) => {
      const project = projects.find((p) => p.id === t.project_id);
      const client = project ? getClientById(project.clientId) : "—";
      return {
        key: `task-${t.id}`,
        name: t.title,
        client,
        deadline: new Date(t.due_date!),
        assignees: resolveNames(t.assignees),
      };
    });

  const rows = [...projectRows, ...taskRows].sort(
    (a, b) => a.deadline.getTime() - b.deadline.getTime()
  );

  return (
    <div
      className="bg-card overflow-hidden flex flex-col border border-border-soft"
      style={{
        padding: 12,
        gap: 12,
        boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
        borderRadius: 12,
      }}
    >
      <div className="flex items-center">
        <h2
          className="text-foreground"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            lineHeight: "120%",
            letterSpacing: "-0.03em",
          }}
        >
          Upcoming Deadlines
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Assignees</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No upcoming deadlines in the next 3 days
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">{row.client}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(row.deadline, "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <AssigneeList names={row.assignees} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeadlineCard;
