import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { apiError, apiSuccess } from '@/lib/helpers';

// GET — fetch latest 30 notifications for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    await connectDB();

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return apiSuccess({
      notifications: notifications.map((item) => ({
        ...item,
        _id: item._id.toString(),
        userId: item.userId.toString(),
        createdAt: item.createdAt?.toISOString?.() ?? new Date().toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('GET /api/notifications error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST — create a notification (used by client-side reminder checks)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const body = await request.json();
    const { title, message, type } = body;

    if (!title || !message) return apiError('title and message are required', 400);

    await connectDB();

    const notification = await Notification.create({
      userId: user._id,
      title: title.trim(),
      message: message.trim(),
      type: type || 'reminder',
      read: false,
    });

    return apiSuccess(
      {
        notification: {
          ...notification.toObject(),
          _id: notification._id.toString(),
          userId: notification.userId.toString(),
          createdAt: notification.createdAt.toISOString(),
        },
      },
      201
    );
  } catch (error: any) {
    console.error('POST /api/notifications error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT — mark specific notifications as read
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const body = await request.json();
    const { notificationIds } = body;
    if (!Array.isArray(notificationIds)) {
      return apiError('notificationIds must be an array', 400);
    }

    await connectDB();

    await Notification.updateMany(
      { userId: user._id, _id: { $in: notificationIds } },
      { $set: { read: true } }
    );

    return apiSuccess({ message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('PUT /api/notifications error:', error);
    return apiError('Internal server error', 500);
  }
}

// DELETE — clear all notifications for the current user
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    await connectDB();
    await Notification.deleteMany({ userId: user._id });

    return apiSuccess({ message: 'All notifications cleared' });
  } catch (error: any) {
    console.error('DELETE /api/notifications error:', error);
    return apiError('Internal server error', 500);
  }
}
