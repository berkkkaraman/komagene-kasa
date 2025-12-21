-- 🌌 MASTER RLS RESET & PRODUCT FIX (V20) 🌌
-- Bu script döngüleri (recursion) tamamen siler ve sistemi açar.

-- 1. ADIM: TÜM RLS KURALLARINI SIFIRLA (Profil Tablosu)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profile Self Read" ON public.profiles;
DROP POLICY IF EXISTS "Profile Auth Read" ON public.profiles;
DROP POLICY IF EXISTS "Profile Self Update" ON public.profiles;
DROP POLICY IF EXISTS "Simple Read" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated Manage Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated Read All" ON public.profiles;
DROP POLICY IF EXISTS "Owner/Admin Update" ON public.profiles;

-- 2. ADIM: YENİ VE BASİT KURALLAR (Döngü Yapmayan)
-- Giriş yapan herkes profilleri görsün (Hiçbir subquery içermez, güvenlidir)
CREATE POLICY "Profiles_Simple_Select" ON public.profiles FOR SELECT USING (true);
-- Herkes sadece kendi profilini güncellesin
CREATE POLICY "Profiles_Simple_Update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. ADIM: ÜRÜN TABLOSUNDAKİ ENGELLERİ KALDIR
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products Public Read" ON public.products;
DROP POLICY IF EXISTS "Products Auth All" ON public.products;
DROP POLICY IF EXISTS "Public Read" ON public.products;
DROP POLICY IF EXISTS "Authenticated Write" ON public.products;

-- Ürünleri herkes görsün, giriş yapan herkes ekleyip silsin
CREATE POLICY "Products_Simple_Select" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products_Simple_All" ON public.products FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. ADIM: KULLANICIYI MERKEZ ŞUBEYE BAĞLA
DO $$
DECLARE
    target_uid UUID := 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50'; -- Berkay'ın ID'si
    m_branch_id UUID;
BEGIN
    -- Şubeyi al
    SELECT id INTO m_branch_id FROM branches WHERE slug = 'merkez-sube' LIMIT 1;
    
    -- Eğer şube yoksa oluştur
    IF m_branch_id IS NULL THEN
        INSERT INTO branches (name, slug) VALUES ('Komagene Merkez', 'merkez-sube') RETURNING id INTO m_branch_id;
    END IF;

    -- Kullanıcıyı güncelle
    UPDATE profiles SET branch_id = m_branch_id, role = 'admin' WHERE id = target_uid;
END $$;

-- 5. ADIM: SONUCU GÖR
SELECT email, branch_id, role FROM profiles WHERE id = 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
