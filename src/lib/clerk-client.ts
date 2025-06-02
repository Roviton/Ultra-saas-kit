/**
 * Custom Clerk client configuration
 * This ensures consistent API version and configuration across the application
 */
import { clerkClient } from '@clerk/nextjs/server';

// Log the current Clerk configuration for debugging
console.log('Clerk client initialized with API version:', process.env.CLERK_API_VERSION);

// Export the client
export { clerkClient };
