
-- Drop existing RLS policies if any exist
DROP POLICY IF EXISTS "Users can view their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;

-- Enable RLS on stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create public read policy - anyone can view all stories
CREATE POLICY "Anyone can view all stories" 
  ON public.stories 
  FOR SELECT 
  USING (true);

-- Create public insert policy - anyone can create stories
CREATE POLICY "Anyone can create stories" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (true);

-- Optional: Allow updates and deletes for public stories
CREATE POLICY "Anyone can update stories" 
  ON public.stories 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete stories" 
  ON public.stories 
  FOR DELETE 
  USING (true);
