# PlayBeat Tools – Secure Admin Dashboard Guide

This document describes the architecture, security model, and setup instructions for the PlayBeat Tools Admin Dashboard.

---

## 1. Architecture & Security Model

- **Authentication & Database**: Powered by Supabase (PostgreSQL 15+).
- **No Public Registration**: Admin sign-up is completely disabled in public UI. Only verified accounts provisioned in `auth.users` AND granted an explicit role in `public.admin_users` can authenticate.
- **Database-Level Row Level Security (RLS)**:
  - All admin tables (`site_settings`, `tool_content`, `blog_posts`, `seo_pages`, `site_revisions`, `audit_logs`) enforce RLS.
  - Queries are validated using the `public.is_admin()` and `public.is_superadmin()` security definer functions checking `auth.uid()`.
- **Zero Client Secret Leakage**:
  - `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_DEPLOY_HOOK`, `GSC_PRIVATE_KEY`, and `GA4_PROPERTY_ID` are **strictly server-only**.
  - Client bundles only receive standard public identifiers (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Visitor Privacy Guarantee**:
  - All 10 utilities (image compression, resizing, passport photo maker, PDF tools, QR code generator, age calculator, word counter, Urdu keyboard) run **100% locally in the visitor's browser**.
  - No user documents, photos, text, or dates are ever transmitted to or stored in Supabase or server logs.

---

## 2. Safe First-Admin Setup Procedure

### Step 1: Run Database Migration
1. Go to your Supabase project dashboard at `https://nsqhllmhnpjftqvxoxsg.supabase.co`.
2. Navigate to the **SQL Editor**.
3. Open `supabase/migrations/20261102000000_create_admin_and_settings.sql`, paste its contents, and click **Run**.
4. Confirm that tables `admin_users`, `site_settings`, `tool_content`, `blog_posts`, `seo_pages`, `site_revisions`, and `audit_logs` are created.

### Step 2: Create First Admin User
1. Navigate to **Authentication** -> **Users** in the Supabase Dashboard.
2. Click **Add User** -> **Create User**.
3. Enter `admin@playbeatdigital.store` and choose a secure password.
4. Confirm user creation.

### Step 3: Grant Superadmin Role
1. In the Supabase **SQL Editor**, run:
   ```sql
   INSERT INTO public.admin_users (id, email, role, full_name)
   SELECT id, email, 'superadmin', 'PlayBeat Admin'
   FROM auth.users
   WHERE email = 'admin@playbeatdigital.store'
   ON CONFLICT (id) DO UPDATE SET role = 'superadmin';
   ```
2. You can now log into `/admin/` with your credentials!

---

## 3. Environment Variables Reference

### Public Variables (Client-safe, prefixed with `VITE_`):
```env
# Public Supabase API Endpoint
VITE_SUPABASE_URL="https://nsqhllmhnpjftqvxoxsg.supabase.co"

# Public Supabase Anon/Publishable Key (Read/Auth only, protected by RLS)
VITE_SUPABASE_ANON_KEY="sb_publishable_cscpcDi4N4VEFAjhbsDurg_fPaU23UC"

# Official Site URL & Contact Email
VITE_SITE_URL="https://playbeatdigital.store"
VITE_CONTACT_EMAIL="admin@playbeatdigital.store"
```

### Server-Only Variables (NEVER exposed to browser / client bundles):
```env
# Supabase Service Role Key (used for administrative validation & server-side audit logs)
SUPABASE_SERVICE_ROLE_KEY=""

# Vercel Production Build & Publishing
VERCEL_DEPLOY_HOOK=""
VERCEL_TOKEN=""
VERCEL_PROJECT_ID=""

# Google Search Console (GSC) Read-Only Integration
GSC_SITE_URL="https://playbeatdigital.store/"
GSC_CLIENT_EMAIL=""
GSC_PRIVATE_KEY=""

# Google Analytics 4 (GA4) Reporting API
GA4_PROPERTY_ID=""
GA4_CLIENT_EMAIL=""
GA4_PRIVATE_KEY=""

# Google PageSpeed Insights (Optional API Key for higher quota)
PAGESPEED_API_KEY=""
```

---

## 4. Google Search Console & GA4 Integration

### Google Search Console:
1. In Google Cloud Console, enable **Google Search Console API**.
2. Create a Service Account (e.g. `playbeat-gsc@project.iam.gserviceaccount.com`) and download a JSON key.
3. In Google Search Console -> Settings -> Users and Permissions, add this service account email with **Full** or **Read** permissions for `https://playbeatdigital.store/`.
4. Set `GSC_CLIENT_EMAIL` and `GSC_PRIVATE_KEY` in your Vercel server environment.

### Google Analytics 4 (GA4):
1. In Google Cloud Console, enable **Google Analytics Data API**.
2. In GA4 Admin -> Property Settings -> Property Access Management, add the Service Account email as **Viewer**.
3. Set `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, and `GA4_PRIVATE_KEY` in your Vercel server environment.

---

## 5. Publishing Pipeline (Static Export with Dynamic Revision Snapshotting)

1. Admins make changes in `/admin/settings`, `/admin/tools`, `/admin/blog`, or `/admin/seo`.
2. Changes are saved as **Drafts** in Supabase and can be previewed immediately.
3. Clicking **Publish to Production** in `/admin/publish`:
   - Freezes all current settings and content into an immutable `site_revisions` record.
   - Invokes the Vercel Deploy Hook (`VERCEL_DEPLOY_HOOK`).
   - Vercel runs `npm run build`, which pulls the frozen revision and pre-renders static HTML for all public routes.
   - If the build passes, production updates atomically; if it fails, the previous deployment remains active with zero downtime.
