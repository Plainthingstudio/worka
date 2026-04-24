import React, { useState } from "react";
import { TaskWithRelations, TaskStatus } from "@/types/task";
import { ClickUpTaskList } from "@/components/tasks/ClickUpTaskList";
import { TaskBoardView } from "@/components/tasks/TaskBoardView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { TaskDetailSidebar } from "@/components/tasks/TaskDetailSidebar";
import { SubtaskDialog } from "@/components/tasks/SubtaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { ProjectTab } from "./ProjectTabs";

interface ProjectTasksViewProps {
  projectId: string;
  view: Exclude<ProjectTab, "overview">;
  onCreateTask: () => void;
}

const ProjectTasksView = ({ projectId, view, onCreateTask }: ProjectTasksViewProps) => {
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

  return (
    <div className="w-full">
      {view === "list" && (
        <ClickUpTaskList
          tasks={tasks}
          isLoading={isLoading}
          onTaskClick={(task) => setSelectedTask(task)}
          onUpdateTask={updateTask}
          onAddTask={handleAddTask}
        />
      )}

      {view === "board" && (
        <TaskBoardView
          tasks={tasks}
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
          tasks={tasks}
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
