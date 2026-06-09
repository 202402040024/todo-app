/**
 * Format a date to a readable string
 * @param {string|Date} date
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
import type { Priority, Status } from '@/types';

export function formatDate(date: string | Date | null, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) return 'No date';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date: string | Date) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Check if a date is overdue
 * @param {string|Date} date
 * @returns {boolean}
 */
export function isOverdue(date: string | Date | null) {
  if (!date) return false;
  return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
}

/**
 * Check if a date is due soon (within next 3 days)
 * @param {string|Date|null} date
 * @returns {boolean}
 */
export function isDueSoon(date: string | Date | null) {
  if (!date) return false;
  const dueDate = new Date(date);
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);
  return dueDate >= now && dueDate <= threeDaysFromNow;
}

/**
 * Format a date and time to a readable string
 * @param {string|Date} date
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDateTime(date: string | Date | null, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) return 'No date';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
}

/**
 * Get priority color classes for Tailwind
 * @param {string} priority
 * @returns {Object} color classes
 */
export function getPriorityColors(priority: Priority) {
  const colors: Record<Priority, { bg: string; text: string; border: string; dot: string }> = {
    high: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-300 dark:border-red-700',
      dot: 'bg-red-500',
    },
    medium: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-300 dark:border-yellow-700',
      dot: 'bg-yellow-500',
    },
    low: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      dot: 'bg-green-500',
    },
  };
  return colors[priority] || colors.medium;
}

/**
 * Get status color classes for Tailwind
 * @param {string} status
 * @returns {Object} color classes
 */
export function getStatusColors(status: Status) {
  const colors: Record<Status, { bg: string; text: string; border: string; dot: string }> = {
    pending: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-600',
      dot: 'bg-gray-500',
    },
    'in-progress': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
      dot: 'bg-blue-500',
    },
    completed: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-700',
      dot: 'bg-emerald-500',
    },
    todo: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-600',
      dot: 'bg-gray-500',
    },
    done: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-700',
      dot: 'bg-emerald-500',
    },
    review: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-300 dark:border-purple-700',
      dot: 'bg-purple-500',
    },
  };
  return colors[status] || colors.pending;
}

/**
 * Capitalize first letter of a string
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a given length
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
export function truncate(str: string, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Create a debounced function
 * @param {Function} func
 * @param {number} delay
 * @returns {Function}
 */
export function debounce<T extends unknown[]>(func: (...args: T) => void, delay = 400) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Build a query string from an object
 * @param {Record<string, string | number | boolean | null | undefined>} params
 * @returns {string}
 */
export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString() ? `?${searchParams.toString()}` : '';
}

/**
 * Standard API error response
 * @param {string} message
 * @param {number} status
 * @returns {Response}
 */
export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Standard API success response
 * @param {Record<string, unknown>} data
 * @param {number} status
 * @returns {Response}
 */
export function apiSuccess(data: Record<string, unknown>, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}
