-- ======================================================
-- GÜNKASA STABILIZED DATABASE CORE (V2.0)
-- Purpose: Unified schema with strict multi-tenancy & fix RLS
-- ======================================================

-- 0. EXTENSIONS (Removed to avoid permission errors on Supabase, assumed pre-installed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADIM: TABLOLAR (Idempotent)

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
    source TEXT DEFAULT 'manual', -- manual, qr_menu, yemeksepeti, getir, trendyol
    external_id TEXT, -- Üçüncü taraf entegrasyon ID (örn: Yemeksepeti ID)
    customer_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Z-Raporları (Email Automation)
CREATE TABLE IF NOT EXISTS public.z_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    receipt_no TEXT,
    raw_email_content TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    credit_card_total NUMERIC NOT NULL DEFAULT 0,
    cash_total NUMERIC NOT NULL DEFAULT 0,
    source TEXT CHECK (source IN ('email_auto', 'manual')) DEFAULT 'email_auto',
    status TEXT CHECK (status IN ('pending', 'processed', 'error')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADIM: GÜVENLİK VE RLS (STRICT MULTI-TENANCY)

-- Mevcut tüm politikaları temizle (Kontrollü temizlik)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.' || quote_ident(pol.tablename);
    END LOOP;
END $$;

-- RLS'i Etkinleştir
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.z_reports ENABLE ROW LEVEL SECURITY;

-- YARDIMCI FONKSİYON: RLS Sonsuz Döngü Engelleme
CREATE OR REPLACE FUNCTION public.get_user_branch()
RETURNS UUID AS $$
    SELECT branch_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- POLİTİKALAR

-- 1. Branches: Herkes okuyabilir (Register için). 
-- Giriş yapan kullanıcı şube oluşturabilir (İşletme sahibi).
CREATE POLICY "Branches_Read_Public" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Branches_Insert_Auth" ON public.branches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Branches_Update_Manager" ON public.branches FOR UPDATE 
USING (id = public.get_user_branch() AND public.get_user_role() IN ('admin', 'manager'));

-- 2. Profiles: Kendi profilini oku/güncelle/oluştur. Admin hepsini okuyabilir.
CREATE POLICY "Profiles_Self_Read" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.get_user_role() = 'admin');
CREATE POLICY "Profiles_Self_Update" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Profiles_Self_Insert" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- 3. Categories: Şubeye özel erişim
CREATE POLICY "Categories_Branch_Isolation" ON public.categories FOR ALL
USING (branch_id = public.get_user_branch() OR public.get_user_role() = 'admin');

-- 4. Products: Şubeye özel erişim (Select public olabilir QR Menü için)
CREATE POLICY "Products_Read_Public" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products_Write_Branch" ON public.products FOR ALL
USING (branch_id = public.get_user_branch() OR public.get_user_role() = 'admin');

-- 5. Product Variants: Product üzerinden erişim
CREATE POLICY "Variants_Isolation" ON public.product_variants FOR ALL
USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.branch_id = public.get_user_branch() OR public.get_user_role() = 'admin')));

-- 6. Records: KRİTİK - Sadece kendi şubesi
CREATE POLICY "Records_Branch_Isolation" ON public.records FOR ALL
USING (branch_id = public.get_user_branch() OR public.get_user_role() = 'admin');

-- 7. Orders: Müşteri Insert yapabilir, Staff kendi şubesini yönetir
CREATE POLICY "Orders_Customer_Insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders_Branch_Isolation" ON public.orders FOR ALL
USING (branch_id = public.get_user_branch() OR public.get_user_role() = 'admin');

-- 8. Z-Reports: Sadece kendi şubesi
CREATE POLICY "ZReports_Branch_Isolation" ON public.z_reports FOR ALL
USING (branch_id = public.get_user_branch() OR public.get_user_role() = 'admin');

-- 3. ADIM: REALTIME CONFIG
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    -- Tabloları tek tek ve güvenli bir şekilde ekle
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.records;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.z_reports;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 4. ADIM: DEFAULT SEED
INSERT INTO public.branches (name, slug) 
VALUES ('Demo Şube', 'demo-sube') 
ON CONFLICT (slug) DO NOTHING;

-- Final Check
COMMENT ON TABLE public.branches IS 'Tenants: All business branding and settings live here.';
COMMENT ON TABLE public.profiles IS 'Users: Links auth.users to branches and roles.';
