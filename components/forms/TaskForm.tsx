'use client';

import type { ChangeEvent, FormEvent } from 'react';
import type { ITask, Priority, Status, TaskFormData } from '@/types';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCategories } from '@/contexts/CategoryContext';

const BUILTIN_CATEGORIES = [
  'General',
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Education',
  'Shopping',
  'Home',
  'Travel',
  'Other',
] as const;

interface TaskFormState {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  reminderDate: string;
}

interface TaskFormProps {
  initialData?: ITask | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  loading: boolean;
}

const DEFAULT_FORM: TaskFormState = {
  title: '',
  description: '',
  category: 'General',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
  reminderDate: '',
};

export default function TaskForm({ initialData, onSubmit, onCancel, loading }: TaskFormProps) {
  const [form, setForm] = useState<TaskFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormState, string>>>({});
  const { categories: userCategories } = useCategories();

  // Merge user-created categories with builtins, deduplicated
  const allCategories = [
    ...BUILTIN_CATEGORIES,
    ...userCategories
      .map((c) => c.name)
      .filter((name) => !BUILTIN_CATEGORIES.includes(name as any)),
  ];

  const toLocalDateTime = (date: string | Date) => {
    const d = new Date(date);
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'General',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'pending',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        reminderDate: initialData.reminderDate
          ? toLocalDateTime(initialData.reminderDate)
          : '',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const key = name as keyof TaskFormState;
    setForm((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof TaskFormState, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (form.title.trim().length > 200) newErrors.title = 'Title is too long';
    if (form.description && form.description.length > 1000)
      newErrors.description = 'Description is too long (max 1000 chars)';
    if (form.dueDate && isNaN(Date.parse(form.dueDate)))
      newErrors.dueDate = 'Invalid date';
    if (form.reminderDate && isNaN(Date.parse(form.reminderDate)))
      newErrors.reminderDate = 'Invalid reminder date';
    if (
      form.dueDate &&
      form.reminderDate &&
      new Date(form.reminderDate) > new Date(form.dueDate + 'T23:59:59')
    )
      newErrors.reminderDate = 'Reminder must be before or equal to the due date';
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...form,
      dueDate: form.dueDate || null,
      reminderDate: form.reminderDate || null,
      assignedTo: null,
      timeEstimate: null,
      subtasks: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <Input
        label="Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Enter task title..."
        error={errors.title}
        required
        maxLength={200}
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add a description (optional)..."
          rows={3}
          maxLength={1000}
          className={`w-full rounded-xl border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-all duration-200 outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.description
              ? 'border-red-400 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}
        />
        <div className="flex justify-between">
          {errors.description ? (
            <p className="text-xs text-red-500">⚠ {errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">
            {form.description.length}/1000
          </span>
        </div>
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </Select>
      </div>

      {/* Status + Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="done">Done</option>
        </Select>

        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Reminder
          </label>
          <input
            name="reminderDate"
            type="datetime-local"
            value={form.reminderDate}
            onChange={handleChange}
            className={`w-full rounded-xl border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-all duration-200 outline-none ${
              errors.reminderDate
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
            min={new Date().toISOString().slice(0, 16)}
          />
          {errors.reminderDate && (
            <p className="text-xs text-red-500">⚠ {errors.reminderDate}</p>
          )}
          <p className="text-xs text-gray-400">
            Optional: set a reminder time before the due date.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" fullWidth loading={loading}>
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
