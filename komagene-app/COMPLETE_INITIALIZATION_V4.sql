-- ==========================================
-- GÜNKASA COMPLETE INITIALIZATION & FIX (V4)
-- Purpose: Create all tables, fix RLS, and ensure columns exist.
-- ==========================================

-- 0. GEREKLİ EKLENTİLER
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLOLARIN OLUŞTURULMASI (CREATE IF NOT EXISTS)

-- A. Şubeler (Tenants)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#D71920',
    tagline TEXT DEFAULT 'Lezzet & Hız',
    sector TEXT DEFAULT 'restaurant',
    ticker_message TEXT DEFAULT 'GÜNKASA • Lezzet & Hız • Afiyet Olsun!',
    is_active BOOLEAN DEFAULT true,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Profiller (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Kategoriler
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT, 
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Ürünler
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Ürün Varyantları
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_multiple_choice BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. Günlük Kayıtlar (Records)
CREATE TABLE IF NOT EXISTS public.records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    income JSONB DEFAULT '{}'::jsonb,
    expenses JSONB DEFAULT '[]'::jsonb,
    ledgers JSONB DEFAULT '[]'::jsonb,
    inventory JSONB DEFAULT '[]'::jsonb,
    shift JSONB DEFAULT '{}'::jsonb,
    note TEXT,
    is_closed BOOLEAN DEFAULT false,
    is_marked BOOLEAN DEFAULT false,
    is_automated BOOLEAN DEFAULT false,
    automation_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT records_date_branch_key UNIQUE (date, branch_id)
);

-- G. Siparişler (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    table_no TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    source TEXT DEFAULT 'manual',
    external_id TEXT,
    customer_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Z-Raporları
CREATE TABLE IF NOT EXISTS public.z_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    receipt_no TEXT,
    raw_email_content TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    credit_card_total NUMERIC NOT NULL DEFAULT 0,
    cash_total NUMERIC NOT NULL DEFAULT 0,
    source TEXT DEFAULT 'email_auto',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GÜVENLİK VE RLS (Sıfırdan Düzenleme)

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.z_reports ENABLE ROW LEVEL SECURITY;

-- Politikaları Temizle
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.' || quote_ident(pol.tablename);
    END LOOP;
END $$;

-- Temel İzinler
CREATE POLICY "Branches_Public_Read" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Branches_Public_Insert" ON public.branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles_Self_Insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles_Public_Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Products_Read_Public" ON public.products FOR SELECT USING (true);

-- Authenticated User İzinleri
CREATE POLICY "Records_Manage" ON public.records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Orders_Manage" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Categories_Manage" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Products_Manage" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- 3. VARSAYILAN ŞUBE (Eğer yoksa)
INSERT INTO public.branches (name, slug) 
VALUES ('Merkez Şube', 'merkez-sube') 
ON CONFLICT (slug) DO NOTHING;
