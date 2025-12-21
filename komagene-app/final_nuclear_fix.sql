-- 🚨 SON VE KESİN KURTARMA SCRIPT'I (V3) 🚨
-- Bu script senin Bağlantı ID'ni (UUID) kullanarak her şeyi düzeltecek.

-- 1. ADIM: Merkez Şubeyi oluştur (Garantili)
INSERT INTO branches (name, slug) 
VALUES ('Merkez', 'merkez') 
ON CONFLICT (slug) DO NOTHING;

-- 2. ADIM: Senin Profilini Manuel Olarak Düzelt
-- Not: e2c92dc8... senin kendi ekranından gelen ID'ndir.
UPDATE profiles 
SET 
  branch_id = (SELECT id FROM branches WHERE name = 'Merkez' LIMIT 1),
  role = 'admin'
WHERE id = 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';

-- 3. ADIM: RLS Kurallarını Sıfırla (Recursion Hatasını engellemek için)
DROP POLICY IF EXISTS "Authenticated Read All" ON public.profiles;
CREATE POLICY "Authenticated Read All" ON public.profiles FOR SELECT USING (true);

-- 4. ADIM: Kontrol Et (Bu sorgu sonuç vermeli)
SELECT email, role, branch_id 
FROM profiles 
WHERE id = 'e2c92dc8-9ef4-4d5d-a432-9e9dc9cb6a50';
