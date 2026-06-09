'use client';

import type { ITask } from '@/types';
import { motion } from 'framer-motion';
import { HiOutlineCalendarDays, HiOutlineClock } from 'react-icons/hi2';
import { PriorityBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, isOverdue, isDueSoon } from '@/lib/helpers';

interface UpcomingDeadlinesProps {
  tasks: ITask[];
}

export default function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProps) {
  // Filter tasks with due dates, not completed, sorted by due date
  const upcomingReminders = tasks
    .filter((t) => t.reminderDate && t.status !== 'completed')
    .sort((a, b) => new Date(a.reminderDate ?? '').getTime() - new Date(b.reminderDate ?? '').getTime())
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate ?? '').getTime() - new Date(b.dueDate ?? '').getTime())
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <HiOutlineCalendarDays size={18} className="text-orange-500" />
        Upcoming Deadlines & Reminders
      </h3>

      {upcomingReminders.length === 0 && upcomingTasks.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
          No upcoming reminders or deadlines. You&apos;re all caught up!
        </p>
      ) : (
        <div className="space-y-4">
          {upcomingReminders.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Reminders
              </h4>
              <div className="space-y-2">
                {upcomingReminders.map((task, i) => {
                  const reminderSoon = isDueSoon(task.reminderDate);
                  const reminderOverdue = task.reminderDate
                    ? new Date(task.reminderDate) < new Date()
                    : false;

                  return (
                    <motion.div
                      key={`reminder-${task._id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        reminderOverdue
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30'
                          : reminderSoon
                          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800/30'
                          : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          reminderOverdue
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : reminderSoon
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <HiOutlineClock
                          size={16}
                          className={
                            reminderOverdue
                              ? 'text-red-500'
                              : reminderSoon
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-indigo-500 dark:text-indigo-300 flex items-center gap-1 mt-0.5">
                          {reminderOverdue ? '⚠ Reminder overdue —' : reminderSoon ? '⏰ Reminder soon —' : 'Reminder —'}
                          {formatDateTime(task.reminderDate)}
                        </p>
                      </div>

                      <PriorityBadge priority={task.priority} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Deadlines
              </h4>
              <div className="space-y-2">
                {upcomingTasks.map((task, i) => {
                  const overdue = isOverdue(task.dueDate);
                  const dueSoon = isDueSoon(task.dueDate);

                  return (
                    <motion.div
                      key={`deadline-${task._id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        overdue
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30'
                          : dueSoon
                          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800/30'
                          : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          overdue
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : dueSoon
                            ? 'bg-yellow-100 dark:bg-yellow-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <HiOutlineClock
                          size={16}
                          className={
                            overdue
                              ? 'text-red-500'
                              : dueSoon
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {task.title}
                        </p>
                        <p
                          className={`text-xs font-medium mt-0.5 ${
                            overdue
                              ? 'text-red-500'
                              : dueSoon
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {overdue ? '⚠ Overdue — ' : dueSoon ? '⏰ Due soon — ' : ''}
                          {formatDate(task.dueDate)}
                        </p>
                      </div>

                      <PriorityBadge priority={task.priority} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
