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
BEGIN
    -- Execute the dynamic query and build JSON result array
    FOR rec IN EXECUTE query_text LOOP
        -- Add each row as an object within the array
        result_array := result_array || jsonb_build_array(to_jsonb(rec));
    END LOOP;
    
    -- Return a SINGLE row with the "result" column containing the JSON array
    RETURN QUERY SELECT result_array;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql_query(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_query(TEXT) TO service_role;

-- Test the function with a simple query
SELECT * FROM execute_sql_query('SELECT COUNT(*) as count FROM setting_analytics WHERE event_type = ''connection_message_sent''');