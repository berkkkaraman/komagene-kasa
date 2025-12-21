-- 🚀 SUPER FINAL RLS & PRODUCT FIX (V15) 🚀
-- Bu script, sistemdeki TÜM döngü (recursion) hatalarını temizler ve ürün eklemeyi açar.

-- 1. ADIM: PROFILES tablosundaki TÜM ihtimalleri temizle
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated Manage Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Simple Read" ON public.profiles;
DROP POLICY IF EXISTS "Self Read" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated Read All" ON public.profiles;
DROP POLICY IF EXISTS "Owner/Admin Update" ON public.profiles;

-- 2. ADIM: YENİ VE GÜVENLİ (RECURSIVE OLMAYAN) KURALLAR
-- Herkes kendi profilini görebilsin
CREATE POLICY "Profile Self Read" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Giriş yapmış herkes profilleri listeyebilsin (Döngü yapmaz çünkü tabloya bakmaz, role bakar)
CREATE POLICY "Profile Auth Read" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- Sadece kişi kendi profilini güncelleyebilsin (Admin kontrolünü döngü olmasın diye çıkardık)
CREATE POLICY "Profile Self Update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. ADIM: PRODUCTS TABLOSU GÜVENLİĞİ
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.products;
DROP POLICY IF EXISTS "Authenticated Write" ON public.products;

-- Herkes ürünleri görebilsin (Digital Signage için)
CREATE POLICY "Products Public Read" ON public.products FOR SELECT USING (true);

-- Giriş yapmış herkes ürün ekleyip/silebilsin
CREATE POLICY "Products Auth All" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- 4. ADIM: KULLANICIYI VE ŞUBEYİ GARANTİYE AL
DO $$
DECLARE
    target_user_id UUID := 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
    target_branch_id UUID;
BEGIN
    -- Şubeyi bul veya oluştur
    INSERT INTO branches (name, slug) 
    VALUES ('Komagene Merkez', 'merkez-sube') 
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO target_branch_id;

    -- Kullanıcıyı güncelle
    UPDATE profiles 
    SET 
        branch_id = target_branch_id,
        role = 'admin'
    WHERE id = target_user_id;
END $$;

-- SONUÇ KONTROL
SELECT email, role, branch_id FROM profiles WHERE id = 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
