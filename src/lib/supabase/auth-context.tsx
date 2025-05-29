'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient, UserProfile } from './client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  isDispatcher: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, role?: 'admin' | 'dispatcher') => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
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
      role: data.role as 'admin' | 'dispatcher',
      organizationId: data.organization_id,
      firstName: data.first_name,
      lastName: data.last_name
    }

    setProfile(userProfile)
    setIsAdmin(userProfile.role === 'admin')
    setIsDispatcher(userProfile.role === 'dispatcher')

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

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    role: 'admin' | 'dispatcher' = 'dispatcher',
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

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAdmin,
    isDispatcher,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    // Helper method to enforce email verification
    requireVerification: (routerToUse: any = router, redirectPath: string = '/auth/verification') => {
      if (user && !isEmailVerified) {
        routerToUse.push(redirectPath)
        return false
      }
      return true
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hook to check if the user has a specific role
export const useHasRole = (roles: ('admin' | 'dispatcher') | ('admin' | 'dispatcher')[]) => {
  const { profile } = useAuth()
  
  if (!profile) {
    return false
  }
  
  if (Array.isArray(roles)) {
    return roles.includes(profile.role)
  }
  
  return profile.role === roles
}
