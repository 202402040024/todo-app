import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { apiError, apiSuccess } from '@/lib/helpers';

// GET /api/tasks — fetch tasks with search, filter, sort, pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';
    const sortBy =
      (searchParams.get('sortBy') as
        | 'newest'
        | 'oldest'
        | 'dueDate'
        | 'priority'
        | 'updated'
        | null) || 'newest';

    await connectDB();

    const filter: Record<string, any> = { userId: user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      dueDate: { dueDate: 1 },
      priority: { priority: -1 },
      updated: { updatedAt: -1 },
    } as const;
    const sort = (sortOptions[sortBy] || sortOptions.newest) as Record<string, 1 | -1>;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Task.countDocuments(filter),
    ]);

    const serializedTasks = tasks.map((task) => ({
      ...task,
      _id: task._id.toString(),
      userId: task.userId.toString(),
    }));

    return apiSuccess({
      tasks: serializedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST /api/tasks — create a task
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      status,
      dueDate,
      reminderDate,
      assignedTo,
      timeEstimate,
      subtasks,
    } = body;

    if (!title || title.trim().length === 0) return apiError('Title is required', 400);
    if (title.trim().length > 200) return apiError('Title cannot exceed 200 characters', 400);
    if (priority && !['low', 'medium', 'high'].includes(priority))
      return apiError('Invalid priority value', 400);
    if (status && !['todo', 'in-progress', 'review', 'done'].includes(status))
      return apiError('Invalid status value', 400);
    if (dueDate && isNaN(Date.parse(dueDate))) return apiError('Invalid due date', 400);
    if (reminderDate && isNaN(Date.parse(reminderDate)))
      return apiError('Invalid reminder date', 400);
    if (
      dueDate &&
      reminderDate &&
      new Date(reminderDate) > new Date(new Date(dueDate).setHours(23, 59, 59, 999))
    )
      return apiError('Reminder must be before or equal to the due date', 400);

    await connectDB();

    const task = await Task.create({
      userId: user._id,
      title: title.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'General',
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate ? new Date(dueDate) : null,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      assignedTo: assignedTo || null,
      timeEstimate: typeof timeEstimate === 'number' ? timeEstimate : null,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
    });

    // Create an in-app notification when a reminder is set
    if (reminderDate) {
      const reminderDisplay = new Date(reminderDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      await Notification.create({
        userId: user._id,
        title: 'Reminder Set',
        message: `Reminder for "${task.title}" scheduled for ${reminderDisplay}`,
        type: 'reminder',
        read: false,
      }).catch(() => {}); // non-blocking
    }

    return apiSuccess(
      {
        message: 'Task created successfully',
        task: {
          ...task.toObject(),
          _id: task._id.toString(),
          userId: task.userId.toString(),
        },
      },
      201
    );
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    if (error.name === 'ValidationError') {
      const err = error as { errors: Record<string, { message: string }> };
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(', ');
      return apiError(message, 400);
    }
    return apiError('Internal server error', 500);
  }
}
