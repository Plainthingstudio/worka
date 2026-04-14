import { useState, useEffect } from 'react';
import { account, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { useToast } from '@/hooks/use-toast';
import { parseJsonField } from "@/utils/appwriteJson";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at?: string;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      let user;
      try {
        user = await account.get();
      } catch {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        'notifications',
        [
          Query.equal('user_id', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ]
      );

      const data: Notification[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        type: doc.type,
        title: doc.title,
        message: doc.message,
        data: parseJsonField(doc.data, {}),
        read_at: doc.read_at,
        created_at: doc.$createdAt,
      }));

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read_at).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await databases.updateDocument(DATABASE_ID, 'notifications', notificationId, {
        read_at: new Date().toISOString()
      });

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);

      if (unreadNotifications.length === 0) return;

      await Promise.all(
        unreadNotifications.map(n =>
          databases.updateDocument(DATABASE_ID, 'notifications', n.id, {
            read_at: new Date().toISOString()
          })
        )
      );

      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
};
