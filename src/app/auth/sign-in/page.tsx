'use client';

import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <SignIn 
            routing="path" 
            path="/auth/sign-in" 
            signUpUrl="/auth/sign-up" 
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
