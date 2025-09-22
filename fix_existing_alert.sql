-- Fix existing alert to work with direct SQL queries
-- Run this in your Supabase SQL Editor

-- First, add the query column if it doesn't exist
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS query TEXT;

-- Update your "Conversaciones bajas" alert with the actual SQL query
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