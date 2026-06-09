'use client';

import type { ITask, IPagination, TaskFormData, TaskQueryParams } from '@/types';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { buildQueryString } from '@/lib/helpers';

export function useTasks() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (params: TaskQueryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQueryString(params as Record<string, string | number | boolean | null | undefined>);
      const res = await fetch(`/api/tasks${qs}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks');

      setTasks(data.tasks as ITask[]);
      setPagination(data.pagination as IPagination);
      return data;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: TaskFormData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create task');

    toast.success('Task created successfully!');
    return data.task;
  }, []);

  const updateTask = useCallback(async (id: string, taskData: TaskFormData) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update task');

    toast.success('Task updated successfully!');
    return data.task;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to delete task');

    toast.success('Task deleted successfully!');
    return true;
  }, []);

  const getTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to fetch task');
    return data.task;
  }, []);

  return {
    tasks,
    setTasks,
    pagination,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTask,
  };
}
