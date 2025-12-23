-- 1. Z-Reports Table (Zero Touch Foundation)
CREATE TABLE IF NOT EXISTS public.z_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID NOT NULL, -- Bağlı olduğu şube (genelde branches tablosuna referans olmalı ama şimdilik UUID)
    date DATE NOT NULL,
    receipt_no TEXT,         -- Z No / Fiş No
    raw_email_content TEXT,  -- Debug için ham mail
    total_amount NUMERIC DEFAULT 0,
    credit_card_total NUMERIC DEFAULT 0,
    cash_total NUMERIC DEFAULT 0,
    source TEXT DEFAULT 'manual', -- 'email_auto', 'manual'
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'error'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders Table Update (Source Tracking)
-- Mevcut orders tablosuna 'source' kolonu ekle
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='source') THEN
        ALTER TABLE public.orders ADD COLUMN source TEXT DEFAULT 'manual'; -- yemeksepeti, getir, trendyol, qr_menu
    END IF;
END $$;

-- 3. Security (RLS)
ALTER TABLE public.z_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Branch Manage ZReports" ON public.z_reports;

CREATE POLICY "Branch Manage ZReports" ON public.z_reports
FOR ALL USING (
    -- Basit RLS: auth.uid() kontrolü veya branch_id eştilemesi yapılmalı
    -- Şimdilik 'public' erişimine kapalı, sadece authenticated user (veya service role) erişebilir diyelim.
    auth.role() = 'authenticated'
);

-- 4. Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'z_reports'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.z_reports;
    END IF;
END $$;
