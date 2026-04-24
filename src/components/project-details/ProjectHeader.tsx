import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Pencil,
  Trash,
  CheckCircle,
  RotateCcw,
  Plus,
  MoreHorizontal,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/types";
import {
  getStatusBadgeVariant,
  getProjectTypeBadgeVariant,
} from "@/components/projects/utils/projectItemUtils";

interface ProjectHeaderProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsCompleted: () => void;
  onChangeStatus: () => void;
  onCreateTask: () => void;
}

const ProjectHeader = ({
  project,
  onEdit,
  onDelete,
  onMarkAsCompleted,
  onChangeStatus,
  onCreateTask,
}: ProjectHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button
        type="button"
        onClick={() => navigate("/projects")}
        className="inline-flex items-center transition-opacity hover:opacity-80"
        style={{
          gap: 4,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16px",
          letterSpacing: "0.6px",
          color: "#64748B",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          width: "fit-content",
        }}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.67} />
        <span>back</span>
      </button>

      <div
        className="flex items-start justify-between"
        style={{ gap: 40, width: "100%" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            minWidth: 0,
          }}
        >
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 24,
              lineHeight: "32px",
              letterSpacing: "-0.48px",
              color: "#020817",
              margin: 0,
            }}
          >
            {project.name}
          </h1>
          <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
            <Badge variant={getStatusBadgeVariant(project.status as any)}>
              {project.status}
            </Badge>
            <Badge variant={getProjectTypeBadgeVariant(project.projectType as any)}>
              <Tag className="h-3.5 w-3.5" />
              {project.projectType}
            </Badge>
          </div>
        </div>

        <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center transition-colors hover:bg-slate-50"
                style={{
                  width: 42,
                  height: 36,
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0px 1px 2px rgba(15, 23, 42, 0.05)",
                  borderRadius: 7,
                  cursor: "pointer",
                }}
                aria-label="More options"
              >
                <MoreHorizontal
                  className="h-4 w-4"
                  style={{ color: "#020817" }}
                  strokeWidth={1.67}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {project.status !== "Completed" ? (
            <button
              type="button"
              onClick={onMarkAsCompleted}
              className="inline-flex items-center justify-center transition-colors hover:bg-slate-50"
              style={{
                gap: 4,
                padding: "0 12px",
                height: 38,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0px 1px 2px rgba(15, 23, 42, 0.05)",
                borderRadius: 7,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
                color: "#020817",
                cursor: "pointer",
              }}
            >
              <CheckCircle
                className="h-4 w-4"
                style={{ color: "#020817" }}
                strokeWidth={1.67}
              />
              <span>Mark as Completed</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onChangeStatus}
              className="inline-flex items-center justify-center transition-colors hover:bg-slate-50"
              style={{
                gap: 4,
                padding: "0 12px",
                height: 38,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0px 1px 2px rgba(15, 23, 42, 0.05)",
                borderRadius: 7,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
                color: "#020817",
                cursor: "pointer",
              }}
            >
              <RotateCcw
                className="h-4 w-4"
                style={{ color: "#020817" }}
                strokeWidth={1.67}
              />
              <span>Change Status</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCreateTask}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              gap: 8,
              padding: "0 12px",
              height: 38,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #3762FB",
              boxShadow:
                "0px 1px 2px rgba(14,18,27,0.24), 0px 0px 0px 1px #3762FB",
              borderRadius: 7,
              color: "#F8FAFC",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "20px",
              cursor: "pointer",
              border: "none",
            }}
          >
            <Plus
              className="h-4 w-4"
              style={{ color: "#F8FAFC" }}
              strokeWidth={1.67}
            />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
