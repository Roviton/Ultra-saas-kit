'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Safely access environment variables on the client side
  const [publishableKey, setPublishableKey] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    // Only set the publishable key on the client side
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setPublishableKey(key);
    
    // Debug key for development purposes
    if (key) {
      console.log('Using publishable key:', key.substring(0, 10) + '...');
    } else {
      console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    }
  }, []);

  // Only render children when publishable key is available
  if (!publishableKey && typeof window !== 'undefined') {
    return <div className="p-4">Loading authentication...</div>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
