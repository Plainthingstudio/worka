
import { useState } from "react";
import { Project } from "@/types";

export type DeadlineSort = "none" | "asc" | "desc";

export const useProjectFilters = (projects: Project[]) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deadlineSort, setDeadlineSort] = useState<DeadlineSort>("none");

  const toggleDeadlineSort = () => {
    setDeadlineSort((current) => {
      if (current === "none") return "asc";
      if (current === "asc") return "desc";
      return "none";
    });
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (deadlineSort !== "none") {
        const aDeadline = a.deadline?.getTime?.() ?? 0;
        const bDeadline = b.deadline?.getTime?.() ?? 0;
        return deadlineSort === "asc"
          ? aDeadline - bDeadline
          : bDeadline - aDeadline;
      }

      const aCreated = a.createdAt?.getTime?.() ?? 0;
      const bCreated = b.createdAt?.getTime?.() ?? 0;
      return bCreated - aCreated;
    });

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    deadlineSort,
    toggleDeadlineSort,
    filteredProjects
  };
};
