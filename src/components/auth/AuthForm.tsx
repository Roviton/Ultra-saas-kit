'use client'

import { useEffect, useState } from 'react'
import { SignIn, SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UserRole } from '@/lib/roles'
import { clerkAppearance } from '@/lib/clerk-appearance'

interface AuthFormProps {
  view?: string
  routing?: 'hash' | 'virtual'
}

/**
 * AuthForm component using Clerk's built-in components
 * This implementation properly handles CAPTCHA and other security features
 * required in production environments
 */
export default function AuthForm({ view = 'sign-in', routing }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(view === 'sign-up')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isClerkLoaded, setIsClerkLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsSignUp(view === 'sign-up')
  }, [view])
  
  // Check if Clerk is loaded
  useEffect(() => {
    // Check if Clerk components are available
    if (typeof SignIn === 'function' && typeof SignUp === 'function') {
      setIsClerkLoaded(true)
    }
    
    // Also check if Clerk script is loaded in window
    const checkClerkLoaded = () => {
      if (typeof window !== 'undefined' && (window as any).__clerk_frontend_api) {
        setIsClerkLoaded(true)
      }
    }
    
    // Check immediately and after a delay
    checkClerkLoaded()
    const timer = setTimeout(checkClerkLoaded, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
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
    console.log('AuthForm rendering with view:', view)
    console.log('isSignUp:', isSignUp)
    console.log('Clerk publishable key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
    console.log('Clerk JS enabled:', process.env.NEXT_PUBLIC_CLERK_JS_ENABLED)
    console.log('Clerk API version:', process.env.NEXT_PUBLIC_CLERK_API_VERSION)
    console.log('Clerk sign-in URL:', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL)
    console.log('Clerk sign-up URL:', process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL)
    console.log('Clerk routing:', routing)
    
    // Check if Clerk is loaded in window
    if (typeof window !== 'undefined') {
      console.log('Clerk window object available:', !!(window as any).__clerk_frontend_api)
    }
  }, [view, isSignUp, routing])

  // Check if Clerk components are available
  const ClerkComponentsAvailable = typeof SignIn === 'function' && typeof SignUp === 'function'
  console.log('Clerk components available:', ClerkComponentsAvailable)

  // Define appearance object once to avoid duplication
  const clerkAppearance = {
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
  }

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

        {!isClerkLoaded && (
          <div className="p-4 border border-yellow-500 bg-yellow-500/10 rounded-lg text-white">
            <p className="font-medium">Authentication components are loading...</p>
            <p className="text-sm mt-1">If this message persists, please check your Clerk configuration and browser console for errors.</p>
          </div>
        )}

        {isClerkLoaded && isSignUp ? (
          <SignUp
            signInUrl="/auth/sign-in"
            fallbackRedirectUrl="/dashboard"
            unsafeMetadata={{
              role: "dispatcher"
            }}
            appearance={clerkAppearance}
            routing={routing}
          />
        ) : (
          <SignIn
            signUpUrl="/auth/sign-up"
            fallbackRedirectUrl="/dashboard"
            appearance={clerkAppearance}
            routing={routing}
          />
        )}
      </div>
    </div>
  )
} 