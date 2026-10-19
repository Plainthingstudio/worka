import { describe, expect, it } from 'vitest';
import {
  isNotificationTaskNavigation,
  shouldDisableMyTasksForNavigation,
} from './taskNavigation';

describe('isNotificationTaskNavigation', () => {
  it('recognizes a marked task deep-link so My task can be disabled', () => {
    expect(isNotificationTaskNavigation(new URLSearchParams('taskId=task-1&source=notification'))).toBe(true);
  });

  it('does not override My task for direct task URLs or the plain task page', () => {
    expect(isNotificationTaskNavigation(new URLSearchParams('taskId=task-1'))).toBe(false);
    expect(isNotificationTaskNavigation(new URLSearchParams('source=notification'))).toBe(false);
    expect(isNotificationTaskNavigation(new URLSearchParams())).toBe(false);
  });

  it('handles a repeated notification to the same task as a new navigation occurrence', () => {
    const params = new URLSearchParams('taskId=task-1&source=notification');

    expect(shouldDisableMyTasksForNavigation(params, 'location-a', null)).toBe(true);
    expect(shouldDisableMyTasksForNavigation(params, 'location-a', 'location-a')).toBe(false);
    expect(shouldDisableMyTasksForNavigation(params, 'location-b', 'location-a')).toBe(true);
  });
});
