-- Create the execute_sql_query function required by the check-alerts Edge Function
-- This function allows dynamic SQL execution for alert queries

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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql_query(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_query(TEXT) TO service_role;

-- Test the function with a simple query
SELECT * FROM execute_sql_query('SELECT COUNT(*) as count FROM setting_analytics WHERE event_type = ''connection_message_sent''');