'use client'

import { ReactNode, useEffect } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
// Keep Supabase auth temporarily until full migration is complete
// import { AuthProvider } from '@/lib/supabase/auth-context'
// import { SessionExpiryAlert } from '@/components/auth/session-expiry-alert'
import { Toaster } from 'sonner'
import { clerkAppearance } from '@/lib/clerk-appearance'

interface ProvidersProps {
  children: ReactNode
}

/**
 * AuthProviders component
 * Wraps the application with all necessary providers for authentication and notifications
 * Updated to use Clerk.com for authentication instead of Supabase Auth
 */
export function AuthProviders({ children }: ProvidersProps) {
  // Debug output to help troubleshoot Clerk initialization
  console.log('ClerkProvider initializing with key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  console.log('Clerk JS enabled:', process.env.NEXT_PUBLIC_CLERK_JS);
  console.log('Clerk API version:', process.env.NEXT_PUBLIC_CLERK_API_VERSION);
  
  // Add effect to check if Clerk script is loaded
  useEffect(() => {
    // Check if Clerk is loaded in window
    if (typeof window !== 'undefined') {
      console.log('Checking for Clerk window object...');
      const checkClerkLoaded = () => {
        const isClerkLoaded = !!(window as any).__clerk_frontend_api;
        console.log('Clerk window object available:', isClerkLoaded);
      };
      
      // Check immediately and after a delay
      checkClerkLoaded();
      setTimeout(checkClerkLoaded, 2000);
    }
  }, []);
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      // Explicitly set sign-in and sign-up URLs
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
    >
      {children}
      {/* <SessionExpiryAlert /> - Removed as Clerk handles session management */}
      <Toaster position="top-right" />
    </ClerkProvider>
  )
}
