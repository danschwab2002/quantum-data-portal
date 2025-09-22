# 🚨 Deploy Smart Alerts Fix

## ✅ Code Changes Complete
The smart alerts system has been updated to work with direct SQL queries without requiring a separate questions table.

## 🗄️ Step 1: Fix Your Existing Alert

Run this in your Supabase SQL Editor to update your "Conversaciones bajas" alert:

```sql
-- Add the query column if it doesn't exist
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS query TEXT;

-- Update your existing alert with the actual SQL query
UPDATE alerts 
SET query = 'SELECT COUNT(*) FROM setting_analytics WHERE event_type = ''connection_message_sent'''
WHERE name = 'Conversaciones bajas' 
AND query IS NULL;

-- Make sure the query column is not null for all alerts
UPDATE alerts SET query = 'SELECT 1' WHERE query IS NULL;
ALTER TABLE alerts ALTER COLUMN query SET NOT NULL;

-- Verify the update worked
SELECT id, name, query, threshold_operator, threshold_value, webhook_url, is_active
FROM alerts 
WHERE name = 'Conversaciones bajas';
```

## 🚀 Step 2: Deploy Edge Function

```bash
# Deploy the updated check-alerts function
supabase functions deploy check-alerts
```

## 🧪 Step 3: Test the Function

### Manual Test
```bash
# Test the function manually
curl -X POST https://your-project-ref.supabase.co/functions/v1/check-alerts \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Verify Your Alert
Your current alert should now work with:
- **Query**: `SELECT COUNT(*) FROM setting_analytics WHERE event_type = 'connection_message_sent'`
- **Condition**: Less than 10
- **Current Result**: 6 (should trigger)

## ⏰ Step 4: Set Up Automatic Execution

### Option A: Supabase Cron (Recommended)
Add to your Supabase SQL Editor:

```sql
-- Create a cron job to run every 10 seconds
SELECT cron.schedule(
  'check-alerts-every-10s',
  '*/10 * * * * *',  -- Every 10 seconds
  'SELECT net.http_post(
    url := ''https://your-project-ref.supabase.co/functions/v1/check-alerts'',
    headers := ''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}''::jsonb
  );'
);
```

### Option B: External Scheduler
Use a service like GitHub Actions, Vercel Cron, or Uptime Kuma to ping your function every 10 seconds.

## 🔍 Step 5: Monitor & Debug

1. Check Supabase Function Logs
2. Verify webhook receives POST requests at `https://appwebhook.plexonai.com/webhook/smart_alert`
3. Check `alert_logs` table for trigger history

Your alert should now trigger every 10 seconds when the query result (6) is less than your threshold (10)!