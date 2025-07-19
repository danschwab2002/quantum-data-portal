-- Create dashboard_sections table
CREATE TABLE public.dashboard_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dashboard_sections
ALTER TABLE public.dashboard_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard_sections
CREATE POLICY "Users can view sections from their dashboards" 
ON public.dashboard_sections 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM dashboards 
  WHERE dashboards.id = dashboard_sections.dashboard_id 
  AND dashboards.user_id = auth.uid()
));

CREATE POLICY "Users can create sections for their dashboards" 
ON public.dashboard_sections 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM dashboards 
  WHERE dashboards.id = dashboard_sections.dashboard_id 
  AND dashboards.user_id = auth.uid()
));

CREATE POLICY "Users can update sections from their dashboards" 
ON public.dashboard_sections 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM dashboards 
  WHERE dashboards.id = dashboard_sections.dashboard_id 
  AND dashboards.user_id = auth.uid()
));

CREATE POLICY "Users can delete sections from their dashboards" 
ON public.dashboard_sections 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM dashboards 
  WHERE dashboards.id = dashboard_sections.dashboard_id 
  AND dashboards.user_id = auth.uid()
));

-- Add section_id to dashboard_widgets
ALTER TABLE public.dashboard_widgets 
ADD COLUMN section_id UUID REFERENCES public.dashboard_sections(id) ON DELETE CASCADE;

-- Create a default section for existing dashboards
INSERT INTO public.dashboard_sections (dashboard_id, name, display_order)
SELECT id, 'General', 0 
FROM public.dashboards;

-- Update existing widgets to use the default section
UPDATE public.dashboard_widgets 
SET section_id = (
  SELECT ds.id 
  FROM public.dashboard_sections ds 
  WHERE ds.dashboard_id = dashboard_widgets.dashboard_id 
  AND ds.name = 'General'
);

-- Make section_id required after populating existing data
ALTER TABLE public.dashboard_widgets 
ALTER COLUMN section_id SET NOT NULL;