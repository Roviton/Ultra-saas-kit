'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

export default function VerificationPage() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
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
          
          if (user?.email_confirmed_at) {
            setIsVerified(true)
            // Wait 3 seconds before redirecting to dashboard
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          } else {
            setIsVerified(false)
          }
        } else {
          setIsVerified(false)
        }
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkSession()
  }, [router, supabase.auth])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h1 className="text-2xl font-bold">Verifying your email...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold">Verification Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <div className="pt-4">
            <Button onClick={() => router.push('/auth')}>
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="text-green-500 text-5xl">✓</div>
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your email has been successfully verified. You will be redirected to the dashboard in a moment.
          </p>
          <div className="pt-4">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-yellow-500 text-5xl">⚠️</div>
        <h1 className="text-2xl font-bold">Email Not Verified</h1>
        <p className="text-muted-foreground">
          Your email has not been verified yet. Please check your inbox for the verification email and click the link to verify your account.
        </p>
        <div className="pt-4 space-y-3">
          <Button 
            onClick={async () => {
              setIsLoading(true)
              try {
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email: (await supabase.auth.getUser()).data.user?.email || '',
                  options: {
                  emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
                })
                
                if (error) {
                  throw error
                }
                
                setError('Verification email resent. Please check your inbox.')
              } catch (error: any) {
                setError(error.message)
              } finally {
                setIsLoading(false)
              }
            }}
            className="w-full"
          >
            Resend Verification Email
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/auth')}
            className="w-full"
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  )
}
