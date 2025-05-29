// Script to verify Supabase connection for Ultra21.com freight dispatch platform
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySupabaseConnection() {
  console.log('Verifying Supabase Connection...');
  console.log('Supabase URL:', supabaseUrl);
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase URL or Anonymous Key is missing from environment variables');
    process.exit(1);
  }

  try {
    // Test query to verify connection
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Data returned:', data);
    
    // Check tables exist
    const tables = ['profiles', 'organizations', 'subscription_tiers', 'drivers', 'customers', 'loads'];
    for (const table of tables) {
      console.log(`Checking table '${table}'...`);
      const { error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        console.error(`❌ Table '${table}' check failed:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    }
    
    console.log('\nSupabase Integration Verification Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    process.exit(1);
  }
}

verifySupabaseConnection();
