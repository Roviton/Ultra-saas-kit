import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { canAccessRoute, getRedirectPath, UserRole } from '@/lib/roles'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // If user is not signed in and trying to access protected routes, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // If user is signed in and trying to access auth pages, redirect to dashboard
  if (session && (req.nextUrl.pathname === '/auth' || req.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Email verification enforcement for Ultra21.com freight dispatch platform
  if (session && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Check if email is verified
    const isEmailVerified = session.user?.email_confirmed_at ? true : false
    
    // If email is not verified and not already on the verification page, redirect to verification
    if (!isEmailVerified && !req.nextUrl.pathname.includes('/auth/verification')) {
      return NextResponse.redirect(new URL('/auth/verification', req.url))
    }
    
    try {
      // Get user's profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', session.user.id)
        .single()

      // Enhanced role-based access control for Ultra21 freight dispatch platform
      if (profile) {
        // Get the user's role and ensure it's valid type for our system
        const userRole = profile.role as UserRole;
        
        // Get current path
        const currentPath = req.nextUrl.pathname;
        
        // Check if user has access to the requested route
        if (!canAccessRoute(currentPath, userRole)) {
          // Get appropriate redirect path for this route/role combination
          const redirectPath = getRedirectPath(currentPath);
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      } else {
        // No profile found, redirect to unauthorized page
        return NextResponse.redirect(new URL('/dashboard/unauthorized', req.url));
      }
    } catch (error) {
      console.error('Error in role-based access control middleware:', error)
      // Continue to the requested page - we'll let the page-level protection handle it
    }
  }

  return res
}

// Specify which routes should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 