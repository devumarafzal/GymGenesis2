import { headers } from 'next/headers';

export function getUserIdFromHeader(): string | null {
  try {
    const headersList = headers();
    const userId = headersList.has('x-user-id') ? headersList.get('x-user-id') : null;
    return userId;
  } catch (error) {
    console.error('Error getting user ID from header:', error);
    return null;
  }
} 