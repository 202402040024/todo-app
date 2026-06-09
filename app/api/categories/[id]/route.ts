import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
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
    if (!isValidObjectId(id)) return apiError('Invalid category ID', 400);

    const body = await request.json();
    const { name, color, icon, description } = body;

    if (name !== undefined && name.trim().length === 0) {
      return apiError('Category name cannot be empty', 400);
    }

    await connectDB();

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description.trim();

    const category = await Category.findOneAndUpdate(
      { _id: id, userId: user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!category) return apiError('Category not found', 404);

    return apiSuccess({ category: {
      ...category,
      _id: category._id.toString(),
      userId: category.userId.toString(),
    }});
  } catch (error: any) {
    console.error('PUT /api/categories/[id] error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return apiError('Invalid category ID', 400);

    await connectDB();

    const category = await Category.findOneAndDelete({ _id: id, userId: user._id });
    if (!category) return apiError('Category not found', 404);

    return apiSuccess({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/categories/[id] error:', error);
    return apiError('Internal server error', 500);
  }
}
