import React, { useState, useEffect } from 'react';
import { supabase, getVerifiedAdminSession, AdminProfile } from '../lib/supabaseClient';
import { Lock, Mail, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, Database } from 'lucide-react';

interface AdminAuthGateProps {
  children: (admin: AdminProfile) => React.ReactNode;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isTableMissing, setIsTableMissing] = useState(false);

  const checkSession = async () => {
    setLoading(true);
    setAuthError(null);
    const result = await getVerifiedAdminSession();
    if (result.isAuthenticated && result.profile) {
      setAdmin(result.profile);
    } else {
      setAdmin(null);
      if (result.isTableMissing) {
        setIsTableMissing(true);
      }
      if (result.error && !result.isTableMissing) {
        setAuthError(result.error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        setSubmitting(false);
        return;
      }

      if (data.user) {
        const result = await getVerifiedAdminSession();
        if (result.isAuthenticated && result.profile) {
          setAdmin(result.profile);
        } else {
          setAuthError(
            result.error ||
              'Access denied: Your account is authenticated in Supabase, but is not authorized in the admin_users table.'
          );
          if (result.isTableMissing) {
            setIsTableMissing(true);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-700 dark:text-slate-300">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Verifying admin session & database authorizations...</p>
      </div>
    );
  }

  if (admin) {
    return <>{children(admin)}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="PlayBeat Tools"
            className="h-10 w-auto dark:hidden"
            width="180"
            height="40"
          />
          <img
            src="/logo-dark.png"
            alt="PlayBeat Tools"
            className="h-10 w-auto hidden dark:block"
            width="180"
            height="40"
          />
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Portal Authentication
        </h1>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Protected by Supabase Auth and Row Level Security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl sm:px-10">
          {isTableMissing && (
            <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
              <div className="flex items-start gap-2.5">
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-1">Database Tables Pending</strong>
                  <p className="leading-relaxed">
                    The Supabase project is connected, but the <code>admin_users</code> table has not been created yet. Run the migration script in your Supabase SQL editor:
                  </p>
                  <code className="block mt-2 p-2 bg-white/70 dark:bg-slate-900 rounded font-mono text-[11px] select-all">
                    supabase/migrations/20261102000000_create_admin_and_settings.sql
                  </code>
                </div>
              </div>
            </div>
          )}

          {authError && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{authError}</div>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@playbeatdigital.store"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying authorization...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Public registration is disabled. To provision the initial superadmin account, see{' '}
              <a
                href="https://github.com/mahbubauzair-dotcom/Playbeatdigital/blob/main/docs/ADMIN_SETUP_GUIDE.md"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700"
              >
                docs/ADMIN_SETUP_GUIDE.md
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
