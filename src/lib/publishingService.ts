import { supabase } from './supabaseClient';

export interface SiteRevision {
  id: string;
  revision_number: number;
  status: 'draft' | 'published' | 'deploying' | 'live' | 'failed';
  snapshot: Record<string, unknown>;
  published_by?: string;
  vercel_deployment_id?: string;
  vercel_deployment_url?: string;
  deploy_error?: string;
  created_at: string;
  deployed_at?: string;
}

export interface PublishResult {
  success: boolean;
  revision?: SiteRevision;
  deployTriggered: boolean;
  message: string;
  error?: string;
}

/**
 * Triggers a site publication:
 * 1. Takes an immutable snapshot of current effective settings and content
 * 2. Stores the revision in Supabase `site_revisions`
 * 3. Calls the server publish API (/api/admin/publish) to securely trigger Vercel build hook
 */
export async function triggerPublish(
  snapshotData: Record<string, unknown>
): Promise<PublishResult> {
  try {
    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ snapshot: snapshotData }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // Fallback direct database publish if backend endpoint is unavailable
  try {
    const { data: rev, error: revError } = await supabase
      .from('site_revisions')
      .insert({
        status: 'published',
        snapshot: snapshotData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (revError) {
      return {
        success: false,
        deployTriggered: false,
        message: 'Could not record revision in Supabase database.',
        error: revError.message,
      };
    }

    return {
      success: true,
      revision: rev as SiteRevision,
      deployTriggered: false,
      message:
        'Published revision created in database. Set VERCEL_DEPLOY_HOOK in server environment for automatic deployment.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      deployTriggered: false,
      message: 'Publishing failed.',
      error: msg,
    };
  }
}

export async function fetchRevisionHistory(): Promise<SiteRevision[]> {
  try {
    const { data, error } = await supabase
      .from('site_revisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      return data as SiteRevision[];
    }
  } catch {}

  return [];
}
