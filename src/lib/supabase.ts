import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback handling
const getEnvVar = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // Fallback for environments where import.meta.env might not be available
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Found' : '❌ Missing');
  
  throw new Error(
    '🚨 Supabase Configuration Error\n\n' +
    'Missing required environment variables in Vercel:\n' +
    '- VITE_SUPABASE_URL: ' + (supabaseUrl ? '✅ Found' : '❌ Missing') + '\n' +
    '- VITE_SUPABASE_ANON_KEY: ' + (supabaseAnonKey ? '✅ Found' : '❌ Missing') + '\n\n' +
    'To fix this:\n' +
    '1. Go to Vercel Dashboard → Settings → Environment Variables\n' +
    '2. Add both variables\n' +
    '3. Redeploy the application\n\n' +
    'See: https://vercel.com/docs/projects/environment-variables'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  },
});
