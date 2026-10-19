import type { TaskWithRelations } from '@/types/task';

const getParentsWithSubtasks = (stageTasks: TaskWithRelations[]) =>
  stageTasks.filter((task) => (task.subtasks?.length || 0) > 0).map((task) => task.id);

export const areAllStageSubtasksCollapsed = (
  collapsed: Set<string>,
  stageTasks: TaskWithRelations[],
): boolean => {
  const parentIds = getParentsWithSubtasks(stageTasks);
  return parentIds.length > 0 && parentIds.every((taskId) => collapsed.has(taskId));
};

export const toggleStageSubtasks = (
  collapsed: Set<string>,
  stageTasks: TaskWithRelations[],
): Set<string> => {
  const next = new Set(collapsed);
  const parentIds = getParentsWithSubtasks(stageTasks);
  const shouldExpand = parentIds.length > 0 && parentIds.every((taskId) => collapsed.has(taskId));

  parentIds.forEach((taskId) => {
    if (shouldExpand) next.delete(taskId);
    else next.add(taskId);
  });

  return next;
};
