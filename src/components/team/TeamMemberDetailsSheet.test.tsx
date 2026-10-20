import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { TeamMember } from '@/types';
import { TeamMemberDetailsSheet } from './TeamMemberDetailsSheet';

const member: TeamMember = {
  id: 'member-1',
  user_id: 'user-1',
  name: 'Ardi Rahman',
  email: 'ardi@worka.id',
  position: 'Project Manager',
  role: 'administrator',
  startDate: new Date('2025-01-12T00:00:00.000Z'),
  skills: ['Planning'],
  createdAt: new Date('2025-01-12T00:00:00.000Z'),
};

vi.mock('@/hooks/useMemberActivities', () => ({
  useMemberActivities: () => ({
    activities: [
      {
        id: 'activity-1',
        taskId: 'subtask-1',
        userId: 'user-1',
        type: 'task_created',
        content: null,
        metadata: {},
        createdAt: new Date('2026-10-20T03:30:00.000Z'),
        taskTitle: 'Mobile responsive',
        parentTaskTitle: 'Homepage exploration',
        projectName: 'Worka Website Revamp',
        isSubtask: true,
      },
      {
        id: 'activity-2',
        taskId: 'task-1',
        userId: 'user-1',
        type: 'comment',
        content: 'Client sudah approve versi ini.',
        metadata: {},
        createdAt: new Date('2026-10-19T03:30:00.000Z'),
        taskTitle: 'Brand guideline',
        projectName: 'Worka Brand',
        isSubtask: false,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('TeamMemberDetailsSheet', () => {
  it('opens on activity, shows subtask context, and exposes member details in its tab', async () => {
    const user = userEvent.setup();

    render(<TeamMemberDetailsSheet member={member} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Ardi Rahman' })).toBeInTheDocument();
    expect(screen.getByText('Created subtask')).toBeInTheDocument();
    expect(screen.getByText('Mobile responsive')).toBeInTheDocument();
    expect(screen.getByText(/Homepage exploration/)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Details' }));

    expect(screen.getByText('ardi@worka.id')).toBeInTheDocument();
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  it('filters the feed to comments', async () => {
    const user = userEvent.setup();

    render(<TeamMemberDetailsSheet member={member} open onOpenChange={vi.fn()} />);
    await user.click(screen.getByRole('combobox', { name: 'Activity type' }));
    await user.click(screen.getByRole('option', { name: 'Comments' }));

    expect(screen.getByText('Commented')).toBeInTheDocument();
    expect(screen.queryByText('Created subtask')).not.toBeInTheDocument();
  });
});
