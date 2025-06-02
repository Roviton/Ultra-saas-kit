/**
 * Client-side authentication utilities for Clerk
 */
import { UserRole } from '@/types/auth';

/**
 * Get the user's role from Clerk user object (client-side version)
 * @param user The Clerk user object
 * @returns The user's role or 'guest' if not specified
 */
export function getUserRole(user: any): UserRole {
  if (!user) {
    return 'guest';
  }
  
  // Get role from user metadata
  const role = user.publicMetadata?.role as UserRole;
  return role || 'user';
}
