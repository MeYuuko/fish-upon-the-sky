export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? '';
export const hasClerkConfiguration = Boolean(clerkPublishableKey);

export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';
export const hasGoogleOAuth = Boolean(googleClientId);

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
export const hasSupabaseConfiguration = Boolean(supabaseUrl && supabaseAnonKey);
