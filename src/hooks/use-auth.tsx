'use client'

import { useAuth as useSupabaseAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'

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
  
  const logout = async (redirectPath: string = '/auth') => {
    await auth.signOut()
    router.push(redirectPath)
  }
  
  return {
    ...auth,
    // Role-specific convenience functions
    loginAsDispatcher,
    loginAsAdmin,
    registerDispatcher,
    registerAdmin,
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
