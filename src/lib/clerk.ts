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

// Set API version explicitly to match what Clerk is using
// Using 2025-04-10 as seen in the network requests
configuredClerkClient.apiVersion = '2025-04-10';

// Set API URL explicitly
configuredClerkClient.apiUrl = 'https://api.clerk.com';

export { configuredClerkClient };
