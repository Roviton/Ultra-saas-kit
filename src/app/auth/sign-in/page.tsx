'use client'

import AuthPage from '@/components/auth/AuthPage'
import { useEffect } from 'react'

export default function SignInPage() {
  // Add debugging to help troubleshoot auth page issues
  useEffect(() => {
    console.log('Sign-in page mounted')
  }, [])

  return <AuthPage view="sign-in" />
}
