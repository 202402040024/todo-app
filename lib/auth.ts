import type { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

const COOKIE_NAME = 'auth-token';

/**
 * Get the authentication cookie options
 */
export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/',
  };
}

/**
 * Set the auth token in an HTTP-only cookie
 * @param {Object} response - NextResponse object
 * @param {string} token - JWT token
 */
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, getCookieOptions());
}

/**
 * Clear the auth cookie
 * @param {NextResponse} response - NextResponse object
 */
export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Get the current user from the request cookies (server-side)
 * @returns {Object|null} User object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = verifyToken(token) as { userId?: string } | null;
    if (!decoded?.userId) return null;

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password').lean();

    if (!user) return null;

    return {
      ...user,
      _id: user._id.toString(),
    };
  } catch {
    return null;
  }
}

/**
 * Get user from token string (for API routes using request cookies)
 * @param {string} token - JWT token string
 * @returns {Object|null} User object or null
 */
export async function getUserFromToken(token: string) {
  try {
    if (!token) return null;

    const decoded = verifyToken(token) as { userId?: string } | null;
    if (!decoded?.userId) return null;

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password').lean();

    if (!user) return null;

    return {
      ...user,
      _id: user._id.toString(),
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
