'use client';

import type { ITask } from '@/types';
import { motion } from 'framer-motion';
import { HiOutlineChartPie } from 'react-icons/hi2';

interface DistributionBarProps {
  label: string;
  count: number;
  total: number;
  colorClass: string;
  delay: number;
}

function DistributionBar({ label, count, total, colorClass, delay }: DistributionBarProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs">({percentage}%)</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay, duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

interface TaskDistributionProps {
  tasks: ITask[];
}

export default function TaskDistribution({ tasks }: TaskDistributionProps) {
  const total = tasks.length;

  const statusCounts = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const priorityCounts = {
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
        <HiOutlineChartPie size={18} className="text-purple-500" />
        Task Distribution
      </h3>

      {total === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
          Create tasks to see distribution charts.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Status Distribution */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              By Status
            </p>
            <DistributionBar
              label="Pending"
              count={statusCounts.pending}
              total={total}
              colorClass="bg-gray-400"
              delay={0.1}
            />
            <DistributionBar
              label="In Progress"
              count={statusCounts['in-progress']}
              total={total}
              colorClass="bg-blue-500"
              delay={0.2}
            />
            <DistributionBar
              label="Completed"
              count={statusCounts.completed}
              total={total}
              colorClass="bg-emerald-500"
              delay={0.3}
            />
          </div>

          {/* Priority Distribution */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              By Priority
            </p>
            <DistributionBar
              label="High"
              count={priorityCounts.high}
              total={total}
              colorClass="bg-red-500"
              delay={0.4}
            />
            <DistributionBar
              label="Medium"
              count={priorityCounts.medium}
              total={total}
              colorClass="bg-yellow-500"
              delay={0.5}
            />
            <DistributionBar
              label="Low"
              count={priorityCounts.low}
              total={total}
              colorClass="bg-green-500"
              delay={0.6}
            />
          </div>
        </div>
      )}
    </div>
  );
}
