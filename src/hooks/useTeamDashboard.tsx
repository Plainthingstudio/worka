import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        // Fetch tasks where user is creator or assignee
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            task_comments(*),
            task_attachments(*),
            task_activities(*)
          `)
          .or(`user_id.eq.${userId},assignees.cs.{${userId}}`)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;

        // Transform tasks data
        const transformedTasks = tasksData.map((task: any) => ({
          id: task.id,
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
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
          brief_id: task.brief_id,
          brief_type: task.brief_type,
          comments: task.task_comments || [],
          attachments: task.task_attachments || [],
          activities: task.task_activities || []
        }));

        // Fetch projects where user is team member or creator
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .or(`user_id.eq.${userId},team_members.cs.{${userId}}`);

        if (projectsError) throw projectsError;

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

        const overdueTasks = transformedTasks.filter(task => 
          task.due_date && 
          task.due_date < new Date() &&
          task.status !== 'Completed'
        ).length;

        setMyTasks(transformedTasks);
        setMyProjects(projectsData || []);
        setStats({
          myActiveTasks: activeTasks.length,
          completedThisWeek,
          dueThisWeek,
          totalProjects: projectsData?.length || 0,
          overdueTasks,
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
    isLoading
  };
};