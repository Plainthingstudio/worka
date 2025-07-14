
import { useState } from "react";
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types";
import { TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";

export const useProjectToTask = () => {
  const [isCreating, setIsCreating] = useState(false);

  const mapProjectStatusToTaskStatus = (projectStatus: ProjectStatus): TaskStatus => {
    switch (projectStatus) {
      case "Planning":
        return "Planning";
      case "In progress":
        return "In progress";
      case "Completed":
      case "Paused":
      case "Cancelled":
      default:
        return "Planning";
    }
  };

  const createTaskFromProject = async (project: Project) => {
    try {
      setIsCreating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create tasks");
        return null;
      }

      // Get team member user_ids from project.teamMembers
      let assignees: string[] = [];
      if (project.teamMembers && project.teamMembers.length > 0) {
        const { data: teamMembersData, error: teamError } = await supabase
          .from('team_members')
          .select('user_id')
          .in('id', project.teamMembers);

        if (teamError) {
          console.error('Error fetching team members:', teamError);
        } else {
          assignees = teamMembersData?.map(tm => tm.user_id) || [];
        }
      }

      const taskData = {
        title: project.name,
        description: `Task created from project: ${project.name}`,
        status: mapProjectStatusToTaskStatus(project.status),
        priority: 'Normal' as TaskPriority,
        task_type: 'Primary' as TaskType,
        due_date: project.deadline.toISOString(),
        assignees: assignees,
        project_id: project.id,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        toast.error("Failed to create task");
        return null;
      }

      toast.success("Task created successfully from project");
      return data;
    } catch (error) {
      console.error('Error creating task from project:', error);
      toast.error("Failed to create task");
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createTaskFromProject,
    isCreating,
  };
};
