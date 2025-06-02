import dynamic from 'next/dynamic'

// Completely disable SSR for this component to prevent "packageName is not defined" error
// This ensures the Clerk components only run on the client side
const ProfilePage = dynamic(
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

export default ProfilePage
