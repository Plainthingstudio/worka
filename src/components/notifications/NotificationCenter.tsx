import React from 'react';
import {
  Bell,
  CalendarClock,
  CheckCheck,
  Clock,
  CreditCard,
  FileText,
  FolderOpen,
  MessageSquare,
  Paperclip,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export const NotificationCenter = () => {
  const { notifications, unreadCount, isLoading, markAllAsRead, markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
      case 'subtask_assigned':
      case 'project_assigned':
        return <UserCheck className="h-4 w-4 text-primary" />;
      case 'task_unassigned':
      case 'project_unassigned':
        return <UserMinus className="h-4 w-4 text-muted-foreground" />;
      case 'task_comment_added':
      case 'task_mention':
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'task_attachment_added':
        return <Paperclip className="h-4 w-4 text-primary" />;
      case 'task_due_date_changed':
      case 'project_deadline_changed':
      case 'task_due_reminder':
      case 'project_due_reminder':
        return <CalendarClock className="h-4 w-4 text-primary" />;
      case 'task_status_changed':
      case 'task_priority_changed':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'task_brief_connected':
      case 'task_brief_disconnected':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'project_payment_added':
        return <CreditCard className="h-4 w-4 text-primary" />;
      case 'project_status_changed':
      case 'project_task_created':
      case 'project_activity_added':
      case 'subtask_created':
        return <FolderOpen className="h-4 w-4 text-secondary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs rounded-full flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  icon={getNotificationIcon(notification.type)}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
