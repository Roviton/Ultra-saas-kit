// Jest setup file
import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Polyfill Response.json static if not available
if (!(Response as any).json) {
  // eslint-disable-next-line no-extend-native
  (Response as any).json = (data: any, init?: ResponseInit) => new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
  })
}

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/test'
  }),
  usePathname: jest.fn().mockReturnValue('/test'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams())
}))

// Mock Next.js head
jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: any }) => children,
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
  UserProfile: {}
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => {
  return {
    auth: jest.fn().mockReturnValue({
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      getToken: jest.fn().mockResolvedValue('test-token')
    }),
    currentUser: jest.fn().mockResolvedValue({
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      publicMetadata: { role: 'user' }
    }),
    clerkClient: {
      users: {
        getUser: jest.fn().mockResolvedValue({
          id: 'test-user-id',
          firstName: 'Test',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          publicMetadata: { role: 'user' }
        })
      }
    },
    getAuth: jest.fn().mockReturnValue({
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      getToken: jest.fn().mockResolvedValue('test-token')
    })
  }
})

// Mock URL constructor
const originalURL = global.URL;
global.URL = function(url: string) {
  return { hostname: 'xfcjarelwsobyglvwajl.supabase.co' } as URL;
} as unknown as typeof URL;
// Preserve the original static methods
global.URL.createObjectURL = originalURL.createObjectURL;
global.URL.revokeObjectURL = originalURL.revokeObjectURL;
global.URL.canParse = originalURL.canParse;

// Restore original URL class to keep searchParams support
global.URL = originalURL
