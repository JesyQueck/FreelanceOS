import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabase';

export interface Notification {
  id: string;
  type: 'message' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  conversationId?: string;
  senderId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toastNotifications: Array<Omit<Notification, 'read'> & { id: string }>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addToastNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeToastNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastNotifications, setToastNotifications] = useState<Array<Omit<Notification, 'read'> & { id: string }>>([]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Add toast notification
  const addToastNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newToastNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setToastNotifications(prev => [...prev, newToastNotification]);
  };

  // Remove toast notification
  const removeToastNotification = (id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Listen for real-time messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}` // Only messages from other users
        },
        (payload) => {
          const newMessage = payload.new;
          
          // Add notification for new message
          addNotification({
            type: 'message',
            title: 'New Message',
            message: newMessage.content.substring(0, 100) + (newMessage.content.length > 100 ? '...' : ''),
            conversationId: newMessage.conversation_id,
            senderId: newMessage.sender_id,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    toastNotifications,
    addNotification,
    addToastNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeToastNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
