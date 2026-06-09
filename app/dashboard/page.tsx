'use client';

import { useState, useEffect } from 'react';
import type { ITask } from '@/types';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { isDueSoon } from '@/lib/helpers';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentTasks from '@/components/dashboard/RecentTasks';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import TaskDistribution from '@/components/dashboard/TaskDistribution';
import { DashboardStatsSkeleton, TaskCardSkeleton } from '@/components/ui/SkeletonLoader';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePlayCircle,
  HiOutlineBell,
  HiXMark,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';

export default function DashboardPage() {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  useEffect(() => {
    async function fetchAllTasks() {
      try {
        // Fetch all tasks (no pagination) for analytics
        const res = await fetch('/api/tasks?limit=100&page=1');
        const data = await res.json();
        if (data.success) setTasks(data.tasks);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllTasks();
  }, []);

  // Calculate stats
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed' || t.status === 'done').length;
  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== 'completed' &&
      t.status !== 'done'
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const upcomingReminders = tasks.filter(
    (task) => task.reminderDate && task.status !== 'completed' && isDueSoon(task.reminderDate)
  );

  const statsCards = [
    {
      title: 'Total Tasks',
      value: total,
      icon: HiOutlineClipboardDocumentList,
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'All tasks',
      href: '/tasks',
    },
    {
      title: 'Completed',
      value: completed,
      icon: HiOutlineCheckCircle,
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Tasks finished',
      percentage: completionRate,
      href: '/tasks?status=done',
    },
    {
      title: 'In Progress',
      value: inProgress,
      icon: HiOutlinePlayCircle,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Currently active',
      href: '/tasks?status=in-progress',
    },
    {
      title: 'Pending',
      value: pending,
      icon: HiOutlineClock,
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Waiting to start',
      href: '/tasks?status=todo',
    },
    {
      title: 'Overdue',
      value: overdue,
      icon: HiOutlineExclamationCircle,
      gradient: 'from-red-500 to-rose-600',
      description: 'Past due date',
      href: '/tasks?overdue=true',
    },
  ];

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good{' '}
            {new Date().getHours() < 12
              ? 'morning'
              : new Date().getHours() < 18
              ? 'afternoon'
              : 'evening'}
            , {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Here&apos;s an overview of your tasks
          </p>
        </div>
      </motion.div>

      {upcomingReminders.length > 0 && !loading && !dismissedBanner && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800/40 dark:bg-yellow-950/40 p-4"
        >
          <HiOutlineBell
            size={18}
            className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-100">
              ⏰ {upcomingReminders.length} upcoming reminder
              {upcomingReminders.length === 1 ? '' : 's'} due within the next 3 days
            </p>
            <ul className="mt-1 space-y-0.5">
              {upcomingReminders.slice(0, 3).map((t) => (
                <li
                  key={t._id}
                  className="text-xs text-yellow-700 dark:text-yellow-300 truncate"
                >
                  • {t.title}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setDismissedBanner(true)}
            className="flex-shrink-0 text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-200 transition-colors"
            aria-label="Dismiss"
          >
            <HiXMark size={16} />
          </button>
        </motion.div>
      )}

      {unreadCount > 0 && !loading && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800/40 dark:bg-indigo-950/40 p-4">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
            <HiOutlineBell size={16} />
            You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'} — check the bell icon above.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statsCards.map((card, i) => (
            <StatsCard key={card.title} {...card} delay={i * 0.08} />
          ))}
        </div>
      )}

      {/* Bottom Grid */}
      {loading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <RecentTasks tasks={recentTasks} />
            <UpcomingDeadlines tasks={tasks} />
          </div>
          <div>
            <TaskDistribution tasks={tasks} />
          </div>
        </div>
      )}
    </div>
  );
}
