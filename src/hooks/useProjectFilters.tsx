
import { useState } from "react";
import { Project } from "@/types";

export const useProjectFilters = (projects: Project[]) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredProjects
  };
};
