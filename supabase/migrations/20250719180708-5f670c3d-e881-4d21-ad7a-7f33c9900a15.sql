-- Create dashboards table
CREATE TABLE public.dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_widgets table for relationships
CREATE TABLE public.dashboard_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL,
  question_id UUID NOT NULL,
  grid_position JSONB DEFAULT '{"x": 0, "y": 0, "width": 1, "height": 1}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboards
CREATE POLICY "Users can view their own dashboards" 
ON public.dashboards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboards" 
ON public.dashboards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards" 
ON public.dashboards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" 
ON public.dashboards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for dashboard_widgets
CREATE POLICY "Users can view widgets from their dashboards" 
ON public.dashboard_widgets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_widgets.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create widgets for their dashboards" 
ON public.dashboard_widgets 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_widgets.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update widgets from their dashboards" 
ON public.dashboard_widgets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_widgets.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete widgets from their dashboards" 
ON public.dashboard_widgets 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.dashboards 
    WHERE dashboards.id = dashboard_widgets.dashboard_id 
    AND dashboards.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX idx_dashboard_widgets_dashboard_id ON public.dashboard_widgets(dashboard_id);
CREATE INDEX idx_dashboard_widgets_question_id ON public.dashboard_widgets(question_id);