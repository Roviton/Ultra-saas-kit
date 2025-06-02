/**
 * Custom Clerk client configuration
 * This file handles API version compatibility issues and ensures consistent configuration
 */
import { clerkClient } from '@clerk/nextjs/server';

// Configure Clerk client with the correct API version
// Use type assertion to add the API version properties
const configuredClerkClient = clerkClient as typeof clerkClient & {
  apiVersion?: string;
  apiUrl?: string;
};

// Set API version explicitly to match environment variables
if (process.env.CLERK_API_VERSION) {
  // Only set if the environment variable is defined
  configuredClerkClient.apiVersion = process.env.CLERK_API_VERSION;
}

if (process.env.CLERK_API_URL) {
  // Only set if the environment variable is defined
  configuredClerkClient.apiUrl = process.env.CLERK_API_URL;
}

export { configuredClerkClient };
