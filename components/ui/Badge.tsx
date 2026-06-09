'use client';

import type { Priority, Status } from '@/types';
import { getPriorityColors, getStatusColors, capitalize } from '@/lib/helpers';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = getPriorityColors(priority);

  const icons: Record<Priority, string> = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className="text-[10px]">{icons[priority]}</span>
      {capitalize(priority)}
    </span>
  );
}

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = getStatusColors(status);

  const labels: Record<Status, string> = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    todo: 'To Do',
    done: 'Done',
    review: 'Review',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {labels[status] || capitalize(status)}
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
      {category || 'General'}
    </span>
  );
}
