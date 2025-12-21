-- ☢️ NUCLEAR RLS RECURSION FIX (V9) ☢️
-- Bu script "infinite recursion" hatasını kökten çözer.

-- 1. PROFILES tablosundaki tüm eski (hatalı) kuralları temizle
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated Manage Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 2. BASİT VE GÜVENLİ KURALLARI EKLE (Recursion Olmayan)
-- Herkes kendi profilini okuyabilir (En temel kural)
CREATE POLICY "Self Read" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Authenticated kullanıcılar tüm profilleri görebilir (Ekranın açılması için şart)
-- Bu kural recursive DEĞİLDİR çünkü select 1 from profiles yapmaz.
CREATE POLICY "Authenticated Read All" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- Sadece Adminler ve profilin sahibi güncelleyebilir
CREATE POLICY "Owner/Admin Update" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. RECORDS (Ciro) tablosundaki riski de temizleyelim
DROP POLICY IF EXISTS "Tenant Isolation: View Records" on records;
CREATE POLICY "Tenant Isolation: View Records" on records
  for select
  using (
    branch_id in (select branch_id from profiles where id = auth.uid())
    OR 
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- 4. KULLANICIYI TEKRAR ADMIN YAP (Garanti)
UPDATE public.profiles SET role = 'admin' WHERE email = 'berkaykrmn3@gmail.com';

-- NOT: Değişiklikten sonra sayfayı yenileyin.
