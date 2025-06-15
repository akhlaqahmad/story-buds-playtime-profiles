
-- 1. Create the story_audios table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.story_audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS) on story_audios table
ALTER TABLE public.story_audios ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS allow_public_insert ON public.story_audios;
DROP POLICY IF EXISTS allow_update ON public.story_audios;
DROP POLICY IF EXISTS allow_delete ON public.story_audios;
DROP POLICY IF EXISTS allow_select ON public.story_audios;

-- 4. Create public insert policy with validation checks for required fields
CREATE POLICY allow_public_insert
  ON public.story_audios
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(audio_url) >= 10
    AND position('.mp3' in audio_url) > 0
    AND char_length(story_title) >= 4
  );

-- 5. Block ALL UPDATE and DELETE operations for all users (no policies created for these actions)

-- 6. Drop and revoke public SELECT policy from story_audios (block reading the table directly)
DROP POLICY IF EXISTS allow_select ON public.story_audios;
REVOKE SELECT ON public.story_audios FROM anon;
REVOKE SELECT ON public.story_audios FROM public;
REVOKE SELECT ON public.story_audios FROM authenticated;

-- 7. Create the restricted public_story_audios view if it doesn't exist
CREATE OR REPLACE VIEW public.public_story_audios AS
  SELECT id, story_title, created_at FROM public.story_audios;

-- 8. Grant SELECT on the view to anon (public) role, revoke other permissions
GRANT SELECT ON public.public_story_audios TO anon;
REVOKE INSERT, UPDATE, DELETE ON public.public_story_audios FROM anon;
