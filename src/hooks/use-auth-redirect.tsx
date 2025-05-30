'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { UserRole } from '@/lib/roles'

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
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Don't redirect during initial load
    if (isLoading) return
    
    // Handle authentication requirement
    if (requireAuth && !user) {
      // Save the current path to redirect back after authentication
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`)
      return
    }
    
    // Handle role-based access control
    if (requireAuth && user && profile) {
      const hasAllowedRole = allowedRoles.includes(profile.role)
      
      if (!hasAllowedRole) {
        // Redirect to the unauthorized page
        router.push('/dashboard/unauthorized')
        return
      }
    }
    
    // Handle redirection for authenticated users trying to access auth pages
    if (!requireAuth && user && pathname.startsWith('/auth')) {
      // Don't redirect from specific auth pages like verification or callback
      const excludedPaths = ['/auth/verification', '/auth/callback', '/auth/reset-password']
      if (!excludedPaths.some(path => pathname.startsWith(path))) {
        router.push('/dashboard')
      }
    }
  }, [user, profile, isLoading, requireAuth, allowedRoles, redirectTo, router, pathname])
  
  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    hasRequiredRole: profile ? allowedRoles.includes(profile.role) : false,
  }
}
