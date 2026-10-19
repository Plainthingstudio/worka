import { describe, expect, it } from 'vitest';
import type { TaskWithRelations } from '@/types/task';
import { areAllStageSubtasksCollapsed, toggleStageSubtasks } from './taskListCollapse';

const makeTask = (id: string, subtasks: TaskWithRelations['subtasks'] = []): TaskWithRelations => ({
  id,
  project_id: 'project-1',
  user_id: 'owner-1',
  title: id,
  status: 'Planning',
  priority: 'Normal',
  task_type: 'Primary',
  assignees: [],
  created_at: new Date('2026-10-19T00:00:00.000Z'),
  updated_at: new Date('2026-10-19T00:00:00.000Z'),
  subtasks,
});

describe('stage subtask collapse helpers', () => {
  const stageTasks = [makeTask('parent-a', [makeTask('child-a')]), makeTask('parent-b'), makeTask('parent-c', [makeTask('child-c')])];

  it('collapses only parents that have subtasks and preserves unrelated collapsed rows', () => {
    const next = toggleStageSubtasks(new Set(['other-stage-parent']), stageTasks);

    expect([...next]).toEqual(['other-stage-parent', 'parent-a', 'parent-c']);
    expect(areAllStageSubtasksCollapsed(next, stageTasks)).toBe(true);
  });

  it('expands all parents in the stage while preserving unrelated collapsed rows', () => {
    const next = toggleStageSubtasks(new Set(['other-stage-parent', 'parent-a', 'parent-c']), stageTasks);

    expect([...next]).toEqual(['other-stage-parent']);
    expect(areAllStageSubtasksCollapsed(next, stageTasks)).toBe(false);
  });

  it('does nothing for a stage without parents that have subtasks', () => {
    const collapsed = new Set(['other-stage-parent']);
    const next = toggleStageSubtasks(collapsed, [makeTask('parent-without-children')]);

    expect(next).not.toBe(collapsed);
    expect([...next]).toEqual(['other-stage-parent']);
    expect(areAllStageSubtasksCollapsed(next, [])).toBe(false);
  });
});
