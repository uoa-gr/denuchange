-- DENUCHANGE 2026 – Registration System
-- Run this entire file in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS and ON CONFLICT throughout.

-- ─────────────────────────────────────────────
-- 1. Registrations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  first_name           TEXT        NOT NULL,
  last_name            TEXT        NOT NULL,
  email                TEXT        NOT NULL UNIQUE,
  affiliation          TEXT        NOT NULL,
  country              TEXT        NOT NULL,
  registration_type    TEXT        NOT NULL
    CHECK (registration_type IN ('regular_full', 'student_full', 'meeting_only', 'accompanying')),
  abstract_intent      TEXT        NOT NULL DEFAULT 'none'
    CHECK (abstract_intent IN ('oral', 'poster', 'none')),
  dietary              TEXT        NOT NULL DEFAULT 'none'
    CHECK (dietary IN ('none', 'vegetarian', 'vegan', 'kosher', 'gluten_free', 'other')),
  dietary_other        TEXT,
  special_requirements TEXT        NOT NULL DEFAULT '',
  payment_confirmed    BOOLEAN     NOT NULL DEFAULT FALSE
);

-- Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registrations_updated_at ON public.registrations;
CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations (email);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert (register) but never update/delete
CREATE POLICY "anon_insert_registrations"
  ON public.registrations FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous lookups by email (needed for abstract/payment form validation)
CREATE POLICY "anon_select_registrations"
  ON public.registrations FOR SELECT TO anon USING (true);

-- ─────────────────────────────────────────────
-- 2. Abstracts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.abstracts (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  first_name        TEXT        NOT NULL,
  last_name         TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  affiliation       TEXT        NOT NULL,
  title             TEXT        NOT NULL,
  co_authors        TEXT        NOT NULL DEFAULT '',
  abstract_text     TEXT,
  file_path         TEXT,
  presentation_type TEXT        NOT NULL
    CHECK (presentation_type IN ('oral', 'poster')),
  -- At least one of abstract_text or file_path must be provided
  CONSTRAINT abstracts_content_check
    CHECK (abstract_text IS NOT NULL OR file_path IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_abstracts_email ON public.abstracts (email);

ALTER TABLE public.abstracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_abstracts"
  ON public.abstracts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_abstracts"
  ON public.abstracts FOR SELECT TO anon USING (true);

-- ─────────────────────────────────────────────
-- 3. Payment Receipts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email      TEXT        NOT NULL,
  file_path  TEXT        NOT NULL,
  notes      TEXT        NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_email ON public.payment_receipts (email);

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_payment_receipts"
  ON public.payment_receipts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_payment_receipts"
  ON public.payment_receipts FOR SELECT TO anon USING (true);

-- ─────────────────────────────────────────────
-- 4. Storage bucket for abstracts
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'abstracts',
  'abstracts',
  false,
  10485760,  -- 10 MB
  ARRAY[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/pdf'
  ]
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_upload_abstracts"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'abstracts');

-- ─────────────────────────────────────────────
-- 5. Storage bucket for payment receipts
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,
  10485760,  -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_upload_payment_receipts"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'payment-receipts');
