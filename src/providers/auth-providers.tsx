'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/supabase/auth-context'
import { SessionExpiryAlert } from '@/components/auth/session-expiry-alert'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

/**
 * AuthProviders component
 * Wraps the application with all necessary providers for authentication and notifications
 */
export function AuthProviders({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <SessionExpiryAlert />
      <Toaster position="top-right" />
    </AuthProvider>
  )
}
