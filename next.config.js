/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Application Configuration
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    
    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_API_URL: process.env.CLERK_API_URL,
    CLERK_API_VERSION: process.env.CLERK_API_VERSION,
    NEXT_PUBLIC_CLERK_API_VERSION: process.env.NEXT_PUBLIC_CLERK_API_VERSION,
    NEXT_PUBLIC_CLERK_JS_ENABLED: process.env.NEXT_PUBLIC_CLERK_JS_ENABLED,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_CORS_ALLOWED_ORIGINS: process.env.NEXT_PUBLIC_CLERK_CORS_ALLOWED_ORIGINS,
    NEXT_PUBLIC_CLERK_WEBHOOK_VERIFICATION_ENABLED: process.env.NEXT_PUBLIC_CLERK_WEBHOOK_VERIFICATION_ENABLED,
    
    // Optional Services
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },
  
  images: {
    domains: [],
  },
  
  // Disable static generation for pages that use Clerk authentication
  // This prevents prerendering errors with Clerk
  experimental: {
    // Disable static generation for pages that use authentication
    missingSuspenseWithCSRBailout: false
  }
}

module.exports = nextConfig