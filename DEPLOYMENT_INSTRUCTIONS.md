# Smart Alerts Deployment Instructions

## 1. Database Migration

To set up the required database tables for Smart Alerts, run the following migration:

```bash
# Connect to your Supabase instance and run:
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase/migrations/20250903000001_create_alerts_tables.sql
```

Or using the Supabase CLI:
```bash
supabase db push
```

This will create:
- `alerts` table: Stores alert configurations
- `alert_logs` table: Stores alert trigger history
- Appropriate indexes and RLS policies
- Updated_at trigger for alerts table

## 2. Edge Function Deployment

### Deploy the check-alerts function:

```bash
# Using Supabase CLI
supabase functions deploy check-alerts

# Or manually upload the function to your Supabase dashboard
```

### Set up Cron Job for Periodic Alert Checking:

1. **In Supabase Dashboard:**
   - Go to Database → Extensions
   - Enable `pg_cron` extension

2. **Create cron jobs:**

```sql
-- Check alerts every hour
SELECT cron.schedule(
  'check-alerts-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://YOUR_SUPABASE_URL/functions/v1/check-alerts',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Check alerts daily at 9 AM
SELECT cron.schedule(
  'check-alerts-daily',
  '0 9 * * *', -- Daily at 9 AM
  $$
  SELECT net.http_post(
    url := 'https://YOUR_SUPABASE_URL/functions/v1/check-alerts',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### Alternative: Manual Trigger for Testing

You can manually trigger the alert check function:

```bash
curl -X POST 'https://YOUR_SUPABASE_URL/functions/v1/check-alerts' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

## 3. Environment Variables

Ensure your Edge Function has access to:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (not anon key!)

## 4. Webhook Testing

Test your webhook endpoints with the expected payload format:

```json
{
  "alert_id": "uuid",
  "alert_name": "Low Daily Conversations",
  "threshold_value": 10,
  "actual_value": 7,
  "query_result": [{"count": 7}],
  "triggered_at": "2025-09-03T11:42:36Z",
  "query_name": "Daily Conversations Count"
}
```

## 5. UI Integration Complete

The Smart Alerts section is now available in:
- Settings → Smart Alerts
- Create, edit, delete alerts
- View alert history and logs
- Toggle alerts on/off

## Real Estate Use Case Example

1. Create a saved query:
   ```sql
   SELECT COUNT(*) as daily_conversations 
   FROM conversations 
   WHERE DATE(created_at) = CURRENT_DATE
   ```

2. Create an alert:
   - Name: "Low Daily Conversations"
   - Query: Select your saved query
   - Condition: "Less than"
   - Threshold: 10
   - Webhook URL: Your notification endpoint
   - Frequency: Daily

3. The system will check daily and trigger webhooks when conversations drop below 10.

## Troubleshooting

- Check Edge Function logs in Supabase Dashboard
- Verify RLS policies allow proper access
- Test webhook URLs independently
- Monitor alert_logs table for execution history