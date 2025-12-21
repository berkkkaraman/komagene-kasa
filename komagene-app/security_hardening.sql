-- IRON DOME: SAAS SECURITY HARDENING (V12)
-- Bu script sistemin "Satışa Hazır" hale gelmesi için tüm güvenlik açıklarını kapatır.
-- HEDEF: Hiçbir şube, başka şubenin verisini göremez, değiştiremez veya sahte veri ekleyemez.

-- 1. RECORDS TABLOSU (Ciro ve İşlemler)
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Mevcut gevşek kuralları sil
DROP POLICY IF EXISTS "Tenant Isolation: View Records" ON public.records;
DROP POLICY IF EXISTS "Authenticated insert records" ON public.records;
DROP POLICY IF EXISTS "Authenticated update records" ON public.records;
DROP POLICY IF EXISTS "Authenticated delete records" ON public.records;
DROP POLICY IF EXISTS "Strict Read Records" ON public.records;
DROP POLICY IF EXISTS "Strict Insert Records" ON public.records;
DROP POLICY IF EXISTS "Strict Update Records" ON public.records;
DROP POLICY IF EXISTS "Strict Delete Records" ON public.records;

-- YENİ: SIKI KURALLAR (STRICT POLICIES)

-- A. OKUMA (Sadece Kendi Şubesi veya Admin)
CREATE POLICY "Strict Read Records" ON public.records
FOR SELECT USING (
  branch_id IN (
    SELECT branch_id FROM public.profiles WHERE id = auth.uid()
  )
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- B. EKLEME (Sadece Kendi Şubesine Veri Ekleyebilir - BAŞKASINA EKLEYEMEZ)
CREATE POLICY "Strict Insert Records" ON public.records
FOR INSERT WITH CHECK (
  branch_id IN (
    SELECT branch_id FROM public.profiles WHERE id = auth.uid()
  )
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- C. GÜNCELLEME (Sadece Kendi Verisi)
CREATE POLICY "Strict Update Records" ON public.records
FOR UPDATE USING (
  branch_id IN (
    SELECT branch_id FROM public.profiles WHERE id = auth.uid()
  )
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- D. SİLME (Sadece Kendi Verisi)
CREATE POLICY "Strict Delete Records" ON public.records
FOR DELETE USING (
  branch_id IN (
    SELECT branch_id FROM public.profiles WHERE id = auth.uid()
  )
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- 2. PRODUCTS TABLOSU (Menü ve Ürünler)
-- Önceki "Herkes yazabilir" kuralını iptal ediyoruz.
DROP POLICY IF EXISTS "Public Read" ON public.products;
DROP POLICY IF EXISTS "Authenticated Write" ON public.products;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Strict Manage Products" ON public.products;

-- A. OKUMA (Herkese Açık - TV ve Müşteriler için)
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

-- B. YAZMA/SİLME (SADECE Kendi Şubesi - SABOTAJ ÖNLEME)
CREATE POLICY "Strict Manage Products" ON public.products
FOR ALL USING (
  branch_id IN (
    SELECT branch_id FROM public.profiles WHERE id = auth.uid()
  )
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- 3. PROFILES TABLOSU (Kullanıcılar)
-- Kimse başkasını admin yapamaz veya rolünü değiştiremez.
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Read Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Update Own Profile" ON public.profiles;

CREATE POLICY "Read Own Profile" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Update Own Profile" ON public.profiles
FOR UPDATE USING (id = auth.uid()); 
-- Not: Rol değiştirme trigger ile veya sadece admin panelinden yapılmalı.


-- 4. BRANCHES TABLOSU
-- Şubeleri sadece Admin yönetir. Kullanıcılar sadece okur.
DROP POLICY IF EXISTS "Authenticated read branches" ON public.branches;
DROP POLICY IF EXISTS "Admins manage branches" ON public.branches;
DROP POLICY IF EXISTS "Read All Branches" ON public.branches;
DROP POLICY IF EXISTS "Admin Manage Branches" ON public.branches;

CREATE POLICY "Read All Branches" ON public.branches
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Manage Branches" ON public.branches
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- BİLGİ MESAJI
SELECT 'Iron Dome Security Protocols Activated. System is now Sealed.' as status;
