'use client';

import type { ITask } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { HiOutlineArrowRight, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { formatRelativeTime } from '@/lib/helpers';

interface RecentTasksProps {
  tasks: ITask[];
}

export default function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <HiOutlineClipboardDocumentList size={18} className="text-indigo-500" />
          Recent Tasks
        </h3>
        <Link
          href="/tasks"
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
        >
          View all <HiOutlineArrowRight size={13} />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
          No tasks yet. Create one to get started!
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-emerald-500'
                    : task.status === 'in-progress'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    task.status === 'completed'
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(task.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <PriorityBadge priority={task.priority} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
