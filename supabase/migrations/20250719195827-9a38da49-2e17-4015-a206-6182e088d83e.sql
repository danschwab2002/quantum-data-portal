-- Revisar la función actual y corregir la validación
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
    -- Limpiar la consulta, eliminar espacios y comentarios, convertir a minúsculas
    trimmed_query := lower(trim(regexp_replace(query_text, '^\s*--.*\n', '', 'g')));
    
    -- Permitir consultas SELECT y WITH (CTEs)
    IF NOT (trimmed_query LIKE 'select%' OR trimmed_query LIKE 'with%') THEN
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