'use client';

import type { ITask } from '@/types';
import { motion } from 'framer-motion';
import { PriorityBadge, StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCalendarDays, HiOutlineBell } from 'react-icons/hi2';
import { formatDate, formatDateTime, isOverdue, isDueSoon } from '@/lib/helpers';

interface TaskRowProps {
  task: ITask;
  index: number;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}

export default function TaskRow({ task, onEdit, onDelete, index }: TaskRowProps) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
  const dueSoon = isDueSoon(task.dueDate) && task.status !== 'completed';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      {/* Title */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span
            className={`text-sm font-medium text-gray-900 dark:text-white ${
              task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''
            }`}
          >
            {task.title}
          </span>
          {task.description && (
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs mt-0.5">
              {task.description}
            </span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden md:table-cell">
        <CategoryBadge category={task.category} />
      </td>

      {/* Priority */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <PriorityBadge priority={task.priority} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={task.status} />
      </td>

      {/* Due Date */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {task.dueDate ? (
          <div className="space-y-1">
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
              {formatDate(task.dueDate)}
            </span>
            {task.reminderDate && (
              <span className="text-[11px] text-indigo-500 dark:text-indigo-300 flex items-center gap-1">
                <HiOutlineBell size={12} />
                {formatDateTime(task.reminderDate)}
              </span>
            )}
          </div>
        ) : task.reminderDate ? (
          <span className="text-[11px] text-indigo-500 dark:text-indigo-300 flex items-center gap-1">
            <HiOutlineBell size={12} />
            {formatDateTime(task.reminderDate)}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all"
            title="Edit"
          >
            <HiOutlinePencilSquare size={15} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
            title="Delete"
          >
            <HiOutlineTrash size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
