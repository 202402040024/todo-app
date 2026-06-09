'use client';

import type { TaskFilters as TaskFilterTypes } from '@/types';
import { HiOutlineFunnel, HiOutlineXMark, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface TaskFiltersProps {
  filters: TaskFilterTypes;
  onChange: (key: keyof TaskFilterTypes, value: string) => void;
  onReset: () => void;
}

export default function TaskFilters({ filters, onChange, onReset }: TaskFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.status || filters.priority || filters.category;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <HiOutlineFunnel size={16} />
          Filters
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            <HiOutlineXMark size={14} />
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search tasks..."
        value={filters.search}
        onChange={(e) => onChange('search', e.target.value)}
        icon={HiOutlineMagnifyingGlass}
      />

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Select
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>

        <Select
          value={filters.priority}
          onChange={(e) => onChange('priority', e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </Select>

        <Select
          value={filters.category}
          onChange={(e) => onChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {[
            'General','Work','Personal','Health','Finance',
            'Education','Shopping','Home','Travel','Other',
          ].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Select
          value={filters.sortBy}
          onChange={(e) => onChange('sortBy', e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="updated">Recently Updated</option>
        </Select>
      </div>
    </div>
  );
}
