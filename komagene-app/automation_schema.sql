-- GÜNKASA ZERO-TOUCH AUTOMATION SCHEMA (V1)

-- 1. Z-Reports Table (Email-based Automated Reports)
CREATE TABLE IF NOT EXISTS public.z_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    raw_email_content TEXT, -- Debug için ham mail içeriği
    total_amount NUMERIC NOT NULL DEFAULT 0,
    credit_card_total NUMERIC NOT NULL DEFAULT 0,
    cash_total NUMERIC NOT NULL DEFAULT 0,
    source TEXT CHECK (source IN ('email_auto', 'manual')) DEFAULT 'email_auto',
    status TEXT CHECK (status IN ('pending', 'processed', 'error')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only branch staff or admin can see Z-Reports
ALTER TABLE public.z_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Strict Read ZReports" ON public.z_reports;
CREATE POLICY "Strict Read ZReports" ON public.z_reports
FOR SELECT USING (
    branch_id IN (SELECT branch_id FROM public.profiles WHERE id = auth.uid()) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. Update Orders Table (Entegrasyon Kaynağı)
-- Not: Eğer orders tablosu zaten varsa sadece sütun ekle.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='source') THEN
        ALTER TABLE public.orders ADD COLUMN source TEXT DEFAULT 'qr_order';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='external_id') THEN
        ALTER TABLE public.orders ADD COLUMN external_id TEXT; -- Yemeksepeti/Getir ID'si için
    END IF;
END $$;

-- 3. Update Records Table (Audit Trail)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='is_automated') THEN
        ALTER TABLE public.records ADD COLUMN is_automated BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='automation_source') THEN
        ALTER TABLE public.records ADD COLUMN automation_source TEXT;
    END IF;
END $$;
