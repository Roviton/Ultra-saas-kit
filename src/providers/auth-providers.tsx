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
    <ClerkProvider
      // Explicitly set routing strategy to path-based
      routerPush={(to) => window.location.href = to}
      routerReplace={(to) => window.location.href = to}
      appearance={{
        elements: {
          formButtonPrimary: 
            "bg-[#FFBE1A] hover:bg-[#FFBE1A]/90 text-black",
          card: "bg-[#0A0A0A] border border-white/10",
          headerTitle: "text-white",
          headerSubtitle: "text-white/60",
          socialButtonsBlockButton: 
            "bg-[#1A1A1A] border border-white/10 text-white hover:bg-[#2A2A2A]",
          formFieldInput: 
            "bg-[#0A0A0A] border border-white/10 text-white",
          formFieldLabel: "text-white",
          footerActionText: "text-white",
          footerActionLink: "text-[#FFBE1A] hover:text-[#FFBE1A]/80"
        }
      }}
    >
      {children}
      {/* <SessionExpiryAlert /> - Removed as Clerk handles session management */}
      <Toaster position="top-right" />
    </ClerkProvider>
  )
}
