'use client';

import { useState, useEffect } from 'react';
import type { ITask } from '@/types';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import EmptyState from '@/components/ui/EmptyState';
import {
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';

interface Analytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
  overdueTasks: number;
  averageTimeToComplete: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks?limit=100&page=1');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        calculateAnalytics(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (tasks: ITask[]) => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const overdue = tasks.filter(
      (t) =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Count by priority
    const byPriority: Record<string, number> = {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
    };

    // Count by status
    const byStatus: Record<string, number> = {
      pending: pending,
      inProgress: inProgress,
      completed: completed,
    };

    setAnalytics({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      pendingTasks: pending,
      completionRate,
      overdueTasks: overdue,
      averageTimeToComplete: 0,
      tasksByStatus: byStatus,
      tasksByPriority: byPriority,
    });
  };

  const cards = analytics
    ? [
        {
          title: 'Total Tasks',
          value: analytics.totalTasks,
          icon: HiOutlineChartBarSquare,
          color: 'indigo',
        },
        {
          title: 'Completed',
          value: analytics.completedTasks,
          icon: HiOutlineCheckCircle,
          color: 'emerald',
        },
        {
          title: 'In Progress',
          value: analytics.inProgressTasks,
          icon: HiOutlineClock,
          color: 'blue',
        },
        {
          title: 'Completion Rate',
          value: `${analytics.completionRate}%`,
          icon: HiOutlineArrowTrendingUp,
          color: 'purple',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <HiOutlineChartBarSquare className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Your productivity insights
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => {
              const colorMap = {
                indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
                emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
                blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20',
                purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20',
              };

              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-6 border border-gray-200 dark:border-gray-700 ${colorMap[card.color as keyof typeof colorMap]}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[card.color as keyof typeof colorMap].split(' ')[0]}`}
                    >
                      <card.icon className="text-white" size={24} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Priority Distribution */}
            <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Tasks by Priority
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.tasksByPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className="capitalize text-sm text-gray-600 dark:text-gray-400">
                      {priority}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{
                            width: `${
                              analytics.totalTasks > 0
                                ? (count / analytics.totalTasks) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Tasks by Status
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.tasksByStatus).map(([status, count]) => {
                  const labels: Record<string, string> = {
                    pending: 'Pending',
                    inProgress: 'In Progress',
                    completed: 'Completed',
                  };
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {labels[status]}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{
                              width: `${
                                analytics.totalTasks > 0
                                  ? (count / analytics.totalTasks) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {analytics.overdueTasks > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            >
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                ⚠️ You have {analytics.overdueTasks} overdue task{analytics.overdueTasks === 1 ? '' : 's'}
              </p>
            </motion.div>
          )}
        </>
      ) : (
        <EmptyState
          icon={HiOutlineChartBarSquare}
          title="No data"
          description="Create and complete tasks to see your analytics"
        />
      )}
    </div>
  );
}
