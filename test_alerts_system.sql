-- 🧪 Script de prueba completo para el sistema de alertas
-- Ejecuta cada sección paso a paso en tu Supabase SQL Editor

-- PASO 1: Verificar que las tablas existen
SELECT 'Tablas de alertas:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('alerts', 'alert_logs') AND table_schema = 'public';

-- PASO 2: Verificar la función execute_sql_query
SELECT 'Función execute_sql_query:' as status;
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'execute_sql_query' AND routine_schema = 'public';

-- PASO 3: Probar la función con tu query específica
SELECT 'Probando query de alerta:' as status;
SELECT * FROM execute_sql_query('SELECT COUNT(*) as count FROM setting_analytics WHERE event_type = ''connection_message_sent''');

-- PASO 4: Ver tu alerta actual
SELECT 'Tu alerta configurada:' as status;
SELECT id, name, query, threshold_operator, threshold_value, webhook_url, is_active 
FROM alerts 
WHERE name = 'Conversaciones bajas';

-- PASO 5: Verificar datos en setting_analytics
SELECT 'Datos en setting_analytics:' as status;
SELECT COUNT(*) as total_connection_messages
FROM setting_analytics 
WHERE event_type = 'connection_message_sent';

-- PASO 6: Simular condición de alerta
SELECT 'Simulación de alerta:' as status;
WITH alert_data AS (
  SELECT 
    threshold_value,
    threshold_operator,
    (SELECT COUNT(*) FROM setting_analytics WHERE event_type = 'connection_message_sent') as actual_value
  FROM alerts 
  WHERE name = 'Conversaciones bajas'
)
SELECT 
  actual_value,
  threshold_value,
  threshold_operator,
  CASE 
    WHEN threshold_operator = 'less_than' AND actual_value < threshold_value THEN 'WEBHOOK DEBERÍA DISPARARSE'
    WHEN threshold_operator = 'greater_than' AND actual_value > threshold_value THEN 'WEBHOOK DEBERÍA DISPARARSE'
    WHEN threshold_operator = 'equal_to' AND actual_value = threshold_value THEN 'WEBHOOK DEBERÍA DISPARARSE'
    ELSE 'Condición no cumplida - No webhook'
  END as alert_status
FROM alert_data;

-- PASO 7: Ver historial de logs (si existen)
SELECT 'Logs de alertas:' as status;
SELECT COUNT(*) as total_logs FROM alert_logs;
SELECT * FROM alert_logs ORDER BY triggered_at DESC LIMIT 5;