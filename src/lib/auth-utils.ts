/**
 * Authentication utilities for integrating Clerk with Supabase
 */
import { currentUser } from '@clerk/nextjs/server';
import { UserRole } from '@/types/auth';

// Define a type for the Clerk user with public metadata
type ClerkUser = {
  id: string;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
  username?: string | null;
  emailAddresses: Array<{ emailAddress: string }> | null;
  primaryEmailAddressId?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
};

/**
 * Get the current user's role
 * @returns The user's role or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    // Get role from user metadata
    const role = user.publicMetadata.role as UserRole;
    return role || 'guest';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if a user has the required role to access a resource
 * @param userRole The user's role
 * @param requiredRole The required role to access the resource
 * @returns True if the user has the required role, false otherwise
 */
export function hasRequiredRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  // Dispatcher has access to dispatcher resources
  if (userRole === 'dispatcher' && requiredRole === 'dispatcher') return true;
  
  // Direct role match
  return userRole === requiredRole;
}

/**
 * Check if the current user is an admin
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * Check if the current user is a dispatcher
 * @returns True if the user is a dispatcher, false otherwise
 */
export async function isDispatcher(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'dispatcher';
}

/**
 * Get the current user's organization ID
 * @returns The organization ID or null if not available
 */
export async function getUserOrganizationId(): Promise<string | null> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    // Get organization ID from user metadata
    return (user.publicMetadata.organizationId as string) || null;
  } catch (error) {
    console.error('Error getting user organization ID:', error);
    return null;
  }
}

/**
 * Set the user's role in Clerk metadata
 * This function would be called during the sign-up process or when changing roles
 * @param userId The Clerk user ID
 * @param role The role to set
 */
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  // This would be implemented using Clerk's API to update user metadata
  // For now, this is a placeholder
  console.log(`Setting user ${userId} role to ${role}`);
}

/**
 * Associate a user with an organization in Clerk metadata
 * @param userId The Clerk user ID
 * @param organizationId The organization ID
 */
export async function associateUserWithOrganization(
  userId: string, 
  organizationId: string
): Promise<void> {
  // This would be implemented using Clerk's API to update user metadata
  // For now, this is a placeholder
  console.log(`Associating user ${userId} with organization ${organizationId}`);
}
