-- Add account column to setting_analytics table
-- This column is used to distinguish manual events from automatic ones

-- Add the account column
ALTER TABLE public.setting_analytics 
ADD COLUMN IF NOT EXISTS account TEXT;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_setting_analytics_account 
ON public.setting_analytics(account);

-- Optional: Update existing records to have a default account value
-- UPDATE public.setting_analytics 
-- SET account = 'AUTO' 
-- WHERE account IS NULL;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
