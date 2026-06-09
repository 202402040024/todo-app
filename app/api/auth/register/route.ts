import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // --- Validation ---
    if (!name || !email || !password || !confirmPassword) {
      return apiError('All fields are required', 400);
    }

    if (name.trim().length < 2) {
      return apiError('Name must be at least 2 characters', 400);
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return apiError('Please enter a valid email address', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }

    if (password !== confirmPassword) {
      return apiError('Passwords do not match', 400);
    }

    // --- Database ---
    await connectDB();

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return apiError('An account with this email already exists', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate JWT
    const token = signToken({ userId: user._id.toString() });

    // Build response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.code === 11000) {
      return apiError('An account with this email already exists', 409);
    }

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
