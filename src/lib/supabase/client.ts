import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Type definitions for user roles
export type UserRole = 'admin' | 'dispatcher'

// Extended user profile with role information
export interface UserProfile {
  id: string
  email: string
  role: UserRole
  organizationId: string | null
  firstName?: string
  lastName?: string
}

// Create a Supabase client for use in browser components
export const createSupabaseBrowserClient = () => {
  return createClientComponentClient<Database>()
}

// Create a Supabase client for direct use with API keys
// This should only be used in secure server environments
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function to get user profile with role information
export const getUserProfile = async (supabase: ReturnType<typeof createSupabaseBrowserClient>) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }
  
  // Fetch the user's profile from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, organization_id, first_name, last_name')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile) {
    console.error('Error fetching user profile:', profileError)
    return null
  }
  
  return {
    id: user.id,
    email: user.email || '',
    role: profile.role as UserRole,
    organizationId: profile.organization_id,
    firstName: profile.first_name,
    lastName: profile.last_name
  }
}

// Check if a user has a specific role
export const hasRole = async (
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  roles: UserRole | UserRole[]
): Promise<boolean> => {
  const profile = await getUserProfile(supabase)
  
  if (!profile) {
    return false
  }
  
  // Check if the user's role is in the allowed roles
  if (Array.isArray(roles)) {
    return roles.includes(profile.role)
  }
  
  return profile.role === roles
}

// Check if a user is an admin
export const isAdmin = async (
  supabase: ReturnType<typeof createSupabaseBrowserClient>
): Promise<boolean> => {
  return hasRole(supabase, 'admin')
}

// Check if a user is a dispatcher
export const isDispatcher = async (
  supabase: ReturnType<typeof createSupabaseBrowserClient>
): Promise<boolean> => {
  return hasRole(supabase, 'dispatcher')
}
