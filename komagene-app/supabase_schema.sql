-- GÜNKASA SAAS RE-INITIALIZATION SCRIPT (V3 - RECURSION PROOF)
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

-- 6. Helper Function to avoid RLS Recursion
-- This function runs as the database owner (SECURITY DEFINER)
-- and can check roles without triggering the RLS policy again.
CREATE OR REPLACE FUNCTION public.check_is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RECURSION-PROOF RLS POLICIES (Profiles)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins see all profiles" ON public.profiles;
END $$;

CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins see all profiles" ON public.profiles 
FOR ALL USING (public.check_is_admin());

-- 8. RLS POLICIES (Branches)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Everyone can view branches" ON public.branches;
    DROP POLICY IF EXISTS "Admins manage branches" ON public.branches;
END $$;

CREATE POLICY "Everyone can view branches" ON public.branches 
FOR SELECT USING (true);

CREATE POLICY "Admins manage branches" ON public.branches 
FOR ALL USING (public.check_is_admin());

-- 9. Retroactive Migration: Fix "Profil Yok" for existing users
INSERT INTO public.profiles (id, email, role, branch_id)
SELECT 
    id, 
    email, 
    'manager', 
    (SELECT id FROM public.branches WHERE slug = 'merkez-sube' LIMIT 1)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 10. PROMOTE TO ADMIN
-- Replace this with your email if different
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'berkaykrmn3@gmail.com';

-- 11. Add branch_id to records/ledger (Idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='branch_id') THEN
        ALTER TABLE public.records ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ledger' AND column_name='branch_id') THEN
        ALTER TABLE public.ledger ADD COLUMN branch_id UUID REFERENCES public.branches(id);
    END IF;
END $$;

-- 12. Fix Records RLS (Ensure Admins can see all)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Tenant Isolation: View Records" ON records;
END $$;

CREATE POLICY "Tenant Isolation: View Records" ON records
  FOR SELECT
  USING (
    branch_id IN (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
    OR 
    public.check_is_admin()
  );