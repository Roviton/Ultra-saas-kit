// Test script to verify sign-up and profile creation with roles
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xfcjarelwsobyglvwajl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmY2phcmVsd3NvYnlnbHZ3YWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MTk5MzEsImV4cCI6MjA2Mzk5NTkzMX0.4XfaJihVH4I_Dxe_4fGf14oBWpt80JgyY1OIMhHO_xg';
const supabase = createClient(supabaseUrl, supabaseKey);

// For testing, use a real email you can access
const testEmail = 'victor1rotaru@gmail.com'; // REPLACE WITH YOUR EMAIL if needed
const password = 'Test123456!';
const testRole = 'driver'; // Test with the driver role

async function testSignUpFlow() {
  console.log(`=== TESTING SIGN-UP FLOW WITH ROLE: ${testRole} ===`);
  
  try {
    // Step 1: Check if user already exists and delete if necessary
    console.log(`Checking if test user ${testEmail} already exists...`);
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testEmail)
      .maybeSingle();
      
    if (existingUser) {
      console.log(`User ${testEmail} already exists. For a clean test, please delete this user from the Supabase dashboard.`);
      console.log(`Go to: https://app.supabase.com/project/xfcjarelwsobyglvwajl/auth/users`);
      console.log(`Find the user with email ${testEmail} and delete it.`);
      console.log(`Then run this script again.`);
      return;
    }
    
    // Step 2: Sign up the user with role metadata
    console.log(`Creating new user: ${testEmail} with role: ${testRole}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password,
      options: {
        data: {
          role: testRole,
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Error signing up:', signUpError);
      return;
    }

    const userId = signUpData.user.id;
    console.log('✅ Sign-up successful!');
    console.log(`User ID: ${userId}`);
    
    // Step 3: Instructions for verification
    console.log('=== VERIFICATION INSTRUCTIONS ===');
    console.log('1. Check your email inbox for the verification email');
    console.log('2. Click the verification link in the email');
    console.log('3. After verification, come back to this terminal');
    console.log('4. Press Enter to continue the test...');
    
    // Wait for user to verify email
    await new Promise(resolve => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Press Enter after you have verified your email...', () => {
        readline.close();
        resolve();
      });
    });
    
    // Step 4: Sign in with the verified user
    console.log('Signing in with verified user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password
    });
    
    if (signInError) {
      console.error('❌ Error signing in:', signInError);
      return;
    }
    
    console.log('✅ Sign-in successful!');
    
    // Step 5: Check if the profile was created with the correct role
    console.log('Checking user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name')
      .eq('id', signInData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }
    
    console.log('Profile data:', profileData);
    
    // Verify the role was set correctly
    if (profileData.role === testRole) {
      console.log('✅ SUCCESS: Profile created with correct role!');
      console.log(`Expected role: ${testRole}, Actual role: ${profileData.role}`);
    } else {
      console.error('❌ ERROR: Profile role mismatch!');
      console.error(`Expected role: ${testRole}, Actual role: ${profileData.role}`);
    }
    
    console.log('=== TEST COMPLETE ===');
    console.log('You can now test logging into the application at http://localhost:3000');
    console.log('and verify that you can access the dashboard with the correct role permissions.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSignUpFlow();
