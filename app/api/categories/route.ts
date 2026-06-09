import { type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { apiError, apiSuccess } from '@/lib/helpers';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    await connectDB();
    const categories = await Category.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    return apiSuccess({ categories: categories.map((category) => ({
      ...category,
      _id: category._id.toString(),
      userId: category.userId.toString(),
    })) });
  } catch (error: any) {
    console.error('GET /api/categories error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError('Not authenticated', 401);

    const body = await request.json();
    const { name, color, icon, description } = body;

    if (!name || name.trim().length === 0) {
      return apiError('Category name is required', 400);
    }

    await connectDB();

    const category = await Category.create({
      userId: user._id,
      name: name.trim(),
      color: color || 'from-indigo-500 to-purple-500',
      icon: icon || 'HiOutlineTag',
      description: description?.trim() || '',
    });

    return apiSuccess({
      message: 'Category created successfully',
      category: {
        ...category.toObject(),
        _id: category._id.toString(),
        userId: category.userId.toString(),
      },
    }, 201);
  } catch (error: any) {
    console.error('POST /api/categories error:', error);
    return apiError('Internal server error', 500);
  }
}
