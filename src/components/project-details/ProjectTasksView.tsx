import React, { useEffect, useState } from "react";
import { TaskWithRelations, TaskStatus } from "@/types/task";
import { ClickUpTaskList } from "@/components/tasks/ClickUpTaskList";
import { TaskBoardView } from "@/components/tasks/TaskBoardView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { TaskDetailSidebar } from "@/components/tasks/TaskDetailSidebar";
import { SubtaskDialog } from "@/components/tasks/SubtaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { ProjectTab } from "./ProjectTabs";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";

interface ProjectTasksViewProps {
  projectId: string;
  view: Exclude<ProjectTab, "overview">;
  onCreateTask: () => void;
  myTasksOnly: boolean;
}

const ProjectTasksView = ({ projectId, view, onCreateTask, myTasksOnly }: ProjectTasksViewProps) => {
  const {
    tasks,
    isLoading,
    updateTask,
    deleteTask,
    addComment,
    uploadAttachment,
    createSubtask,
  } = useTasks(projectId);

  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string>("");
  const [myTaskIdentityIds, setMyTaskIdentityIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMyTaskIdentities = async () => {
      try {
        const user = await account.get();
        if (!isMounted) return;

        setCurrentUserId(user.$id);

        const teamResponse = await databases.listDocuments(DATABASE_ID, "team_members", [
          Query.equal("user_id", user.$id),
        ]);
        const memberIds = teamResponse.documents.map((member: any) => member.$id);

        if (isMounted) {
          setMyTaskIdentityIds(Array.from(new Set([user.$id, ...memberIds].filter(Boolean))));
        }
      } catch {
        if (isMounted) {
          setCurrentUserId(null);
          setMyTaskIdentityIds([]);
        }
      }
    };

    fetchMyTaskIdentities();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddSubtask = (taskId: string) => {
    setParentTaskId(taskId);
    setIsSubtaskDialogOpen(true);
  };

  const handleCreateSubtask = async (subtaskData: any) => {
    await createSubtask({
      ...subtaskData,
      parent_task_id: subtaskData.parent_task_id || parentTaskId,
    });
    setIsSubtaskDialogOpen(false);
  };

  const handleAddTask = (_status?: TaskStatus) => {
    onCreateTask();
  };

  const isAssignedToCurrentUser = (task: TaskWithRelations) => {
    const assignees = task.assignees || [];

    return Boolean(
      (currentUserId && task.user_id === currentUserId) ||
        myTaskIdentityIds.some((id) => assignees.includes(id))
    );
  };

  const visibleTasks = myTasksOnly
    ? tasks.reduce<TaskWithRelations[]>((acc, task) => {
        const subtasks = (task.subtasks || []) as TaskWithRelations[];
        const filteredSubtasks = subtasks.filter(isAssignedToCurrentUser);

        if (isAssignedToCurrentUser(task) || filteredSubtasks.length > 0) {
          acc.push({ ...task, subtasks: filteredSubtasks });
        }

        return acc;
      }, [])
    : tasks;

  return (
    <div className="w-full">
      {view === "list" && (
        <ClickUpTaskList
          tasks={visibleTasks}
          isLoading={isLoading}
          onTaskClick={(task) => setSelectedTask(task)}
          onUpdateTask={updateTask}
          onAddTask={handleAddTask}
        />
      )}

      {view === "board" && (
        <TaskBoardView
          tasks={visibleTasks}
          isLoading={isLoading}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onAddComment={addComment}
          onUploadAttachment={uploadAttachment}
          onAddTask={handleAddTask}
          onTaskClick={(task) => setSelectedTask(task)}
        />
      )}

      {view === "timeline" && (
        <TaskCalendarView
          tasks={visibleTasks}
          isLoading={isLoading}
          onUpdateTask={updateTask}
        />
      )}

      <TaskDetailSidebar
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onAddComment={addComment}
        onUploadAttachment={uploadAttachment}
        onAddSubtask={handleAddSubtask}
        onTaskSelect={setSelectedTask}
        allTasks={tasks}
      />

      <SubtaskDialog
        isOpen={isSubtaskDialogOpen}
        onClose={() => setIsSubtaskDialogOpen(false)}
        onSubmit={handleCreateSubtask}
        parentTaskId={parentTaskId}
        title="Create New Subtask"
      />
    </div>
  );
};

export default ProjectTasksView;
