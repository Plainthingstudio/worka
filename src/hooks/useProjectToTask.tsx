
import { useState } from "react";
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types";
import { TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { account, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";

export const useProjectToTask = () => {
  const [isCreating, setIsCreating] = useState(false);

  const mapProjectStatusToTaskStatus = (projectStatus: ProjectStatus): TaskStatus => {
    switch (projectStatus) {
      case "Planning":
        return "Planning";
      case "In progress":
        return "In progress";
      case "Awaiting Feedback":
        return "Awaiting Feedback";
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
      console.log('Creating task from project:', project);

      let user;
      try {
        user = await account.get();
      } catch {
        toast.error("You must be logged in to create tasks");
        return null;
      }

      if (!user) {
        toast.error("You must be logged in to create tasks");
        return null;
      }

      console.log('Current user:', user.$id);

      // Get team member user_ids from project.teamMembers
      let assignees: string[] = [];
      if (project.teamMembers && project.teamMembers.length > 0) {
        console.log('Fetching team members for IDs:', project.teamMembers);
        try {
          const teamResponse = await databases.listDocuments(
            DATABASE_ID,
            'team_members',
            [Query.equal('$id', project.teamMembers)]
          );
          assignees = teamResponse.documents.map((tm: any) => tm.user_id);
          console.log('Team member user IDs:', assignees);
        } catch (teamError) {
          console.error('Error fetching team members:', teamError);
        }
      }

      const taskData: any = {
        title: project.name,
        description: `Task created from project: ${project.name}`,
        status: mapProjectStatusToTaskStatus(project.status),
        priority: 'Normal' as TaskPriority,
        task_type: 'Primary' as TaskType,
        due_date: project.deadline.toISOString(),
        assignees: assignees,
        project_id: project.id,
        user_id: user.$id,
      };

      console.log('Inserting task with data:', taskData);

      const data = await databases.createDocument(DATABASE_ID, 'tasks', ID.unique(), taskData);

      console.log('Task created successfully:', data);
      toast.success("Task created successfully from project");
      return data;
    } catch (error: any) {
      console.error('Error creating task from project:', error);
      toast.error("Failed to create task: " + (error.message || "Unknown error"));
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
