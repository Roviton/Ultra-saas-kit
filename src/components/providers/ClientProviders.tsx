'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

// This component ensures Clerk is only initialized on the client side
// to prevent prerendering errors during build
export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track if we're on the client side
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Debug environment variables
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (key) {
      // Only log in development to avoid exposing key in production logs
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using publishable key:', key.substring(0, 10) + '...');
      }
    } else {
      console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    }
  }, []);

  // Show a simple loading state until client-side hydration completes
  if (!isMounted) {
    return <div className="p-4">Loading application...</div>;
  }

  // Only render ClerkProvider on the client side after hydration
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
