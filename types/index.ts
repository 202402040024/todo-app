// ─── User Types ───────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  timezone?: string;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Task Types ───────────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'done' | 'pending' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
}

export interface ITask {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  reminderDate: string | null;
  assignedTo?: string | null;
  progress?: number;
  subtasks?: Subtask[];
  comments?: Comment[];
  attachments?: Attachment[];
  timeEstimate?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T = Record<string, unknown>> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T = Record<string, unknown>> = ApiSuccess<T> | ApiError;

// ─── Filter / Query Types ─────────────────────────────────────────────────────

export type SortBy = 'newest' | 'oldest' | 'dueDate' | 'priority' | 'updated';

export interface TaskFilters {
  search: string;
  status: Status | '';
  priority: Priority | '';
  category: string;
  sortBy: SortBy;
}

export interface TaskQueryParams extends Partial<TaskFilters> {
  page?: number;
  limit?: number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface TaskFormData {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  reminderDate: string | null;
  assignedTo: string | null;
  timeEstimate: number | null;
  subtasks: Subtask[];
}

export interface Category {
  _id?: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory extends Category {}

export interface Reminder {
  _id?: string;
  userId: string;
  title: string;
  notes?: string;
  dueDate: string;
  completed: boolean;
  priority: Priority;
  category: string;
  taskId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IReminder extends Reminder {}

export interface Notification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'reminder' | 'system';
  read: boolean;
  createdAt?: string;
}

export interface INotification extends Notification {}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Color Helper Types ───────────────────────────────────────────────────────

export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
  dot: string;
}
