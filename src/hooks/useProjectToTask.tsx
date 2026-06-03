
import { useState } from "react";
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types";
import { TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { account, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";
import { notifyTaskCreated } from "@/services/notificationService";

type TaskFromProjectOverrides = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  task_type?: TaskType;
  due_date?: Date | string | null;
  assignees?: string[];
};

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

  const serializeDate = (value: Date | string | null | undefined) => {
    if (!value) return undefined;
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  };

  const resolveProjectAssignees = async (memberIds: string[] = []) => {
    if (memberIds.length === 0) return [];

    try {
      const teamResponse = await databases.listDocuments(
        DATABASE_ID,
        'team_members',
        [Query.equal('$id', memberIds)]
      );

      const resolvedUserIds = teamResponse.documents.map((tm: any) => tm.user_id).filter(Boolean);
      const resolvedDocumentIds = new Set(teamResponse.documents.map((tm: any) => tm.$id));
      const alreadyUserIds = memberIds.filter((id) => !resolvedDocumentIds.has(id));

      return Array.from(new Set([...resolvedUserIds, ...alreadyUserIds]));
    } catch (teamError) {
      console.error('Error fetching team members:', teamError);
      return memberIds;
    }
  };

  const createTaskFromProject = async (
    project: Project,
    overrides: TaskFromProjectOverrides = {}
  ) => {
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

      const assignees = overrides.assignees !== undefined
        ? Array.from(new Set(overrides.assignees))
        : await resolveProjectAssignees(project.teamMembers || []);

      const dueDate = serializeDate(overrides.due_date ?? project.deadline);

      const taskData: any = {
        title: overrides.title || project.name,
        description: overrides.description ?? `Task created from project: ${project.name}`,
        status: overrides.status || mapProjectStatusToTaskStatus(project.status),
        priority: overrides.priority || ('Normal' as TaskPriority),
        task_type: overrides.task_type || ('Primary' as TaskType),
        assignees: assignees,
        project_id: project.id,
        user_id: user.$id,
      };

      if (dueDate) {
        taskData.due_date = dueDate;
      }

      console.log('Inserting task with data:', taskData);

      const data = await databases.createDocument(DATABASE_ID, 'tasks', ID.unique(), taskData);
      await notifyTaskCreated(data, user.$id);

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
