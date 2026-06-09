import { getCurrentUser } from '@/lib/auth';
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
