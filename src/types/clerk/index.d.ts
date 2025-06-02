/**
 * Type declarations for Clerk authentication
 * This file provides type definitions for Clerk's API to avoid TypeScript errors
 */

declare module '@clerk/nextjs/server' {
  export interface ClerkUser {
    id: string;
    publicMetadata: Record<string, unknown>;
    privateMetadata: Record<string, unknown>;
    username?: string | null;
    emailAddresses: Array<{ emailAddress: string }> | null;
    primaryEmailAddressId?: string | null;
    primaryEmailAddress?: { emailAddress: string } | null;
  }

  export function getAuth(req: Request | import('next/server').NextRequest): {
    userId: string | null;
    sessionId: string | null;
    getToken: (options?: { template?: string }) => Promise<string | null>;
  };

  export function currentUser(): Promise<ClerkUser | null>;

  export function withClerkMiddleware<T extends Request | import('next/server').NextRequest>(
    middleware: (req: T) => Response | import('next/server').NextResponse
  ): (req: T) => Promise<Response | import('next/server').NextResponse>;
}

declare module '@clerk/nextjs' {
  import { ReactNode } from 'react';

  export interface ClerkProviderProps {
    children: ReactNode;
    appearance?: {
      baseTheme?: any;
      elements?: Record<string, string>;
    };
  }

  export function ClerkProvider(props: ClerkProviderProps): JSX.Element;
}
