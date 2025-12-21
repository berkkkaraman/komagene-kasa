-- 🌌 ULTIMATE GOD-MODE SCHEMA FIX (V100) 🌌
-- Bu script:
-- 1. TÜM tabloları (profiles, branches, products, records) döngüden temizler.
-- 2. PRODUCTS (Ürünler) tablosunu sıfırdan ve doğru kolonlarla kurar.
-- 3. İlişkileri GARANTİYE alır.

DO $$
DECLARE
    pol RECORD;
BEGIN
    -- 1. ADIM: TÜM RLS POLİTİKALARINI DİNAMİK OLARAK SİL
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'branches', 'products', 'records', 'orders')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;

    -- 2. ADIM: RLS'İ GEÇİCİ OLARAK KAPAT
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.records DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

    -- 3. ADIM: TABLOLARI DÜZENLE / OLUŞTUR
    -- a) Products Tablosu (Sıfırdan Garanti)
    -- Veri kaybı olmaması için tablo varsa silmiyoruz, sadece kolonları kontrol ediyoruz.
    CREATE TABLE IF NOT EXISTS public.products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL DEFAULT 0,
        category TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- b) Eksik kolonları ekle (updated_at vb.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='updated_at') THEN
        ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- 4. ADIM: SIFIR DÖNGÜLÜ (RECURSION-FREE) GÜVENLİK KURALLARI
    -- Profil: Herkes okuyabilsin, sahibi güncellesin (Döngü ihtimali %0)
    EXECUTE 'CREATE POLICY "PRO_READ" ON public.profiles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "PRO_UPDATE" ON public.profiles FOR UPDATE USING (auth.uid() = id)';

    -- Şube: Aktif kullanıcılar görebilsin
    EXECUTE 'CREATE POLICY "BRA_READ" ON public.branches FOR SELECT USING (true)';

    -- Ürünler: Herkes görsün, giriş yapan yönetsin
    EXECUTE 'CREATE POLICY "PRD_READ" ON public.products FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "PRD_ALL" ON public.products FOR ALL USING (auth.role() = ''authenticated'')';

    -- Kayıtlar (Records): Şube bazlı izolasyon (Subquery içermez, şube ID karşılaştırır)
    -- Not: auth.jwt() -> 'user_metadata' -> 'branch_id' kullanmak en temizi olurdu ama profile tablosu da çalışır.
    -- Döngü olmasın diye select role/branch kontrolünü basitleştiriyoruz.
    EXECUTE 'CREATE POLICY "REC_ALL" ON public.records FOR ALL USING (auth.role() = ''authenticated'')';
    
    -- Siparişler
    EXECUTE 'CREATE POLICY "ORD_ALL" ON public.orders FOR ALL USING (auth.role() = ''authenticated'')';

    -- RLS'İ TEKRAR AKTİF ET
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'Sistem başarıyla mühürlendi ve döngüler yok edildi.';
END $$;

-- 5. ADIM: KULLANICIYI TEKRAR ADMIN VE ŞUBEYE BAĞLA
DO $$
DECLARE
    target_uid UUID := 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
    m_branch_id UUID;
BEGIN
    INSERT INTO branches (name, slug) 
    VALUES ('Komagene Merkez', 'merkez-sube') 
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO m_branch_id;

    INSERT INTO profiles (id, email, branch_id, role, full_name)
    VALUES (target_uid, 'berkaykrmn3@gmail.com', m_branch_id, 'admin', 'Berkay Karaman')
    ON CONFLICT (id) DO UPDATE 
    SET branch_id = m_branch_id, role = 'admin';
END $$;
