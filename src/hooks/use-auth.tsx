'use client'

import { useRouter } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'
import { UserRole } from '@/lib/roles'

/**
 * Custom hook for freight dispatch platform authentication
 * Uses Clerk authentication with role-based helpers
 */
export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  
  // Get user role from Clerk metadata
  const userRole = user?.publicMetadata?.role as UserRole | null
  
  // Extract profile information
  const profile = user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    role: userRole,
    avatarUrl: user.imageUrl,
    organizationId: user.publicMetadata?.organizationId as string | undefined,
    organizationName: user.publicMetadata?.organizationName as string | undefined
  } : null
  
  // Sign out function
  const logout = async () => {
    await signOut()
    router.push('/')
  }
  
  // Redirect helpers
  const redirectToDashboard = () => {
    router.push('/dashboard')
  }
  
  const redirectToLogin = () => {
    router.push('/auth/sign-in')
  }
  
  const redirectToSignup = () => {
    router.push('/auth/sign-up')
  }
  
  const redirectToUnauthorized = () => {
    router.push('/dashboard/unauthorized')
  }
  
  // Check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!userRole) return false
    
    if (Array.isArray(role)) {
      return role.includes(userRole)
    }
    
    return role === userRole
  }
  
  // Check if user is admin (admins can access everything)
  const isAdmin = () => userRole === 'admin'
  
  // Check if user is dispatcher
  const isDispatcher = () => userRole === 'dispatcher'
  
  // Check if user is driver
  const isDriver = () => userRole === 'driver'
  
  // Check if user is customer
  const isCustomer = () => userRole === 'customer'
  
  return {
    user,                // Clerk user object
    profile,             // Formatted user profile
    isLoading: !isLoaded, // Loading state (inverted from Clerk for compatibility)
    isAuthenticated: isSignedIn,
    userRole,            // User role from metadata
    signOut: logout,     // Sign out function
    hasRole,             // Role checking function
    isAdmin,             // Admin check
    isDispatcher,        // Dispatcher check
    isDriver,            // Driver check
    isCustomer,          // Customer check
    redirectToDashboard,
    redirectToLogin,
    redirectToSignup,
    redirectToUnauthorized
  }
}
