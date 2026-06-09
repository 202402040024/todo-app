import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';
import { apiError, apiSuccess } from '@/lib/helpers';
import mongoose from 'mongoose';

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return apiError('Invalid reminder ID', 400);

    const body = await request.json();
    const { title, notes, dueDate, priority, category, completed } = body;

    if (title !== undefined && title.trim().length === 0) {
      return apiError('Title cannot be empty', 400);
    }

    if (dueDate !== undefined && dueDate && isNaN(Date.parse(dueDate))) {
      return apiError('Invalid due date', 400);
    }

    await connectDB();

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (notes !== undefined) updateData.notes = notes.trim();
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category.trim();
    if (completed !== undefined) updateData.completed = completed;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!reminder) return apiError('Reminder not found', 404);

    return apiSuccess({ reminder: {
      ...reminder,
      _id: reminder._id.toString(),
      userId: reminder.userId.toString(),
      dueDate: reminder.dueDate.toISOString(),
    }});
  } catch (error: any) {
    console.error('PUT /api/reminders/[id] error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return apiError('Invalid reminder ID', 400);

    await connectDB();
    const reminder = await Reminder.findOneAndDelete({ _id: id, userId: user._id });
    if (!reminder) return apiError('Reminder not found', 404);

    return apiSuccess({ message: 'Reminder deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/reminders/[id] error:', error);
    return apiError('Internal server error', 500);
  }
}
