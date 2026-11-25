import { createClient } from '@supabase/supabase-js';
import { hasSupabaseConfiguration, supabaseAnonKey, supabaseUrl } from '../auth/auth-config.js';

let googleSupabaseClient = null;

export function getGoogleSupabase() {
  if (!hasSupabaseConfiguration) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  if (!googleSupabaseClient) {
    googleSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return googleSupabaseClient;
}

export function createClerkSupabase(getToken) {
  if (!hasSupabaseConfiguration) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => (await getToken()) ?? null,
  });
}

export async function fetchCurrentMemberId(client) {
  const { data, error } = await client.rpc('current_member_id');
  if (error) throw error;
  return data || null;
}
