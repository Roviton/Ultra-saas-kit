export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { Suspense } from 'react';
import ProfileClient from './client';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">
          <p className="text-center text-gray-500">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileClient />
    </Suspense>
  );
}
