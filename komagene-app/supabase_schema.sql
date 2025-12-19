-- GÜNKASA SAAS RE-INITIALIZATION SCRIPT
-- Copy this ENTIRE code and run it in Supabase SQL Editor.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert Default Branch
INSERT INTO public.branches (name, slug)
VALUES ('Merkez Şube', 'merkez-sube')
ON CONFLICT (slug) DO NOTHING;

-- 4. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'manager', 'staff')) DEFAULT 'manager',
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES (Simple & Secure)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins see all profiles" ON public.profiles;
CREATE POLICY "Admins see all profiles" ON public.profiles 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. Retroactive Migration: Fix "Profil Yok" for existing users
INSERT INTO public.profiles (id, email, role, branch_id)
SELECT 
    id, 
    email, 
    'manager', 
    (SELECT id FROM public.branches WHERE slug = 'merkez-sube' LIMIT 1)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 8. Add branch_id to records/ledger
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='branch_id') THEN
        ALTER TABLE public.records ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ledger' AND column_name='branch_id') THEN
        ALTER TABLE public.ledger ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    END IF;
END $$;

-- 9. Promote You to Admin
-- IMPORTANT: Update your email here if it's different
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'berkaykrmn3@gmail.com';

-- 10. TRIGGER for new signups
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