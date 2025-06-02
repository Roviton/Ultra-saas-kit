import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

// Debug environment variables during build
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
if (!publishableKey) {
  console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
} else if (typeof window !== 'undefined') {
  // Only log in client-side to avoid build issues
  console.log('Using publishable key:', publishableKey.substring(0, 10) + '...')
}

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ultra SAAS Kit',
  description: 'The ultimate starter kit for your SAAS project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-primary text-secondary antialiased`} suppressHydrationWarning>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
