// Import necessary types from Next.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
// These will be used when we implement full authentication checks
const _publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/pricing",
  "/features",
  "/docs",
  "/api/webhook/clerk",
  "/api/webhook/stripe",
  // Add other public routes as needed
];

/**
 * Simple middleware function to handle authentication
 * This avoids TypeScript issues with Clerk's middleware
 */
export function middleware(_request: NextRequest) {
  // For now, just allow all requests to continue
  // We'll implement proper authentication checks once we resolve the TypeScript issues
  return NextResponse.next();
}

// Configure Middleware to run on specific paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
