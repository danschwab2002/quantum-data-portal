-- Create RPC function to insert manual events
-- This bypasses PostgREST cache issues with the 'account' column

CREATE OR REPLACE FUNCTION public.insert_manual_event(
  p_event_type TEXT,
  p_account TEXT DEFAULT 'MANUAL',
  p_created_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  id UUID,
  event_type TEXT,
  account TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Generate a unique ID
  v_id := gen_random_uuid();
  
  -- Insert and return the new event
  RETURN QUERY
  INSERT INTO public.setting_analytics (id, event_type, account, created_at)
  VALUES (v_id, p_event_type, p_account, p_created_at)
  RETURNING 
    setting_analytics.id,
    setting_analytics.event_type,
    setting_analytics.account,
    setting_analytics.created_at;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_manual_event(TEXT, TEXT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_manual_event(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_manual_event(TEXT) TO authenticated;

-- Test the function
-- SELECT * FROM insert_manual_event('test_event', 'MANUAL', NOW());
