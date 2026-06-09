'use client';

import type { ReactNode } from 'react';
import type { INotification } from '@/types';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

interface ReminderItem {
  _id: string;
  title: string;
  taskName?: string;
  dueDate: string;
  completed: boolean;
  isTaskReminder?: boolean;
}

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Track which reminder IDs have already fired a toast this session
const firedToasts = new Set<string>();

function requestBrowserPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

function fireBrowserNotification(title: string, body: string) {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

async function saveNotificationToDB(title: string, message: string, type = 'reminder') {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, type }),
    });
  } catch {
    // non-blocking
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seededRef = useRef(false);

  // Request browser notification permission on mount
  useEffect(() => {
    if (user) requestBrowserPermission();
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  // Seed notifications from tasks that have upcoming reminders (run once per session)
  const seedReminderNotifications = useCallback(async () => {
    if (!user || seededRef.current) return;
    seededRef.current = true;

    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      if (!data.success) return;

      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const reminders: ReminderItem[] = data.reminders;

      // Find reminders that are upcoming in next 24 hours and not yet notified this session
      const upcoming = reminders.filter((r) => {
        if (r.completed) return false;
        const due = new Date(r.dueDate);
        return due >= now && due <= in24h;
      });

      for (const reminder of upcoming.slice(0, 5)) {
        const label = reminder.isTaskReminder
          ? reminder.taskName ?? reminder.title
          : reminder.title;
        const due = new Date(reminder.dueDate);
        const diffMins = Math.round((due.getTime() - now.getTime()) / 60000);
        const timeStr =
          diffMins < 60
            ? `in ${diffMins} min`
            : `at ${due.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

        // Only seed a DB notification if it doesn't already have a recent one
        await saveNotificationToDB(
          'Upcoming Reminder',
          `${reminder.isTaskReminder ? 'Task' : 'Reminder'} "${label}" is due ${timeStr}`
        );
      }

      // Refresh after seeding
      if (upcoming.length > 0) {
        await fetchNotifications();
      }
    } catch {
      // non-blocking
    }
  }, [user, fetchNotifications]);

  // Check reminders and fire toast/browser alerts when due
  const checkReminders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      if (!data.success) return;

      const now = new Date();
      const reminders: ReminderItem[] = data.reminders;

      for (const reminder of reminders) {
        if (reminder.completed) continue;

        const due = new Date(reminder.dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffMins = diffMs / 60000;
        const label = reminder.isTaskReminder
          ? reminder.taskName ?? reminder.title
          : reminder.title;

        // Overdue or firing right now (within 2 min window)
        if (diffMs <= 0 || diffMins <= 2) {
          const toastKey = `due-${reminder._id}`;
          if (!firedToasts.has(toastKey)) {
            firedToasts.add(toastKey);

            const msg =
              diffMs <= 0
                ? reminder.isTaskReminder
                  ? `Task deadline reached: "${label}"`
                  : `Reminder: "${label}"`
                : reminder.isTaskReminder
                ? `Task "${label}" is due in ${Math.ceil(diffMins)} min`
                : `Reminder due soon: "${label}"`;

            toast.warn(msg, { autoClose: 10000,  toastId: toastKey });
            fireBrowserNotification('TaskFlow Reminder', msg);

            // Persist to DB
            await saveNotificationToDB('Reminder Alert', msg);
            await fetchNotifications();
          }
        } else if (diffMins <= 60) {
          // 1-hour advance warning
          const hourKey = `1h-${reminder._id}`;
          if (!firedToasts.has(hourKey)) {
            firedToasts.add(hourKey);
            const msg = reminder.isTaskReminder
              ? `Task "${label}" is due in ~${Math.ceil(diffMins)} min`
              : `Reminder in ~${Math.ceil(diffMins)} min: "${label}"`;

            toast.info(msg, { autoClose: 8000, toastId: hourKey });
            fireBrowserNotification('TaskFlow Reminder', msg);
          }
        }
      }
    } catch {
      // silently ignore
    }
  }, [user, fetchNotifications]);

  // Start polling when user is logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      seededRef.current = false;
      return;
    }

    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
    seedReminderNotifications();
    checkReminders();

    intervalRef.current = setInterval(() => {
      fetchNotifications();
      checkReminders();
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchNotifications, checkReminders, seedReminderNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (ids: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
      });
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n._id!) ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((n) => !n.read)
      .map((n) => n._id!)
      .filter(Boolean);
    if (unreadIds.length > 0) await markRead(unreadIds);
  }, [notifications, markRead]);

  const clearAll = useCallback(async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markRead,
        markAllRead,
        clearAll,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
