'use client'

import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
// Keep Supabase auth temporarily until full migration is complete
// import { AuthProvider } from '@/lib/supabase/auth-context'
// import { SessionExpiryAlert } from '@/components/auth/session-expiry-alert'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

/**
 * AuthProviders component
 * Wraps the application with all necessary providers for authentication and notifications
 * Updated to use Clerk.com for authentication instead of Supabase Auth
 */
export function AuthProviders({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      {children}
      {/* <SessionExpiryAlert /> - Removed as Clerk handles session management */}
      <Toaster position="top-right" />
    </ClerkProvider>
  )
}
