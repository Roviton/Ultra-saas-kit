/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Clerk Authentication Keys
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    
    // Clerk API Configuration
    CLERK_API_URL: process.env.CLERK_API_URL,
    CLERK_API_VERSION: process.env.CLERK_API_VERSION,
    NEXT_PUBLIC_CLERK_API_VERSION: process.env.NEXT_PUBLIC_CLERK_API_VERSION,
    
    // Clerk Script Loading Configuration
    NEXT_PUBLIC_CLERK_JS_ENABLED: process.env.NEXT_PUBLIC_CLERK_JS_ENABLED,
    NEXT_PUBLIC_CLERK_LOAD_JS: process.env.NEXT_PUBLIC_CLERK_LOAD_JS,
    NEXT_PUBLIC_CLERK_DEVELOPMENT_MODE: process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT_MODE,
    
    // Clerk URL Configuration
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL,
    
    // Clerk Domain Configuration
    NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
    NEXT_PUBLIC_CLERK_FRONTEND_API: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
    
    // Clerk CORS Configuration
    NEXT_PUBLIC_CLERK_CORS_ALLOWED_ORIGINS: process.env.NEXT_PUBLIC_CLERK_CORS_ALLOWED_ORIGINS,
    NEXT_PUBLIC_CLERK_WEBHOOK_VERIFICATION_ENABLED: process.env.NEXT_PUBLIC_CLERK_WEBHOOK_VERIFICATION_ENABLED
  },
  
  // Clerk requires these settings for proper functioning
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
  }
}

module.exports = nextConfig