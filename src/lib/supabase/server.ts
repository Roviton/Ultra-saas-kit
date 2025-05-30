import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { Database } from '@/types/supabase'
import { UserProfile } from './client'
import { UserRole } from '@/lib/roles'

// Create a Supabase client for server components
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Create a Supabase client for API route handlers
export const createSupabaseRouteHandler = () => {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}

// Helper function to get user profile in server components
export const getServerUserProfile = async (): Promise<UserProfile | null> => {
  const supabase = createSupabaseServerClient()
  
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
    id: profile.id,
    email: user.email || '',
    role: profile.role as UserRole,
    organizationId: profile.organization_id,
    firstName: profile.first_name,
    lastName: profile.last_name
  }
}

// Check if the current user in a server component has a specific role
export const serverHasRole = async (
  roles: UserRole | UserRole[]
): Promise<boolean> => {
  const profile = await getServerUserProfile()
  
  if (!profile) {
    return false
  }
  
  if (Array.isArray(roles)) {
    return roles.includes(profile.role)
  }
  
  return profile.role === roles
}
