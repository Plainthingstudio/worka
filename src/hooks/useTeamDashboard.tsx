import { useState, useEffect } from "react";
import { account, client, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { Currency, Project, ProjectStatus, ProjectType, TeamMember, TeamPosition } from "@/types";
import { TaskPriority, TaskType, TaskWithRelations, isTaskClosedStatus, isTaskWorkingStatus } from "@/types/task";

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
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;

    async function fetchTeamData() {
      try {
        if (isMounted && !hasLoaded) {
          setIsLoading(true);
        }

        let session;
        try {
          session = await account.getSession('current');
        } catch {
          return;
        }
        if (!session) return;

        const userId = session.userId;

        const teamResponse = await databases.listDocuments(
          DATABASE_ID,
          'team_members',
          [Query.orderDesc('$createdAt')]
        );

        const transformedTeamMembers: TeamMember[] = teamResponse.documents.map((member: any) => ({
          id: member.$id,
          user_id: member.user_id,
          name: member.name,
          position: member.position as TeamPosition,
          startDate: new Date(member.start_date),
          skills: member.skills || [],
          createdAt: new Date(member.$createdAt),
        }));

        const currentMemberIds = transformedTeamMembers
          .filter((member) => member.user_id === userId)
          .map((member) => member.id);

        const identityIds = Array.from(new Set([userId, ...currentMemberIds].filter(Boolean)));

        const tasksResponse = await databases.listDocuments(
          DATABASE_ID,
          'tasks',
          [Query.orderDesc('$createdAt')]
        );

        const allTaskDocs = tasksResponse.documents.filter((task: any) => {
          const taskAssignees = task.assignees || [];

          return (
            task.user_id === userId ||
            identityIds.some((id) => taskAssignees.includes(id))
          );
        });

        const projectsResponse = await databases.listDocuments(
          DATABASE_ID,
          'projects',
          [Query.orderDesc('$createdAt')]
        );

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
              priority: task.priority as TaskPriority,
              task_type: task.task_type as TaskType,
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

        const assignedProjectIds = new Set(
          transformedTasks
            .map((task) => task.project_id)
            .filter(Boolean)
        );

        const allProjectDocs = projectsResponse.documents.filter((project: any) => {
          const projectTeamMembers = project.team_members || [];

          return (
            project.user_id === userId ||
            assignedProjectIds.has(project.$id) ||
            identityIds.some((id) => projectTeamMembers.includes(id))
          );
        });

        const transformedProjects: Project[] = allProjectDocs.map((project: any) => ({
          id: project.$id,
          name: project.name,
          clientId: project.client_id,
          status: project.status as ProjectStatus,
          deadline: new Date(project.deadline),
          fee: project.fee,
          currency: project.currency as Currency,
          projectType: project.project_type as ProjectType,
          payments: [],
          serviceIds: project.service_ids || [],
          subServiceIds: project.sub_service_ids || [],
          serviceQuantities: project.service_quantities || [],
          subServiceQuantities: project.sub_service_quantities || [],
          teamMembers: project.team_members || [],
          createdAt: new Date(project.$createdAt),
        }));

        // Calculate stats
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

        const activeTasks = transformedTasks.filter((task) => isTaskWorkingStatus(task.status));

        const completedThisWeek = transformedTasks.filter(task =>
          task.completed_at &&
          task.completed_at >= startOfWeek &&
          task.completed_at <= endOfWeek
        ).length;

        const dueThisWeek = transformedTasks.filter(task =>
          task.due_date &&
          task.due_date >= startOfWeek &&
          task.due_date <= endOfWeek &&
          !isTaskClosedStatus(task.status)
        ).length;

        const overdueTasksList = transformedTasks.filter(task =>
          task.due_date &&
          task.due_date < new Date() &&
          !isTaskClosedStatus(task.status)
        );

        const overdueTasksCount = overdueTasksList.length;

        if (isMounted) {
          setMyTasks(transformedTasks);
          setOverdueTasks(overdueTasksList);
          setMyProjects(transformedProjects);
          setTeamMembers(transformedTeamMembers);
          setStats({
            myActiveTasks: activeTasks.length,
            completedThisWeek,
            dueThisWeek,
            totalProjects: transformedProjects.length,
            overdueTasks: overdueTasksCount,
          });
        }

      } catch (error) {
        console.error("Error fetching team dashboard data:", error);
      } finally {
        if (isMounted) {
          hasLoaded = true;
          setIsLoading(false);
        }
      }
    }

    fetchTeamData();

    const channels = ['tasks', 'projects', 'team_members'].map(
      (collection) => `databases.${DATABASE_ID}.collections.${collection}.documents`
    );

    const unsubscribe = client.subscribe(channels, () => {
      fetchTeamData();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    stats,
    myTasks,
    myProjects,
    teamMembers,
    overdueTasks,
    isLoading,
  };
};
