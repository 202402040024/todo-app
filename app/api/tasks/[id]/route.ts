import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { apiError, apiSuccess } from '@/lib/helpers';
import mongoose from 'mongoose';

// Helper to validate ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/tasks/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return apiError('Invalid task ID', 400);

    await connectDB();

    const task = await Task.findOne({ _id: id, userId: user._id }).lean();
    if (!task) return apiError('Task not found', 404);

    return apiSuccess({
      task: {
        ...task,
        _id: task._id.toString(),
        userId: task.userId.toString(),
      },
    });
  } catch (error: any) {
    console.error('GET /api/tasks/[id] error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT /api/tasks/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return apiError('Invalid task ID', 400);

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

    // Validation
    if (title !== undefined && title.trim().length === 0) {
      return apiError('Title cannot be empty', 400);
    }

    if (title && title.trim().length > 200) {
      return apiError('Title cannot exceed 200 characters', 400);
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return apiError('Invalid priority value', 400);
    }

    if (status && !['todo', 'in-progress', 'review', 'done'].includes(status)) {
      return apiError('Invalid status value', 400);
    }

    if (dueDate && isNaN(Date.parse(dueDate))) {
      return apiError('Invalid due date', 400);
    }

    if (reminderDate && isNaN(Date.parse(reminderDate))) {
      return apiError('Invalid reminder date', 400);
    }

    if (dueDate && reminderDate && new Date(reminderDate) > new Date(new Date(dueDate).setHours(23, 59, 59, 999))) {
      return apiError('Reminder must be before or equal to the due date', 400);
    }

    await connectDB();

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category.trim() || 'General';
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (reminderDate !== undefined) updateData.reminderDate = reminderDate ? new Date(reminderDate) : null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (timeEstimate !== undefined) updateData.timeEstimate = typeof timeEstimate === 'number' ? timeEstimate : null;
    if (subtasks !== undefined && Array.isArray(subtasks)) updateData.subtasks = subtasks;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!task) return apiError('Task not found', 404);

    // Create notification if reminder date was just set or changed
    if (reminderDate !== undefined && reminderDate) {
      const reminderDisplay = new Date(reminderDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      await Notification.create({
        userId: user._id,
        title: 'Reminder Updated',
        message: `Reminder for "${task.title}" set for ${reminderDisplay}`,
        type: 'reminder',
        read: false,
      }).catch(() => {});
    }

    return apiSuccess({
      message: 'Task updated successfully',
      task: {
        ...task,
        _id: task._id.toString(),
        userId: task.userId.toString(),
      },
    });
  } catch (error: any) {
    console.error('PUT /api/tasks/[id] error:', error);

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

// DELETE /api/tasks/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return apiError('Invalid task ID', 400);

    await connectDB();

    const task = await Task.findOneAndDelete({ _id: id, userId: user._id });
    if (!task) return apiError('Task not found', 404);

    return apiSuccess({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return apiError('Internal server error', 500);
  }
}
