import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

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
 * Middleware function for handling authentication with Clerk
 * This uses the correct patterns for Clerk v6.20.2 with Next.js 15
 * 
 * By default, all routes require authentication unless specified in publicRoutes
 * Webhook routes are also added to publicRoutes to bypass authentication
 */

export async function middleware(req: NextRequest) {
  // Check if the request URL is in the public routes
  const url = req.nextUrl.clone();
  const isPublicRoute = [...publicRoutes, ...webhookRoutes].some(path => 
    url.pathname === path || url.pathname.startsWith(path + '/')
  );
  
  // Get the Clerk auth state using the getAuth helper
  const { userId } = getAuth(req);
  
  // If the user is not signed in and the route is not public, redirect to sign-in
  if (!userId && !isPublicRoute) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Allow the request to continue
  return NextResponse.next();
}
 
// Configure the middleware matcher to include only specific routes that need auth
// This avoids using negative lookaheads which cause issues in Next.js 15
export const config = {
  matcher: [
    // Include routes that need authentication
    '/dashboard/:path*',
    '/account/:path*',
    '/api/:path*',
    // Exclude specific API routes in the middleware logic instead of the matcher
  ],
};
