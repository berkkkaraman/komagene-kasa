-- ==========================================
-- GÜNKASA MASTER INITIALIZATION SCRIPT (V1.1 - IDEMPOTENT)
-- 10-Agent Hive Mind Protocol
-- ==========================================

-- 0. GEREKLİ EKLENTİLER
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADIM: TABLOLARIN OLUŞTURULMASI

-- A. Şubeler (Branches)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Profiller (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'staff', -- admin, manager, staff
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Kategoriler (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT, 
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Ürünler (Products)
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

-- E. Ürün Varyantları (Product Variants)
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT records_date_branch_key UNIQUE (date, branch_id)
);

-- G. QR Siparişler (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    table_no TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    source TEXT DEFAULT 'manual', -- manual, qr_menu, online
    customer_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Email Z Raporları (Z-Reports)
CREATE TABLE IF NOT EXISTS public.z_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    receipt_no TEXT,
    raw_email_content TEXT,
    total_amount NUMERIC DEFAULT 0,
    credit_card_total NUMERIC DEFAULT 0,
    cash_total NUMERIC DEFAULT 0,
    source TEXT DEFAULT 'email_auto',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADIM: GÜVENLİK VE RLS KURALLARI

-- RLS'i Etkinleştir
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.z_reports ENABLE ROW LEVEL SECURITY;

-- Politikalar (Idempotent - Zaten varsa hata vermez)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Branches_Read' AND tablename = 'branches') THEN
        CREATE POLICY "Branches_Read" ON public.branches FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles_Read_All' AND tablename = 'profiles') THEN
        CREATE POLICY "Profiles_Read_All" ON public.profiles FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles_Update_Own' AND tablename = 'profiles') THEN
        CREATE POLICY "Profiles_Update_Own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories_Read' AND tablename = 'categories') THEN
        CREATE POLICY "Categories_Read" ON public.categories FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products_Read' AND tablename = 'products') THEN
        CREATE POLICY "Products_Read" ON public.products FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Variants_Read' AND tablename = 'product_variants') THEN
        CREATE POLICY "Variants_Read" ON public.product_variants FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Records_Manage' AND tablename = 'records') THEN
        CREATE POLICY "Records_Manage" ON public.records FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Orders_Public_Insert' AND tablename = 'orders') THEN
        CREATE POLICY "Orders_Public_Insert" ON public.orders FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Orders_Staff_Manage' AND tablename = 'orders') THEN
        CREATE POLICY "Orders_Staff_Manage" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ZReports_Staff_Manage' AND tablename = 'z_reports') THEN
        CREATE POLICY "ZReports_Staff_Manage" ON public.z_reports FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 3. ADIM: REALTIME CONFIGURATION

DO $$
BEGIN
    -- 1. Yayını oluştur (Eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    -- 2. Tabloları tek tek ve güvenli bir şekilde ekle (Hata fırlatmaz)
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

-- 4. ADIM: VARSAYILAN VERİLER VE ADMIN YETKİSİ

DO $$
DECLARE
    m_branch_id UUID;
BEGIN
    -- 1. Merkez Şubeyi Oluştur
    INSERT INTO public.branches (name, slug) 
    VALUES ('Komagene Merkez', 'merkez-sube') 
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO m_branch_id;

    -- 2. Admin Profilini Tanımla (Gerekirse açılabilir)
    -- INSERT INTO public.profiles (id, email, branch_id, role, full_name)
    -- VALUES ('e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50', 'berkaykrmn3@gmail.com', m_branch_id, 'admin', 'Berkay Karaman')
    -- ON CONFLICT (id) DO UPDATE SET branch_id = m_branch_id, role = 'admin';
END $$;
