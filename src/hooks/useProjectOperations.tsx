
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types";
import { projects } from "@/mockData";
import { useNavigate } from "react-router-dom";

export const useProjectOperations = (project: Project | null, setProject: (project: Project) => void) => {
  const navigate = useNavigate();

  const handleEditProject = (data: any) => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, ...data };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      toast.success("Project updated successfully");
    }
  };

  const handleDeleteProject = () => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      projects.splice(projectIndex, 1);
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

  const handleChangeStatus = (selectedStatus: ProjectStatus) => {
    if (!project) return;

    const projectIndex = projects.findIndex((p) => p.id === project.id);
    if (projectIndex !== -1) {
      const updatedProject = { ...project, status: selectedStatus };
      projects[projectIndex] = updatedProject;
      
      setProject(updatedProject);
      toast.success(`Project status changed to ${selectedStatus}`);
    }
  };

  return {
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus
  };
};
