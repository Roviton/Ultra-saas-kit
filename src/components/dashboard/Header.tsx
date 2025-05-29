'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/supabase/auth-context'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { Database } from '@/types/supabase'

interface OrganizationInfo {
  id: string
  name: string
  subscription_tier?: string
}

export default function Header() {
  const { user, profile, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // The auth data is already being loaded by the AuthProvider in the auth-context

  // SignOut functionality is now handled by the SignOutButton component

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-white/5 h-8 w-24 rounded"></div>
            <div className="animate-pulse bg-white/5 h-8 w-32 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              SAAS Kit
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {profile?.role && (
                <div className="text-white/60 bg-white/5 px-2 py-1 rounded text-xs">
                  {profile.role === 'admin' ? 'Administrator' : 'Dispatcher'}
                </div>
              )}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-white/80"
                >
                  <span className="max-w-[150px] truncate">{user?.email}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <div onClick={() => setIsMenuOpen(false)}>
                        <SignOutButton
                          variant="ghost"
                          showIcon={true}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 justify-start font-normal"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 