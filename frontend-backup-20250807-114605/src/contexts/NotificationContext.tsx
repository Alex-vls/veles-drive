import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from './types';
import { notificationsService } from './services/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount(),
      ]);
      setNotifications(notificationsData.results);
      setUnreadCount(unreadCountData);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Обновляем уведомления каждые 30 секунд
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      setError(null);
      await notificationsService.markAsRead(id);
      await fetchNotifications();
    } catch (err) {
      setError('Failed to mark notification as read');
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      setError(null);
      await notificationsService.markAllAsRead();
      await fetchNotifications();
    } catch (err) {
      setError('Failed to mark all notifications as read');
      throw err;
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      setError(null);
      await notificationsService.deleteNotification(id);
      await fetchNotifications();
    } catch (err) {
      setError('Failed to delete notification');
      throw err;
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setError(null);
      await notificationsService.deleteAllNotifications();
      await fetchNotifications();
    } catch (err) {
      setError('Failed to delete all notifications');
      throw err;
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 