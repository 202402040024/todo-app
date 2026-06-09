import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { apiError, apiSuccess } from '@/lib/helpers';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError('Not authenticated', 401);
    }

    return apiSuccess({ user });
  } catch (error: any) {
    console.error('Me error:', error);
    return apiError('Internal server error', 500);
  }
}

// PATCH /api/auth/me — update profile (name, bio) or change password
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const body = await request.json();
    const { name, bio, phone, location, currentPassword, newPassword } = body;

    await connectDB();

    // --- Password change ---
    if (newPassword) {
      if (!currentPassword) return apiError('Current password is required', 400);
      if (newPassword.length < 6) return apiError('New password must be at least 6 characters', 400);

      const dbUser = await User.findById(user._id).select('+password');
      if (!dbUser) return apiError('User not found', 404);

      const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isMatch) return apiError('Current password is incorrect', 400);

      const hashed = await bcrypt.hash(newPassword, 12);
      dbUser.password = hashed;
      await dbUser.save();

      return apiSuccess({ message: 'Password updated successfully' });
    }

    // --- Profile update ---
    const updateData: Record<string, any> = {};
    if (name !== undefined && name.trim().length >= 2) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (location !== undefined) updateData.location = location.trim();

    if (Object.keys(updateData).length === 0) {
      return apiError('No valid fields to update', 400);
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!updated) return apiError('User not found', 404);

    return apiSuccess({
      message: 'Profile updated successfully',
      user: { ...updated, _id: updated._id.toString() },
    });
  } catch (error: any) {
    console.error('PATCH /api/auth/me error:', error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors as Record<string, { message: string }>)
        .map((e) => e.message)
        .join(', ');
      return apiError(message, 400);
    }
    return apiError('Internal server error', 500);
  }
}
