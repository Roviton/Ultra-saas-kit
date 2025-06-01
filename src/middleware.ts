import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccessRoute, getRedirectPath, UserRole } from '@/lib/roles';
import { getAuth } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/api/webhook/clerk',
  '/terms',
  '/privacy',
  // Add any other public routes here
];

// Middleware function to handle authentication and role-based access control
export async function middleware(request: NextRequest) {
  // Get the pathname from the request
  const path = request.nextUrl.pathname;
  
  // Allow public routes to proceed without authentication
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }
  
  // Get authentication data
  const { userId, sessionClaims } = getAuth(request);
  
  // If user is not signed in and trying to access protected routes, redirect to sign-in
  if (!userId && path.startsWith('/dashboard')) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    // Preserve the original URL to redirect back after sign-in
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // If user is signed in and trying to access auth pages, redirect to dashboard
  if (userId && (path === '/auth/sign-in' || path === '/auth/sign-up' || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For protected routes, check role-based access
  if (userId && path.startsWith('/dashboard')) {
    try {
      // Get user role from session claims metadata
      const metadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
      const userRole = (metadata?.role as UserRole) || 'dispatcher';
      
      // Check if user has access to the requested route
      if (!canAccessRoute(path, userRole)) {
        // Get appropriate redirect path for this role
        const redirectPath = getRedirectPath(userRole);
        console.log(`User with role ${userRole} attempted to access ${path}, redirecting to ${redirectPath}`);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch (error) {
      console.error('Error in role-based access control middleware:', error);
      // On error, redirect to dashboard homepage as a fallback
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Export the Clerk middleware config
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|static|favicon.ico|.*\.(?:jpg|jpeg|gif|png|svg|ico|webp|webm|mp4|css|js|woff|woff2|ttf|otf)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Run for auth and dashboard routes
    '/(auth|dashboard)(.*)',
    // Run for the homepage
    '/'
  ],
};