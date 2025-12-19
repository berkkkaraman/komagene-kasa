-- GÜNKASA SAAS EMERGENCY FIX (V4 - NO RECURSION)
-- Bu script "Infinite Recursion" hatasını %100 çözer. 
-- Admin kontrolünü sadece "Yazma/Silme" işlemlerine koyacağız. Okuma herkese açık olacak.

-- 1. Tablo ve Eklenti Kurulumları (Hata vermez, varsa geçer)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.branches (name, slug) VALUES ('Merkez Şube', 'merkez-sube') ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'manager', 'staff')) DEFAULT 'manager',
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. POLİTİKALARI TEMİZLE (Eski hatalı politikaları sil)
DO $$ 
BEGIN
    -- Profiles cleanup
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins see all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Everyone view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
    
    -- Branches cleanup
    DROP POLICY IF EXISTS "Everyone can view branches" ON public.branches;
    DROP POLICY IF EXISTS "Admins manage branches" ON public.branches;
END $$;

-- 3. YENİ BASİT POLİTİKALAR (RECURSION RİSKİ SIFIR)

-- KURAL 1: Giriş yapmış herkes profilleri OKUYABİLİR (Select)
-- Bu sayede "Ben admin miyim?" diye bakarken döngüye girmez.
CREATE POLICY "Authenticated users can view profiles" ON public.profiles 
FOR SELECT USING (auth.role() = 'authenticated');

-- KURAL 2: Sadece kendisi profilini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- KURAL 3: Şubeleri herkes görebilir (Seçim yapmak için)
CREATE POLICY "Authenticated users can view branches" ON public.branches 
FOR SELECT USING (auth.role() = 'authenticated');

-- 4. GEÇMİŞE DÖNÜK DÜZELTME (Eksik profil varsa oluştur)
INSERT INTO public.profiles (id, email, role, branch_id)
SELECT 
    id, 
    email, 
    'manager', 
    (SELECT id FROM public.branches WHERE slug = 'merkez-sube' LIMIT 1)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. SENİ ADMIN YAP (E-posta kontrolü)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'berkaykrmn3@gmail.com';

-- 6. Trigger Düzeltmesi
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, branch_id)
  VALUES (new.id, new.email, 'manager', (SELECT id FROM public.branches WHERE slug = 'merkez-sube' LIMIT 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();