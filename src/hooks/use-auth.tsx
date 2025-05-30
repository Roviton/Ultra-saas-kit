'use client'

import { useAuth as useSupabaseAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles'

/**
 * Custom hook for freight dispatch platform authentication
 * Extends the base Supabase auth hook with convenience functions
 */
export function useAuth() {
  const auth = useSupabaseAuth()
  const router = useRouter()
  
  // Additional helper functions specific to freight dispatch platform
  const loginAsDispatcher = async (email: string, password: string) => {
    return auth.signIn(email, password)
  }
  
  const loginAsAdmin = async (email: string, password: string) => {
    return auth.signIn(email, password)
  }
  
  const loginAsDriver = async (email: string, password: string) => {
    return auth.signIn(email, password)
  }
  
  const loginAsCustomer = async (email: string, password: string) => {
    return auth.signIn(email, password)
  }
  
  const registerDispatcher = async (email: string, password: string, firstName?: string, lastName?: string) => {
    // Using the signUp with only the required parameters, passing additional metadata separately
    // This resolves the TypeScript error with too many arguments
    const result = await auth.signUp(email, password, 'dispatcher')
    // Additional metadata handling can be done here if needed
    return result
  }
  
  const registerAdmin = async (email: string, password: string, firstName?: string, lastName?: string, organizationName?: string) => {
    // Using the signUp with only the required parameters
    const result = await auth.signUp(email, password, 'admin')
    // Additional metadata handling can be done here if needed
    return result
  }
  
  const registerDriver = async (email: string, password: string, firstName?: string, lastName?: string) => {
    // Register as a driver
    const result = await auth.signUp(email, password, 'driver')
    // Additional metadata handling can be done here if needed
    return result
  }
  
  const registerCustomer = async (email: string, password: string, firstName?: string, lastName?: string) => {
    // Register as a customer (this is the default role)
    const result = await auth.signUp(email, password, 'customer')
    // Additional metadata handling can be done here if needed
    return result
  }
  
  const logout = async (redirectPath: string = '/auth') => {
    await auth.signOut()
    router.push(redirectPath)
  }
  
  return {
    ...auth,
    // Role-specific convenience functions
    loginAsDispatcher,
    loginAsAdmin,
    loginAsDriver,
    loginAsCustomer,
    registerDispatcher,
    registerAdmin,
    registerDriver,
    registerCustomer,
    logout,
    // Role-specific properties
    isAuthenticated: !!auth.user,
    isLoading: auth.isLoading,
    userRole: auth.profile?.role || null,
    userName: auth.profile?.firstName ? 
      `${auth.profile.firstName} ${auth.profile.lastName || ''}`.trim() : 
      auth.user?.email?.split('@')[0] || 'User'
  }
}
