import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/auth';
import { apiError } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return apiError('Please enter a valid email address', 400);
    }

    await connectDB();

    // Find user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Use generic message to prevent email enumeration
    if (!user) {
      return apiError('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return apiError('Invalid email or password', 401);
    }

    // Generate JWT
    const token = signToken({ userId: user._id.toString() });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully',
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Internal server error', 500);
  }
}
