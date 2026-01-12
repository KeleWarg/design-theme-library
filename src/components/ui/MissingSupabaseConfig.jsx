/**
 * @chunk 1.11 - Missing Config Screen
 *
 * Rendered when required runtime config (Supabase env vars) is missing in production.
 * This prevents "blank deploys" (React never mounting due to thrown errors).
 */

import { AlertTriangle } from 'lucide-react';

export default function MissingSupabaseConfig({ missingKeys = [] }) {
  const keys = Array.isArray(missingKeys) ? missingKeys : [];

  return (
    <div className="page" data-testid="missing-supabase-config">
      <div className="page-header">
        <h1>Configuration Required</h1>
        <p>Your deployment is missing required environment variables.</p>
      </div>

      <div className="empty-state">
        <AlertTriangle size={48} className="empty-state-icon" />
        <h3 className="empty-state-title">Supabase is not configured</h3>
        <p className="empty-state-description">
          Set these variables in Vercel Project Settings → Environment Variables, then redeploy:
        </p>

        <div className="empty-state-action" style={{ textAlign: 'left' }}>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
            {(keys.length ? keys : ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']).map((k) => (
              <li key={k}>
                <code>{k}</code>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 'var(--spacing-md)' }}>
            Note: localStorage overrides are disabled in production, so Vercel must provide these.
          </p>
        </div>
      </div>
    </div>
  );
}


