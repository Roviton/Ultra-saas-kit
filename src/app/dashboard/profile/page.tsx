'use client'

import { useState } from 'react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

// Mock profile data for UI demonstration
interface MockProfile {
  id: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string | null;
  website?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

export default function ProfileSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Mock profile data for UI demonstration
  const [profileData, setProfileData] = useState<MockProfile>({
    id: '1',
    username: 'johndoe',
    fullName: 'John Doe',
    avatarUrl: null,
    website: 'https://example.com',
    email: 'john.doe@example.com',
    role: 'admin',
    firstName: 'John',
    lastName: 'Doe'
  })

  // Mock function to simulate profile update - will be replaced with Clerk auth
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Validation example
        if (profileData.username && profileData.username.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        
        // Success message
        setSuccessMessage('Profile updated successfully');
        setIsSaving(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        setIsSaving(false);
      }
    }, 800);
  }
  
  // Mock function to simulate avatar upload - will be replaced with Clerk auth
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Size validation (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate upload delay
    setTimeout(() => {
      // Create a fake URL for demo purposes
      const fakeUrl = URL.createObjectURL(file);
      setProfileData({
        ...profileData,
        avatarUrl: fakeUrl
      });
      setSuccessMessage('Avatar updated successfully');
      setIsSaving(false);
    }, 1000);
  }
  
  // Mock function to remove avatar - will be replaced with Clerk auth
  const handleAvatarRemove = () => {
    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setProfileData({
        ...profileData,
        avatarUrl: null
      });
      setSuccessMessage('Avatar removed successfully');
      setIsSaving(false);
    }, 500);
  }

  // Loading state UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-2 text-white/60">
            Manage your profile information and settings.
          </p>
        </div>
        <div>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-500">{successMessage}</p>
        </div>
      )}

      <div className="bg-[#111111] rounded-2xl p-8 border border-white/5">
        {/* Role Badge Section */}
        <div className="mb-8 pb-8 border-b border-white/5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Account Type</h3>
              <div className="mt-1 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                  Administrator
                </span>
                <span className="ml-2 text-sm text-white/60">
                  Full access to all features and settings
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Avatar Section */}
        <div className="flex items-center mb-8 pb-8 border-b border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
            {profileData?.avatarUrl ? (
              <img
                src={profileData.avatarUrl}
                alt="Profile"
                className="w-20 h-20 object-cover"
              />
            ) : (
              <UserCircleIcon className="w-12 h-12 text-white/20" />
            )}
          </div>
          <div className="ml-6">
            <h3 className="text-lg font-medium text-white">Profile Picture</h3>
            <p className="text-sm text-white/60 mb-4">
              Upload a new profile picture or remove the current one
            </p>
            <div className="flex space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors inline-block">
                  Upload New
                </span>
              </label>
              {profileData?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileUpdate}>
          <div className="space-y-6">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={profileData?.firstName || ''}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={profileData?.lastName || ''}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={profileData?.username || ''}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="Choose a username"
              />
              <p className="mt-1 text-sm text-white/60">
                This will be your public username visible to other users.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profileData?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="Your email address"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
                Website
              </label>
              <input
                type="text"
                id="website"
                value={profileData?.website || ''}
                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 