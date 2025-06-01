import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Special route handler to ensure proper session handling when redirecting to dashboard
 * This bypasses potential middleware issues by forcing a server-side redirect
 */
export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // If no session, redirect to login
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // Check if email is verified
  const isEmailVerified = session.user?.email_confirmed_at ? true : false
  
  if (!isEmailVerified) {
    // If email not verified, redirect to verification page
    return NextResponse.redirect(new URL('/auth/verification', request.url))
  }
  
  // Get user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  if (!profile) {
    // If no profile found, redirect to unauthorized page
    return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url))
  }
  
  // Successfully redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
