
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client, Project, TeamMember } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import CategoryCell from "./cells/CategoryCell";
import StatusCell from "./cells/StatusCell";
import DateCell from "./cells/DateCell";
import FeeCell from "./cells/FeeCell";
import ProjectTypeCell from "./cells/ProjectTypeCell";
import TeamMembersCell from "./cells/TeamMembersCell";

interface ProjectItemProps {
  project: Project;
  client: Client | undefined;
  allClients: Client[];
  allTeamMembers: TeamMember[];
  onDelete: (id: string) => void;
  onInlineUpdate: (projectId: string, fields: Partial<Project>) => void;
}

const ProjectItem = ({
  project,
  client,
  allClients,
  allTeamMembers,
  onDelete,
  onInlineUpdate,
}: ProjectItemProps) => {
  const navigate = useNavigate();

  // ── Name inline edit ───────────────────────────────────────────────
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setNameValue(project.name); }, [project.name]);

  const commitName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onInlineUpdate(project.id, { name: trimmed });
    } else {
      setNameValue(project.name);
    }
    setIsEditingName(false);
  };

  // ── Client inline edit ─────────────────────────────────────────────
  const [clientOpen, setClientOpen] = useState(false);

  return (
    <TableRow
      className="cursor-pointer group"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Project Name */}
      <TableCell className="font-medium">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            autoFocus
            value={nameValue}
            className="w-full rounded border border-primary bg-card text-foreground px-2 py-1 text-sm font-medium outline-none focus:ring-1 focus:ring-primary"
            onChange={e => setNameValue(e.target.value)}
            onClick={e => e.stopPropagation()}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") { setNameValue(project.name); setIsEditingName(false); }
            }}
          />
        ) : (
          <span
            className="cursor-text rounded px-1 py-0.5 hover:bg-accent transition-colors"
            onClick={e => { e.stopPropagation(); setIsEditingName(true); }}
          >
            {nameValue}
          </span>
        )}
      </TableCell>

      {/* Categories */}
      <TableCell>
        <CategoryCell
          categories={project.categories}
          onSave={cats => onInlineUpdate(project.id, { categories: cats })}
        />
      </TableCell>

      {/* Client */}
      <TableCell>
        <DropdownMenu open={clientOpen} onOpenChange={setClientOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1 rounded px-1 py-0.5 text-sm hover:bg-accent transition-colors"
              onClick={e => { e.stopPropagation(); setClientOpen(true); }}
            >
              {client?.name || "Unknown Client"}
              <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={e => e.stopPropagation()} className="w-48">
            {allClients.map(c => (
              <DropdownMenuItem
                key={c.id}
                className={c.id === project.clientId ? "font-medium text-primary" : ""}
                onClick={() => { onInlineUpdate(project.id, { clientId: c.id }); setClientOpen(false); }}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusCell
          status={project.status}
          onSave={s => onInlineUpdate(project.id, { status: s })}
        />
      </TableCell>

      {/* Deadline */}
      <TableCell>
        <DateCell
          date={project.deadline}
          onSave={d => onInlineUpdate(project.id, { deadline: d })}
        />
      </TableCell>

      {/* Fee */}
      <TableCell>
        <FeeCell
          fee={project.fee}
          currency={project.currency}
          onSave={(fee, currency) => onInlineUpdate(project.id, { fee, currency })}
        />
      </TableCell>

      {/* Type */}
      <TableCell>
        <ProjectTypeCell
          type={project.projectType}
          onSave={t => onInlineUpdate(project.id, { projectType: t })}
        />
      </TableCell>

      {/* Team */}
      <TableCell>
        <TeamMembersCell
          selectedIds={project.teamMembers || []}
          allTeamMembers={allTeamMembers}
          onSave={ids => onInlineUpdate(project.id, { teamMembers: ids })}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProjectItem;
