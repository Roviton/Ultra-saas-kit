/**
 * Auth-related type definitions
 */

// User roles in the application
export type UserRole = 'admin' | 'dispatcher' | 'guest';

// User metadata structure
export interface UserMetadata {
  role: UserRole;
  organizationId?: string;
}

// Organization metadata structure
export interface OrganizationMetadata {
  tier: 'free' | 'premium' | 'enterprise';
  maxDispatchers: number;
}
