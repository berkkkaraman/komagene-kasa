-- 🚨 ABSOLUTE FINAL KURTARMA SCRIPT'I (V4) 🚨
-- Bu script hata payını SIFIRA indirir.

-- 1. ADIM: Eski (Döngüye giren) kuralları tamamen SİLİN
DROP POLICY IF EXISTS "Owner/Admin Update" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated Read All" ON public.profiles;

-- 2. ADIM: Basit ve hatasız bir kural ekleyin
-- (Herkes okuyabilsin, döngü olmasın)
CREATE POLICY "Simple Read" ON public.profiles FOR SELECT USING (true);

-- 3. ADIM: Şubeyi oluştur ve ID'yi DEĞİŞKENE alarak Berkay'a ata
-- Bu yöntem "NULL" dönme ihtimalini ortadan kaldırır.
DO $$
DECLARE
    new_branch_id UUID;
BEGIN
    -- Şubeyi oluştur (veya olanın ID'sini al)
    INSERT INTO branches (name, slug) 
    VALUES ('Komagene Merkez', 'merkez-sube') 
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO new_branch_id;

    -- Berkay'a bu ID'yi ve Admin yetkisini ÇAK
    UPDATE profiles 
    SET 
        branch_id = new_branch_id,
        role = 'admin'
    WHERE id = 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
    
    RAISE NOTICE 'İşlem Başarılı! Atanan Şube ID: %', new_branch_id;
END $$;

-- 4. ADIM: Sonucu Kontrol Et
SELECT p.email, p.role, b.name as sube_adi, p.branch_id 
FROM profiles p 
JOIN branches b ON p.branch_id = b.id
WHERE p.id = 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
