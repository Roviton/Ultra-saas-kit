import { NextResponse } from 'next/server';
import { canAccessRoute, getRedirectPath, UserRole } from '@/lib/roles';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Log middleware initialization to help with debugging
console.log('Initializing Clerk middleware with API version:', process.env.CLERK_API_VERSION);

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/sign-in/(.*)',  // Catch-all route for sign-in
  '/auth/sign-up/(.*)',  // Catch-all route for sign-up
  '/api/webhook/clerk',
  '/terms',
  '/privacy',
  // Add any other public routes here
];

// Custom middleware handler with role-based access control
export default clerkMiddleware(async (auth, req) => {
    // Get the pathname from the request
    const path = req.nextUrl.pathname;
    
    // Allow public routes to proceed without authentication
    if (publicRoutes.includes(path)) {
      return NextResponse.next();
    }
    
    // Get auth data using the auth function - must await the Promise
    const { userId, sessionClaims, redirectToSignIn } = await auth();
    
    // If user is not signed in and trying to access protected routes, redirect to sign-in
    if (!userId && path.startsWith('/dashboard')) {
      // Redirect to sign-in with the original URL to redirect back after sign-in
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (userId && (path === '/auth/sign-in' || path === '/auth/sign-up' || path === '/')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
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
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      } catch (error) {
        console.error('Error in role-based access control middleware:', error);
        // On error, redirect to dashboard homepage as a fallback
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    
    // Allow the request to proceed
    return NextResponse.next();
});


// Export the Clerk middleware config
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    '/((?!_next/static|_next/image|favicon.ico|.*.(?:jpg|jpeg|gif|png|svg|ico|webp|webm|mp4|css|js|woff|woff2|ttf|otf)).*)',
    // Optional: Match API routes that should be protected
    '/api/((?!webhook/clerk).*)'
  ]
};