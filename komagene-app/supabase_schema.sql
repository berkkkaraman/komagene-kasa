-- GÜNKASA FINAL FIX (V8 - TEMİZLİK VE CONSTRAINT)
-- Bu script:
-- 1. Veritabanındaki çakışan (duplicate) kayıtları temizler.
-- 2. "Tarih ve Şube" benzersizlik kuralını ekler (Sync hatasını çözer).
-- 3. Eksik kolonları tamamlar.

-- A. CLEANUP (Çakışanları Sil)
-- Aynı gün ve şubeye ait birden fazla kayıt varsa, en son oluşturulanı tutar, diğerlerini siler.
DELETE FROM public.records
WHERE id IN (
  SELECT id FROM (
    SELECT id,
    ROW_NUMBER() OVER (PARTITION BY date, branch_id ORDER BY created_at DESC) as rnum
    FROM public.records
  ) t
  WHERE t.rnum > 1
);

-- B. UNIQUE CONSTRAINT EKLE
-- Artık veri temiz olduğu için bu %100 çalışacak.
DO $$ 
BEGIN
    -- Varsa eskisini sil
    ALTER TABLE public.records DROP CONSTRAINT IF EXISTS records_date_branch_key;
    
    -- Yenisini ekle
    ALTER TABLE public.records ADD CONSTRAINT records_date_branch_key UNIQUE (date, branch_id);
END $$;

-- C. EKSİK KOLONLARI EKLE (Eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='is_closed') THEN
        ALTER TABLE public.records ADD COLUMN is_closed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='ledgers') THEN
        ALTER TABLE public.records ADD COLUMN ledgers JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='inventory') THEN
        ALTER TABLE public.records ADD COLUMN inventory JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='expenses') THEN
        ALTER TABLE public.records ADD COLUMN expenses JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='income') THEN
        ALTER TABLE public.records ADD COLUMN income JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='records' AND column_name='shift') THEN
        ALTER TABLE public.records ADD COLUMN shift JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- D. GÜVENLİK AYARLARI (Garanti)
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- E. SENİ ADMIN YAP
UPDATE public.profiles SET role = 'admin' WHERE email = 'berkaykrmn3@gmail.com';