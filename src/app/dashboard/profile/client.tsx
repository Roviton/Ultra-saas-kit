'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Import ProfileSettings with dynamic import to avoid SSR issues
const ProfileSettings = dynamic(
  () => import('@/components/profile/ProfileSettings'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export default function ProfileClient() {
  const router = useRouter()
  
  // We'll handle any client-side only logic here
  useEffect(() => {
    // This runs only on the client
    console.log('Profile client component mounted')
  }, [])

  return <ProfileSettings />
}
