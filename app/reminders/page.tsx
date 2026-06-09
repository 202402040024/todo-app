'use client';

import { useState, useEffect } from 'react';
import type { Reminder, Priority, Status } from '@/types';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatDateTime } from '@/lib/helpers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { PriorityBadge, StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import {
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineBell,
  HiOutlineCalendarDays,
  HiOutlineTag,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';

interface ReminderWithSource extends Reminder {
  isTaskReminder?: boolean;
  taskName?: string;
  taskDueDate?: string | null;
  status?: Status;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reminders');
      const data = await res.json();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (reminderId: string, isTaskReminder: boolean) => {
    try {
      if (isTaskReminder) {
        const res = await fetch(`/api/tasks/${reminderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'done' }),
        });
        const data = await res.json();
        if (data.success) {
          setReminders((prev) =>
            prev.map((r) => (r._id === reminderId ? { ...r, completed: true, status: 'done' as Status } : r))
          );
          toast.success('Task marked as completed');
        }
      } else {
        const res = await fetch(`/api/reminders/${reminderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true }),
        });
        const data = await res.json();
        if (data.success) {
          setReminders((prev) =>
            prev.map((r) => (r._id === reminderId ? { ...data.reminder, isTaskReminder: false } : r))
          );
          toast.success('Reminder marked as completed');
        }
      }
    } catch (err) {
      console.error('Failed to update reminder:', err);
      toast.error('Failed to update reminder');
    }
  };

  const deleteReminder = async (reminderId: string, isTaskReminder: boolean) => {
    try {
      if (isTaskReminder) {
        const res = await fetch(`/api/tasks/${reminderId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          setReminders((prev) => prev.filter((r) => r._id !== reminderId));
          toast.success('Task deleted');
        }
      } else {
        const res = await fetch(`/api/reminders/${reminderId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          setReminders((prev) => prev.filter((r) => r._id !== reminderId));
          toast.success('Reminder deleted');
        }
      }
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      toast.error('Failed to delete reminder');
    }
  };

  // Calculate statistics
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const stats = {
    total: reminders.length,
    today: reminders.filter(
      (r) =>
        !r.completed &&
        new Date(r.dueDate) >= todayStart &&
        new Date(r.dueDate) < tomorrowStart
    ).length,
    upcoming: reminders.filter(
      (r) => !r.completed && new Date(r.dueDate) >= tomorrowStart
    ).length,
    completed: reminders.filter((r) => r.completed).length,
    overdue: reminders.filter(
      (r) => !r.completed && new Date(r.dueDate) < todayStart
    ).length,
  };

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch =
      reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const reminderDate = new Date(reminder.dueDate);
    if (filter === 'today')
      return matchesSearch && !reminder.completed && reminderDate >= todayStart && reminderDate < tomorrowStart;
    if (filter === 'upcoming')
      return matchesSearch && !reminder.completed && reminderDate >= tomorrowStart;
    if (filter === 'completed')
      return matchesSearch && reminder.completed;
    if (filter === 'overdue')
      return matchesSearch && !reminder.completed && reminderDate < todayStart;
    return matchesSearch;
  });

  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${color}`}
    >
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </motion.div>
  );

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <HiOutlineBell className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Reminders
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                {stats.upcoming} upcoming · {stats.today} today · {stats.completed} completed
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Total"
          value={stats.total}
          color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        />
        <StatCard
          label="Today"
          value={stats.today}
          color="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          color="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search reminders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredReminders.length === 0 ? (
        <EmptyState
          icon={HiOutlineClock}
          title="No reminders"
          description={
            reminders.length === 0
              ? 'Add a reminder date to any task to see it here'
              : 'No reminders match your current filter'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((reminder, i) => {
            const reminderDate = new Date(reminder.dueDate);
            const isOverdue =
              !reminder.completed && reminderDate < todayStart;
            const isToday =
              !reminder.completed &&
              reminderDate >= todayStart &&
              reminderDate < tomorrowStart;

            return (
              <motion.div
                key={reminder._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-4 rounded-xl border transition-all ${
                  reminder.completed
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-70'
                    : isOverdue
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : isToday
                    ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Completion toggle */}
                  <button
                    onClick={() =>
                      markAsCompleted(reminder._id!, reminder.isTaskReminder || false)
                    }
                    className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      reminder.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500'
                    }`}
                    aria-label="Mark as completed"
                  >
                    {reminder.completed && (
                      <HiOutlineCheck className="text-white" size={14} />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title row */}
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3
                        className={`font-semibold text-base leading-snug ${
                          reminder.completed
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {reminder.title}
                      </h3>
                      {reminder.isTaskReminder && (
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full whitespace-nowrap">
                          Task Reminder
                        </span>
                      )}
                      {isOverdue && !reminder.completed && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full whitespace-nowrap">
                          Overdue
                        </span>
                      )}
                      {isToday && !reminder.completed && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full whitespace-nowrap">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Task name (when it's a task reminder) */}
                    {reminder.isTaskReminder && reminder.taskName && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <HiOutlineClipboardDocumentList
                          size={14}
                          className="text-indigo-500 dark:text-indigo-400 flex-shrink-0"
                        />
                        <span className="font-medium">Task:</span>
                        <span>{reminder.taskName}</span>
                      </div>
                    )}

                    {/* Description / notes */}
                    {reminder.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {reminder.notes}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {/* Reminder date & time */}
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          isOverdue
                            ? 'text-red-600 dark:text-red-400'
                            : isToday
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <HiOutlineBell size={13} />
                        {formatDateTime(reminder.dueDate)}
                      </span>

                      {/* Priority */}
                      <PriorityBadge priority={reminder.priority as Priority} />

                      {/* Status */}
                      {reminder.status && (
                        <StatusBadge status={reminder.status as Status} />
                      )}

                      {/* Category */}
                      {reminder.category && reminder.category !== 'General' && (
                        <CategoryBadge category={reminder.category} />
                      )}

                      {/* Task due date (separate from reminder date) */}
                      {reminder.isTaskReminder && reminder.taskDueDate && (
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <HiOutlineCalendarDays size={13} />
                          Due: {formatDate(reminder.taskDueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() =>
                      deleteReminder(reminder._id!, reminder.isTaskReminder || false)
                    }
                    className="flex-shrink-0 p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete reminder"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
