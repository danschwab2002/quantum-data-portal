-- ============================================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- ============================================================================
-- Execute this script in your new Supabase SQL Editor to create all tables,
-- functions, indexes, RLS policies, and triggers needed for the application.
--
-- IMPORTANT: This creates the database structure only. Data migration is separate.
-- ============================================================================

-- ============================================================================
-- PART 1: FUNCTIONS
-- ============================================================================

-- Function: update_updated_at_column
-- Used by triggers to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function: execute_sql_query
-- Allows dynamic SQL execution for alert queries
CREATE OR REPLACE FUNCTION execute_sql_query(query_text TEXT)
RETURNS TABLE(result JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    result_array JSONB := '[]'::JSONB;
    row_json JSONB;
BEGIN
    -- Execute the dynamic query and build JSON result
    FOR rec IN EXECUTE query_text LOOP
        -- Convert each row to JSON
        row_json := to_jsonb(rec);
        result_array := result_array || row_json;
    END LOOP;
    
    -- Return each row as a separate result
    FOR rec IN SELECT jsonb_array_elements(result_array) as r LOOP
        result := rec.r;
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION execute_sql_query(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_query(TEXT) TO service_role;

-- ============================================================================
-- PART 2: TABLES
-- ============================================================================

-- Table: questions
-- Stores saved SQL queries
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: dashboards
-- Stores dashboard configurations
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: dashboard_sections
-- Stores sections within dashboards
CREATE TABLE IF NOT EXISTS dashboard_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: dashboard_widgets
-- Stores widgets within dashboard sections
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES dashboard_sections(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('metric', 'chart', 'table')),
  config JSONB DEFAULT '{}'::JSONB,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: collections
-- Stores collections of questions and dashboards
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: collection_questions
-- Many-to-many relationship between collections and questions
CREATE TABLE IF NOT EXISTS collection_questions (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (collection_id, question_id)
);

-- Table: collection_dashboards
-- Many-to-many relationship between collections and dashboards
CREATE TABLE IF NOT EXISTS collection_dashboards (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (collection_id, dashboard_id)
);

-- Table: alerts
-- Stores smart alert configurations
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  threshold_operator TEXT NOT NULL CHECK (threshold_operator IN ('less_than', 'greater_than', 'equal_to')),
  threshold_value NUMERIC NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  check_frequency TEXT NOT NULL DEFAULT 'daily',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: alert_logs
-- Stores history of triggered alerts
CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  threshold_value NUMERIC NOT NULL,
  actual_value NUMERIC NOT NULL,
  webhook_response_status INTEGER,
  webhook_response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: setting_analytics
-- Stores analytics events
CREATE TABLE IF NOT EXISTS setting_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: n8n_chat_histories
-- Stores chat history for n8n integration
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- PART 3: INDEXES
-- ============================================================================

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);

-- Dashboards indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_sections_dashboard_id ON dashboard_sections(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_section_id ON dashboard_widgets(section_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_question_id ON dashboard_widgets(question_id);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_questions_collection_id ON collection_questions(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_questions_question_id ON collection_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_collection_dashboards_collection_id ON collection_dashboards(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_dashboards_dashboard_id ON collection_dashboards(dashboard_id);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_question_id ON alerts(question_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_alert_id ON alert_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_triggered_at ON alert_logs(triggered_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_setting_analytics_event_type ON setting_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_setting_analytics_user_id ON setting_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_setting_analytics_created_at ON setting_analytics(created_at);

-- Chat histories indexes
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_user_id ON n8n_chat_histories(user_id);

-- ============================================================================
-- PART 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE setting_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: questions
CREATE POLICY "Users can view their own questions" ON questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON questions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: dashboards
CREATE POLICY "Users can view their own dashboards" ON dashboards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboards" ON dashboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards" ON dashboards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" ON dashboards
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: dashboard_sections
CREATE POLICY "Users can view sections of their dashboards" ON dashboard_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = dashboard_sections.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sections in their dashboards" ON dashboard_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = dashboard_sections.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections in their dashboards" ON dashboard_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = dashboard_sections.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections from their dashboards" ON dashboard_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = dashboard_sections.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

-- RLS Policies: dashboard_widgets
CREATE POLICY "Users can view widgets in their dashboards" ON dashboard_widgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dashboard_sections 
      JOIN dashboards ON dashboards.id = dashboard_sections.dashboard_id
      WHERE dashboard_sections.id = dashboard_widgets.section_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert widgets in their dashboards" ON dashboard_widgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboard_sections 
      JOIN dashboards ON dashboards.id = dashboard_sections.dashboard_id
      WHERE dashboard_sections.id = dashboard_widgets.section_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update widgets in their dashboards" ON dashboard_widgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dashboard_sections 
      JOIN dashboards ON dashboards.id = dashboard_sections.dashboard_id
      WHERE dashboard_sections.id = dashboard_widgets.section_id 
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete widgets from their dashboards" ON dashboard_widgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM dashboard_sections 
      JOIN dashboards ON dashboards.id = dashboard_sections.dashboard_id
      WHERE dashboard_sections.id = dashboard_widgets.section_id 
      AND dashboards.user_id = auth.uid()
    )
  );

-- RLS Policies: collections
CREATE POLICY "Users can view their own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: collection_questions
CREATE POLICY "Users can view questions in their collections" ON collection_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_questions.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add questions to their collections" ON collection_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_questions.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove questions from their collections" ON collection_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_questions.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

-- RLS Policies: collection_dashboards
CREATE POLICY "Users can view dashboards in their collections" ON collection_dashboards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_dashboards.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add dashboards to their collections" ON collection_dashboards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_dashboards.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove dashboards from their collections" ON collection_dashboards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = collection_dashboards.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

-- RLS Policies: alerts
CREATE POLICY "Users can view their own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts" ON alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON alerts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: alert_logs
CREATE POLICY "Users can view logs for their alerts" ON alert_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM alerts 
      WHERE alerts.id = alert_logs.alert_id 
      AND alerts.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert alert logs" ON alert_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies: setting_analytics
CREATE POLICY "Users can view their own analytics" ON setting_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON setting_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies: n8n_chat_histories
CREATE POLICY "Users can view their own chat histories" ON n8n_chat_histories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat histories" ON n8n_chat_histories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 5: TRIGGERS
-- ============================================================================

-- Trigger for questions.updated_at
CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for dashboards.updated_at
CREATE TRIGGER update_dashboards_updated_at 
  BEFORE UPDATE ON dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for collections.updated_at
CREATE TRIGGER update_collections_updated_at 
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for alerts.updated_at
CREATE TRIGGER update_alerts_updated_at 
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables, functions, indexes, RLS policies, and triggers have been created.
-- 
-- NEXT STEPS:
-- 1. Verify that all objects were created successfully
-- 2. If you need to migrate existing data, export from old database and import here
-- 3. Update your application's environment variables with the new Supabase credentials
-- 4. Test the application thoroughly
-- ============================================================================
