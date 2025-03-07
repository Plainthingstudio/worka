
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Project, Client } from "@/types";
import { projects, clients } from "@/mockData";

export const useProjectData = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);

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

  return { project, setProject, client };
};
