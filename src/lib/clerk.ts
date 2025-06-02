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

// Set API version explicitly to a stable version
// Using 2023-10-24 which is compatible with Clerk SDK v6.20.2
configuredClerkClient.apiVersion = '2023-10-24';

// Set API URL explicitly
configuredClerkClient.apiUrl = 'https://api.clerk.com';

export { configuredClerkClient };
