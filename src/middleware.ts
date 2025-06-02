// Import necessary types from Next.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth, withClerkMiddleware } from '@clerk/nextjs/server';
import { UserRole } from '@/types/auth';

// For debugging middleware issues
const DEBUG = process.env.NODE_ENV !== 'production';

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/pricing",
  "/features",
  "/docs",
  "/api/webhook/clerk",
  "/api/webhook/stripe",
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
  "/legal/privacy",
  "/legal/terms",
  "/contact",
  "/about",
  "/blog",
  "/faq",
  // Static assets and API routes that don't require authentication
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

// Define admin-only routes
const adminRoutes = [
  "/dashboard/admin",
  "/admin",
  "/dashboard/users",
  "/dashboard/organizations",
  "/dashboard/settings/global",
  "/api/admin",
];

// Define dispatcher-only routes
const dispatcherRoutes = [
  "/dashboard/freight",
  "/freight",
  "/dashboard/dispatch",
  "/dashboard/fleet",
  "/dashboard/routes",
  "/api/dispatch",
];

// Define authenticated routes (require login but no specific role)
const authenticatedRoutes = [
  "/dashboard",
  "/dashboard/profile",
  "/dashboard/settings",
  "/dashboard/billing",
  "/dashboard/analytics",
  "/dashboard/support",
  "/api/user",
  "/api/billing",
];

/**
 * Check if a pathname matches any of the routes in the list
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`)
  );
}

/**
 * Get the required role for a specific route
 */
function getRequiredRoleForRoute(pathname: string): UserRole | null {
  if (matchesRoute(pathname, adminRoutes)) {
    return 'admin';
  }
  
  if (matchesRoute(pathname, dispatcherRoutes)) {
    return 'dispatcher';
  }
  
  if (matchesRoute(pathname, authenticatedRoutes)) {
    return 'user'; // Any authenticated user can access
  }
  
  return null; // No specific role required
}

/**
 * Middleware function to handle authentication and role-based access control
 */
export default withClerkMiddleware((request: NextRequest) => {
  return middlewareHandler(request);
});

/**
 * Main middleware handler with our custom logic
 */
function middlewareHandler(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Check if the route is public first
    if (matchesRoute(pathname, publicRoutes)) {
      return NextResponse.next();
    }
    
    // Get auth information from Clerk
    const { userId } = getAuth(request);
    
    // If user is not authenticated and trying to access a protected route, redirect to sign-in
    if (!userId) {
      // Create a redirect URL to the sign-in page
      const signInUrl = new URL('/auth/sign-in', request.url);
      
      // Add the current URL as a redirect parameter so users can be sent back after login
      signInUrl.searchParams.set('redirect_url', request.url);
      
      // Redirect to the sign-in page
      return NextResponse.redirect(signInUrl);
    }
    
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (userId && (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // Get the required role for the requested route
    const requiredRole = getRequiredRoleForRoute(pathname);
    
    // If no specific role is required, allow access to authenticated users
    if (!requiredRole) {
      return NextResponse.next();
    }
    
    // For admin routes, we'll implement a basic check in the middleware
    // For more complex role checks, we'll rely on page-level components
    if (matchesRoute(pathname, adminRoutes)) {
      // For admin routes, we'll add a header to indicate that admin access is required
      // This can be checked in the page component
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-auth-role-required', 'admin');
      
      // Return the request with the modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // For dispatcher routes, we'll implement a similar check
    if (matchesRoute(pathname, dispatcherRoutes)) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-auth-role-required', 'dispatcher');
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // For all other authenticated routes, allow access
    return NextResponse.next();
  } catch (error) {
    // Log the error for debugging
    if (DEBUG) {
      console.error('Middleware error:', error);
    }
    
    // In case of an error, allow the request to proceed to avoid blocking users
    // The application can handle authentication at the component level as a fallback
    return NextResponse.next();
  }
}

// Configure Middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files and API routes that don't need auth
    "/",
    "/((?!api/webhooks|_next).*)",
    // Match dashboard routes
    "/dashboard/:path*",
    // Match API routes that need auth
    "/api/((?!webhooks).*)/:path*",
  ],
};
