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
  console.log('Clerk JS enabled:', process.env.NEXT_PUBLIC_CLERK_JS_ENABLED);
  console.log('Clerk API version:', process.env.NEXT_PUBLIC_CLERK_API_VERSION);
  console.log('Clerk Frontend API:', process.env.NEXT_PUBLIC_CLERK_FRONTEND_API);
  console.log('Clerk domain:', process.env.NEXT_PUBLIC_CLERK_DOMAIN);
  
  // Add effect to check if Clerk script is loaded
  useEffect(() => {
    // Check if Clerk is loaded in window
    if (typeof window !== 'undefined') {
      console.log('Checking for Clerk window object...');
      const checkClerkLoaded = () => {
        const isClerkLoaded = !!(window as any).__clerk_frontend_api;
        console.log('Clerk window object available:', isClerkLoaded);
        
        // If not loaded after 3 seconds, try to manually load the script
        if (!isClerkLoaded && typeof document !== 'undefined') {
          console.log('Attempting to manually load Clerk script...');
          const script = document.createElement('script');
          script.src = `https://${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
          script.async = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }
      };
      
      // Check immediately and after delays
      checkClerkLoaded();
      setTimeout(() => {
        console.log('Checking Clerk loaded state after 1s');
        checkClerkLoaded();
      }, 1000);
      setTimeout(() => {
        console.log('Checking Clerk loaded state after 3s');
        checkClerkLoaded();
      }, 3000);
    }
  }, []);
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      {children}
      {/* <SessionExpiryAlert /> - Removed as Clerk handles session management */}
      <Toaster position="top-right" />
    </ClerkProvider>
  )
}
