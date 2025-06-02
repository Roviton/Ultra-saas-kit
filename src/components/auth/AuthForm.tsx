'use client'

import { useEffect, useState } from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UserRole } from '@/lib/roles'

interface AuthFormProps {
  view?: string
}

/**
 * AuthForm component using Clerk's built-in components
 * This implementation properly handles CAPTCHA and other security features
 * required in production environments
 */
export default function AuthForm({ view: initialView }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(initialView === 'sign-up')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setIsSignUp(initialView === 'sign-up')
  }, [initialView])
  
  // Handle errors at the component level
  useEffect(() => {
    // Listen for Clerk-related errors
    const handleClerkError = (e: Event) => {
      if (e instanceof ErrorEvent) {
        console.error('Authentication error:', e.error || e.message)
        setError(e.message || 'An error occurred during authentication')
      }
    }
    
    window.addEventListener('error', handleClerkError)
    
    return () => {
      window.removeEventListener('error', handleClerkError)
    }
  }, [])
  
  // Debug output to help troubleshoot rendering issues
  useEffect(() => {
    console.log('AuthForm rendering with view:', initialView)
    console.log('isSignUp:', isSignUp)
    console.log('Clerk publishable key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  }, [initialView, isSignUp])

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full px-4">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-semibold text-white text-center">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {isSignUp ? (
          <SignUp
            signInUrl="/auth?view=sign-in"
            fallbackRedirectUrl="/dashboard"
            unsafeMetadata={{
              role: "dispatcher"
            }}
            appearance={{
              elements: {
                formButtonPrimary: 
                  "w-full py-2 px-4 bg-[#FFBE1A] text-black rounded-lg font-medium hover:bg-[#FFBE1A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFBE1A] disabled:opacity-50 transition-colors",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "bg-[#0A0A0A] border border-white/10 text-white hover:bg-[#1A1A1A]",
                formFieldInput: 
                  "w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent",
                formFieldLabel: "text-white",
                footerActionText: "text-white",
                footerActionLink: "text-[#FFBE1A] hover:text-[#FFBE1A]/80"
              }
            }}
          />
        ) : (
          <SignIn
            signUpUrl="/auth?view=sign-up"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 
                  "w-full py-2 px-4 bg-[#FFBE1A] text-black rounded-lg font-medium hover:bg-[#FFBE1A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFBE1A] disabled:opacity-50 transition-colors",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "bg-[#0A0A0A] border border-white/10 text-white hover:bg-[#1A1A1A]",
                formFieldInput: 
                  "w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FFBE1A] focus:border-transparent",
                formFieldLabel: "text-white",
                footerActionText: "text-white",
                footerActionLink: "text-[#FFBE1A] hover:text-[#FFBE1A]/80"
              }
            }}
          />
        )}
      </div>
    </div>
  )
} 