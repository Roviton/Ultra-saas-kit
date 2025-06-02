'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/lib/roles'
import { useUser } from '@clerk/nextjs'

/**
 * Hook to handle authentication-based redirects for the Ultra21 freight platform
 * 
 * @param requireAuth - Whether authentication is required for the current page
 * @param allowedRoles - Array of roles allowed to access the current page
 * @param redirectTo - Where to redirect if authentication/authorization fails
 */
export function useAuthRedirect(
  requireAuth: boolean = true,
  allowedRoles: UserRole[] = ['admin', 'dispatcher'],
  redirectTo: string = '/auth'
) {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser()
  const { profile, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Don't redirect during initial load
    if (isLoading || !clerkIsLoaded) return
    
    // Handle authentication requirement
    if (requireAuth && !clerkUser) {
      // Save the current path to redirect back after authentication
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`)
      return
    }
    
    // Handle role-based access control
    if (requireAuth && clerkUser && profile) {
      const hasAllowedRole = profile.role ? allowedRoles.includes(profile.role as UserRole) : false
      
      if (!hasAllowedRole) {
        // Redirect to the unauthorized page
        router.push('/dashboard/unauthorized')
        return
      }
    }
    
    // Handle redirection for authenticated users trying to access auth pages
    if (!requireAuth && clerkUser && pathname.startsWith('/auth')) {
      // Don't redirect from specific auth pages like verification or callback
      const excludedPaths = ['/auth/verification', '/auth/callback', '/auth/reset-password']
      if (!excludedPaths.some(path => pathname.startsWith(path))) {
        router.push('/dashboard')
      }
    }
  }, [clerkUser, profile, isLoading, clerkIsLoaded, requireAuth, allowedRoles, redirectTo, router, pathname])
  
  return {
    user: clerkUser,
    profile,
    isLoading: isLoading || !clerkIsLoaded,
    isAuthenticated,
    hasRequiredRole: profile && profile.role ? allowedRoles.includes(profile.role as UserRole) : false,
  }
}
