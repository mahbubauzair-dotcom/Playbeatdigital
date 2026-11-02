-- ==============================================================================
-- PlayBeat Tools - Admin Dashboard Database Schema & Row Level Security (RLS)
-- Target: Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Admin Users Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('superadmin', 'admin', 'editor')) DEFAULT 'admin',
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Security Definer Helper Function: is_admin()
-- Evaluates whether the current authenticated JWT user exists in public.admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- 4. Security Definer Helper Function: is_superadmin()
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

-- 5. Site Settings Table (Key/Value configuration with Automatic Defaults & Manual Overrides)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'current',
  automatic_values jsonb NOT NULL,
  manual_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_draft boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Tool Content Overrides Table
CREATE TABLE IF NOT EXISTS public.tool_content (
  slug text PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  meta_description text NOT NULL,
  introduction text,
  guide_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_tool_slugs text[] DEFAULT ARRAY[]::text[],
  category text NOT NULL DEFAULT 'General',
  display_order integer NOT NULL DEFAULT 0,
  is_visible_homepage boolean NOT NULL DEFAULT true,
  is_draft boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  body_markdown text NOT NULL,
  body_html text NOT NULL,
  featured_image text,
  image_alt text,
  meta_title text,
  meta_description text,
  status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at timestamptz,
  redirect_url text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. SEO Pages Table (Page-by-page metadata & structured data overrides)
CREATE TABLE IF NOT EXISTS public.seo_pages (
  route_path text PRIMARY KEY,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  robots_index boolean NOT NULL DEFAULT true,
  structured_data_override jsonb,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Site Revisions Table (Immutable snapshot of published configuration for static builds)
CREATE TABLE IF NOT EXISTS public.site_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_number serial UNIQUE,
  status text NOT NULL CHECK (status IN ('draft', 'published', 'deploying', 'live', 'failed')) DEFAULT 'draft',
  snapshot jsonb NOT NULL,
  published_by uuid REFERENCES auth.users(id),
  vercel_deployment_id text,
  vercel_deployment_url text,
  deploy_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deployed_at timestamptz
);

-- 10. Audit Logs Table (Tracks all administrative actions and setting revisions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- admin_users policies:
-- Authenticated users can view their own admin profile
CREATE POLICY "admin_users_select_self" ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Superadmins can manage all admin records
CREATE POLICY "admin_users_superadmin_all" ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- site_settings policies:
-- Public can read live published settings snapshot
CREATE POLICY "site_settings_public_read_published" ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (is_draft = false);

-- Admins can view and update settings
CREATE POLICY "site_settings_admin_select" ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "site_settings_admin_modify" ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- tool_content policies:
CREATE POLICY "tool_content_public_read" ON public.tool_content
  FOR SELECT
  TO anon, authenticated
  USING (is_draft = false);

CREATE POLICY "tool_content_admin_all" ON public.tool_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- blog_posts policies:
CREATE POLICY "blog_posts_public_read" ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "blog_posts_admin_all" ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- seo_pages policies:
CREATE POLICY "seo_pages_public_read" ON public.seo_pages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "seo_pages_admin_all" ON public.seo_pages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- site_revisions policies:
CREATE POLICY "site_revisions_public_read_live" ON public.site_revisions
  FOR SELECT
  TO anon, authenticated
  USING (status = 'live');

CREATE POLICY "site_revisions_admin_all" ON public.site_revisions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- audit_logs policies:
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "audit_logs_admin_insert" ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- Initial Seed: Default starter article & initial settings
-- ==============================================================================

INSERT INTO public.site_settings (id, automatic_values, manual_overrides, effective_values, is_draft)
VALUES (
  'current',
  '{
    "siteName": "PlayBeat Tools",
    "siteTagline": "Everyday tools. Simple, fast and free.",
    "contactEmail": "admin@playbeatdigital.store",
    "primaryColor": "#4F46E5",
    "accentColor": "#6366F1",
    "advertisingEnabled": false,
    "analyticsMeasurementId": "G-PLAYBEAT01",
    "headerLogo": "/logo.png",
    "headerLogoDark": "/logo-dark.png",
    "footerText": "Free browser utilities for students, job seekers, and applicants. Files never leave your device."
  }'::jsonb,
  '{}'::jsonb,
  '{
    "siteName": "PlayBeat Tools",
    "siteTagline": "Everyday tools. Simple, fast and free.",
    "contactEmail": "admin@playbeatdigital.store",
    "primaryColor": "#4F46E5",
    "accentColor": "#6366F1",
    "advertisingEnabled": false,
    "analyticsMeasurementId": "G-PLAYBEAT01",
    "headerLogo": "/logo.png",
    "headerLogoDark": "/logo-dark.png",
    "footerText": "Free browser utilities for students, job seekers, and applicants. Files never leave your device."
  }'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;
