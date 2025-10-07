-- Create RPC function to insert questions
-- This bypasses PostgREST cache issues with schema changes

CREATE OR REPLACE FUNCTION public.insert_question(
  p_name TEXT,
  p_query TEXT,
  p_visualization_type TEXT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  query TEXT,
  visualization_type TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Insert and return the new question
  RETURN QUERY
  INSERT INTO public.questions (name, query, visualization_type, user_id)
  VALUES (p_name, p_query, p_visualization_type, v_user_id)
  RETURNING 
    questions.id,
    questions.name,
    questions.query,
    questions.visualization_type,
    questions.created_at,
    questions.user_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_question(TEXT, TEXT, TEXT) TO authenticated;

-- Test the function
-- SELECT * FROM insert_question('Test Question', 'SELECT 1', 'numero');
