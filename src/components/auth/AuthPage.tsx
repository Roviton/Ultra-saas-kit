'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthForm from './AuthForm'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@clerk/nextjs'

interface AuthContentProps {
  view?: 'sign-in' | 'sign-up'
}

function AuthContent({ view: initialView = 'sign-in' }: AuthContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState(initialView)
  const [mounted, setMounted] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    setMounted(true)
    const viewParam = searchParams.get('view')
    if (viewParam && (viewParam === 'sign-in' || viewParam === 'sign-up')) {
      setView(viewParam as 'sign-in' | 'sign-up')
    }

    // If user is already authenticated, redirect to dashboard
    if (user) {
      router.push('/dashboard')
    }
  }, [router, searchParams, user, initialView])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Ultra21" width={32} height={32} priority />
              <span className="text-white font-bold text-xl">Ultra<span className="text-yellow-400">21</span></span>
              <span className="text-sm text-white/60 hidden sm:block">Freight Dispatch Platform</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link href="/features" className="text-white/60 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/docs" className="text-white/60 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link 
                href={view === 'sign-in' ? '/auth/sign-up' : '/auth/sign-in'} 
                className="text-[#FFBE1A] hover:text-[#FFBE1A]/80 transition-colors"
              >
                {view === 'sign-in' ? 'Sign up' : 'Sign in'}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col pt-20">
        <AuthForm view={view} />
      </div>
    </div>
  )
}

interface AuthPageProps {
  view?: 'sign-in' | 'sign-up'
}

export default function AuthPage({ view = 'sign-in' }: AuthPageProps) {
  // Add debugging to help troubleshoot auth page issues
  useEffect(() => {
    console.log('AuthPage mounted with view:', view)
  }, [view])

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthContent view={view} />
    </Suspense>
  )
} 