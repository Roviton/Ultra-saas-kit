'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, MailCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function VerificationPage() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  
  // Create a Supabase client for verification operations
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session and user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (session) {
          // Check if email is verified
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError) {
            throw userError
          }
          
          if (user?.email) {
            setUserEmail(user.email)
          }
          
          if (user?.email_confirmed_at) {
            // Force a fresh session so middleware recognises verification immediately
            await supabase.auth.getSession()
            
            setIsVerified(true)
            // Quick redirect
            setTimeout(() => {
              router.push('/dashboard')
            }, 500)
          } else {
            setIsVerified(false)
          }
        } else {
          setIsVerified(false)
          router.push('/auth')
        }
      } catch (error: any) {
        console.error('Verification error:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkSession()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Header with Ultra21 branding */}
          <div className="mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2">
              <Image src="/logo.svg" alt="Ultra21" width={40} height={40} priority />
              <span className="text-white font-bold text-2xl">Ultra<span className="text-yellow-400">21</span></span>
            </Link>
            <p className="text-gray-400 mt-2">Freight Dispatch Platform</p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-yellow-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
            <p className="text-gray-400 mt-2">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Header with Ultra21 branding */}
          <div className="mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2">
              <Image src="/logo.svg" alt="Ultra21" width={40} height={40} priority />
              <span className="text-white font-bold text-2xl">Ultra<span className="text-yellow-400">21</span></span>
            </Link>
            <p className="text-gray-400 mt-2">Freight Dispatch Platform</p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
            <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <h1 className="text-2xl font-bold text-white mb-4">Unable to Verify Email</h1>
            <p className="text-gray-400 mb-6">We encountered an error while verifying your email address. Please try again or contact support.</p>
            
            <div className="flex flex-col space-y-3">
              <Button onClick={() => router.push('/auth')} className="w-full">
                Return to Login
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Header with Ultra21 branding */}
          <div className="mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2">
              <Image src="/logo.svg" alt="Ultra21" width={40} height={40} priority />
              <span className="text-white font-bold text-2xl">Ultra<span className="text-yellow-400">21</span></span>
            </Link>
            <p className="text-gray-400 mt-2">Freight Dispatch Platform</p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            
            <Alert variant="default" className="mb-4 bg-green-900/30 border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your email has been successfully verified!</AlertDescription>
            </Alert>
            
            <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-gray-400 mb-6">
              Your account is now fully activated. You'll be redirected to the dashboard in a moment.
            </p>
            <div className="pt-2">
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Header with Ultra21 branding */}
        <div className="mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <Image src="/logo.svg" alt="Ultra21" width={40} height={40} priority />
            <span className="text-white font-bold text-2xl">Ultra<span className="text-yellow-400">21</span></span>
          </Link>
          <p className="text-gray-400 mt-2">Freight Dispatch Platform</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-4">
            <MailCheck className="h-16 w-16 text-yellow-400" />
          </div>
          
          {resendSuccess ? (
            <Alert className="mb-4 bg-green-900/30 border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Email Sent</AlertTitle>
              <AlertDescription>A new verification email has been sent to your inbox.</AlertDescription>
            </Alert>
          ) : null}
          
          <h1 className="text-2xl font-bold text-white mb-4">Verify Your Email</h1>
          <p className="text-gray-400 mb-6">
            We've sent a verification link to your email address. Please check your inbox and click on the link to activate your Ultra21 account.
          </p>
          
          <div className="bg-gray-700/40 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Haven't received the email?</h3>
            <ul className="text-sm text-gray-400 list-disc ml-5 space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Verify you entered the correct email</li>
              <li>Try resending the verification email</li>
            </ul>
          </div>
          
          <div className="pt-2 space-y-3">
            <Button 
              onClick={async () => {
                setIsLoading(true)
                try {
                  // Get current user's email if not already set
                  let emailToUse = userEmail
                  
                  if (!emailToUse) {
                    const { data } = await supabase.auth.getUser()
                    emailToUse = data?.user?.email || null
                  }
                  
                  if (!emailToUse) {
                    throw new Error('No user email found')
                  }
                  
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: emailToUse,
                    options: {
                      emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                  })
                  
                  if (error) {
                    throw error
                  }
                  
                  setResendSuccess(true)
                  setTimeout(() => setResendSuccess(false), 5000)
                } catch (error: any) {
                  console.error('Error resending verification email:', error)
                  setError(error.message)
                } finally {
                  setIsLoading(false)
                }
              }}
              className="w-full"
              disabled={isLoading || resendSuccess}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/auth')}
              className="w-full"
              disabled={isLoading}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
