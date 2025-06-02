'use client'

import AuthPage from '@/components/auth/AuthPage'
import { useEffect } from 'react'

export default function SignUpPage() {
  // Add debugging to help troubleshoot auth page issues
  useEffect(() => {
    console.log('Sign-up catch-all page mounted with hash routing')
  }, [])

  return <AuthPage view="sign-up" routing="hash" />
}
