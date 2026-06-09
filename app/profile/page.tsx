'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePlayCircle,
} from 'react-icons/hi2';
import { formatDate } from '@/lib/helpers';
import { DashboardStatsSkeleton } from '@/components/ui/SkeletonLoader';

interface ProfileStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/tasks?limit=100&page=1');
        const data = await res.json();
        if (data.success) {
          const tasks = data.tasks as Array<{ status: string }>;
          setStats({
            total: tasks.length,
            completed: tasks.filter((t) => t.status === 'completed').length,
            inProgress: tasks.filter((t) => t.status === 'in-progress').length,
            pending: tasks.filter((t) => t.status === 'pending').length,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statsConfig = stats
    ? [
        {
          label: 'Total Tasks',
          value: stats.total,
          icon: HiOutlineClipboardDocumentList,
          color: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
          label: 'Completed',
          value: stats.completed,
          icon: HiOutlineCheckCircle,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
          label: 'In Progress',
          value: stats.inProgress,
          icon: HiOutlinePlayCircle,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
          label: 'Pending',
          value: stats.pending,
          icon: HiOutlineClock,
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        },
      ]
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Your account information and task statistics
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <HiOutlineEnvelope size={15} className="shrink-0" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <HiOutlineCalendarDays size={15} className="shrink-0" />
                Member since {formatDate(user?.createdAt ?? null)}
              </div>
            </div>
          </div>
        </div>

        {/* Account info details */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Full Name
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <HiOutlineUser size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Email Address
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <HiOutlineEnvelope size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Completion rate */}
        {stats && stats.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Completion Rate
              </p>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Task Statistics
        </h3>

        {loading ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statsConfig.map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <HiOutlineCheckCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
            Account Secured
          </p>
          <p className="text-xs text-indigo-600/80 dark:text-indigo-400/70 mt-0.5">
            Your password is encrypted with bcrypt and your session uses HTTP-only JWT cookies.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
