-- SQL Patch to ensure all columns exist in public.branches
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'restaurant',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#D71920',
ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Lezzet & Hız',
ADD COLUMN IF NOT EXISTS ticker_message TEXT DEFAULT 'GÜNKASA • Lezzet & Hız • Afiyet Olsun!';

-- Additional checks for other tables if necessary
ALTER TABLE public.records
ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS automation_source TEXT;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS external_id TEXT;
