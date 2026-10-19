import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SubtaskDialog } from './SubtaskDialog';

const teamMembers = [
  {
    id: 'member-doc-a',
    user_id: 'user-a',
    name: 'Ari',
    position: 'Designer',
    startDate: new Date('2026-01-01'),
    skills: [],
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'member-doc-b',
    user_id: 'user-b',
    name: 'Bima',
    position: 'Designer',
    startDate: new Date('2026-01-02'),
    skills: [],
    createdAt: new Date('2026-01-02'),
  },
  {
    id: 'member-doc-c',
    user_id: 'user-c',
    name: 'Citra',
    position: 'Designer',
    startDate: new Date('2026-01-03'),
    skills: [],
    createdAt: new Date('2026-01-03'),
  },
];

vi.mock('@/hooks/useTeamMembers', () => ({
  useTeamMembers: () => ({ teamMembers, fetchTeamMembers: vi.fn() }),
}));

describe('SubtaskDialog parent assignees', () => {
  it('places the reuse action by Assignees and merges parent members with manual choices', async () => {
    const user = userEvent.setup();

    render(
      <SubtaskDialog
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        parentTaskId="parent-1"
        parentAssignees={['user-b', 'user-c']}
        initialData={{ assignees: ['user-a', 'user-b'] }}
      />,
    );

    const reuseButton = screen.getByRole('button', { name: 'Use parent team · 2' });
    expect(reuseButton.parentElement).toHaveTextContent('Assignees');

    await user.click(reuseButton);

    expect(screen.getByText('Ari - Designer')).toBeInTheDocument();
    expect(screen.getByText('Bima - Designer')).toBeInTheDocument();
    expect(screen.getByText('Citra - Designer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parent team added' })).toBeInTheDocument();
  });

  it('hides the reuse action when the parent has no assignees', () => {
    render(
      <SubtaskDialog
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        parentTaskId="parent-1"
        parentAssignees={[]}
      />,
    );

    expect(screen.queryByRole('button', { name: /parent team/i })).not.toBeInTheDocument();
  });
});
