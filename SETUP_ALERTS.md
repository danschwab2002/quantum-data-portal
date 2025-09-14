# 🚨 Setup Smart Alerts Database - UPDATED

Your Smart Alerts system is now **code-complete** but needs the updated database tables to be created.

## ⚠️ IMPORTANT: Updated Migration Required
The migration has been updated to fix custom frequency support and foreign key issues.

## Step 1: Run Updated Database Migration

Execute the `create_alerts_tables.sql` file in your Supabase database:

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**  
3. Copy the contents of `create_alerts_tables.sql`
4. Paste and run the SQL

### Option B: Using Supabase CLI
```bash
supabase db reset  # This will run all migrations including alerts
```

### Option C: Using psql (if you have direct access)
```bash
psql -h your-db-host -U postgres -d postgres -f create_alerts_tables.sql
```

## Step 2: Verify Setup

Once the migration runs successfully:
1. Refresh your application
2. Navigate to Smart Alerts section
3. Create a new alert with your webhook: `https://appwebhook.plexonai.com/webhook/smart_alert`
4. The webhook URL will now be **permanently saved** and **functional**!

## What happens after migration:

✅ **Full CRUD operations** - Create, edit, delete alerts  
✅ **Webhook persistence** - Your custom URLs are saved in the database  
✅ **Real-time monitoring** - Alerts check your queries automatically  
✅ **Alert logs** - Track when webhooks were triggered  
✅ **Custom frequencies** - Set precise timing with days/hours/minutes/seconds  

## Troubleshooting

If you see "Database Setup Required" messages, the tables haven't been created yet. Just run the migration above.

The webhook will send **POST** requests with this structure:
```json
{
  "alert_id": "uuid",
  "alert_name": "Your Alert Name", 
  "threshold_value": 10,
  "actual_value": 7,
  "query_result": 7,
  "triggered_at": "2025-01-01T12:00:00Z",
  "query_name": "Daily Conversations Count"
}
```