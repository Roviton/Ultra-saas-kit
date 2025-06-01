/**
 * Role definitions for Ultra21 freight dispatch platform
 * 
 * This file contains role-related constants and helper functions
 * for implementing role-based access control (RBAC) in the application.
 */

// Available roles in the system
export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'customer';

// Route access configuration
export interface RouteAccess {
  roles: UserRole[];
  redirect?: string;
}

// Define which roles can access which routes
export const ROUTE_ACCESS: Record<string, RouteAccess> = {
  // Admin-only routes
  '/dashboard/admin': {
    roles: ['admin'],
    redirect: '/dashboard/unauthorized',
  },
  '/dashboard/analytics': {
    roles: ['admin'],
    redirect: '/dashboard/unauthorized',
  },
  '/dashboard/settings/organization': {
    roles: ['admin'],
    redirect: '/dashboard/unauthorized',
  },
  '/dashboard/settings/users': {
    roles: ['admin'],
    redirect: '/dashboard/unauthorized',
  },
  
  // Dispatcher routes (accessible by admins and dispatchers)
  '/dashboard/freight': {
    roles: ['admin', 'dispatcher'],
    redirect: '/dashboard/unauthorized',
  },
  '/dashboard/dispatch': {
    roles: ['admin', 'dispatcher'],
    redirect: '/dashboard/unauthorized',
  },
  '/dashboard/loads': {
    roles: ['admin', 'dispatcher'],
    redirect: '/dashboard/unauthorized',
  },
  
  // Removed driver and customer routes as they're no longer needed
  
  // Common routes accessible by all authenticated users
  '/dashboard': {
    roles: ['admin', 'dispatcher'],
  },
  '/dashboard/profile': {
    roles: ['admin', 'dispatcher'],
  },
  '/dashboard/billing': {
    roles: ['admin', 'dispatcher'],
  },
};

/**
 * Check if a user with the given role can access a specific route
 * 
 * @param route The route to check access for
 * @param userRole The user's role
 * @returns True if the user can access the route, false otherwise
 */
export function canAccessRoute(route: string, userRole: UserRole | null): boolean {
  if (!userRole) return false;
  
  // Find the most specific matching route configuration
  const matchingRoute = Object.keys(ROUTE_ACCESS)
    .filter(pattern => route.startsWith(pattern))
    .sort((a, b) => b.length - a.length)[0]; // Sort by length descending to get most specific match
    
  if (!matchingRoute) {
    // If no specific route match, check if it's a dashboard route
    if (route.startsWith('/dashboard')) {
      return true; // Allow access to any dashboard route not explicitly protected
    }
    return true; // Allow access to routes without specific protection
  }
  
  // Get the route access configuration and check if the user role is allowed
  const accessConfig = ROUTE_ACCESS[matchingRoute];
  if (!accessConfig) return true; // Allow access if no config is found
  
  return accessConfig.roles.includes(userRole);
}

/**
 * Get the redirect path for unauthorized access to a route
 * 
 * @param route The route being accessed
 * @returns The path to redirect to, or null if no redirect is specified
 */
export function getRedirectPath(route: string): string {
  // Find the most specific matching route configuration
  const matchingRoute = Object.keys(ROUTE_ACCESS)
    .filter(pattern => route.startsWith(pattern))
    .sort((a, b) => b.length - a.length)[0]; // Sort by length descending to get most specific match
    
  // Default redirect path
  const defaultRedirect = '/dashboard/unauthorized';
  
  // If no matching route found, return default
  if (!matchingRoute) {
    return defaultRedirect;
  }
  
  // Get access config and check if it has a redirect property
  const accessConfig = ROUTE_ACCESS[matchingRoute];
  if (!accessConfig || !accessConfig.redirect) {
    return defaultRedirect;
  }
  
  return accessConfig.redirect;
}
