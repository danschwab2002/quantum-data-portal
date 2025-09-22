# 🔧 Guía de Debug para Webhooks de Alertas

## Paso 1: Crear función SQL requerida

Ejecuta `create_execute_sql_function.sql` en tu Supabase SQL Editor:

```sql
-- Esta función permite que la Edge Function ejecute queries dinámicas
```

## Paso 2: Probar Edge Function manualmente

```bash
# Reemplaza YOUR-PROJECT-URL con tu URL de Supabase
curl -X POST 'https://appsupabase.plexonai.com/functions/v1/check-alerts' \
  -H 'Authorization: Bearer YOUR-SERVICE-ROLE-KEY' \
  -H 'Content-Type: application/json'
```

## Paso 3: Verificar query de la alerta

Ejecuta manualmente la query de tu alerta en SQL Editor:

```sql
-- Tu query actual según la imagen:
SELECT COUNT(*) FROM setting_analytics WHERE event_type = 'connection_message_sent';
```

**Esperado**: Debe retornar un número. Si es < 5 (tu threshold), el webhook debería dispararse.

## Paso 4: Configurar Cron Job (Opcional para pruebas)

```sql
-- Habilitar extensión cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ejecutar cada minuto para pruebas
SELECT cron.schedule(
  'check-alerts-job',
  '* * * * *',
  'SELECT net.http_post(
    url := ''https://appsupabase.plexonai.com/functions/v1/check-alerts'',
    headers := ''{"Authorization": "Bearer YOUR-SERVICE-ROLE-KEY", "Content-Type": "application/json"}''::jsonb
  );'
);
```

## Paso 5: Revisar logs de alertas

```sql
-- Ver intentos de ejecución
SELECT * FROM alert_logs ORDER BY triggered_at DESC LIMIT 10;

-- Ver alertas activas
SELECT id, name, query, threshold_operator, threshold_value, webhook_url 
FROM alerts WHERE is_active = true;
```

## Paso 6: Probar webhook de n8n directamente

```bash
# Probar tu webhook manualmente
curl -X POST 'https://appwebhook.plexonai.com/webhook/smart_alert' \
  -H 'Content-Type: application/json' \
  -d '{
    "alert_id": "test",
    "alert_name": "Test Alert",
    "threshold_value": 5,
    "actual_value": 3,
    "triggered_at": "2025-01-01T12:00:00Z"
  }'
```

## 🔍 Diagnóstico de errores comunes:

1. **Function not found**: Falta crear `execute_sql_query`
2. **Permission denied**: Revisar permisos de RLS
3. **Query error**: La query SQL tiene sintaxis incorrecta
4. **Webhook timeout**: El endpoint n8n no responde
5. **No logs**: La Edge Function no se está ejecutando

## ✅ Verificación exitosa:

- [ ] Función `execute_sql_query` creada
- [ ] Edge Function responde sin errores
- [ ] Query retorna resultado numérico
- [ ] Webhook n8n responde 200 OK
- [ ] Se crean registros en `alert_logs`