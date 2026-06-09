'use client';

import type { ITask } from '@/types';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PriorityBadge, StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineBell,
} from 'react-icons/hi2';
import { formatDate, formatDateTime, formatRelativeTime, isOverdue, isDueSoon } from '@/lib/helpers';

interface TaskCardProps {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
  const dueSoon = isDueSoon(task.dueDate) && task.status !== 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`
        relative bg-white dark:bg-gray-800 rounded-2xl border p-5 
        transition-all duration-200 cursor-default group
        ${task.status === 'completed'
          ? 'border-emerald-200 dark:border-emerald-800/50 opacity-80'
          : overdue
          ? 'border-red-200 dark:border-red-800/50'
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
        }
        ${hovered ? 'shadow-lg shadow-gray-200/60 dark:shadow-gray-900/60' : 'shadow-sm'}
      `}
    >
      {/* Overdue/Due Soon indicator strip */}
      {(overdue || dueSoon) && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
            overdue ? 'bg-red-500' : 'bg-yellow-500'
          }`}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className={`font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1 ${
            task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''
          }`}
        >
          {task.title}
        </h3>
        <StatusBadge status={task.status} />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <PriorityBadge priority={task.priority} />
        <CategoryBadge category={task.category} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
        <div className="flex flex-col gap-0.5">
          {task.reminderDate && (
            <span className="text-xs flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
              <HiOutlineBell size={13} />
              Reminder: {formatDateTime(task.reminderDate)}
            </span>
          )}
          {task.dueDate && (
            <span
              className={`text-xs flex items-center gap-1 font-medium ${
                overdue
                  ? 'text-red-500'
                  : dueSoon
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <HiOutlineCalendarDays size={13} />
              {overdue ? '⚠ Overdue · ' : dueSoon ? '⏰ Due soon · ' : ''}
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <HiOutlineClock size={12} />
            {formatRelativeTime(task.createdAt)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all"
            title="Edit task"
          >
            <HiOutlinePencilSquare size={17} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
            title="Delete task"
          >
            <HiOutlineTrash size={17} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
