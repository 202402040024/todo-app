'use client';

import type { ITask, TaskFilters as TaskFilterTypes, TaskFormData } from '@/types';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { useDebounce } from '@/hooks/useDebounce';
import TaskCard from '@/components/tasks/TaskCard';
import TaskRow from '@/components/tasks/TaskRow';
import TaskFilters from '@/components/tasks/TaskFilters';
import Pagination from '@/components/tasks/Pagination';
import TaskForm from '@/components/forms/TaskForm';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { TaskCardSkeleton, TaskListSkeleton } from '@/components/ui/SkeletonLoader';
import {
  HiOutlinePlus,
  HiOutlineViewColumns,
  HiOutlineTableCells,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { isOverdue } from '@/lib/helpers';

const DEFAULT_FILTERS: TaskFilterTypes = {
  search: '',
  status: '',
  priority: '',
  category: '',
  sortBy: 'newest',
};

// Inner component that uses useSearchParams (must be inside Suspense)
function TasksPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tasks, pagination, loading, fetchTasks, createTask, updateTask, deleteTask } = useTasks();

  // Initialize filters from URL on first render
  const [filters, setFilters] = useState<TaskFilterTypes>(() => ({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as TaskFilterTypes['status']) || '',
    priority: (searchParams.get('priority') as TaskFilterTypes['priority']) || '',
    category: searchParams.get('category') || '',
    sortBy: (searchParams.get('sortBy') as TaskFilterTypes['sortBy']) || 'newest',
  }));

  // Special overdue filter (not a status value, handled client-side)
  const [showOverdueOnly, setShowOverdueOnly] = useState(
    searchParams.get('overdue') === 'true'
  );

  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<ITask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ITask | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 400);

  // Keep URL in sync with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.category) params.set('category', filters.category);
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
    if (showOverdueOnly) params.set('overdue', 'true');

    const qs = params.toString();
    router.replace(qs ? `/tasks?${qs}` : '/tasks', { scroll: false });
  }, [filters, showOverdueOnly, router]);

  // Fetch tasks when filters or page change
  const loadTasks = useCallback(() => {
    fetchTasks({
      page,
      limit: 12,
      search: debouncedSearch,
      // When overdue-only is active, fetch all non-done tasks and filter client-side
      status: showOverdueOnly ? '' : filters.status,
      priority: filters.priority,
      category: filters.category,
      sortBy: filters.sortBy,
    });
  }, [page, debouncedSearch, filters.status, filters.priority, filters.category, filters.sortBy, showOverdueOnly, fetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.priority, filters.category, filters.sortBy, showOverdueOnly]);

  const handleFilterChange = (key: keyof TaskFilterTypes, value: string) => {
    setShowOverdueOnly(false);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setShowOverdueOnly(false);
    setPage(1);
  };

  const handleCreate = async (data: TaskFormData) => {
    setFormLoading(true);
    try {
      await createTask(data);
      setCreateOpen(false);
      loadTasks();
    } catch {
      // Error toast handled in hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (data: TaskFormData) => {
    if (!editTask) return;
    setFormLoading(true);
    try {
      await updateTask(editTask._id, data);
      setEditTask(null);
      loadTasks();
    } catch {
      // Error toast handled in hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTask(deleteTarget._id);
      setDeleteTarget(null);
      loadTasks();
    } catch {
      // Error toast handled in hook
    } finally {
      setDeleteLoading(false);
    }
  };

  // Apply overdue client-side filter on top of API results
  const displayedTasks = showOverdueOnly
    ? tasks.filter(
        (t) =>
          t.dueDate &&
          isOverdue(t.dueDate) &&
          t.status !== 'completed' &&
          t.status !== 'done'
      )
    : tasks;

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.category ||
    showOverdueOnly;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination
              ? `${pagination.total} task${pagination.total !== 1 ? 's' : ''}`
              : 'Manage your tasks'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Grid view"
            >
              <HiOutlineViewColumns size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="List view"
            >
              <HiOutlineTableCells size={18} />
            </button>
          </div>

          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <HiOutlinePlus size={16} />
            New Task
          </Button>
        </div>
      </div>

      {/* Active overdue banner */}
      {showOverdueOnly && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <HiOutlineExclamationCircle
            size={18}
            className="text-red-500 dark:text-red-400 flex-shrink-0"
          />
          <span className="text-sm font-medium text-red-700 dark:text-red-300 flex-1">
            Showing overdue tasks only
          </span>
          <button
            onClick={handleResetFilters}
            className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Tasks Content */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <TaskListSkeleton count={8} />
        )
      ) : displayedTasks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting or clearing your filters to find tasks.'
              : 'Create your first task to get started with TaskFlow.'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Create Task'}
          onAction={hasActiveFilters ? handleResetFilters : () => setCreateOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {displayedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={(t: ITask) => setEditTask(t)}
                onDelete={(t: ITask) => setDeleteTarget(t)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                <AnimatePresence>
                  {displayedTasks.map((task, i) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      index={i}
                      onEdit={(t: ITask) => setEditTask(t)}
                      onDelete={(t: ITask) => setDeleteTarget(t)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination — hide when overdue filter is active (client-side filtered) */}
      {!loading && displayedTasks.length > 0 && !showOverdueOnly && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}

      {/* Create Task Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task">
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm
          initialData={editTask}
          onSubmit={handleEdit}
          onCancel={() => setEditTask(null)}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it in Next.js App Router
export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5">
          <div className="h-10 w-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <TasksPageInner />
    </Suspense>
  );
}
