-- Actualizar la función para permitir consultas WITH (CTEs) además de SELECT
CREATE OR REPLACE FUNCTION public.execute_sql_query(query_text text)
 RETURNS TABLE(result jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    rec record;
    result_array jsonb := '[]'::jsonb;
    row_data jsonb;
    trimmed_query text;
BEGIN
    -- Limpiar la consulta y convertir a minúsculas para validación
    trimmed_query := lower(trim(query_text));
    
    -- Permitir consultas SELECT y WITH (CTEs que son esencialmente SELECT)
    IF trimmed_query NOT LIKE 'select%' AND trimmed_query NOT LIKE 'with%' THEN
        RAISE EXCEPTION 'Only SELECT queries and CTEs (WITH statements) are allowed';
    END IF;
    
    -- Execute the query and build JSON result
    FOR rec IN EXECUTE query_text LOOP
        row_data := to_jsonb(rec);
        result_array := result_array || row_data;
    END LOOP;
    
    RETURN QUERY SELECT result_array;
END;
$function$;