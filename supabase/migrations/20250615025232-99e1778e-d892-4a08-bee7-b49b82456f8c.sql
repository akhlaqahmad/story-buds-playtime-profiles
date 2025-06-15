
-- 1. Create the story-audio storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-audio', 'story-audio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies to allow public uploads to the story-audio bucket
CREATE POLICY "Allow public uploads to story-audio bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'story-audio');

-- 3. Create policy to allow public reads from story-audio bucket
CREATE POLICY "Allow public reads from story-audio bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'story-audio');

-- 4. Create policy to allow public updates to story-audio bucket (for upsert functionality)
CREATE POLICY "Allow public updates to story-audio bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'story-audio');
