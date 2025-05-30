'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { canAccessRoute, getRedirectPath, UserRole } from '@/lib/roles'
import { useEffect, useState } from 'react'

/**
 * A custom hook for role-based access control in components
 * 
 * This hook can be used to:
 * 1. Protect routes at the component level
 * 2. Conditionally render UI elements based on user roles
 * 3. Check if a user can perform certain actions
 * 
 * @param requiredRoles Optional array of roles that can access this component
 * @param redirectTo Optional custom redirect path for unauthorized access
 * @returns Object with role protection utilities
 */
export function useRoleProtection(requiredRoles?: UserRole[], redirectTo?: string) {
  const router = useRouter()
  const { user, profile, isLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const userRole = profile?.role as UserRole | null
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

  // Effect to check authorization when component mounts or dependencies change
  useEffect(() => {
    // Wait for auth to be loaded
    if (isLoading) {
      return
    }
    
    // If user isn't authenticated, they're not authorized
    if (!user) {
      setIsAuthorized(false)
      return
    }
    
    // If requiredRoles are provided, check if user's role is included
    if (requiredRoles && requiredRoles.length > 0) {
      if (userRole && requiredRoles.includes(userRole)) {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
        // If redirectTo is provided, or we can determine it from the route, redirect
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          const path = getRedirectPath(currentPath)
          router.push(path)
        }
      }
    } else {
      // If no requiredRoles specified, check using the route access rules
      const hasAccess = canAccessRoute(currentPath, userRole)
      setIsAuthorized(hasAccess)
      
      if (!hasAccess) {
        const path = redirectTo || getRedirectPath(currentPath)
        router.push(path)
      }
    }
  }, [user, userRole, isLoading, requiredRoles, currentPath, redirectTo, router])
  
  /**
   * Check if the current user can perform an action requiring specific roles
   * 
   * @param roles Roles allowed to perform the action
   * @returns Whether the user can perform the action
   */
  const canPerform = (roles: UserRole[]): boolean => {
    if (!userRole) return false
    return roles.includes(userRole)
  }
  
  /**
   * Check if the current user can access a specific route
   * 
   * @param route The route to check access for
   * @returns Whether the user can access the route
   */
  const canAccess = (route: string): boolean => {
    return canAccessRoute(route, userRole)
  }
  
  /**
   * Check if the current user has a specific role
   * 
   * @param role The role to check
   * @returns Whether the user has the role
   */
  const hasRole = (role: UserRole): boolean => {
    return userRole === role
  }
  
  /**
   * Check if the current user has admin role
   * 
   * @returns Whether the user is an admin
   */
  const isAdmin = (): boolean => {
    return userRole === 'admin'
  }
  
  /**
   * Check if the current user has dispatcher role
   * 
   * @returns Whether the user is a dispatcher
   */
  const isDispatcher = (): boolean => {
    return userRole === 'dispatcher'
  }

  /**
   * Check if the current user has driver role
   * 
   * @returns Whether the user is a driver
   */
  const isDriver = (): boolean => {
    return userRole === 'driver'
  }

  /**
   * Check if the current user has customer role
   * 
   * @returns Whether the user is a customer
   */
  const isCustomer = (): boolean => {
    return userRole === 'customer'
  }

  return {
    isAuthorized,
    isLoading,
    userRole,
    canPerform,
    canAccess,
    hasRole,
    isAdmin,
    isDispatcher,
    isDriver,
    isCustomer
  }
}
