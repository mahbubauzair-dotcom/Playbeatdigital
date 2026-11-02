import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env ? (import.meta as unknown as { env: Record<string, string> }).env : {};
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const SUPABASE_URL =
  env.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL || 'https://nsqhllmhnpjftqvxoxsg.supabase.co';
const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cscpcDi4N4VEFAjhbsDurg_fPaU23UC';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface AdminProfile {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor';
  full_name?: string;
  created_at?: string;
}

export interface AdminAuthResult {
  isAuthenticated: boolean;
  user: User | null;
  profile: AdminProfile | null;
  error?: string;
  isTableMissing?: boolean;
}

/**
 * Validates the current authenticated session AND verifies authorization
 * against the public.admin_users table (enforced with database RLS).
 */
export async function getVerifiedAdminSession(): Promise<AdminAuthResult> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      return { isAuthenticated: false, user: null, profile: null };
    }

    // Query admin_users table to verify role
    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('id, email, role, full_name, created_at')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
      if (profileError.code === 'PGRST205' || profileError.message.includes('schema cache')) {
        return {
          isAuthenticated: false,
          user: session.user,
          profile: null,
          isTableMissing: true,
          error: 'Database table admin_users has not been created yet in Supabase.',
        };
      }
      return {
        isAuthenticated: false,
        user: session.user,
        profile: null,
        error: profileError.message,
      };
    }

    if (!profile) {
      // User is authenticated in Supabase Auth, but NOT registered in admin_users table
      return {
        isAuthenticated: false,
        user: session.user,
        profile: null,
        error: 'Access denied: User account is not registered in the admin_users table.',
      };
    }

    return {
      isAuthenticated: true,
      user: session.user,
      profile: profile as AdminProfile,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { isAuthenticated: false, user: null, profile: null, error: message };
  }
}
