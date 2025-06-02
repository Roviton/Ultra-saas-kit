'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { useUser, useClerk } from '@clerk/clerk-react'
import { getUserRole } from '@/lib/client-auth-utils'
import { UserRole } from '@/types/auth'

export default function ProfileSettings() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Load user data when the component mounts
  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.emailAddresses[0]?.emailAddress || '');
      setUsername(user.username || '');
      setUserRole(getUserRole(user));
      setImageUrl(user.imageUrl || null);
    }
  }, [isLoaded, user]);
  
  // Redirect to sign-in page if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await user.update({
        firstName,
        lastName,
        username: username || undefined
      });
      
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      console.error('Sign out error:', err);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar section */}
            <div className="md:col-span-1">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full border-2 border-gray-200">
                      <UserCircleIcon className="w-28 h-28 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Profile picture can be changed in your Clerk Dashboard
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      userRole === 'admin'
                        ? 'bg-red-500 text-white'
                        : userRole === 'dispatcher'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile form */}
            <div className="md:col-span-2">
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* First name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Last name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email can be changed in your Clerk Dashboard
                    </p>
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors ${
                      isUpdating ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
