-- GÜNKASA QR SİPARİŞ SİSTEMİ (ORDERS SCHEMA)
-- Bu script, masa siparişlerini tutacak tabloyu oluşturur.

-- 1. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    table_no TEXT NOT NULL, -- Örn: "Masa 1", "Bahçe 3"
    items JSONB DEFAULT '[]'::jsonb, -- [{name: "Dürüm", price: 50, quantity: 1, note: "Acısız"}]
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, preparing, ready, completed, cancelled
    customer_note TEXT
);

-- 2. RLS Security (ÖNEMLİ)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Create Order" ON public.orders;
DROP POLICY IF EXISTS "Branch Manage Orders" ON public.orders;

-- A. MÜŞTERİ HAKLARI (Public)
-- Müşteri sipariş oluşturabilir (INSERT)
CREATE POLICY "Public Create Order" ON public.orders
FOR INSERT WITH CHECK (true);

-- B. ŞUBE HAKLARI (Staff)
-- Şube kendi siparişlerini görür ve yönetir.
CREATE POLICY "Branch Manage Orders" ON public.orders
FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM public.profiles WHERE id = auth.uid()
    )
    OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. REALTIME
-- Şube ekranına anlık düşmesi için
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;
