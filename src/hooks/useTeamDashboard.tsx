import { useState, useEffect } from "react";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { TaskWithRelations } from "@/types/task";

export interface TeamDashboardStats {
  myActiveTasks: number;
  completedThisWeek: number;
  dueThisWeek: number;
  totalProjects: number;
  overdueTasks: number;
}

export const useTeamDashboard = () => {
  const [stats, setStats] = useState<TeamDashboardStats>({
    myActiveTasks: 0,
    completedThisWeek: 0,
    dueThisWeek: 0,
    totalProjects: 0,
    overdueTasks: 0,
  });
  const [myTasks, setMyTasks] = useState<TaskWithRelations[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        setIsLoading(true);

        let session;
        try {
          session = await account.getSession('current');
        } catch {
          return;
        }
        if (!session) return;

        const userId = session.userId;

        // Fetch tasks where user is creator
        const tasksCreatorResponse = await databases.listDocuments(
          DATABASE_ID,
          'tasks',
          [Query.equal('user_id', userId), Query.orderDesc('$createdAt')]
        );

        // Fetch tasks where user is assignee
        const tasksAssigneeResponse = await databases.listDocuments(
          DATABASE_ID,
          'tasks',
          [Query.equal('assignees', userId), Query.orderDesc('$createdAt')]
        );

        // Merge and deduplicate tasks
        const allTaskDocs = [...tasksCreatorResponse.documents];
        const seenIds = new Set(allTaskDocs.map((t: any) => t.$id));
        for (const task of tasksAssigneeResponse.documents) {
          if (!seenIds.has(task.$id)) {
            allTaskDocs.push(task);
            seenIds.add(task.$id);
          }
        }

        // Fetch comments, attachments, activities for each task
        const transformedTasks: TaskWithRelations[] = await Promise.all(
          allTaskDocs.map(async (task: any) => {
            let task_comments: any[] = [];
            let task_attachments: any[] = [];
            let task_activities: any[] = [];

            try {
              const commentsRes = await databases.listDocuments(DATABASE_ID, 'task_comments', [Query.equal('task_id', task.$id)]);
              task_comments = commentsRes.documents;
            } catch (e) {}

            try {
              const attachRes = await databases.listDocuments(DATABASE_ID, 'task_attachments', [Query.equal('task_id', task.$id)]);
              task_attachments = attachRes.documents;
            } catch (e) {}

            try {
              const actRes = await databases.listDocuments(DATABASE_ID, 'task_activities', [Query.equal('task_id', task.$id)]);
              task_activities = actRes.documents;
            } catch (e) {}

            return {
              id: task.$id,
              project_id: task.project_id,
              user_id: task.user_id,
              title: task.title,
              description: task.description,
              status: task.status,
              due_date: task.due_date ? new Date(task.due_date) : undefined,
              priority: task.priority,
              task_type: task.task_type,
              assignees: task.assignees || [],
              parent_task_id: task.parent_task_id,
              completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
              created_at: new Date(task.$createdAt),
              updated_at: new Date(task.$updatedAt),
              brief_id: task.brief_id,
              brief_type: task.brief_type,
              comments: task_comments,
              attachments: task_attachments,
              activities: task_activities
            };
          })
        );

        // Fetch projects where user is creator
        const projectsCreatorResponse = await databases.listDocuments(
          DATABASE_ID,
          'projects',
          [Query.equal('user_id', userId)]
        );

        // Fetch projects where user is a team member
        const projectsTeamResponse = await databases.listDocuments(
          DATABASE_ID,
          'projects',
          [Query.equal('team_members', userId)]
        );

        // Merge and deduplicate projects
        const allProjectDocs = [...projectsCreatorResponse.documents];
        const seenProjectIds = new Set(allProjectDocs.map((p: any) => p.$id));
        for (const proj of projectsTeamResponse.documents) {
          if (!seenProjectIds.has(proj.$id)) {
            allProjectDocs.push(proj);
            seenProjectIds.add(proj.$id);
          }
        }

        // Calculate stats
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

        const activeTasks = transformedTasks.filter(task =>
          task.status !== 'Completed' && task.status !== 'Canceled'
        );

        const completedThisWeek = transformedTasks.filter(task =>
          task.completed_at &&
          task.completed_at >= startOfWeek &&
          task.completed_at <= endOfWeek
        ).length;

        const dueThisWeek = transformedTasks.filter(task =>
          task.due_date &&
          task.due_date >= startOfWeek &&
          task.due_date <= endOfWeek &&
          task.status !== 'Completed'
        ).length;

        const overdueTasksList = transformedTasks.filter(task =>
          task.due_date &&
          task.due_date < new Date() &&
          task.status !== 'Completed'
        );

        const overdueTasksCount = overdueTasksList.length;

        setMyTasks(transformedTasks);
        setOverdueTasks(overdueTasksList);
        setMyProjects(allProjectDocs);
        setStats({
          myActiveTasks: activeTasks.length,
          completedThisWeek,
          dueThisWeek,
          totalProjects: allProjectDocs.length,
          overdueTasks: overdueTasksCount,
        });

      } catch (error) {
        console.error("Error fetching team dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamData();
  }, []);

  return {
    stats,
    myTasks,
    myProjects,
    overdueTasks,
    isLoading,
  };
};
