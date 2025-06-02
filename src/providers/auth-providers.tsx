/**
 * Clerk Authentication Provider
 * This file implements Clerk authentication for the application
 */

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export const AuthProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white',
          footerActionLink: 'text-primary hover:text-primary/90',
          card: 'bg-background shadow-md',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};
