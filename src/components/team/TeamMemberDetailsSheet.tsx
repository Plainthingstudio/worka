import { useEffect, useMemo, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import {
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Flag,
  ListChecks,
  MessageSquare,
  Paperclip,
  Plus,
  UserRoundPlus,
} from 'lucide-react';
import type { TeamMember } from '@/types';
import { UserAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemberActivities } from '@/hooks/useMemberActivities';
import {
  filterMemberActivities,
  type MemberActivity,
  type MemberActivityCategory,
  type MemberActivityPeriod,
} from './memberActivity';

interface TeamMemberDetailsSheetProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleLabel = (role?: string) => {
  if (!role) return 'Team member';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const activityIcon = (type: MemberActivity['type']) => {
  switch (type) {
    case 'task_created':
      return Plus;
    case 'comment':
      return MessageSquare;
    case 'status_change':
      return CheckCircle2;
    case 'priority_change':
      return Flag;
    case 'due_date_change':
      return CalendarDays;
    case 'assignee_change':
      return UserRoundPlus;
    case 'attachment':
      return Paperclip;
    default:
      return ListChecks;
  }
};

const activityLabel = (activity: MemberActivity) => {
  const metadata = activity.metadata as Record<string, string | undefined>;
  switch (activity.type) {
    case 'task_created':
      return activity.isSubtask ? 'Created subtask' : 'Created task';
    case 'comment':
      return 'Commented';
    case 'status_change':
      return `Changed status${metadata.new_value ? ` to ${metadata.new_value}` : ''}`;
    case 'priority_change':
      return `Changed priority${metadata.new_value ? ` to ${metadata.new_value}` : ''}`;
    case 'due_date_change':
      return metadata.new_value ? 'Changed due date' : 'Removed due date';
    case 'assignee_change':
      return metadata.action === 'removed' ? 'Removed an assignee' : 'Added an assignee';
    case 'attachment':
      return 'Added an attachment';
    case 'brief_connected':
      return 'Connected a brief';
    case 'brief_disconnected':
      return 'Disconnected a brief';
    default:
      return 'Updated task';
  }
};

const dayLabel = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM dd, yyyy');
};

const TeamActivityItem = ({ activity }: { activity: MemberActivity }) => {
  const Icon = activityIcon(activity.type);
  const creationContext = activity.isSubtask && activity.parentTaskTitle
    ? `${activity.parentTaskTitle} · ${activity.projectName}`
    : activity.projectName;

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <p className="text-sm font-medium leading-5 text-foreground">{activityLabel(activity)}</p>
        <p className="truncate text-sm text-foreground/80">{activity.taskTitle}</p>
        {activity.type === 'comment' && activity.content && (
          <p className="mt-2 line-clamp-3 rounded-lg bg-muted/70 px-3 py-2 text-sm leading-5 text-muted-foreground">
            “{activity.content}”
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {creationContext} · {format(activity.createdAt, 'HH:mm')}
        </p>
      </div>
    </div>
  );
};

export const TeamMemberDetailsSheet = ({ member, open, onOpenChange }: TeamMemberDetailsSheetProps) => {
  const [activeTab, setActiveTab] = useState('activity');
  const [category, setCategory] = useState<MemberActivityCategory>('all');
  const [period, setPeriod] = useState<MemberActivityPeriod>('30');
  const { activities, isLoading, error } = useMemberActivities(member?.user_id || '');

  useEffect(() => {
    if (!open) return;
    setActiveTab('activity');
    setCategory('all');
    setPeriod('30');
  }, [member?.id, open]);

  const filteredActivities = useMemo(
    () => filterMemberActivities(activities, category, period),
    [activities, category, period],
  );
  const groupedActivities = useMemo(() => {
    const groups = new Map<string, MemberActivity[]>();
    filteredActivities.forEach((activity) => {
      const label = dayLabel(activity.createdAt);
      groups.set(label, [...(groups.get(label) || []), activity]);
    });
    return Array.from(groups.entries());
  }, [filteredActivities]);

  if (!member) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]">
        <SheetHeader className="px-6 pb-2 pt-6 text-left">
          <div className="flex items-center gap-3 pr-8">
            <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size={48} />
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-base">{member.name}</SheetTitle>
              <SheetDescription className="truncate">{member.position}</SheetDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">{roleLabel(member.role)}</Badge>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
          <div className="px-6 py-2">
            <TabsList className="grid w-full grid-cols-2 dark:bg-black/20">
              <TabsTrigger value="details">
                <CircleUserRound className="h-4 w-4" aria-hidden="true" />
                Details
              </TabsTrigger>
              <TabsTrigger value="activity">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Activity
                <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  {activities.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="m-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <CircleUserRound className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Member details</h3>
              </div>
              <dl className="grid gap-4 text-sm">
                <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1 break-all font-medium">{member.email || 'Not available'}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Position</dt><dd className="mt-1 font-medium">{member.position}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Role</dt><dd className="mt-1 font-medium">{roleLabel(member.role)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Start date</dt><dd className="mt-1 font-medium">{format(new Date(member.startDate), 'MMM dd, yyyy')}</dd></div>
                <div>
                  <dt className="text-xs text-muted-foreground">Skills</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {member.skills.length > 0 ? member.skills.map((skill) => <Badge key={skill} variant="category">{skill}</Badge>) : <span className="text-muted-foreground">No skills added</span>}
                  </dd>
                </div>
              </dl>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="m-0 flex min-h-0 flex-1 flex-col">
            <div className="flex gap-2 border-b px-6 pb-3 pt-1">
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as MemberActivityCategory)}
              >
                <SelectTrigger aria-label="Activity type" className="h-9 min-w-0 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All activity</SelectItem>
                  <SelectItem value="created">Tasks & subtasks</SelectItem>
                  <SelectItem value="comments">Comments</SelectItem>
                  <SelectItem value="updates">Task updates</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as MemberActivityPeriod)}
              >
                <SelectTrigger aria-label="Activity period" className="h-9 min-w-0 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {isLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Loading activity…</p>
              ) : error ? (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">Activity could not be loaded. Close the sidebar and try again.</p>
              ) : groupedActivities.length === 0 ? (
                <div className="py-12 text-center"><ListChecks className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" /><p className="text-sm font-medium">No activity in this period</p><p className="mt-1 text-xs text-muted-foreground">Try another filter or a longer period.</p></div>
              ) : (
                <div className="space-y-2">
                  {groupedActivities.map(([label, items]) => (
                    <section key={label}>
                      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</h3>
                      {items.map((activity) => <TeamActivityItem key={activity.id} activity={activity} />)}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
