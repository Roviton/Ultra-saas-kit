'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient, UserProfile } from './client'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/roles' // Import UserRole type from roles.ts

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  isDispatcher: boolean
  isDriver: boolean
  isCustomer: boolean
  isEmailVerified?: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  // Role management functions
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean, error: Error | null }>
  // Email verification helper
  requireVerification?: (routerToUse?: any, redirectPath?: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDispatcher, setIsDispatcher] = useState(false)
  const [isDriver, setIsDriver] = useState(false)
  const [isCustomer, setIsCustomer] = useState(false)

  // Function to fetch user profile data
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, organization_id, first_name, last_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    if (!data) return null

    const userProfile: UserProfile = {
      id: userId,
      email: user?.email || '',
      role: data.role as UserRole,
      organizationId: data.organization_id,
      firstName: data.first_name,
      lastName: data.last_name
    }

    setProfile(userProfile)
    // Set role flags based on user's role
    setIsAdmin(userProfile.role === 'admin')
    setIsDispatcher(userProfile.role === 'dispatcher')
    setIsDriver(userProfile.role === 'driver')
    setIsCustomer(userProfile.role === 'customer')

    return userProfile
  }

  // Function to refresh the profile
  const refreshProfile = async () => {
    if (!user) return
    await fetchProfile(user.id)
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      setUser(data.user)
      setSession(data.session)

      if (data.user) {
        await fetchProfile(data.user.id)
      }

      router.refresh()
      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error as Error }
    }
  }

  // Function to update a user's role (admin only)
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // Check if the current user is an admin
      if (!isAdmin) {
        return { 
          success: false, 
          error: new Error('Only administrators can change user roles') 
        }
      }

      // Call the Supabase RPC function to update the role
      const { data, error } = await supabase.rpc('set_user_role', {
        user_id: userId,
        new_role: newRole
      })

      if (error) {
        console.error('Error updating user role:', error)
        return { success: false, error }
      }

      // Refresh current user's profile if they're updating their own role
      if (user && user.id === userId) {
        await refreshProfile()
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return { success: false, error: error as Error }
    }
  }

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    role: UserRole = 'customer',
    firstName?: string,
    lastName?: string,
    organizationName?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role,
            first_name: firstName,
            last_name: lastName,
            organization_name: role === 'admin' ? organizationName : undefined
          },
        },
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: error as Error }
    }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setIsAdmin(false)
    setIsDispatcher(false)
    router.refresh()
    router.push('/auth')
  }

  // Effect to initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      
      // Get the initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      
      if (initialSession?.user) {
        setUser(initialSession.user)
        await fetchProfile(initialSession.user.id)
      }
      
      setIsLoading(false)
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, updatedSession) => {
          setSession(updatedSession)
          setUser(updatedSession?.user || null)
          
          if (updatedSession?.user) {
            await fetchProfile(updatedSession.user.id)
          } else {
            setProfile(null)
            setIsAdmin(false)
            setIsDispatcher(false)
          }
          
          router.refresh()
        }
      )
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    initAuth()
  }, [router, supabase.auth])

  const isEmailVerified = user?.email_confirmed_at ? true : false

  // Helper method to enforce email verification
  const requireVerification = (routerToUse: any = router, redirectPath: string = '/auth/verification') => {
    if (user && !isEmailVerified) {
      routerToUse.push(redirectPath)
      return false
    }
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        isDispatcher,
        isDriver,
        isCustomer,
        isEmailVerified,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateUserRole,
        requireVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hook to check if the user has a specific role
export const useHasRole = (roles: UserRole | UserRole[]) => {
  const auth = useAuth()
  
  // Convert single role to array for consistency
  const roleArray = Array.isArray(roles) ? roles : [roles]
  
  if (!auth.profile) return false
  
  return roleArray.includes(auth.profile.role)
}
