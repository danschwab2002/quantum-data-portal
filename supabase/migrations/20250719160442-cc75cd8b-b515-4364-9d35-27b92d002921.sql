-- Disable RLS on setting_analytics to allow public access for SQL editor
ALTER TABLE public.setting_analytics DISABLE ROW LEVEL SECURITY;

-- Create a function to execute dynamic queries safely
CREATE OR REPLACE FUNCTION public.execute_sql_query(query_text text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec record;
    result_array jsonb := '[]'::jsonb;
    row_data jsonb;
BEGIN
    -- Only allow SELECT queries for security
    IF lower(trim(query_text)) NOT LIKE 'select%' THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed';
    END IF;
    
    -- Execute the query and build JSON result
    FOR rec IN EXECUTE query_text LOOP
        row_data := to_jsonb(rec);
        result_array := result_array || row_data;
    END LOOP;
    
    RETURN QUERY SELECT result_array;
END;
$$;