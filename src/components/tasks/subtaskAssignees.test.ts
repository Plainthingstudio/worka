import { describe, expect, it } from 'vitest';
import { mergeAssigneeIds } from './subtaskAssignees';

describe('mergeAssigneeIds', () => {
  it('keeps manual choices in order and appends only missing parent assignees', () => {
    expect(
      mergeAssigneeIds(
        ['manual-member', 'shared-member'],
        ['shared-member', 'parent-member', 'parent-member'],
      ),
    ).toEqual(['manual-member', 'shared-member', 'parent-member']);
  });
});
