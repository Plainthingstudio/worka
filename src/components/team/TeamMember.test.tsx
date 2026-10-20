import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TeamMember } from '@/types';
import TeamMemberItem from './TeamMember';

const member: TeamMember = {
  id: 'member-1',
  user_id: 'user-1',
  name: 'Ardi Rahman',
  email: 'ardi@worka.id',
  position: 'Project Manager',
  startDate: new Date('2025-01-12T00:00:00.000Z'),
  skills: ['Planning'],
  createdAt: new Date('2025-01-12T00:00:00.000Z'),
};

describe('TeamMemberItem', () => {
  it('opens member details when the member row is clicked', async () => {
    const user = userEvent.setup();
    const onView = vi.fn();

    render(
      <table>
        <tbody>
          <TeamMemberItem member={member} onView={onView} />
        </tbody>
      </table>,
    );

    await user.click(screen.getByText('Ardi Rahman'));

    expect(onView).toHaveBeenCalledOnce();
    expect(onView).toHaveBeenCalledWith(member);
  });

  it('does not open details when the edit action is used from the keyboard', async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    const onEdit = vi.fn();

    render(
      <table>
        <tbody>
          <TeamMemberItem member={member} onView={onView} onEdit={onEdit} />
        </tbody>
      </table>,
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.keyDown(editButton, { key: 'Enter' });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(member);
    expect(onView).not.toHaveBeenCalled();
  });
});
