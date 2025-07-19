-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Users can view their own collections" 
ON public.collections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections" 
ON public.collections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
ON public.collections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
ON public.collections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create collection_questions table (many-to-many relationship)
CREATE TABLE public.collection_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL,
  question_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, question_id)
);

-- Enable Row Level Security
ALTER TABLE public.collection_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for collection_questions
CREATE POLICY "Users can manage questions in their collections" 
ON public.collection_questions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.collections 
  WHERE collections.id = collection_questions.collection_id 
  AND collections.user_id = auth.uid()
));

-- Create collection_dashboards table (many-to-many relationship)
CREATE TABLE public.collection_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL,
  dashboard_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, dashboard_id)
);

-- Enable Row Level Security
ALTER TABLE public.collection_dashboards ENABLE ROW LEVEL SECURITY;

-- Create policies for collection_dashboards
CREATE POLICY "Users can manage dashboards in their collections" 
ON public.collection_dashboards 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.collections 
  WHERE collections.id = collection_dashboards.collection_id 
  AND collections.user_id = auth.uid()
));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();