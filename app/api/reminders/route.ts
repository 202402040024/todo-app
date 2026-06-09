import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';
import Task from '@/models/Task';
import { apiError, apiSuccess } from '@/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';

    await connectDB();

    // Fetch dedicated reminders
    const filter: Record<string, any> = { userId: user._id };
    if (status === 'overdue') filter.completed = false;
    if (status === 'completed') filter.completed = true;

    const reminders = await Reminder.find(filter).sort({ dueDate: 1 }).lean();

    // Fetch tasks with reminderDate as virtual reminders
    const taskFilter: Record<string, any> = {
      userId: user._id,
      reminderDate: { $ne: null },
    };

    const tasks = await Task.find(taskFilter)
      .select('_id title description reminderDate priority category status dueDate')
      .lean();

    // Convert tasks to reminder format
    const taskReminders = tasks.map((task: any) => ({
      _id: task._id.toString(),
      userId: user._id.toString(),
      title: `Reminder: ${task.title}`,
      taskName: task.title,
      notes: task.description || '',
      dueDate: task.reminderDate,
      taskDueDate: task.dueDate ? task.dueDate.toISOString() : null,
      completed: task.status === 'done',
      priority: task.priority || 'medium',
      category: task.category || 'General',
      status: task.status || 'todo',
      taskId: task._id.toString(),
      isTaskReminder: true,
      createdAt: task._id.getTimestamp?.(),
    }));

    // Combine and sort all reminders
    const allReminders = [
      ...reminders.map((reminder) => ({
        ...reminder,
        _id: reminder._id.toString(),
        userId: reminder.userId.toString(),
        dueDate: reminder.dueDate.toISOString(),
        isTaskReminder: false,
      })),
      ...taskReminders,
    ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return apiSuccess({ reminders: allReminders });
  } catch (error: any) {
    console.error('GET /api/reminders error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const body = await request.json();
    const { title, notes, dueDate, priority, category, taskId } = body;

    if (!title || title.trim().length === 0) {
      return apiError('Title is required', 400);
    }

    if (!dueDate || isNaN(Date.parse(dueDate))) {
      return apiError('Valid due date is required', 400);
    }

    await connectDB();

    const reminder = await Reminder.create({
      userId: user._id,
      title: title.trim(),
      notes: notes?.trim() || '',
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      category: category?.trim() || 'General',
      taskId: taskId || null,
    });

    return apiSuccess({
      message: 'Reminder created successfully',
      reminder: {
        ...reminder.toObject(),
        _id: reminder._id.toString(),
        userId: reminder.userId.toString(),
        dueDate: reminder.dueDate.toISOString(),
        isTaskReminder: false,
      },
    }, 201);
  } catch (error: any) {
    console.error('POST /api/reminders error:', error);
    return apiError('Internal server error', 500);
  }
}
