-- 🌪️ THE ULTIMATE DYNAMIC RLS CLEANER (V50) 🌪️
-- Bu script, isimlerini bilmediğimiz TÜM gizli kuralları (policies) bulur ve yok eder.

DO $$
DECLARE
    pol RECORD;
BEGIN
    -- 1. ADIM: PROFILES, BRANCHES ve PRODUCTS tablolarındaki TÜM kuralları bul ve sil
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'branches', 'products', 'records')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;

    -- 2. ADIM: RLS'i temizle ve tekrar başlat
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
    
    -- 3. ADIM: YENI VE EN BASIT (SIFIR DÖNGÜ) KURALLAR
    -- Profilleri herkes okusun, sahibi güncellesin
    EXECUTE 'CREATE POLICY "Profiles_Safe_Read" ON public.profiles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Profiles_Safe_Update" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
    
    -- Şubeleri herkes okusun
    EXECUTE 'CREATE POLICY "Branches_Safe_Read" ON public.branches FOR SELECT USING (true)';
    
    -- Ürünleri herkes okusun, giriş yapan silsin
    EXECUTE 'CREATE POLICY "Products_Safe_Read" ON public.products FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Products_Safe_All" ON public.products FOR ALL USING (auth.role() = ''authenticated'')';

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'Tüm kurallar temizlendi ve güvenli kurallar kuruldu.';
END $$;

-- 4. ADIM: PROFILI MERKEZ'E ZORLA BAGLA
DO $$
DECLARE
    target_uid UUID := 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
    m_branch_id UUID;
BEGIN
    -- Şubeyi al veya oluştur
    INSERT INTO branches (name, slug) 
    VALUES ('Komagene Merkez', 'merkez-sube') 
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO m_branch_id;

    -- Profili zorla (Force) oluştur/güncelle
    INSERT INTO profiles (id, email, branch_id, role, full_name)
    VALUES (target_uid, 'berkaykrmn3@gmail.com', m_branch_id, 'admin', 'Berkay Karaman')
    ON CONFLICT (id) DO UPDATE 
    SET branch_id = m_branch_id, role = 'admin';
END $$;

-- SON DURUM
SELECT email, role, branch_id FROM profiles WHERE id = 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
