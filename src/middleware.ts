import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
 
// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/pricing",
  "/features",
  "/docs",
  "/legal/privacy",
  "/legal/terms",
  "/contact",
  "/about",
  "/blog",
  "/faq",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

// Define webhook routes that should bypass authentication
const webhookRoutes = [
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
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
 * Simple middleware function for MVP
 * This handles basic routing without relying on Clerk's middleware wrapper
 * 
 * This simplified approach ensures the application works reliably while
 * we continue to develop the full authentication system
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Always allow webhook routes
  if (matchesRoute(pathname, webhookRoutes)) {
    return NextResponse.next();
  }
  
  // Allow public routes without authentication
  if (matchesRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }
  
  // For protected routes (dashboard, etc.), redirect to sign-in
  if (pathname.startsWith('/dashboard')) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Allow all other routes for now
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    // Match all routes except static files and API routes that don't need auth
    "/((?!_next/static|_next/image|favicon.ico|.*\.svg).*)",
  ],
};
