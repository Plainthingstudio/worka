import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getNotificationDestination } from '@/services/notificationService';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at?: string;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  icon: React.ReactNode;
  onMarkAsRead: (notificationId: string) => void;
}

export const NotificationItem = ({ notification, icon, onMarkAsRead }: NotificationItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }

    const destination = getNotificationDestination(notification.data);
    if (destination) navigate(destination);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full p-3 h-auto text-left justify-start relative group",
        !notification.read_at && "bg-accent/50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium line-clamp-1">
              {notification.title}
            </h4>
            {!notification.read_at && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {timeAgo}
          </p>
        </div>
      </div>
    </Button>
  );
};
