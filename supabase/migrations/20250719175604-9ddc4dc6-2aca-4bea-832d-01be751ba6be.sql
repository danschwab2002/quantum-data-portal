-- Create table for storing SQL questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  visualization_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to manage their questions
-- For simplicity, allowing all authenticated users to read/write all questions
-- You can make this more restrictive later if needed
CREATE POLICY "Anyone can manage questions" 
ON public.questions 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);